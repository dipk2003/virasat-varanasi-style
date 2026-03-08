import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Tag, Palette, Star, Users,
  BarChart3, Bell, LogOut, Settings,
} from "lucide-react";
import logo from "@/assets/logo.png";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminCoupons from "@/components/admin/AdminCoupons";
import AdminCustomDesigns from "@/components/admin/AdminCustomDesigns";
import AdminReviews from "@/components/admin/AdminReviews";
import AdminCustomers from "@/components/admin/AdminCustomers";
import AdminInventory from "@/components/admin/AdminInventory";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "inventory", label: "Inventory", icon: BarChart3 },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "coupons", label: "Coupons", icon: Tag },
  { id: "custom-designs", label: "Custom Designs", icon: Palette },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "customers", label: "Customers", icon: Users },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-foreground flex-shrink-0 hidden lg:flex flex-col">
        <div className="p-6 border-b" style={{ borderColor: "hsl(var(--cream) / 0.1)" }}>
          <Link to="/">
            <img src={logo} alt="Virasat" className="h-12 brightness-200" />
          </Link>
          <p className="font-ui text-xs tracking-[0.2em] uppercase mt-2" style={{ color: "hsl(var(--gold))" }}>
            Admin Panel
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 font-ui text-sm tracking-wider transition-all rounded-sm ${
                activeTab === tab.id
                  ? "text-accent-foreground"
                  : "hover:bg-cream/5"
              }`}
              style={{
                color: activeTab === tab.id ? "hsl(var(--gold))" : "hsl(var(--cream) / 0.6)",
                background: activeTab === tab.id ? "hsl(var(--gold) / 0.1)" : undefined,
              }}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: "hsl(var(--cream) / 0.1)" }}>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 font-ui text-sm tracking-wider transition-colors"
            style={{ color: "hsl(var(--cream) / 0.5)" }}
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "overview" && <AdminOverview />}
            {activeTab === "products" && <AdminProducts />}
            {activeTab === "orders" && <AdminOrders />}
            {activeTab === "coupons" && <AdminCoupons />}
            {activeTab === "custom-designs" && <AdminCustomDesigns />}
            {activeTab === "reviews" && <AdminReviews />}
            {activeTab === "customers" && <AdminCustomers />}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
