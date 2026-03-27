import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  CustomDesignRequest,
  asStringArray,
  asStringRecord,
  formatCurrency,
  untypedDb,
} from "@/lib/commerce";
import ImageUpload from "./ImageUpload";

const AdminCustomDesigns = () => {
  const db = untypedDb;
  const { toast } = useToast();
  const [designs, setDesigns] = useState<CustomDesignRequest[]>([]);
  const [profilesByUserId, setProfilesByUserId] = useState<Record<string, { full_name?: string | null; phone?: string | null }>>({});
  const [drafts, setDrafts] = useState<Record<string, Partial<CustomDesignRequest>>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchDesigns = async () => {
    const [designRes, profileRes] = await Promise.all([
      db.from("custom_designs").select("*").order("created_at", { ascending: false }),
      db.from("profiles").select("user_id, full_name, phone"),
    ]);

    setDesigns((designRes.data || []) as CustomDesignRequest[]);
    setProfilesByUserId(
      ((profileRes.data || []) as Array<{ user_id: string; full_name?: string | null; phone?: string | null }>).reduce<Record<string, { full_name?: string | null; phone?: string | null }>>((acc, profile) => {
        acc[profile.user_id] = { full_name: profile.full_name, phone: profile.phone };
        return acc;
      }, {})
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  const updateDraft = (id: string, updates: Partial<CustomDesignRequest>) => {
    setDrafts((current) => ({ ...current, [id]: { ...current[id], ...updates } }));
  };

  const updateDesign = async (design: CustomDesignRequest) => {
    const draft = { ...design, ...drafts[design.id] };
    setSavingId(design.id);

    const { error } = await db.from("custom_designs").update({
      status: draft.status,
      admin_notes: draft.admin_notes || null,
      estimated_price: draft.estimated_price ? Number(draft.estimated_price) : null,
      priority: draft.priority || "normal",
      admin_reference_images: draft.admin_reference_images || [],
    }).eq("id", design.id);

    setSavingId(null);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Updated!" });
    fetchDesigns();
  };

  if (loading) return <div className="font-body text-muted-foreground">Loading...</div>;

  return (
    <div>
      <h2 className="font-display text-3xl font-light text-foreground mb-6">Custom Design Requests</h2>
      <div className="space-y-4">
        {designs.map((design) => {
          const current = { ...design, ...drafts[design.id] };
          const profile = profilesByUserId[design.user_id];

          return (
            <div key={design.id} className="border border-border p-6 bg-card">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-ui text-xs text-muted-foreground">
                    By {profile?.full_name || "User"} • {new Date(design.created_at).toLocaleDateString("en-IN")}
                  </p>
                  <p className="font-body text-foreground mt-2">{design.design_description}</p>
                  <div className="flex flex-wrap gap-3 mt-2 font-body text-sm text-muted-foreground">
                    {design.product_category && <span>Category: {design.product_category}</span>}
                    {design.fabric_type && <span>Fabric: {design.fabric_type}</span>}
                    {design.weave_style && <span>Weave: {design.weave_style}</span>}
                    {design.color_preference && <span>Color: {design.color_preference}</span>}
                    {design.size && <span>Size: {design.size}</span>}
                    {design.quantity && <span>Qty: {design.quantity}</span>}
                    {design.budget_range && <span>Budget: {design.budget_range}</span>}
                    {design.deadline_date && <span>Deadline: {new Date(design.deadline_date).toLocaleDateString("en-IN")}</span>}
                  </div>
                </div>

                <select
                  value={current.status}
                  onChange={(e) => updateDraft(design.id, { status: e.target.value })}
                  className="px-3 py-2 bg-background border border-border font-ui text-xs focus:outline-none focus:border-accent"
                >
                  {["submitted", "under_review", "approved", "rejected", "in_production", "completed"].map((status) => (
                    <option key={status} value={status}>{status.replace("_", " ")}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 text-sm">
                <div className="border border-border bg-background p-4">
                  <p className="font-ui text-[10px] tracking-wider uppercase text-muted-foreground mb-2">Customer Notes</p>
                  <p className="font-body text-foreground">{design.inspiration_notes || "No extra inspiration notes."}</p>
                </div>

                <div className="border border-border bg-background p-4">
                  <p className="font-ui text-[10px] tracking-wider uppercase text-muted-foreground mb-2">Measurements</p>
                  <p className="font-body text-foreground">
                    {Object.entries(asStringRecord(design.measurements)).map(([key, value]) => `${key.replace("_", " ")} ${value}`).join(" • ") || "No measurements"}
                  </p>
                </div>

                <div className="border border-border bg-background p-4">
                  <p className="font-ui text-[10px] tracking-wider uppercase text-muted-foreground mb-2">Delivery & Contact</p>
                  <p className="font-body text-foreground">
                    {[design.contact_phone || profile?.phone, design.delivery_city, design.delivery_state].filter(Boolean).join(" • ") || "No delivery details"}
                  </p>
                  {asStringArray(design.addons).length > 0 && (
                    <p className="mt-2 font-body text-sm text-muted-foreground">Add-ons: {asStringArray(design.addons).join(", ")}</p>
                  )}
                </div>
              </div>

              {asStringArray(design.reference_images).length > 0 && (
                <div className="mb-4">
                  <p className="font-ui text-[10px] tracking-wider uppercase text-muted-foreground mb-3">Customer Reference Images</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {asStringArray(design.reference_images).map((imageUrl) => (
                      <a key={imageUrl} href={imageUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-border">
                        <img src={imageUrl} alt="Customer reference" className="w-full h-32 object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-[1fr,180px,160px] gap-4">
                <div>
                  <label className="font-ui text-[10px] tracking-wider uppercase text-muted-foreground block mb-2">Admin Notes</label>
                  <textarea
                    rows={4}
                    value={current.admin_notes || ""}
                    onChange={(e) => updateDraft(design.id, { admin_notes: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border font-body text-foreground focus:outline-none focus:border-accent resize-none"
                  />
                </div>

                <div>
                  <label className="font-ui text-[10px] tracking-wider uppercase text-muted-foreground block mb-2">Estimated Price</label>
                  <input
                    type="number"
                    min="0"
                    value={current.estimated_price || ""}
                    onChange={(e) => updateDraft(design.id, { estimated_price: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-4 py-3 bg-background border border-border font-body text-foreground focus:outline-none focus:border-accent"
                  />
                  <p className="mt-2 font-body text-xs text-muted-foreground">
                    {current.estimated_price ? formatCurrency(current.estimated_price) : "No estimate"}
                  </p>
                </div>

                <div>
                  <label className="font-ui text-[10px] tracking-wider uppercase text-muted-foreground block mb-2">Priority</label>
                  <select
                    value={current.priority || "normal"}
                    onChange={(e) => updateDraft(design.id, { priority: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border font-body text-foreground focus:outline-none focus:border-accent"
                  >
                    {["normal", "high", "urgent"].map((priority) => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => updateDesign(design)}
                    disabled={savingId === design.id}
                    className="w-full mt-3 px-5 py-3 bg-accent text-accent-foreground font-ui text-[10px] tracking-[0.2em] uppercase disabled:opacity-50"
                  >
                    {savingId === design.id ? "Saving..." : "Save Review"}
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <ImageUpload
                  images={asStringArray(current.admin_reference_images)}
                  onChange={(images) => updateDraft(design.id, { admin_reference_images: images })}
                  bucket="design-reference-images"
                  maxImages={4}
                  label="Admin Design Options"
                  helperText="Upload design options or styling suggestions"
                />
              </div>
            </div>
          );
        })}

        {designs.length === 0 && (
          <p className="text-center py-8 font-body text-muted-foreground">No custom design requests</p>
        )}
      </div>
    </div>
  );
};

export default AdminCustomDesigns;
