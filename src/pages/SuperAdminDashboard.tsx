import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AdminCustomers from "@/components/admin/AdminCustomers";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminTeamAccess from "@/components/admin/AdminTeamAccess";
import BusinessConsoleLayout, { BusinessConsoleTab } from "@/components/admin/BusinessConsoleLayout";
import SuperAdminOverview from "@/components/admin/SuperAdminOverview";

const superAdminTabs: BusinessConsoleTab[] = [
  { id: "overview", label: "Owner Overview", icon: LayoutDashboard },
  { id: "team-access", label: "Team & Access", icon: ShieldCheck },
  { id: "brand-control", label: "Brand Control", icon: Settings },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "customers", label: "Customers", icon: Users },
  { id: "catalog", label: "Catalog", icon: Package },
  { id: "logistics", label: "Logistics", icon: Truck },
];

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <BusinessConsoleLayout
      badge="Super Admin Control Tower"
      title="Business Control Tower"
      subtitle="Sensitive platform controls, owner decisions, and white-label business settings yahan isolate kiye gaye hain."
      tabs={superAdminTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onSignOut={handleSignOut}
    >
      {activeTab === "overview" && <SuperAdminOverview />}
      {activeTab === "team-access" && <AdminTeamAccess />}
      {activeTab === "brand-control" && <AdminSettings />}
      {activeTab === "orders" && <AdminOrders />}
      {activeTab === "customers" && <AdminCustomers />}
      {activeTab === "catalog" && <AdminProducts />}
      {activeTab === "logistics" && <AdminSettings />}
    </BusinessConsoleLayout>
  );
};

export default SuperAdminDashboard;
