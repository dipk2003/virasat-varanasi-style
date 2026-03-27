import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Trash2 } from "lucide-react";

const UserWishlist = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("wishlist")
      .select("*, product:products(*)")
      .eq("user_id", user.id);
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchWishlist(); }, [user]);

  const removeItem = async (id: string) => {
    await supabase.from("wishlist").delete().eq("id", id);
    setItems(items.filter((i) => i.id !== id));
  };

  if (loading) return <div className="font-body text-muted-foreground">Loading...</div>;

  if (items.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-border bg-card/95 py-16 text-center">
        <Heart size={48} className="mx-auto mb-4 text-muted-foreground/30" />
        <h3 className="mb-2 font-display text-2xl text-foreground">Your wishlist is empty</h3>
        <p className="font-body text-muted-foreground">Save your favorite pieces here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-border/80 bg-[linear-gradient(160deg,hsl(var(--accent)/0.08),transparent_36%),linear-gradient(180deg,hsl(var(--card)),hsl(var(--card)))] p-6 sm:p-7">
        <p className="font-ui text-[10px] tracking-[0.26em] uppercase text-accent">Saved Favourites</p>
        <h2 className="mt-3 font-display text-3xl text-foreground">My Wishlist</h2>
        <p className="mt-3 max-w-2xl font-body text-sm leading-7 text-muted-foreground">
          Shortlisted pieces ko yahan save rakho aur right time par checkout me move karo.
        </p>
      </section>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 rounded-[24px] border border-border/80 bg-card/95 p-4 shadow-[0_18px_55px_-44px_hsl(var(--foreground)/0.7)]">
            {item.product?.images?.[0] && (
              <img src={item.product.images[0]} alt={item.product.name} className="h-24 w-20 rounded-2xl object-cover" />
            )}
            <div className="flex-1">
              <h4 className="font-display text-lg text-foreground">{item.product?.name}</h4>
              <p className="font-ui text-sm text-accent">₹{item.product?.price}</p>
            </div>
            <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserWishlist;
