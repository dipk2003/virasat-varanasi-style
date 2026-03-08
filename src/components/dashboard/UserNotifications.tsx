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
      <div className="text-center py-16">
        <Bell size={48} className="mx-auto text-muted-foreground/30 mb-4" />
        <h3 className="font-display text-xl text-foreground mb-2">No notifications</h3>
        <p className="font-body text-muted-foreground">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-light text-foreground mb-6">Notifications</h2>
      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => !n.is_read && markRead(n.id)}
            className={`border border-border p-4 cursor-pointer transition-colors ${n.is_read ? "bg-card" : "bg-accent/5 border-accent/20"}`}
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
