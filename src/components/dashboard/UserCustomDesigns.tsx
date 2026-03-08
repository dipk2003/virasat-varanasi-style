import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Palette } from "lucide-react";

const statusColors: Record<string, string> = {
  submitted: "text-blue-600 bg-blue-50",
  under_review: "text-yellow-600 bg-yellow-50",
  approved: "text-green-600 bg-green-50",
  rejected: "text-red-600 bg-red-50",
  in_production: "text-indigo-600 bg-indigo-50",
  completed: "text-emerald-600 bg-emerald-50",
};

const UserCustomDesigns = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fabric_type: "", color_preference: "", design_description: "", budget_range: "", size: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchDesigns = async () => {
    if (!user) return;
    const { data } = await supabase.from("custom_designs").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setDesigns(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchDesigns(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("custom_designs").insert({ ...form, user_id: user.id });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Design submitted!", description: "Our artisans will review your request." });
      setShowForm(false);
      setForm({ fabric_type: "", color_preference: "", design_description: "", budget_range: "", size: "" });
      fetchDesigns();
    }
  };

  if (loading) return <div className="font-body text-muted-foreground">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-light text-foreground">Custom Designs</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-6 py-2 bg-accent text-accent-foreground font-ui text-xs tracking-[0.2em] uppercase hover:bg-gold-dark transition-colors">
          {showForm ? "Cancel" : "New Request"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-border p-6 bg-card mb-6 space-y-4">
          {[
            { key: "fabric_type", label: "Preferred Fabric", placeholder: "e.g., Banarasi Silk, Cotton" },
            { key: "color_preference", label: "Color Preference", placeholder: "e.g., Maroon with gold" },
            { key: "size", label: "Size", placeholder: "e.g., S, M, L, XL" },
            { key: "budget_range", label: "Budget Range", placeholder: "e.g., ₹3,000 - ₹5,000" },
          ].map((f) => (
            <div key={f.key}>
              <label className="font-ui text-xs tracking-wider uppercase text-muted-foreground block mb-2">{f.label}</label>
              <input
                type="text"
                value={(form as any)[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className="w-full px-4 py-3 bg-background border border-border font-body text-foreground focus:outline-none focus:border-accent"
              />
            </div>
          ))}
          <div>
            <label className="font-ui text-xs tracking-wider uppercase text-muted-foreground block mb-2">Design Description *</label>
            <textarea
              value={form.design_description}
              onChange={(e) => setForm({ ...form, design_description: e.target.value })}
              required
              rows={4}
              placeholder="Describe your dream kurti in detail..."
              className="w-full px-4 py-3 bg-background border border-border font-body text-foreground focus:outline-none focus:border-accent resize-none"
            />
          </div>
          <button type="submit" disabled={submitting} className="px-8 py-3 bg-accent text-accent-foreground font-ui text-sm tracking-[0.2em] uppercase hover:bg-gold-dark transition-colors disabled:opacity-50">
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      )}

      {designs.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <Palette size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-display text-xl text-foreground mb-2">No custom design requests</h3>
          <p className="font-body text-muted-foreground">Submit a request to create your dream kurti.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {designs.map((d) => (
            <div key={d.id} className="border border-border p-4 bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="font-ui text-xs text-muted-foreground">
                  {new Date(d.created_at).toLocaleDateString("en-IN")}
                </span>
                <span className={`px-3 py-1 font-ui text-[10px] tracking-wider uppercase ${statusColors[d.status] || ""}`}>
                  {d.status.replace("_", " ")}
                </span>
              </div>
              <p className="font-body text-foreground">{d.design_description}</p>
              {d.admin_notes && (
                <p className="mt-2 font-body text-sm text-accent">Admin: {d.admin_notes}</p>
              )}
              {d.estimated_price && (
                <p className="mt-1 font-ui text-sm text-foreground">Estimated: ₹{d.estimated_price}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserCustomDesigns;
