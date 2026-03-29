import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminCoupons from "@/components/admin/AdminCoupons";
import AdminCustomDesigns from "@/components/admin/AdminCustomDesigns";
import AdminReviews from "@/components/admin/AdminReviews";
import AdminCustomers from "@/components/admin/AdminCustomers";
import AdminInventory from "@/components/admin/AdminInventory";
import AdminSupportInbox from "@/components/admin/AdminSupportInbox";
import BusinessConsoleLayout from "@/components/admin/BusinessConsoleLayout";
import { businessConsoleConfigs } from "@/lib/businessConsole";

type DashboardLocationState = {
  initialTab?: string;
};

const AdminDashboard = () => {
  const config = businessConsoleConfigs.admin;
  const location = useLocation();
  const requestedTab = (location.state as DashboardLocationState | null)?.initialTab;
  const [activeTab, setActiveTab] = useState(
    requestedTab && config.tabs.some((tab) => tab.id === requestedTab) ? requestedTab : "overview"
  );
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <BusinessConsoleLayout
      badge={config.badge}
      title={config.title}
      subtitle={config.subtitle}
      tabs={config.tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onSignOut={handleSignOut}
    >
      {activeTab === "overview" && <AdminOverview />}
      {activeTab === "products" && <AdminProducts portal="admin" />}
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
