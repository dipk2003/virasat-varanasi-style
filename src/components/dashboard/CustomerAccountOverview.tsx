import { useEffect, useState } from "react";
import { ArrowRight, Headset, Heart, MapPin, Package, Palette, ShoppingBag, Sparkles, Star, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, orderStatusLabels } from "@/lib/commerce";

const quickLinks = [
  {
    eyebrow: "Shop edit",
    title: "Continue Shopping",
    description: "Browse fresh festive arrivals, bestselling sarees, and ready-to-ship kurti edits.",
    href: "/shop",
    icon: ShoppingBag,
  },
  {
    eyebrow: "Atelier desk",
    title: "Custom Design Brief",
    description: "Share blouse, saree, lehenga, or gifting requirements with fabric and fit notes.",
    href: "/dashboard?tab=custom",
    icon: Palette,
  },
  {
    eyebrow: "Saved picks",
    title: "Wishlist Review",
    description: "Return to shortlisted pieces and move favourites into cart faster.",
    href: "/dashboard?tab=wishlist",
    icon: Heart,
  },
  {
    eyebrow: "Live support",
    title: "Support Chat",
    description: "Ask about products, delivery, or order issues and continue the conversation live.",
    href: "/dashboard?tab=support",
    icon: Headset,
  },
];

type RecentOrder = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
};

const CustomerAccountOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    orders: 0,
    wishlist: 0,
    reviews: 0,
    addresses: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchOverview = async () => {
      const [ordersRes, wishlistRes, reviewsRes, addressesRes] = await Promise.all([
        supabase
          .from("orders")
          .select("id, order_number, status, total, created_at", { count: "exact" })
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3),
        supabase.from("wishlist").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase
          .from("customer_addresses")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

      setStats({
        orders: ordersRes.count || 0,
        wishlist: wishlistRes.count || 0,
        reviews: reviewsRes.count || 0,
        addresses: addressesRes.error ? 0 : addressesRes.count || 0,
      });
      setRecentOrders((ordersRes.data || []) as RecentOrder[]);
    };

    fetchOverview();
  }, [user]);

  const latestOrder = recentOrders[0];
  const statCards = [
    {
      label: "Orders Placed",
      value: stats.orders,
      helper: stats.orders > 0 ? "Track every shipment stage" : "Start your first purchase",
      icon: Package,
    },
    {
      label: "Wishlist Items",
      value: stats.wishlist,
      helper: stats.wishlist > 0 ? "Ready for your next checkout" : "Save designs you love",
      icon: Heart,
    },
    {
      label: "Reviews Shared",
      value: stats.reviews,
      helper: stats.reviews > 0 ? "Your style feedback is live" : "Review after each delivery",
      icon: Star,
    },
    {
      label: "Saved Addresses",
      value: stats.addresses,
      helper: stats.addresses > 0 ? "Faster checkout on repeat orders" : "Add delivery details once",
      icon: MapPin,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-border/80 bg-[linear-gradient(160deg,hsl(var(--accent)/0.12),transparent_38%),linear-gradient(180deg,hsl(var(--card)),hsl(var(--card)))] p-6 shadow-[0_22px_70px_-44px_hsl(var(--gold)/0.55)] sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
          <div>
            <p className="font-ui text-[10px] tracking-[0.3em] uppercase text-accent">
              Customer Account
            </p>
            <h2 className="mt-4 max-w-3xl font-display text-3xl text-foreground sm:text-5xl">
              Shop Faster From Your Personal Buying Desk
            </h2>
            <p className="mt-4 max-w-2xl font-body text-sm leading-7 text-muted-foreground sm:text-base">
              Yahan se aap orders track kar sakte ho, wishlist aur saved addresses manage kar sakte ho,
              aur made-to-order design brief bhi submit kar sakte ho without business-console clutter.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 font-ui text-[11px] tracking-[0.24em] uppercase text-accent-foreground transition-colors hover:bg-gold-dark"
              >
                Continue Shopping
              </Link>
              <Link
                to="/dashboard?tab=orders"
                className="inline-flex items-center justify-center rounded-full border border-border bg-background/70 px-6 py-3 font-ui text-[11px] tracking-[0.24em] uppercase text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                Track Orders
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[24px] border border-border/70 bg-background/70 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <Truck size={18} />
                </div>
                <div>
                  <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                    Latest Order
                  </p>
                  <p className="mt-1 font-display text-xl text-foreground">
                    {latestOrder ? latestOrder.order_number : "No purchase yet"}
                  </p>
                </div>
              </div>
              <p className="mt-3 font-body text-sm leading-6 text-muted-foreground">
                {latestOrder
                  ? `${orderStatusLabels[latestOrder.status as keyof typeof orderStatusLabels] || latestOrder.status} • ${formatCurrency(latestOrder.total)}`
                  : "Shop se first purchase karte hi yahan latest delivery status dikhne lagega."}
              </p>
            </div>

            <div className="rounded-[24px] border border-border/70 bg-background/70 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                    Premium Convenience
                  </p>
                  <p className="mt-1 font-display text-xl text-foreground">
                    {stats.addresses > 0 ? "Ready for quick checkout" : "Complete your account"}
                  </p>
                </div>
              </div>
              <p className="mt-3 font-body text-sm leading-6 text-muted-foreground">
                {stats.addresses > 0
                  ? "Saved address aur order history ki wajah se repeat checkout streamlined hai."
                  : "Profile aur address details add karke buyer experience aur polished banao."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-[26px] border border-border/80 bg-card/95 p-5 shadow-[0_18px_50px_-44px_hsl(var(--foreground)/0.65)]"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
              <card.icon size={18} />
            </div>
            <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-3 font-display text-4xl text-foreground">{card.value}</p>
            <p className="mt-2 font-body text-sm leading-6 text-muted-foreground">{card.helper}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <section className="rounded-[30px] border border-border/80 bg-card/95 p-6 shadow-[0_20px_60px_-46px_hsl(var(--foreground)/0.55)]">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                Recent Orders
              </p>
              <h3 className="mt-2 font-display text-3xl text-foreground">Purchase History</h3>
            </div>
            <Link
              to="/dashboard?tab=orders"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 font-ui text-[10px] tracking-[0.2em] uppercase text-accent transition-colors hover:border-accent"
            >
              View All
              <ArrowRight size={14} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-border bg-background/60 p-8 text-center">
              <ShoppingBag size={34} className="mx-auto text-muted-foreground/35" />
              <p className="mt-4 font-display text-2xl text-foreground">No purchases yet</p>
              <p className="mt-2 font-body text-sm leading-6 text-muted-foreground">
                Start with featured collections and your account will begin showing order timelines here.
              </p>
              <Link
                to="/shop"
                className="mt-5 inline-flex items-center gap-2 font-ui text-[10px] tracking-[0.2em] uppercase text-accent"
              >
                Explore Shop
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-[22px] border border-border/70 bg-background/60 p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-xl text-foreground">{order.order_number}</p>
                      <p className="mt-1 font-body text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                        Status
                      </p>
                      <p className="mt-2 font-body text-sm text-foreground">
                        {orderStatusLabels[order.status as keyof typeof orderStatusLabels] || order.status}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
                    <p className="font-display text-2xl text-foreground">{formatCurrency(order.total)}</p>
                    <Link
                      to="/dashboard?tab=orders"
                      className="inline-flex items-center gap-2 font-ui text-[10px] tracking-[0.2em] uppercase text-accent"
                    >
                      Open Order Desk
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="space-y-4">
          {quickLinks.map((link) => (
            <Link
              key={link.title}
              to={link.href}
              className="block rounded-[28px] border border-border/80 bg-card/95 p-5 transition-all hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-[0_18px_40px_-34px_hsl(var(--gold)/0.7)]"
            >
              <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-accent">{link.eyebrow}</p>
              <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
                <link.icon size={18} />
              </div>
              <h3 className="mt-4 font-display text-2xl text-foreground">{link.title}</h3>
              <p className="mt-2 font-body text-sm leading-6 text-muted-foreground">
                {link.description}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 font-ui text-[10px] tracking-[0.2em] uppercase text-accent">
                Open
                <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerAccountOverview;
