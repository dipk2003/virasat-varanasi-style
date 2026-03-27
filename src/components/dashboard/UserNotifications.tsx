import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bell } from "lucide-react";

const UserNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      setNotifications(data || []);
      setLoading(false);
    });
  }, [user]);

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications(notifications.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  if (loading) return <div className="font-body text-muted-foreground">Loading...</div>;

  if (notifications.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-border bg-card/95 py-16 text-center">
        <Bell size={48} className="mx-auto mb-4 text-muted-foreground/30" />
        <h3 className="mb-2 font-display text-2xl text-foreground">No notifications</h3>
        <p className="font-body text-muted-foreground">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-border/80 bg-[linear-gradient(160deg,hsl(var(--accent)/0.08),transparent_36%),linear-gradient(180deg,hsl(var(--card)),hsl(var(--card)))] p-6 sm:p-7">
        <p className="font-ui text-[10px] tracking-[0.26em] uppercase text-accent">Updates</p>
        <h2 className="mt-3 font-display text-3xl text-foreground">Notifications</h2>
        <p className="mt-3 max-w-2xl font-body text-sm leading-7 text-muted-foreground">
          Order updates, account alerts, aur important store messages yahan readable timeline me rahenge.
        </p>
      </section>
      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => !n.is_read && markRead(n.id)}
            className={`cursor-pointer rounded-[22px] border p-4 transition-colors ${n.is_read ? "border-border bg-card/95" : "border-accent/20 bg-accent/5"}`}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-display text-base text-foreground">{n.title}</h4>
              <span className="font-ui text-[10px] text-muted-foreground">
                {new Date(n.created_at).toLocaleDateString("en-IN")}
              </span>
            </div>
            <p className="font-body text-sm text-muted-foreground mt-1">{n.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserNotifications;
