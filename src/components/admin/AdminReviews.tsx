import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Star, Check, X } from "lucide-react";

const AdminReviews = () => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    const { data } = await supabase.from("reviews").select("*, product:products(name), profile:profiles(full_name)").order("created_at", { ascending: false });
    setReviews(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  const toggleApproval = async (id: string, approved: boolean) => {
    const { error } = await supabase.from("reviews").update({ is_approved: !approved }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchReviews();
  };

  if (loading) return <div className="font-body text-muted-foreground">Loading...</div>;

  return (
    <div>
      <h2 className="font-display text-3xl font-light text-foreground mb-6">Reviews</h2>
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="border border-border p-4 bg-card flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className={s <= r.rating ? "text-accent fill-accent" : "text-muted-foreground/30"} />
                  ))}
                </div>
                <span className="font-body text-sm text-muted-foreground">for {r.product?.name}</span>
              </div>
              <p className="font-body text-sm text-foreground">{r.comment}</p>
              <p className="font-ui text-xs text-muted-foreground mt-1">By {r.profile?.full_name || "User"}</p>
            </div>
            <button
              onClick={() => toggleApproval(r.id, r.is_approved)}
              className={`flex items-center gap-1 px-3 py-1 font-ui text-xs tracking-wider ${r.is_approved ? "text-green-600 bg-green-50" : "text-yellow-600 bg-yellow-50"}`}
            >
              {r.is_approved ? <><Check size={12} /> Approved</> : <><X size={12} /> Pending</>}
            </button>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-center py-8 font-body text-muted-foreground">No reviews yet</p>}
      </div>
    </div>
  );
};

export default AdminReviews;
