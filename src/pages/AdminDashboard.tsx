import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Tag, Palette, Star, Users, BarChart3, Headset,
} from "lucide-react";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminCoupons from "@/components/admin/AdminCoupons";
import AdminCustomDesigns from "@/components/admin/AdminCustomDesigns";
import AdminReviews from "@/components/admin/AdminReviews";
import AdminCustomers from "@/components/admin/AdminCustomers";
import AdminInventory from "@/components/admin/AdminInventory";
import AdminSupportInbox from "@/components/admin/AdminSupportInbox";
import BusinessConsoleLayout, { BusinessConsoleTab } from "@/components/admin/BusinessConsoleLayout";

const adminTabs: BusinessConsoleTab[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "inventory", label: "Inventory", icon: BarChart3 },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "coupons", label: "Coupons", icon: Tag },
  { id: "custom-designs", label: "Custom Designs", icon: Palette },
  { id: "support", label: "Support", icon: Headset },
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
    <BusinessConsoleLayout
      badge="Admin Operations Console"
      title="Operations Dashboard"
      subtitle="Daily catalog, order, customer, and review management yahan se handle hoga."
      tabs={adminTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onSignOut={handleSignOut}
    >
      {activeTab === "overview" && <AdminOverview />}
      {activeTab === "products" && <AdminProducts />}
      {activeTab === "inventory" && <AdminInventory />}
      {activeTab === "orders" && <AdminOrders />}
      {activeTab === "coupons" && <AdminCoupons />}
      {activeTab === "custom-designs" && <AdminCustomDesigns />}
      {activeTab === "support" && <AdminSupportInbox />}
      {activeTab === "reviews" && <AdminReviews />}
      {activeTab === "customers" && <AdminCustomers />}
    </BusinessConsoleLayout>
  );
};

export default AdminDashboard;
