import {
  BarChart3,
  Headset,
  LayoutDashboard,
  LayoutTemplate,
  Package,
  Palette,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Star,
  Tag,
  Truck,
  Users,
} from "lucide-react";
import { BusinessConsoleTab } from "@/components/admin/BusinessConsoleLayout";

export type ConsolePortal = "admin" | "super-admin";

export const adminTabs: BusinessConsoleTab[] = [
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

export const superAdminTabs: BusinessConsoleTab[] = [
  { id: "overview", label: "Owner Overview", icon: LayoutDashboard },
  { id: "team-access", label: "Team & Access", icon: ShieldCheck },
  { id: "brand-control", label: "Brand Control", icon: Settings },
  { id: "homepage-banners", label: "Homepage Banner", icon: LayoutTemplate },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "coupons", label: "Coupons", icon: Tag },
  { id: "customers", label: "Customers", icon: Users },
  { id: "catalog", label: "Catalog", icon: Package },
  { id: "logistics", label: "Logistics", icon: Truck },
];

export const businessConsoleConfigs: Record<
  ConsolePortal,
  {
    badge: string;
    title: string;
    subtitle: string;
    tabs: BusinessConsoleTab[];
    catalogTabId: string;
    rootPath: string;
  }
> = {
  admin: {
    badge: "Admin Operations Console",
    title: "Operations Dashboard",
    subtitle: "Daily catalog, order, customer, and review management yahan se handle hoga.",
    tabs: adminTabs,
    catalogTabId: "products",
    rootPath: "/admin",
  },
  "super-admin": {
    badge: "Super Admin Control Tower",
    title: "Business Control Tower",
    subtitle: "Sensitive platform controls, owner decisions, and white-label business settings yahan isolate kiye gaye hain.",
    tabs: superAdminTabs,
    catalogTabId: "catalog",
    rootPath: "/super-admin",
  },
};

export const getProductCreatePath = (portal: ConsolePortal) =>
  portal === "admin" ? "/admin/products/new" : "/super-admin/products/new";

export const getProductEditPath = (portal: ConsolePortal, productId: string) =>
  portal === "admin" ? `/admin/products/${productId}/edit` : `/super-admin/products/${productId}/edit`;
