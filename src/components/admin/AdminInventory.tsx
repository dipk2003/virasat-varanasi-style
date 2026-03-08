import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Package, Check, X, TrendingDown, RefreshCw } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  category: { name: string } | null;
}

const AdminInventory = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState("");
  const [editThreshold, setEditThreshold] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, price, stock_quantity, low_stock_threshold, is_active, category:categories(name)")
      .order("stock_quantity", { ascending: true });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setProducts((data as any) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = products.filter((p) => {
    if (filter === "low") return p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold;
    if (filter === "out") return p.stock_quantity === 0;
    return true;
  });

  const lowStockCount = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold).length;
  const outOfStockCount = products.filter((p) => p.stock_quantity === 0).length;
  const totalStock = products.reduce((sum, p) => sum + p.stock_quantity, 0);

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditStock(String(p.stock_quantity));
    setEditThreshold(String(p.low_stock_threshold));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditStock("");
    setEditThreshold("");
  };

  const saveEdit = async (productId: string) => {
    setSaving(true);
    const { error } = await supabase
      .from("products")
      .update({
        stock_quantity: parseInt(editStock) || 0,
        low_stock_threshold: parseInt(editThreshold) || 5,
      })
      .eq("id", productId);

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Stock updated!" });
      cancelEdit();
      fetchProducts();
    }
  };

  const bulkRestock = async (amount: number) => {
    const lowItems = products.filter((p) => p.stock_quantity <= p.low_stock_threshold);
    if (lowItems.length === 0) {
      toast({ title: "No low stock items to restock" });
      return;
    }

    setSaving(true);
    let errors = 0;
    for (const item of lowItems) {
      const { error } = await supabase
        .from("products")
        .update({ stock_quantity: item.stock_quantity + amount })
        .eq("id", item.id);
      if (error) errors++;
    }
    setSaving(false);

    if (errors > 0) {
      toast({ title: "Some updates failed", variant: "destructive" });
    } else {
      toast({ title: `Restocked ${lowItems.length} products by +${amount}` });
    }
    fetchProducts();
  };

  if (loading) return <div className="font-body text-muted-foreground">Loading inventory...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-3xl font-light text-foreground">Inventory</h2>
        <div className="flex gap-2">
          <button
            onClick={() => bulkRestock(10)}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 border border-border text-foreground font-ui text-xs tracking-[0.15em] uppercase hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} /> Restock Low (+10)
          </button>
          <button
            onClick={fetchProducts}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground font-ui text-xs tracking-[0.15em] uppercase hover:bg-accent/90 transition-colors"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="border border-border p-5 bg-card">
          <div className="flex items-center gap-3 mb-2">
            <Package size={20} className="text-accent" />
            <span className="font-ui text-xs tracking-wider uppercase text-muted-foreground">Total Stock</span>
          </div>
          <p className="font-display text-3xl text-foreground">{totalStock.toLocaleString("en-IN")}</p>
          <p className="font-body text-xs text-muted-foreground mt-1">{products.length} products</p>
        </div>
        <button
          onClick={() => setFilter(filter === "low" ? "all" : "low")}
          className={`border p-5 text-left transition-colors ${filter === "low" ? "border-yellow-500 bg-yellow-500/5" : "border-border bg-card"}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle size={20} className="text-yellow-500" />
            <span className="font-ui text-xs tracking-wider uppercase text-muted-foreground">Low Stock</span>
          </div>
          <p className="font-display text-3xl text-yellow-600">{lowStockCount}</p>
          <p className="font-body text-xs text-muted-foreground mt-1">Below threshold</p>
        </button>
        <button
          onClick={() => setFilter(filter === "out" ? "all" : "out")}
          className={`border p-5 text-left transition-colors ${filter === "out" ? "border-destructive bg-destructive/5" : "border-border bg-card"}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown size={20} className="text-destructive" />
            <span className="font-ui text-xs tracking-wider uppercase text-muted-foreground">Out of Stock</span>
          </div>
          <p className="font-display text-3xl text-destructive">{outOfStockCount}</p>
          <p className="font-body text-xs text-muted-foreground mt-1">Needs immediate attention</p>
        </button>
      </div>

      {filter !== "all" && (
        <button onClick={() => setFilter("all")} className="mb-4 font-ui text-xs text-accent hover:underline tracking-wider">
          ← Show all products
        </button>
      )}

      {/* Inventory Table */}
      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Product", "Category", "Stock", "Threshold", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left p-4 font-ui text-xs tracking-wider uppercase text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((p) => {
              const isEditing = editingId === p.id;
              const isLow = p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold;
              const isOut = p.stock_quantity === 0;

              return (
                <tr key={p.id} className={`transition-colors ${isOut ? "bg-destructive/5" : isLow ? "bg-yellow-500/5" : "hover:bg-muted/50"}`}>
                  <td className="p-4">
                    <p className="font-display text-sm text-foreground">{p.name}</p>
                    <p className="font-body text-xs text-muted-foreground">₹{p.price}</p>
                  </td>
                  <td className="p-4 font-body text-sm text-muted-foreground">{p.category?.name || "—"}</td>
                  <td className="p-4">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editStock}
                        onChange={(e) => setEditStock(e.target.value)}
                        className="w-20 px-2 py-1 border border-accent bg-background font-ui text-sm text-foreground focus:outline-none"
                        min={0}
                      />
                    ) : (
                      <span className={`font-ui text-sm font-semibold ${isOut ? "text-destructive" : isLow ? "text-yellow-600" : "text-foreground"}`}>
                        {p.stock_quantity}
                        {(isLow || isOut) && <AlertTriangle size={13} className="inline ml-1" />}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editThreshold}
                        onChange={(e) => setEditThreshold(e.target.value)}
                        className="w-20 px-2 py-1 border border-accent bg-background font-ui text-sm text-foreground focus:outline-none"
                        min={0}
                      />
                    ) : (
                      <span className="font-ui text-sm text-muted-foreground">{p.low_stock_threshold}</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`font-ui text-[10px] tracking-wider px-2 py-1 ${
                      isOut ? "text-red-600 bg-red-50" : isLow ? "text-yellow-700 bg-yellow-50" : "text-green-600 bg-green-50"
                    }`}>
                      {isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                    </span>
                  </td>
                  <td className="p-4">
                    {isEditing ? (
                      <div className="flex gap-1">
                        <button onClick={() => saveEdit(p.id)} disabled={saving} className="p-1.5 text-green-600 hover:bg-green-50 transition-colors">
                          <Check size={16} />
                        </button>
                        <button onClick={cancelEdit} className="p-1.5 text-destructive hover:bg-red-50 transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(p)} className="font-ui text-xs text-accent hover:underline tracking-wider">
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-8 text-center font-body text-muted-foreground">No products match this filter</p>}
      </div>
    </div>
  );
};

export default AdminInventory;
