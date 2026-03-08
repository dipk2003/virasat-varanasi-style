import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, AlertTriangle, Pencil } from "lucide-react";

const AdminProducts = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", slug: "", description: "", price: "", compare_at_price: "",
    stock_quantity: "0", category_id: "", fabric: "", sizes: "S,M,L,XL",
    colors: "", is_active: true, is_featured: false,
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const [p, c] = await Promise.all([
      supabase.from("products").select("*, category:categories(name)").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("sort_order"),
    ]);
    setProducts(p.data || []);
    setCategories(c.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, "-");
    const { error } = await supabase.from("products").insert({
      name: form.name,
      slug,
      description: form.description,
      price: parseFloat(form.price),
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      stock_quantity: parseInt(form.stock_quantity),
      category_id: form.category_id || null,
      fabric: form.fabric,
      sizes: form.sizes.split(",").map((s) => s.trim()),
      colors: form.colors ? form.colors.split(",").map((s) => s.trim()) : [],
      is_active: form.is_active,
      is_featured: form.is_featured,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Product added!" });
      setShowForm(false);
      fetchData();
    }
  };

  if (loading) return <div className="font-body text-muted-foreground">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-3xl font-light text-foreground">Products</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-6 py-2 bg-accent text-accent-foreground font-ui text-xs tracking-[0.2em] uppercase hover:bg-gold-dark transition-colors">
          <Plus size={16} /> {showForm ? "Cancel" : "Add Product"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-border p-6 bg-card mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: "name", label: "Name *", required: true },
            { key: "slug", label: "Slug (auto-generated)" },
            { key: "price", label: "Price *", type: "number", required: true },
            { key: "compare_at_price", label: "Compare At Price", type: "number" },
            { key: "stock_quantity", label: "Stock *", type: "number", required: true },
            { key: "fabric", label: "Fabric" },
            { key: "sizes", label: "Sizes (comma separated)" },
            { key: "colors", label: "Colors (comma separated)" },
          ].map((f) => (
            <div key={f.key}>
              <label className="font-ui text-xs tracking-wider uppercase text-muted-foreground block mb-2">{f.label}</label>
              <input
                type={f.type || "text"}
                value={(form as any)[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                required={f.required}
                className="w-full px-4 py-3 bg-background border border-border font-body text-foreground focus:outline-none focus:border-accent"
              />
            </div>
          ))}
          <div>
            <label className="font-ui text-xs tracking-wider uppercase text-muted-foreground block mb-2">Category</label>
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border font-body text-foreground focus:outline-none focus:border-accent"
            >
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="font-ui text-xs tracking-wider uppercase text-muted-foreground block mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-background border border-border font-body text-foreground focus:outline-none focus:border-accent resize-none"
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={saving} className="px-8 py-3 bg-accent text-accent-foreground font-ui text-sm tracking-[0.2em] uppercase hover:bg-gold-dark transition-colors disabled:opacity-50">
              {saving ? "Saving..." : "Add Product"}
            </button>
          </div>
        </form>
      )}

      {/* Products Table */}
      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Product", "Category", "Price", "Stock", "Status"].map((h) => (
                <th key={h} className="text-left p-4 font-ui text-xs tracking-wider uppercase text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-muted/50 transition-colors">
                <td className="p-4">
                  <p className="font-display text-sm text-foreground">{p.name}</p>
                  <p className="font-body text-xs text-muted-foreground">{p.fabric}</p>
                </td>
                <td className="p-4 font-body text-sm text-muted-foreground">{p.category?.name || "—"}</td>
                <td className="p-4">
                  <span className="font-ui text-sm text-foreground">₹{p.price}</span>
                  {p.compare_at_price && (
                    <span className="font-ui text-xs text-muted-foreground line-through ml-2">₹{p.compare_at_price}</span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`font-ui text-sm ${p.stock_quantity <= p.low_stock_threshold ? "text-destructive" : "text-foreground"}`}>
                    {p.stock_quantity}
                  </span>
                  {p.stock_quantity <= p.low_stock_threshold && (
                    <AlertTriangle size={14} className="inline ml-1 text-destructive" />
                  )}
                </td>
                <td className="p-4">
                  <span className={`font-ui text-[10px] tracking-wider px-2 py-1 ${p.is_active ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}>
                    {p.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-8 text-center font-body text-muted-foreground">No products yet</p>}
      </div>
    </div>
  );
};

export default AdminProducts;
