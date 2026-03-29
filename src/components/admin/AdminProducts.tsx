import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Pencil, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  ConsolePortal,
  getProductCreatePath,
  getProductEditPath,
} from "@/lib/businessConsole";

const AdminProducts = ({ portal = "admin" }: { portal?: ConsolePortal }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [productRes, categoryRes] = await Promise.all([
      supabase.from("products").select("*, category:categories(name)").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("sort_order"),
    ]);

    setProducts(productRes.data || []);
    setCategories(categoryRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    void fetchData();
  }, []);

  if (loading) return <div className="font-body text-muted-foreground">Loading...</div>;

  const groupedProducts = [
    ...categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description || "",
      items: products.filter((product) => product.category_id === category.id),
    })),
    {
      id: "uncategorized",
      name: "Uncategorized",
      description: "Products jinko abhi kisi category me map nahi kiya gaya.",
      items: products.filter((product) => !product.category_id),
    },
  ].filter((group) => group.items.length > 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-3xl font-light text-foreground">Products</h2>
          <p className="mt-2 font-body text-sm text-muted-foreground">
            Edit ab dedicated page par open hoga. Yahan category-wise grouped catalog list rahegi.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(getProductCreatePath(portal))}
          className="flex items-center gap-2 px-6 py-2 bg-accent text-accent-foreground font-ui text-xs tracking-[0.2em] uppercase hover:bg-gold-dark transition-colors"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      <div className="space-y-6">
        {groupedProducts.map((group) => (
          <div key={group.id} className="border border-border bg-card overflow-x-auto">
            <div className="border-b border-border bg-muted/30 px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl text-foreground">{group.name}</h3>
                  <p className="font-body text-sm text-muted-foreground">
                    {group.description || "Category wise grouped catalog view."}
                  </p>
                </div>
                <span className="font-ui text-xs tracking-[0.2em] uppercase text-muted-foreground">
                  {group.items.length} product{group.items.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["", "Product", "Category", "Price", "Stock", "Status", ""].map((heading, index) => (
                    <th key={index} className="text-left p-4 font-ui text-xs tracking-wider uppercase text-muted-foreground">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {group.items.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4 w-16">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-muted flex items-center justify-center text-muted-foreground text-xs">No img</div>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-display text-sm text-foreground">{product.name}</p>
                      <p className="font-ui text-[10px] tracking-wider uppercase text-muted-foreground mt-1">{product.slug}</p>
                    </td>
                    <td className="p-4 font-body text-sm text-muted-foreground">{product.category?.name || group.name}</td>
                    <td className="p-4">
                      <span className="font-ui text-sm text-foreground">₹{product.price}</span>
                      {product.compare_at_price && (
                        <span className="font-ui text-xs text-muted-foreground line-through ml-2">₹{product.compare_at_price}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`font-ui text-sm ${product.stock_quantity <= product.low_stock_threshold ? "text-destructive" : "text-foreground"}`}>
                        {product.stock_quantity}
                      </span>
                      {product.stock_quantity <= product.low_stock_threshold && (
                        <AlertTriangle size={14} className="inline ml-1 text-destructive" />
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`font-ui text-[10px] tracking-wider px-2 py-1 ${product.is_active ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}>
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => navigate(getProductEditPath(portal, product.id))}
                        className="p-1.5 text-accent hover:bg-accent/10 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {products.length === 0 && <p className="p-8 text-center font-body text-muted-foreground">No products yet</p>}
      </div>
    </div>
  );
};

export default AdminProducts;
