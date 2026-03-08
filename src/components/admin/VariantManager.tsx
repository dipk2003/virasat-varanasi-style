import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save } from "lucide-react";

interface Variant {
  id?: string;
  size: string;
  color: string;
  sku: string;
  price_override: string;
  compare_at_price_override: string;
  stock_quantity: string;
  is_active: boolean;
  isNew?: boolean;
}

interface VariantManagerProps {
  productId: string;
  sizes: string[];
  colors: string[];
}

const VariantManager = ({ productId, sizes, colors }: VariantManagerProps) => {
  const { toast } = useToast();
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchVariants = async () => {
    const { data } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .order("size")
      .order("color");
    setVariants(
      (data || []).map((v: any) => ({
        id: v.id,
        size: v.size || "",
        color: v.color || "",
        sku: v.sku || "",
        price_override: v.price_override != null ? String(v.price_override) : "",
        compare_at_price_override: v.compare_at_price_override != null ? String(v.compare_at_price_override) : "",
        stock_quantity: String(v.stock_quantity),
        is_active: v.is_active,
      }))
    );
    setLoading(false);
  };

  useEffect(() => { fetchVariants(); }, [productId]);

  const addVariant = () => {
    setVariants([
      ...variants,
      { size: sizes[0] || "", color: colors[0] || "", sku: "", price_override: "", compare_at_price_override: "", stock_quantity: "0", is_active: true, isNew: true },
    ]);
  };

  const generateAllVariants = () => {
    const existingKeys = new Set(variants.map((v) => `${v.size}|${v.color}`));
    const newVariants: Variant[] = [];
    const sizeList = sizes.length > 0 ? sizes : [""];
    const colorList = colors.length > 0 ? colors : [""];

    for (const size of sizeList) {
      for (const color of colorList) {
        const key = `${size}|${color}`;
        if (!existingKeys.has(key)) {
          newVariants.push({
            size, color, sku: "", price_override: "", compare_at_price_override: "",
            stock_quantity: "0", is_active: true, isNew: true,
          });
        }
      }
    }

    if (newVariants.length === 0) {
      toast({ title: "All variants already exist" });
      return;
    }
    setVariants([...variants, ...newVariants]);
    toast({ title: `${newVariants.length} variant(s) added` });
  };

  const updateVariant = (index: number, field: keyof Variant, value: string | boolean) => {
    const updated = [...variants];
    (updated[index] as any)[field] = value;
    setVariants(updated);
  };

  const removeVariant = async (index: number) => {
    const v = variants[index];
    if (v.id) {
      await supabase.from("product_variants").delete().eq("id", v.id);
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const saveAll = async () => {
    setSaving(true);

    const toInsert = variants.filter((v) => v.isNew);
    const toUpdate = variants.filter((v) => v.id && !v.isNew);

    // Insert new variants
    if (toInsert.length > 0) {
      const { error } = await supabase.from("product_variants").insert(
        toInsert.map((v) => ({
          product_id: productId,
          size: v.size || null,
          color: v.color || null,
          sku: v.sku || null,
          price_override: v.price_override ? parseFloat(v.price_override) : null,
          compare_at_price_override: v.compare_at_price_override ? parseFloat(v.compare_at_price_override) : null,
          stock_quantity: parseInt(v.stock_quantity) || 0,
          is_active: v.is_active,
        }))
      );
      if (error) {
        toast({ title: "Error inserting variants", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
    }

    // Update existing
    for (const v of toUpdate) {
      await supabase.from("product_variants").update({
        size: v.size || null,
        color: v.color || null,
        sku: v.sku || null,
        price_override: v.price_override ? parseFloat(v.price_override) : null,
        compare_at_price_override: v.compare_at_price_override ? parseFloat(v.compare_at_price_override) : null,
        stock_quantity: parseInt(v.stock_quantity) || 0,
        is_active: v.is_active,
      }).eq("id", v.id!);
    }

    toast({ title: "Variants saved!" });
    await fetchVariants();
    setSaving(false);
  };

  if (loading) return <p className="font-body text-sm text-muted-foreground py-4">Loading variants...</p>;

  return (
    <div className="border border-border p-6 bg-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg text-foreground">Variants ({variants.length})</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={generateAllVariants}
            className="flex items-center gap-1 px-3 py-1.5 border border-border text-foreground font-ui text-[10px] tracking-wider uppercase hover:bg-muted transition-colors"
          >
            Generate All
          </button>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-1 px-3 py-1.5 bg-accent text-accent-foreground font-ui text-[10px] tracking-wider uppercase hover:bg-accent/90 transition-colors"
          >
            <Plus size={12} /> Add
          </button>
        </div>
      </div>

      {variants.length === 0 ? (
        <p className="text-center py-8 font-body text-sm text-muted-foreground">
          No variants yet. Add individual variants or generate all size/color combinations.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Size", "Color", "SKU", "Price Override", "Compare Price", "Stock", "Active", ""].map((h) => (
                  <th key={h} className="text-left p-2 font-ui text-[10px] tracking-wider uppercase text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {variants.map((v, i) => (
                <tr key={v.id || `new-${i}`} className={v.isNew ? "bg-accent/5" : ""}>
                  <td className="p-2">
                    <select
                      value={v.size}
                      onChange={(e) => updateVariant(i, "size", e.target.value)}
                      className="w-full px-2 py-1.5 bg-background border border-border font-ui text-xs text-foreground focus:outline-none focus:border-accent"
                    >
                      <option value="">—</option>
                      {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-2">
                    <select
                      value={v.color}
                      onChange={(e) => updateVariant(i, "color", e.target.value)}
                      className="w-full px-2 py-1.5 bg-background border border-border font-ui text-xs text-foreground focus:outline-none focus:border-accent"
                    >
                      <option value="">—</option>
                      {colors.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => updateVariant(i, "sku", e.target.value)}
                      placeholder="SKU-001"
                      className="w-full px-2 py-1.5 bg-background border border-border font-ui text-xs text-foreground focus:outline-none focus:border-accent"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={v.price_override}
                      onChange={(e) => updateVariant(i, "price_override", e.target.value)}
                      placeholder="Base price"
                      className="w-20 px-2 py-1.5 bg-background border border-border font-ui text-xs text-foreground focus:outline-none focus:border-accent"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={v.compare_at_price_override}
                      onChange={(e) => updateVariant(i, "compare_at_price_override", e.target.value)}
                      placeholder="—"
                      className="w-20 px-2 py-1.5 bg-background border border-border font-ui text-xs text-foreground focus:outline-none focus:border-accent"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={v.stock_quantity}
                      onChange={(e) => updateVariant(i, "stock_quantity", e.target.value)}
                      min={0}
                      className="w-16 px-2 py-1.5 bg-background border border-border font-ui text-xs text-foreground focus:outline-none focus:border-accent"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={v.is_active}
                      onChange={(e) => updateVariant(i, "is_active", e.target.checked)}
                      className="accent-accent"
                    />
                  </td>
                  <td className="p-2">
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      className="p-1 text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {variants.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={saveAll}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-accent text-accent-foreground font-ui text-xs tracking-[0.15em] uppercase hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            <Save size={14} /> {saving ? "Saving..." : "Save Variants"}
          </button>
        </div>
      )}
    </div>
  );
};

export default VariantManager;
