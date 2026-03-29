import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminCustomers from "@/components/admin/AdminCustomers";
import AdminCoupons from "@/components/admin/AdminCoupons";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminHomepageBanners from "@/components/admin/AdminHomepageBanners";
import AdminLogistics from "@/components/admin/AdminLogistics";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminTeamAccess from "@/components/admin/AdminTeamAccess";
import BusinessConsoleLayout from "@/components/admin/BusinessConsoleLayout";
import SuperAdminOverview from "@/components/admin/SuperAdminOverview";
import { businessConsoleConfigs } from "@/lib/businessConsole";

type DashboardLocationState = {
  initialTab?: string;
};

const SuperAdminDashboard = () => {
  const config = businessConsoleConfigs["super-admin"];
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
      {activeTab === "overview" && <SuperAdminOverview />}
      {activeTab === "team-access" && <AdminTeamAccess />}
      {activeTab === "brand-control" && <AdminSettings />}
      {activeTab === "homepage-banners" && <AdminHomepageBanners />}
      {activeTab === "orders" && <AdminOrders />}
      {activeTab === "coupons" && <AdminCoupons />}
      {activeTab === "customers" && <AdminCustomers />}
      {activeTab === "catalog" && <AdminProducts portal="super-admin" />}
      {activeTab === "logistics" && <AdminLogistics />}
    </BusinessConsoleLayout>
  );
};

export default SuperAdminDashboard;
