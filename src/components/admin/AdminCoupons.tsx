import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const AdminCoupons = () => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "", description: "", discount_type: "percentage", discount_value: "",
    min_order_amount: "0", max_uses: "", valid_until: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("coupons").insert({
      code: form.code.toUpperCase(),
      description: form.description,
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value),
      min_order_amount: parseFloat(form.min_order_amount) || 0,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      valid_until: form.valid_until || null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Coupon created!" });
      setShowForm(false);
      fetchCoupons();
    }
  };

  const toggleCoupon = async (id: string, is_active: boolean) => {
    await supabase.from("coupons").update({ is_active: !is_active }).eq("id", id);
    fetchCoupons();
  };

  if (loading) return <div className="font-body text-muted-foreground">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-3xl font-light text-foreground">Coupons & Offers</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-6 py-2 bg-accent text-accent-foreground font-ui text-xs tracking-[0.2em] uppercase hover:bg-gold-dark transition-colors">
          <Plus size={16} /> {showForm ? "Cancel" : "Add Coupon"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-border p-6 bg-card mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-ui text-xs tracking-wider uppercase text-muted-foreground block mb-2">Code *</label>
            <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required className="w-full px-4 py-3 bg-background border border-border font-body uppercase" />
          </div>
          <div>
            <label className="font-ui text-xs tracking-wider uppercase text-muted-foreground block mb-2">Type</label>
            <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="w-full px-4 py-3 bg-background border border-border font-body">
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
          <div>
            <label className="font-ui text-xs tracking-wider uppercase text-muted-foreground block mb-2">Discount Value *</label>
            <input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} required className="w-full px-4 py-3 bg-background border border-border font-body" />
          </div>
          <div>
            <label className="font-ui text-xs tracking-wider uppercase text-muted-foreground block mb-2">Min Order Amount</label>
            <input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} className="w-full px-4 py-3 bg-background border border-border font-body" />
          </div>
          <div>
            <label className="font-ui text-xs tracking-wider uppercase text-muted-foreground block mb-2">Max Uses</label>
            <input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} className="w-full px-4 py-3 bg-background border border-border font-body" />
          </div>
          <div>
            <label className="font-ui text-xs tracking-wider uppercase text-muted-foreground block mb-2">Valid Until</label>
            <input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} className="w-full px-4 py-3 bg-background border border-border font-body" />
          </div>
          <div className="sm:col-span-2">
            <label className="font-ui text-xs tracking-wider uppercase text-muted-foreground block mb-2">Description</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 bg-background border border-border font-body" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={saving} className="px-8 py-3 bg-accent text-accent-foreground font-ui text-sm tracking-[0.2em] uppercase hover:bg-gold-dark transition-colors disabled:opacity-50">
              {saving ? "Creating..." : "Create Coupon"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {coupons.map((c) => (
          <div key={c.id} className="border border-border p-4 bg-card flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-ui text-lg font-semibold text-accent tracking-wider">{c.code}</p>
              <p className="font-body text-sm text-muted-foreground">
                {c.discount_type === "percentage" ? `${c.discount_value}% off` : `₹${c.discount_value} off`}
                {c.min_order_amount > 0 && ` • Min ₹${c.min_order_amount}`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-ui text-xs text-muted-foreground">Used: {c.used_count}/{c.max_uses || "∞"}</span>
              <button
                onClick={() => toggleCoupon(c.id, c.is_active)}
                className={`px-3 py-1 font-ui text-xs tracking-wider ${c.is_active ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}
              >
                {c.is_active ? "Active" : "Inactive"}
              </button>
            </div>
          </div>
        ))}
        {coupons.length === 0 && <p className="text-center py-8 font-body text-muted-foreground">No coupons yet</p>}
      </div>
    </div>
  );
};

export default AdminCoupons;
