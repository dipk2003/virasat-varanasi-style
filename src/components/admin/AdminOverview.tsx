import { useEffect, useState } from "react";
import { AlertTriangle, IndianRupee, Package, Palette, ShieldCheck, ShoppingCart, Truck, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { isMissingRelationError, untypedDb } from "@/lib/commerce";

const AdminOverview = () => {
  const db = untypedDb;
  const { isSuperAdmin } = useAuth();
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    customers: 0,
    revenue: 0,
    lowStock: 0,
    pendingOrders: 0,
    inquiries: 0,
    activeAdmins: 0,
    activeSuperAdmins: 0,
    pendingPayments: 0,
    activeDeliveryPartners: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [products, orders, customers, lowStock, inquiries, roles, payments, providers] = await Promise.all([
        db.from("products").select("id", { count: "exact", head: true }),
        db.from("orders").select("id, total, status, order_number, created_at").order("created_at", { ascending: false }),
        db.from("profiles").select("id", { count: "exact", head: true }),
        db.from("products").select("id", { count: "exact", head: true }).lte("stock_quantity", 5),
        db.from("custom_designs").select("id, status"),
        db.from("user_roles").select("role"),
        db.from("payment_orders").select("id, status"),
        db.from("delivery_providers").select("id, is_active"),
      ]);

      const allOrders = orders.data || [];
      const allInquiries = isMissingRelationError(inquiries.error) ? [] : inquiries.data || [];
      const allRoles = roles.data || [];
      const allPayments = isMissingRelationError(payments.error) ? [] : payments.data || [];
      const allProviders = isMissingRelationError(providers.error) ? [] : providers.data || [];
      const revenue = allOrders.filter((o) => o.status === "delivered").reduce((sum, o) => sum + Number(o.total), 0);
      const pending = allOrders.filter((o) => o.status === "pending").length;
      const activeAdmins = allRoles.filter((role) => role.role === "admin").length;
      const activeSuperAdmins = allRoles.filter((role) => role.role === "super_admin").length;
      const pendingPayments = allPayments.filter((payment) => payment.status === "pending" || payment.status === "failed").length;
      const activeDeliveryPartners = allProviders.filter((provider) => provider.is_active).length;

      setStats({
        products: products.count || 0,
        orders: allOrders.length,
        customers: customers.count || 0,
        revenue,
        lowStock: lowStock.count || 0,
        pendingOrders: pending,
        inquiries: allInquiries.length,
        activeAdmins,
        activeSuperAdmins,
        pendingPayments,
        activeDeliveryPartners,
      });
      setRecentOrders(allOrders.slice(0, 5));
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div className="font-body text-muted-foreground">Loading dashboard...</div>;

  const cards = [
    { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-green-600 bg-green-50" },
    { label: "Total Orders", value: stats.orders, icon: ShoppingCart, color: "text-blue-600 bg-blue-50" },
    { label: "Products", value: stats.products, icon: Package, color: "text-indigo-600 bg-indigo-50" },
    { label: "Customers", value: stats.customers, icon: Users, color: "text-amber-600 bg-amber-50" },
    { label: "Custom Inquiries", value: stats.inquiries, icon: Palette, color: "text-rose-600 bg-rose-50" },
    { label: "Delivery Partners", value: stats.activeDeliveryPartners, icon: Truck, color: "text-cyan-600 bg-cyan-50" },
  ];

  if (isSuperAdmin) {
    cards.push(
      { label: "Admins", value: stats.activeAdmins, icon: ShieldCheck, color: "text-violet-600 bg-violet-50" },
      { label: "Super Admins", value: stats.activeSuperAdmins, icon: ShieldCheck, color: "text-fuchsia-600 bg-fuchsia-50" }
    );
  }

  return (
    <div>
      <h2 className="font-display text-3xl font-light text-foreground mb-8">Dashboard Overview</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="border border-border p-6 bg-card">
            <div className="flex items-center justify-between mb-3">
              <span className="font-ui text-xs tracking-wider uppercase text-muted-foreground">{c.label}</span>
              <div className={`p-2 rounded-sm ${c.color}`}><c.icon size={18} /></div>
            </div>
            <p className="font-display text-2xl text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {(stats.lowStock > 0 || stats.pendingOrders > 0 || stats.pendingPayments > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
          {stats.lowStock > 0 && (
            <div className="border border-destructive/30 bg-destructive/5 p-4 flex items-center gap-3">
              <AlertTriangle size={20} className="text-destructive" />
              <div>
                <p className="font-ui text-sm font-medium text-destructive">{stats.lowStock} products need restocking</p>
                <p className="font-body text-xs text-muted-foreground">Stock is below threshold</p>
              </div>
            </div>
          )}
          {stats.pendingOrders > 0 && (
            <div className="border border-yellow-500/30 bg-yellow-50 p-4 flex items-center gap-3">
              <ShoppingCart size={20} className="text-yellow-600" />
              <div>
                <p className="font-ui text-sm font-medium text-yellow-700">{stats.pendingOrders} pending orders</p>
                <p className="font-body text-xs text-muted-foreground">Awaiting confirmation</p>
              </div>
            </div>
          )}
          {stats.pendingPayments > 0 && (
            <div className="border border-blue-500/30 bg-blue-50 p-4 flex items-center gap-3">
              <IndianRupee size={20} className="text-blue-600" />
              <div>
                <p className="font-ui text-sm font-medium text-blue-700">{stats.pendingPayments} payment records need review</p>
                <p className="font-body text-xs text-muted-foreground">Pending or failed payments are waiting for attention</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent orders */}
      <div className="border border-border bg-card">
        <div className="p-4 border-b border-border">
          <h3 className="font-display text-lg text-foreground">Recent Orders</h3>
        </div>
        {recentOrders.length === 0 ? (
          <p className="p-6 font-body text-muted-foreground text-center">No orders yet</p>
        ) : (
          <div className="divide-y divide-border">
            {recentOrders.map((o) => (
              <div key={o.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-ui text-sm text-foreground">{o.order_number}</p>
                  <p className="font-body text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-ui text-sm text-foreground">₹{o.total}</p>
                  <span className="font-ui text-[10px] tracking-wider uppercase text-muted-foreground">{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOverview;
