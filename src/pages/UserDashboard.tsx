import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Bell,
  Headset,
  Heart,
  LogOut,
  MapPin,
  MessageSquare,
  Package,
  Palette,
  ShoppingBag,
  Star,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";
import CustomerAccountOverview from "@/components/dashboard/CustomerAccountOverview";
import UserOrders from "@/components/dashboard/UserOrders";
import UserAddresses from "@/components/dashboard/UserAddresses";
import UserProfile from "@/components/dashboard/UserProfile";
import UserWishlist from "@/components/dashboard/UserWishlist";
import UserReviews from "@/components/dashboard/UserReviews";
import UserCustomDesigns from "@/components/dashboard/UserCustomDesigns";
import UserNotifications from "@/components/dashboard/UserNotifications";
import UserSupport from "@/components/dashboard/UserSupport";

const tabs = [
  { id: "overview", label: "Account Home", icon: ShoppingBag },
  { id: "orders", label: "My Orders", icon: Package },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "custom", label: "Custom Designs", icon: Palette },
  { id: "support", label: "Support", icon: MessageSquare },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "profile", label: "Profile", icon: User },
];

const UserDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    tabs.some((tab) => tab.id === requestedTab) ? requestedTab! : "overview"
  );
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (requestedTab && tabs.some((tab) => tab.id === requestedTab)) {
      setActiveTab(requestedTab);
    }
  }, [requestedTab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", tabId);
    setSearchParams(nextParams, { replace: true });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const shopperName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0]?.replace(/[._-]/g, " ") ||
    "Shopper";

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--background))_56%,hsl(var(--muted)/0.4))]">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Virasat" className="h-10 sm:h-12" />
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 font-ui text-[10px] tracking-[0.24em] uppercase text-muted-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <ShoppingBag size={15} />
              Shop
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 font-ui text-[10px] tracking-[0.24em] uppercase text-muted-foreground transition-colors hover:border-destructive/30 hover:text-destructive"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-10">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-[28px] border border-border/80 bg-[linear-gradient(160deg,hsl(var(--accent)/0.08),transparent_34%),linear-gradient(180deg,hsl(var(--card)),hsl(var(--card)))] p-6 shadow-[0_18px_60px_-48px_hsl(var(--foreground)/0.45)] sm:p-8"
        >
          <div className="max-w-4xl">
            <p className="font-ui text-[10px] tracking-[0.28em] uppercase text-accent">Customer Account</p>
            <h1 className="mt-4 font-display text-3xl font-light text-foreground sm:text-5xl">
              Welcome back, {shopperName}
            </h1>
            <p className="mt-4 max-w-3xl font-body text-sm leading-7 text-muted-foreground sm:text-base">
              Shopping, orders, support, saved addresses, aur custom requests ke liye yeh clean buyer space hai.
              Business ERP clutter yahan nahi dikhaya jayega.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 font-ui text-[11px] tracking-[0.24em] uppercase text-accent-foreground transition-colors hover:bg-gold-dark"
            >
              Continue Shopping
            </Link>
            <button
              onClick={() => handleTabChange("orders")}
              className="inline-flex items-center justify-center rounded-full border border-border bg-background/65 px-6 py-3 font-ui text-[11px] tracking-[0.24em] uppercase text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              Track Orders
            </button>
            <button
              onClick={() => handleTabChange("support")}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background/65 px-6 py-3 font-ui text-[11px] tracking-[0.24em] uppercase text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <Headset size={14} />
              Support Chat
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {["Minimal buyer dashboard", "Live support thread", "Custom design upload", "Mobile-first account"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-border bg-background/65 px-3 py-1.5 font-ui text-[10px] tracking-[0.18em] uppercase text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </motion.section>

        <div className="mt-8 grid gap-8 xl:grid-cols-[260px,minmax(0,1fr)]">
          <nav className="xl:sticky xl:top-24 xl:self-start">
            <div className="rounded-[24px] border border-border/80 bg-card/95 p-3 shadow-[0_18px_40px_-36px_hsl(var(--foreground)/0.4)]">
              <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left font-ui text-[11px] tracking-[0.16em] uppercase transition-all ${
                      activeTab === tab.id
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <tab.icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </nav>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22 }}
            className="min-w-0"
          >
            {activeTab === "overview" && <CustomerAccountOverview />}
            {activeTab === "orders" && <UserOrders />}
            {activeTab === "addresses" && <UserAddresses />}
            {activeTab === "wishlist" && <UserWishlist />}
            {activeTab === "reviews" && <UserReviews />}
            {activeTab === "custom" && <UserCustomDesigns />}
            {activeTab === "support" && <UserSupport />}
            {activeTab === "notifications" && <UserNotifications />}
            {activeTab === "profile" && <UserProfile />}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
