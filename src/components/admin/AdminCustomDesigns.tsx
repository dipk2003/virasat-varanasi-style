import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminCustomDesigns = () => {
  const { toast } = useToast();
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDesigns = async () => {
    const { data } = await supabase.from("custom_designs").select("*, profile:profiles(full_name)").order("created_at", { ascending: false });
    setDesigns(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchDesigns(); }, []);

  const updateDesign = async (id: string, updates: any) => {
    const { error } = await supabase.from("custom_designs").update(updates).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Updated!" }); fetchDesigns(); }
  };

  if (loading) return <div className="font-body text-muted-foreground">Loading...</div>;

  return (
    <div>
      <h2 className="font-display text-3xl font-light text-foreground mb-6">Custom Design Requests</h2>
      <div className="space-y-4">
        {designs.map((d) => (
          <div key={d.id} className="border border-border p-6 bg-card">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <p className="font-ui text-xs text-muted-foreground">
                  By {d.profile?.full_name || "User"} • {new Date(d.created_at).toLocaleDateString("en-IN")}
                </p>
                <p className="font-body text-foreground mt-2">{d.design_description}</p>
                <div className="flex flex-wrap gap-3 mt-2 font-body text-sm text-muted-foreground">
                  {d.fabric_type && <span>Fabric: {d.fabric_type}</span>}
                  {d.color_preference && <span>Color: {d.color_preference}</span>}
                  {d.size && <span>Size: {d.size}</span>}
                  {d.budget_range && <span>Budget: {d.budget_range}</span>}
                </div>
              </div>
              <select
                value={d.status}
                onChange={(e) => updateDesign(d.id, { status: e.target.value })}
                className="px-3 py-2 bg-background border border-border font-ui text-xs focus:outline-none focus:border-accent"
              >
                {["submitted", "under_review", "approved", "rejected", "in_production", "completed"].map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
        {designs.length === 0 && <p className="text-center py-8 font-body text-muted-foreground">No custom design requests</p>}
      </div>
    </div>
  );
};

export default AdminCustomDesigns;
