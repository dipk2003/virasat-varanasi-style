import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const statusOptions = ["pending", "confirmed", "processing", "dispatched", "delivered", "cancelled", "refund_requested", "refunded"];

const AdminOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchOrders = async () => {
    let q = supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter as any);
    const { data } = await q;
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Order updated!" });
      fetchOrders();
    }
  };

  if (loading) return <div className="font-body text-muted-foreground">Loading...</div>;

  return (
    <div>
      <h2 className="font-display text-3xl font-light text-foreground mb-6">Orders</h2>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["all", ...statusOptions].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 font-ui text-xs tracking-wider uppercase whitespace-nowrap transition-colors ${
              filter === s ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Order #", "Date", "Items", "Total", "Status", "Action"].map((h) => (
                <th key={h} className="text-left p-4 font-ui text-xs tracking-wider uppercase text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="p-4 font-ui text-sm text-foreground">{o.order_number}</td>
                <td className="p-4 font-body text-sm text-muted-foreground">
                  {new Date(o.created_at).toLocaleDateString("en-IN")}
                </td>
                <td className="p-4 font-body text-sm text-muted-foreground">{o.order_items?.length || 0}</td>
                <td className="p-4 font-ui text-sm text-foreground">₹{o.total}</td>
                <td className="p-4">
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    className="px-2 py-1 bg-background border border-border font-ui text-xs text-foreground focus:outline-none focus:border-accent"
                  >
                    {statusOptions.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                  </select>
                </td>
                <td className="p-4">
                  {o.tracking_number ? (
                    <span className="font-ui text-xs text-accent">{o.tracking_number}</span>
                  ) : (
                    <span className="font-ui text-xs text-muted-foreground">No tracking</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-8 text-center font-body text-muted-foreground">No orders found</p>}
      </div>
    </div>
  );
};

export default AdminOrders;
