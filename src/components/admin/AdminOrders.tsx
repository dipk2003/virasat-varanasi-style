import { Fragment, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, MapPin, Package, Save, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  OrderStatus,
  OrderTimelineData,
  ShippingAddress,
  buildFallbackStatusHistory,
  fetchOrderTimelineData,
  formatAddressLines,
  formatCurrency,
  isMissingRelationError,
  orderStatusLabels,
  untypedDb,
} from "@/lib/commerce";

const statusOptions: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "dispatched",
  "delivered",
  "cancelled",
  "refund_requested",
  "refunded",
];

type OrderItem = {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  size: string | null;
  color: string | null;
};

type OrderRecord = {
  id: string;
  order_number: string;
  created_at: string;
  updated_at: string;
  total: number;
  status: OrderStatus;
  tracking_number: string | null;
  shipping_address: Record<string, unknown> | null;
  notes: string | null;
  order_items: OrderItem[];
};

const AdminOrders = () => {
  const db = untypedDb;
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null);
  const [detailsByOrderId, setDetailsByOrderId] = useState<Record<string, OrderTimelineData>>({});
  const [trackingDrafts, setTrackingDrafts] = useState<Record<string, string>>({});

  const fetchOrders = async () => {
    setLoading(true);
    let q = supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter as OrderStatus);
    const { data } = await q;
    const fetchedOrders = (data || []) as OrderRecord[];
    setOrders(fetchedOrders);
    setTrackingDrafts(
      fetchedOrders.reduce<Record<string, string>>((accumulator, order) => {
        accumulator[order.id] = order.tracking_number || "";
        return accumulator;
      }, {})
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Order updated" });
    setDetailsByOrderId((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    fetchOrders();
  };

  const toggleDetails = async (order: OrderRecord) => {
    if (expandedOrderId === order.id) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(order.id);

    if (detailsByOrderId[order.id]) return;

    setDetailLoadingId(order.id);
    const detail = await fetchOrderTimelineData(order.id);
    setDetailsByOrderId((current) => ({ ...current, [order.id]: detail }));
    setDetailLoadingId(null);
  };

  const saveTracking = async (order: OrderRecord) => {
    const trackingNumber = trackingDrafts[order.id]?.trim() || null;
    const { error } = await supabase.from("orders").update({ tracking_number: trackingNumber }).eq("id", order.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    const shipmentStatus = order.status === "delivered" ? "delivered" : order.status === "dispatched" ? "in_transit" : "created";
    const shipmentPayload = {
      order_id: order.id,
      status: shipmentStatus,
      awb_number: trackingNumber,
      courier_name: "Carrier Pending",
      metadata: { source: "admin-order-desk" },
    };

    const existingShipment = await db.from("order_shipments").select("id").eq("order_id", order.id).maybeSingle();
    if (existingShipment.error && !isMissingRelationError(existingShipment.error)) {
      toast({ title: "Tracking saved on order only", description: existingShipment.error.message, variant: "destructive" });
    } else if (!existingShipment.error) {
      if (existingShipment.data?.id) {
        await db.from("order_shipments").update(shipmentPayload).eq("id", existingShipment.data.id);
      } else {
        await db.from("order_shipments").insert(shipmentPayload);
      }
    }

    toast({ title: "Tracking updated" });
    setDetailsByOrderId((current) => {
      const next = { ...current };
      delete next[order.id];
      return next;
    });
    fetchOrders();
  };

  if (loading) return <div className="font-body text-muted-foreground">Loading...</div>;

  return (
    <div>
      <h2 className="font-display text-3xl font-light text-foreground mb-6">Orders</h2>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["all", ...statusOptions].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 font-ui text-xs tracking-wider uppercase whitespace-nowrap transition-colors ${
              filter === status ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {status.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Order #", "Date", "Items", "Total", "Status", "Action"].map((header) => (
                <th key={header} className="text-left p-4 font-ui text-xs tracking-wider uppercase text-muted-foreground">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => {
              const detail = detailsByOrderId[order.id];
              const timeline = detail?.statusHistory.length
                ? detail.statusHistory
                : buildFallbackStatusHistory(order);
              const shipments = detail?.shipments || [];

              return (
                <Fragment key={order.id}>
                  <tr key={order.id}>
                    <td className="p-4 font-ui text-sm text-foreground">{order.order_number}</td>
                    <td className="p-4 font-body text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="p-4 font-body text-sm text-muted-foreground">{order.order_items?.length || 0}</td>
                    <td className="p-4 font-ui text-sm text-foreground">{formatCurrency(order.total)}</td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(event) => updateStatus(order.id, event.target.value as OrderStatus)}
                        className="px-2 py-1 bg-background border border-border font-ui text-xs text-foreground focus:outline-none focus:border-accent"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleDetails(order)}
                        className="flex items-center gap-2 font-ui text-xs tracking-wider text-accent hover:underline"
                      >
                        {expandedOrderId === order.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {expandedOrderId === order.id ? "Hide" : "View"}
                      </button>
                    </td>
                  </tr>

                  {expandedOrderId === order.id && (
                    <tr key={`${order.id}-details`}>
                      <td colSpan={6} className="p-0">
                        <div className="border-t border-border px-6 py-5 space-y-5">
                          {detailLoadingId === order.id ? (
                            <p className="font-body text-sm text-muted-foreground">Loading order context...</p>
                          ) : (
                            <>
                              <div className="grid grid-cols-1 xl:grid-cols-[1.1fr,0.9fr] gap-6">
                                <div>
                                  <h3 className="font-ui text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Items</h3>
                                  <div className="space-y-3">
                                    {order.order_items.map((item) => (
                                      <div key={item.id} className="border border-border p-4 flex items-center justify-between gap-4">
                                        <div>
                                          <p className="font-display text-base text-foreground">{item.product_name}</p>
                                          <p className="font-body text-sm text-muted-foreground">
                                            Qty {item.quantity}
                                            {item.size ? ` • Size ${item.size}` : ""}
                                            {item.color ? ` • ${item.color}` : ""}
                                          </p>
                                        </div>
                                        <p className="font-ui text-sm text-foreground">{formatCurrency(item.price * item.quantity)}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div className="border border-border p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <MapPin size={14} className="text-accent" />
                                      <p className="font-ui text-xs tracking-wider uppercase text-foreground">Shipping Address</p>
                                    </div>
                                    {formatAddressLines(order.shipping_address as ShippingAddress | null).map((line) => (
                                      <p key={line} className="font-body text-sm text-muted-foreground">
                                        {line}
                                      </p>
                                    ))}
                                  </div>

                                  <div className="border border-border p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                      <Truck size={14} className="text-accent" />
                                      <p className="font-ui text-xs tracking-wider uppercase text-foreground">Tracking</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                      <input
                                        type="text"
                                        value={trackingDrafts[order.id] || ""}
                                        onChange={(event) =>
                                          setTrackingDrafts((current) => ({ ...current, [order.id]: event.target.value }))
                                        }
                                        placeholder="Add AWB / tracking number"
                                        className="flex-1 px-4 py-3 border border-border bg-background font-body text-sm focus:outline-none focus:border-accent"
                                      />
                                      <button
                                        onClick={() => saveTracking(order)}
                                        className="flex items-center justify-center gap-2 px-5 py-3 bg-accent text-accent-foreground font-ui text-xs tracking-[0.15em] uppercase hover:bg-accent/90 transition-colors"
                                      >
                                        <Save size={14} /> Save
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h3 className="font-ui text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                                  Order Timeline
                                </h3>
                                <div className="space-y-3">
                                  {timeline.map((event) => (
                                    <div key={event.id} className="border border-border p-4">
                                      <div className="flex items-center justify-between gap-4">
                                        <p className="font-display text-base text-foreground">
                                          {orderStatusLabels[event.new_status]}
                                        </p>
                                        <p className="font-ui text-[10px] tracking-wider text-muted-foreground">
                                          {new Date(event.created_at).toLocaleString("en-IN")}
                                        </p>
                                      </div>
                                      {event.note && (
                                        <p className="font-body text-sm text-muted-foreground mt-2">{event.note}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {shipments.length > 0 && (
                                <div>
                                  <h3 className="font-ui text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                                    Shipment Desk
                                  </h3>
                                  <div className="space-y-3">
                                    {shipments.map((shipment) => (
                                      <div key={shipment.id} className="border border-border p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                          <div>
                                            <p className="font-display text-base text-foreground">
                                              {shipment.courier_name || "Shipment"} {shipment.awb_number ? `• ${shipment.awb_number}` : ""}
                                            </p>
                                            <p className="font-body text-sm text-muted-foreground">
                                              Status: {shipment.status.replace(/_/g, " ")}
                                            </p>
                                          </div>
                                          {shipment.tracking_url && (
                                            <a
                                              href={shipment.tracking_url}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="font-ui text-xs tracking-wider text-accent hover:underline"
                                            >
                                              Open Tracking
                                            </a>
                                          )}
                                        </div>

                                        <div className="space-y-2">
                                          {(shipment.shipment_events || []).length > 0 ? (
                                            shipment.shipment_events?.map((event) => (
                                              <div key={event.id} className="flex items-start justify-between gap-3 text-sm">
                                                <div>
                                                  <p className="font-body text-foreground">{event.event_description}</p>
                                                  <p className="font-body text-muted-foreground">
                                                    {[event.location, event.provider_status].filter(Boolean).join(" • ")}
                                                  </p>
                                                </div>
                                                <p className="font-ui text-[10px] tracking-wider text-muted-foreground">
                                                  {new Date(event.event_at).toLocaleString("en-IN")}
                                                </p>
                                              </div>
                                            ))
                                          ) : (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                              <Package size={14} />
                                              Shipment record created. Carrier events sync hone par yahan timeline dikhegi.
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-8 text-center font-body text-muted-foreground">No orders found</p>}
      </div>
    </div>
  );
};

export default AdminOrders;
