import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LogOut, LucideIcon } from "lucide-react";
import logo from "@/assets/logo.png";

export type BusinessConsoleTab = {
  id: string;
  label: string;
  icon: LucideIcon;
};

interface BusinessConsoleLayoutProps {
  badge: string;
  title: string;
  subtitle: string;
  tabs: BusinessConsoleTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onSignOut: () => Promise<void> | void;
  children: ReactNode;
}

const BusinessConsoleLayout = ({
  badge,
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  onSignOut,
  children,
}: BusinessConsoleLayoutProps) => (
  <div className="min-h-screen bg-background flex">
    <aside className="w-72 bg-foreground flex-shrink-0 hidden lg:flex flex-col">
      <div className="p-6 border-b" style={{ borderColor: "hsl(var(--cream) / 0.1)" }}>
        <Link to="/">
          <img src={logo} alt="Virasat" className="h-12 brightness-200" />
        </Link>
        <p className="font-ui text-xs tracking-[0.2em] uppercase mt-3" style={{ color: "hsl(var(--gold))" }}>
          {badge}
        </p>
        <h1 className="font-display text-2xl text-white mt-4">{title}</h1>
        <p className="font-body text-sm mt-2" style={{ color: "hsl(var(--cream) / 0.7)" }}>
          {subtitle}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 font-ui text-sm tracking-wider transition-all rounded-sm ${
              activeTab === tab.id ? "text-accent-foreground" : "hover:bg-cream/5"
            }`}
            style={{
              color: activeTab === tab.id ? "hsl(var(--gold))" : "hsl(var(--cream) / 0.7)",
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
          type="button"
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 font-ui text-sm tracking-wider transition-colors"
          style={{ color: "hsl(var(--cream) / 0.5)" }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>

    <main className="flex-1 overflow-y-auto">
      <div className="p-6 lg:p-8">
        <div className="lg:hidden mb-6 space-y-4">
          <div className="border border-border bg-card p-4">
            <p className="font-ui text-[10px] tracking-[0.2em] uppercase text-accent">{badge}</p>
            <h1 className="font-display text-2xl text-foreground mt-2">{title}</h1>
            <p className="font-body text-sm text-muted-foreground mt-2">{subtitle}</p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex-shrink-0 border px-4 py-2 font-ui text-[10px] tracking-[0.18em] uppercase ${
                  activeTab === tab.id
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-muted-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </div>
    </main>
  </div>
);

export default BusinessConsoleLayout;
