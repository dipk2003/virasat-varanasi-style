import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Package, Clock, Truck, CheckCircle } from "lucide-react";

const statusColors: Record<string, string> = {
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
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  if (loading) return <div className="font-body text-muted-foreground">Loading orders...</div>;

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <Package size={48} className="mx-auto text-muted-foreground/30 mb-4" />
        <h3 className="font-display text-xl text-foreground mb-2">No orders yet</h3>
        <p className="font-body text-muted-foreground">Start shopping to see your orders here.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-light text-foreground mb-6">My Orders</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border border-border p-6 bg-card">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <p className="font-ui text-xs tracking-wider text-muted-foreground">Order #{order.order_number}</p>
                <p className="font-body text-sm text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <span className={`px-3 py-1 font-ui text-xs tracking-wider uppercase ${statusColors[order.status] || "text-muted-foreground bg-muted"}`}>
                {order.status.replace("_", " ")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="font-body text-sm text-muted-foreground">
                {order.order_items?.length || 0} item(s)
              </p>
              <p className="font-display text-lg text-foreground">₹{order.total}</p>
            </div>
            {order.tracking_number && (
              <p className="mt-2 font-ui text-xs text-accent flex items-center gap-1">
                <Truck size={14} /> Tracking: {order.tracking_number}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserOrders;
