import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Package, Heart, Star, RefreshCcw, MapPin, Bell, User, LogOut, Palette, ShoppingBag,
} from "lucide-react";
import logo from "@/assets/logo.png";
import UserOrders from "@/components/dashboard/UserOrders";
import UserProfile from "@/components/dashboard/UserProfile";
import UserWishlist from "@/components/dashboard/UserWishlist";
import UserReviews from "@/components/dashboard/UserReviews";
import UserCustomDesigns from "@/components/dashboard/UserCustomDesigns";
import UserNotifications from "@/components/dashboard/UserNotifications";

const tabs = [
  { id: "orders", label: "My Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "custom", label: "Custom Designs", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "profile", label: "Profile", icon: User },
];

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Virasat" className="h-10" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="font-ui text-xs tracking-wider uppercase text-muted-foreground hover:text-accent">
              <ShoppingBag size={18} />
            </Link>
            <button onClick={handleSignOut} className="font-ui text-xs tracking-wider uppercase text-muted-foreground hover:text-destructive flex items-center gap-1">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl font-light text-foreground">
            Welcome, {user?.user_metadata?.full_name || "User"}
          </h1>
          <p className="font-body text-muted-foreground mt-1">{user?.email}</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <nav className="lg:w-64 flex-shrink-0">
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 font-ui text-sm tracking-wider whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 min-w-0"
          >
            {activeTab === "orders" && <UserOrders />}
            {activeTab === "wishlist" && <UserWishlist />}
            {activeTab === "reviews" && <UserReviews />}
            {activeTab === "custom" && <UserCustomDesigns />}
            {activeTab === "notifications" && <UserNotifications />}
            {activeTab === "profile" && <UserProfile />}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
