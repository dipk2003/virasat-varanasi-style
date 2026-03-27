import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, MapPin, Package, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  OrderStatus,
  OrderTimelineData,
  ShippingAddress,
  buildFallbackStatusHistory,
  fetchOrderTimelineData,
  formatAddressLines,
  formatCurrency,
  orderStatusLabels,
} from "@/lib/commerce";

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
  status: OrderStatus;
  total: number;
  shipping_address: Record<string, unknown> | null;
  tracking_number: string | null;
  notes: string | null;
  order_items: OrderItem[];
};

const statusColors: Record<OrderStatus, string> = {
  pending: "text-yellow-600 bg-yellow-50",
  confirmed: "text-blue-600 bg-blue-50",
  processing: "text-orange-600 bg-orange-50",
  dispatched: "text-indigo-600 bg-indigo-50",
  delivered: "text-green-600 bg-green-50",
  cancelled: "text-red-600 bg-red-50",
  refund_requested: "text-pink-600 bg-pink-50",
  refunded: "text-gray-600 bg-gray-50",
};

const UserOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null);
  const [detailsByOrderId, setDetailsByOrderId] = useState<Record<string, OrderTimelineData>>({});

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders((data || []) as OrderRecord[]);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  const toggleDetails = async (order: OrderRecord) => {
    if (expandedOrderId === order.id) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(order.id);

    if (detailsByOrderId[order.id]) {
      return;
    }

    setDetailLoadingId(order.id);
    const detail = await fetchOrderTimelineData(order.id);
    setDetailsByOrderId((current) => ({ ...current, [order.id]: detail }));
    setDetailLoadingId(null);
  };

  if (loading) return <div className="font-body text-muted-foreground">Loading orders...</div>;

  if (orders.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-border bg-card/95 py-16 text-center">
        <Package size={48} className="mx-auto mb-4 text-muted-foreground/30" />
        <h3 className="mb-2 font-display text-2xl text-foreground">No orders yet</h3>
        <p className="font-body text-muted-foreground">Start shopping to see your orders here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-border/80 bg-[linear-gradient(160deg,hsl(var(--accent)/0.1),transparent_36%),linear-gradient(180deg,hsl(var(--card)),hsl(var(--card)))] p-6 sm:p-7">
        <p className="font-ui text-[10px] tracking-[0.26em] uppercase text-accent">Order Desk</p>
        <h2 className="mt-3 font-display text-3xl text-foreground">My Orders</h2>
        <p className="mt-3 max-w-2xl font-body text-sm leading-7 text-muted-foreground">
          Har purchase ka timeline, item breakdown, aur shipment status yahin ek structured view me milega.
        </p>
      </section>

      <div className="space-y-4">
        {orders.map((order) => {
          const detail = detailsByOrderId[order.id];
          const timeline = detail?.statusHistory.length
            ? detail.statusHistory
            : buildFallbackStatusHistory(order);
          const shipments = detail?.shipments || [];

          return (
            <div key={order.id} className="overflow-hidden rounded-[28px] border border-border/80 bg-card/95 shadow-[0_18px_55px_-44px_hsl(var(--foreground)/0.7)]">
              <div className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="font-ui text-xs tracking-wider text-muted-foreground">Order #{order.order_number}</p>
                    <p className="font-body text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 font-ui text-xs tracking-wider uppercase ${statusColors[order.status] || "text-muted-foreground bg-muted"}`}>
                    {orderStatusLabels[order.status]}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-body text-sm text-muted-foreground">
                      {order.order_items?.length || 0} item(s)
                    </p>
                    {(order.tracking_number || shipments[0]?.awb_number) && (
                      <p className="mt-2 font-ui text-xs text-accent flex items-center gap-1">
                        <Truck size={14} /> Tracking: {order.tracking_number || shipments[0]?.awb_number}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="font-display text-lg text-foreground">{formatCurrency(order.total)}</p>
                    <button
                      onClick={() => toggleDetails(order)}
                      className="flex items-center gap-2 px-4 py-2 border border-border font-ui text-xs tracking-[0.15em] uppercase hover:border-accent transition-colors"
                    >
                      {expandedOrderId === order.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {expandedOrderId === order.id ? "Hide Details" : "View Details"}
                    </button>
                  </div>
                </div>
              </div>

              {expandedOrderId === order.id && (
                <div className="border-t border-border px-6 py-5 space-y-5 bg-background/45">
                  {detailLoadingId === order.id ? (
                    <p className="font-body text-sm text-muted-foreground">Loading timeline...</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr,0.9fr] gap-6">
                        <div>
                          <h3 className="font-ui text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                            Items
                          </h3>
                          <div className="space-y-3">
                            {order.order_items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between gap-4 border border-border p-4">
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
                          <div>
                            <h3 className="font-ui text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                              Shipping Address
                            </h3>
                            <div className="border border-border p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin size={14} className="text-accent" />
                                <p className="font-ui text-xs tracking-wider uppercase text-foreground">Delivery</p>
                              </div>
                              {formatAddressLines(order.shipping_address as ShippingAddress | null).map((line) => (
                                <p key={line} className="font-body text-sm text-muted-foreground">
                                  {line}
                                </p>
                              ))}
                            </div>
                          </div>

                          {!detail?.relationReady && (
                            <div className="border border-dashed border-border p-4">
                              <p className="font-body text-sm text-muted-foreground">
                                Detailed shipment timeline foundation migration ke baad auto-fill hogi. Abhi fallback order timeline dikh raha hai.
                              </p>
                            </div>
                          )}
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
                            Shipment Events
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
                                  {(shipment.shipment_events || []).map((event) => (
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
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserOrders;
