import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import BusinessConsoleLayout from "@/components/admin/BusinessConsoleLayout";
import ImageUpload from "@/components/admin/ImageUpload";
import VariantManager from "@/components/admin/VariantManager";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ConsolePortal,
  businessConsoleConfigs,
  getProductEditPath,
} from "@/lib/businessConsole";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  compare_at_price: "",
  stock_quantity: "0",
  category_id: "",
  fabric: "",
  sizes: "S,M,L,XL",
  colors: "",
  is_active: true,
  is_featured: false,
};

const ProductEditorPage = ({ portal }: { portal: ConsolePortal }) => {
  const config = businessConsoleConfigs[portal];
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const { signOut } = useAuth();
  const { toast } = useToast();

  const isEditMode = Boolean(productId);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [productFound, setProductFound] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleTabChange = (tabId: string) => {
    navigate(config.rootPath, { state: { initialTab: tabId } });
  };

  const returnToCatalog = () => {
    navigate(config.rootPath, { state: { initialTab: config.catalogTabId } });
  };

  useEffect(() => {
    let active = true;

    const loadEditorData = async () => {
      setLoading(true);

      const { data: categoryRows, error: categoryError } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");

      if (!active) return;

      if (categoryError) {
        toast({ title: "Error", description: categoryError.message, variant: "destructive" });
      }

      setCategories(categoryRows || []);

      if (!isEditMode || !productId) {
        setProductFound(true);
        setLoading(false);
        return;
      }

      const { data: product, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .maybeSingle();

      if (!active) return;

      if (productError) {
        toast({ title: "Error", description: productError.message, variant: "destructive" });
        setProductFound(false);
        setLoading(false);
        return;
      }

      if (!product) {
        setProductFound(false);
        setLoading(false);
        return;
      }

      setProductFound(true);
      setForm({
        name: product.name || "",
        slug: product.slug || "",
        description: product.description || "",
        price: String(product.price ?? ""),
        compare_at_price: product.compare_at_price != null ? String(product.compare_at_price) : "",
        stock_quantity: String(product.stock_quantity ?? 0),
        category_id: product.category_id || "",
        fabric: product.fabric || "",
        sizes: (product.sizes || []).join(","),
        colors: (product.colors || []).join(","),
        is_active: !!product.is_active,
        is_featured: !!product.is_featured,
      });
      setImages(product.images || []);
      setLoading(false);
    };

    void loadEditorData();

    return () => {
      active = false;
    };
  }, [isEditMode, productId, toast]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);

    const slug = form.slug.trim() || form.name.toLowerCase().trim().replace(/\s+/g, "-");
    const payload = {
      name: form.name.trim(),
      slug,
      description: form.description.trim() || null,
      price: parseFloat(form.price),
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      category_id: form.category_id || null,
      fabric: form.fabric.trim() || null,
      sizes: form.sizes.split(",").map((size) => size.trim()).filter(Boolean),
      colors: form.colors.split(",").map((color) => color.trim()).filter(Boolean),
      is_active: form.is_active,
      is_featured: form.is_featured,
      images,
    };

    if (Number.isNaN(payload.price)) {
      setSaving(false);
      toast({ title: "Invalid price", description: "Price valid number hona chahiye.", variant: "destructive" });
      return;
    }

    if (isEditMode && productId) {
      const { error } = await supabase.from("products").update(payload).eq("id", productId);
      setSaving(false);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }

      toast({ title: "Product updated" });
      return;
    }

    const { data, error } = await supabase.from("products").insert(payload).select("id").single();
    setSaving(false);

    if (error || !data?.id) {
      toast({ title: "Error", description: error?.message || "Product create nahi hua.", variant: "destructive" });
      return;
    }

    toast({ title: "Product created" });
    navigate(getProductEditPath(portal, data.id), { replace: true });
  };

  const parsedSizes = form.sizes.split(",").map((size) => size.trim()).filter(Boolean);
  const parsedColors = form.colors.split(",").map((color) => color.trim()).filter(Boolean);

  return (
    <BusinessConsoleLayout
      badge={config.badge}
      title={config.title}
      subtitle={config.subtitle}
      tabs={config.tabs}
      activeTab={config.catalogTabId}
      onTabChange={handleTabChange}
      onSignOut={handleSignOut}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={returnToCatalog}
              className="mb-3 inline-flex items-center gap-2 font-ui text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-accent transition-colors"
            >
              <ArrowLeft size={14} />
              Back To Catalog
            </button>
            <h2 className="font-display text-3xl font-light text-foreground">
              {isEditMode ? "Edit Product" : "Create Product"}
            </h2>
            <p className="mt-2 font-body text-sm text-muted-foreground">
              {isEditMode
                ? "Product details is dedicated page par update karo. Save ke baad wapas catalog par ja sakte ho."
                : "Naya product dedicated page se create karo, phir isi screen par variants manage kar paoge."}
            </p>
          </div>

          <button
            type="submit"
            form="product-editor-form"
            disabled={saving || loading || (isEditMode && !productFound)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground font-ui text-xs tracking-[0.2em] uppercase hover:bg-gold-dark transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? "Saving..." : isEditMode ? "Save Changes" : "Create Product"}
          </button>
        </div>

        {loading ? (
          <div className="border border-border bg-card p-6 font-body text-muted-foreground">Loading product editor...</div>
        ) : !productFound ? (
          <div className="border border-border bg-card p-6">
            <h3 className="font-display text-2xl text-foreground">Product not found</h3>
            <p className="mt-2 font-body text-sm text-muted-foreground">
              Requested product mil nahi raha. Shayad delete ho gaya ya wrong link open hua hai.
            </p>
          </div>
        ) : (
          <>
            <form id="product-editor-form" onSubmit={handleSubmit} className="border border-border bg-card p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: "name", label: "Name *", required: true },
                { key: "slug", label: "Slug" },
                { key: "price", label: "Price *", type: "number", required: true },
                { key: "compare_at_price", label: "Compare At Price", type: "number" },
                { key: "stock_quantity", label: "Stock *", type: "number", required: true },
                { key: "fabric", label: "Fabric" },
                { key: "sizes", label: "Sizes (comma separated)" },
                { key: "colors", label: "Colors (comma separated)" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="font-ui text-xs tracking-wider uppercase text-muted-foreground block mb-2">{field.label}</label>
                  <input
                    type={field.type || "text"}
                    required={field.required}
                    value={(form as Record<string, string | boolean>)[field.key] as string}
                    onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                    className="w-full px-4 py-3 bg-background border border-border font-body text-foreground focus:outline-none focus:border-accent"
                  />
                </div>
              ))}

              <div>
                <label className="font-ui text-xs tracking-wider uppercase text-muted-foreground block mb-2">Category</label>
                <select
                  value={form.category_id}
                  onChange={(event) => setForm((current) => ({ ...current, category_id: event.target.value }))}
                  className="w-full px-4 py-3 bg-background border border-border font-body text-foreground focus:outline-none focus:border-accent"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-3 font-body text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
                  />
                  Active product
                </label>
                <label className="flex items-center gap-3 font-body text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(event) => setForm((current) => ({ ...current, is_featured: event.target.checked }))}
                  />
                  Featured on storefront
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="font-ui text-xs tracking-wider uppercase text-muted-foreground block mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-background border border-border font-body text-foreground focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div className="sm:col-span-2">
                <ImageUpload
                  images={images}
                  onChange={setImages}
                  maxImages={12}
                  helperText="Up to 12 images • first image stays main • 6+ images unlock 360° view"
                />
              </div>
            </form>

            {isEditMode && productId && (
              <VariantManager productId={productId} sizes={parsedSizes} colors={parsedColors} />
            )}
          </>
        )}
      </div>
    </BusinessConsoleLayout>
  );
};

export default ProductEditorPage;
