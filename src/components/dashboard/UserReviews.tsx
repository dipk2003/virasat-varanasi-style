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
      <div className="rounded-[28px] border border-dashed border-border bg-card/95 py-16 text-center">
        <Star size={48} className="mx-auto mb-4 text-muted-foreground/30" />
        <h3 className="mb-2 font-display text-2xl text-foreground">No reviews yet</h3>
        <p className="font-body text-muted-foreground">Purchase an item to leave a review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-border/80 bg-[linear-gradient(160deg,hsl(var(--accent)/0.08),transparent_36%),linear-gradient(180deg,hsl(var(--card)),hsl(var(--card)))] p-6 sm:p-7">
        <p className="font-ui text-[10px] tracking-[0.26em] uppercase text-accent">Style Feedback</p>
        <h2 className="mt-3 font-display text-3xl text-foreground">My Reviews</h2>
        <p className="mt-3 max-w-2xl font-body text-sm leading-7 text-muted-foreground">
          Yahan aapke product opinions, ratings, aur approved review history store hoti hai.
        </p>
      </section>
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-[24px] border border-border/80 bg-card/95 p-5 shadow-[0_18px_55px_-44px_hsl(var(--foreground)/0.7)]">
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
