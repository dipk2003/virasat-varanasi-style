import { Building2, ShieldCheck, Store, Truck } from "lucide-react";
import AdminOverview from "@/components/admin/AdminOverview";

const controlAreas = [
  {
    title: "Platform Access",
    description: "Admin, super admin, bootstrap rules, and role governance stay isolated here.",
    icon: ShieldCheck,
  },
  {
    title: "Brand Controls",
    description: "Store identity, support channels, policies, and white-label configuration stay under owner control.",
    icon: Store,
  },
  {
    title: "Fulfillment Contracts",
    description: "Delivery partner activation, API configs, and logistics escalation should be reviewed from the owner console.",
    icon: Truck,
  },
  {
    title: "Business Health",
    description: "Revenue, order risk, operational load, and team access can be monitored from one place.",
    icon: Building2,
  },
];

const SuperAdminOverview = () => (
  <div className="space-y-6">
    <div className="border border-border bg-card p-6">
      <p className="font-ui text-[10px] tracking-[0.2em] uppercase text-accent">Sensitive Business Area</p>
      <h2 className="font-display text-3xl font-light text-foreground mt-3">Platform Owner Overview</h2>
      <p className="font-body text-sm text-muted-foreground mt-3 max-w-3xl">
        Ye console customer-facing nahi hai. Isme team access, brand control, delivery contracts, and core business decisions isolate karke rakhe gaye hain.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {controlAreas.map((area) => (
        <div key={area.title} className="border border-border bg-card p-5">
          <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
            <area.icon size={20} />
          </div>
          <h3 className="font-display text-xl text-foreground">{area.title}</h3>
          <p className="font-body text-sm text-muted-foreground mt-2">{area.description}</p>
        </div>
      ))}
    </div>

    <AdminOverview />
  </div>
);

export default SuperAdminOverview;
