import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Star } from "lucide-react";

const UserReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("reviews")
      .select("*, product:products(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setReviews(data || []);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <div className="font-body text-muted-foreground">Loading...</div>;

  if (reviews.length === 0) {
    return (
      <div className="text-center py-16">
        <Star size={48} className="mx-auto text-muted-foreground/30 mb-4" />
        <h3 className="font-display text-xl text-foreground mb-2">No reviews yet</h3>
        <p className="font-body text-muted-foreground">Purchase an item to leave a review.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-light text-foreground mb-6">My Reviews</h2>
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="border border-border p-4 bg-card">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} className={s <= r.rating ? "text-accent fill-accent" : "text-muted-foreground/30"} />
                ))}
              </div>
              <span className="font-body text-sm text-muted-foreground">for {r.product?.name}</span>
            </div>
            {r.title && <h4 className="font-display text-base text-foreground">{r.title}</h4>}
            {r.comment && <p className="font-body text-sm text-muted-foreground mt-1">{r.comment}</p>}
            <span className={`mt-2 inline-block font-ui text-[10px] tracking-wider px-2 py-0.5 ${r.is_approved ? "text-green-600 bg-green-50" : "text-yellow-600 bg-yellow-50"}`}>
              {r.is_approved ? "Approved" : "Pending"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserReviews;
