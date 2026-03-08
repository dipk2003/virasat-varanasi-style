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
      <div className="text-center py-16">
        <Heart size={48} className="mx-auto text-muted-foreground/30 mb-4" />
        <h3 className="font-display text-xl text-foreground mb-2">Your wishlist is empty</h3>
        <p className="font-body text-muted-foreground">Save your favorite pieces here.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-light text-foreground mb-6">My Wishlist</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className="border border-border p-4 bg-card flex gap-4">
            {item.product?.images?.[0] && (
              <img src={item.product.images[0]} alt={item.product.name} className="w-20 h-24 object-cover" />
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
