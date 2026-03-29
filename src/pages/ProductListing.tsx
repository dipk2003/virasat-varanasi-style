import { useEffect, useState, useRef } from "react";
import { motion, useInView, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Heart, ShoppingBag, Eye, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";

const fabricTypes = ["Banarasi Silk", "Cotton", "Chiffon", "Georgette", "Linen", "Crepe"];
const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
const priceRanges = [
  { label: "Under ₹2,000", min: 0, max: 2000 },
  { label: "₹2,000 - ₹5,000", min: 2000, max: 5000 },
  { label: "₹5,000 - ₹10,000", min: 5000, max: 10000 },
  { label: "Above ₹10,000", min: 10000, max: 999999 },
];

const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);
  const { addToCart, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const selectedCategory = searchParams.get("category") || "";
  const selectedFabric = searchParams.get("fabric") || "";
  const selectedSize = searchParams.get("size") || "";
  const selectedPriceRange = searchParams.get("price") || "";
  const sortBy = searchParams.get("sort") || "newest";

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setLoadError(null);
      const [catRes, prodRes] = await Promise.all([
        supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
        supabase.from("products").select("*, category:categories(name, slug)").eq("is_active", true),
      ]);

      if (catRes.error || prodRes.error) {
        setCategories([]);
        setProducts([]);
        setLoadError(prodRes.error?.message || catRes.error?.message || "Unable to load products right now.");
        setLoading(false);
        return;
      }

      setCategories(catRes.data || []);

      let filtered = prodRes.data || [];
      if (selectedCategory) filtered = filtered.filter((p) => p.category?.slug === selectedCategory);
      if (selectedFabric) filtered = filtered.filter((p) => p.fabric?.toLowerCase().includes(selectedFabric.toLowerCase()));
      if (selectedSize) filtered = filtered.filter((p) => p.sizes?.includes(selectedSize));
      if (selectedPriceRange) {
        const range = priceRanges.find((r) => r.label === selectedPriceRange);
        if (range) filtered = filtered.filter((p) => p.price >= range.min && p.price <= range.max);
      }

      if (sortBy === "price-low") filtered.sort((a, b) => a.price - b.price);
      else if (sortBy === "price-high") filtered.sort((a, b) => b.price - a.price);
      else filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setProducts(filtered);
      setLoading(false);
    };
    fetchData();
  }, [selectedCategory, selectedFabric, selectedSize, selectedPriceRange, sortBy]);

  useEffect(() => {
    let active = true;

    const fetchWishlist = async () => {
      if (!user?.id || products.length === 0) {
        if (active) setWishlistedIds([]);
        return;
      }

      const productIds = products
        .map((product) => product.id)
        .filter((productId): productId is string => typeof productId === "string" && productId.length > 0);

      if (productIds.length === 0) {
        if (active) setWishlistedIds([]);
        return;
      }

      const { data, error } = await supabase
        .from("wishlist")
        .select("product_id")
        .eq("user_id", user.id)
        .in("product_id", productIds);

      if (!active) return;

      if (error) {
        setWishlistedIds([]);
        return;
      }

      setWishlistedIds(
        ((data || []) as Array<{ product_id: string | null }>)
          .map((entry) => entry.product_id)
          .filter((productId): productId is string => Boolean(productId))
      );
    };

    void fetchWishlist();

    return () => {
      active = false;
    };
  }, [products, user?.id]);

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  const clearFilters = () => setSearchParams({});
  const activeFilterCount = [selectedCategory, selectedFabric, selectedSize, selectedPriceRange].filter(Boolean).length;

  const requestSignIn = (productSlug?: string) => {
    toast({
      title: "Sign in required",
      description: "Please sign in first to save items to your wishlist.",
    });

    navigate("/auth", {
      state: {
        redirectTo: productSlug ? `/product/${productSlug}` : "/shop",
      },
    });
  };

  const handleAddToBag = async (event: React.MouseEvent<HTMLButtonElement>, product: any) => {
    event.stopPropagation();

    await addToCart(product.id, product.sizes?.[0], product.colors?.[0]);
    setIsCartOpen(true);
  };

  const handleWishlistToggle = async (event: React.MouseEvent<HTMLButtonElement>, product: any) => {
    event.stopPropagation();

    if (!user) {
      requestSignIn(product.slug);
      return;
    }

    const isWishlisted = wishlistedIds.includes(product.id);

    if (isWishlisted) {
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", product.id);

      if (error) {
        toast({
          title: "Wishlist update failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setWishlistedIds((current) => current.filter((productId) => productId !== product.id));
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      });
      return;
    }

    const { error } = await supabase
      .from("wishlist")
      .insert({ user_id: user.id, product_id: product.id });

    if (error) {
      toast({
        title: "Wishlist update failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setWishlistedIds((current) => [...current, product.id]);
    toast({
      title: "Saved to wishlist",
      description: `${product.name} is now in your wishlist.`,
    });
  };

  const handleQuickView = (event: React.MouseEvent<HTMLButtonElement>, productSlug: string) => {
    event.stopPropagation();
    navigate(`/product/${productSlug}`);
  };

  const gridRef = useRef(null);
  const gridInView = useInView(gridRef, { once: true, margin: "-50px" });

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <CartDrawer />

      {/* Parallax Hero Banner */}
      <section ref={heroRef} className="relative h-[50vh] overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <div className="w-full h-[120%] bg-maroon-gradient" />
        </motion.div>
        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 h-full flex items-center justify-center text-center px-4 pt-28">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-ui text-xs tracking-[0.4em] uppercase mb-4"
              style={{ color: "hsl(var(--gold-light))" }}
            >
              Explore Our Heritage
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="font-display text-4xl sm:text-6xl font-light tracking-wider"
              style={{ color: "hsl(var(--cream))" }}
            >
              {selectedCategory
                ? categories.find((c) => c.slug === selectedCategory)?.name || "Collection"
                : "All Collections"}
            </motion.h1>
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.7, duration: 0.6 }} className="gold-divider w-20 mx-auto mt-4" />
          </div>
        </motion.div>
      </section>

      {/* Filters & Products */}
      <div className="container mx-auto px-4 py-12">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 px-5 py-2.5 border border-border font-ui text-xs tracking-[0.15em] uppercase hover:border-accent transition-colors"
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-accent text-accent-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="font-ui text-xs tracking-wider text-muted-foreground hover:text-destructive flex items-center gap-1">
                <X size={14} /> Clear all
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="font-body text-sm text-muted-foreground">
              {loading ? "Loading products..." : `${products.length} products`}
            </span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setFilter("sort", e.target.value)}
                disabled={loading}
                className="appearance-none pl-4 pr-8 py-2.5 border border-border bg-background font-ui text-xs tracking-wider focus:outline-none focus:border-accent cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden mb-8"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 border border-border bg-card">
                {/* Categories */}
                <div>
                  <h4 className="font-ui text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Category</h4>
                  <div className="space-y-2">
                    <button onClick={() => setFilter("category", "")} className={`block w-full text-left font-body text-sm py-1 transition-colors ${!selectedCategory ? "text-accent font-medium" : "text-muted-foreground hover:text-foreground"}`}>
                      All Categories
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setFilter("category", c.slug)}
                        className={`block w-full text-left font-body text-sm py-1 transition-colors ${selectedCategory === c.slug ? "text-accent font-medium" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-ui text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Price Range</h4>
                  <div className="space-y-2">
                    <button onClick={() => setFilter("price", "")} className={`block w-full text-left font-body text-sm py-1 transition-colors ${!selectedPriceRange ? "text-accent font-medium" : "text-muted-foreground hover:text-foreground"}`}>
                      All Prices
                    </button>
                    {priceRanges.map((r) => (
                      <button
                        key={r.label}
                        onClick={() => setFilter("price", r.label)}
                        className={`block w-full text-left font-body text-sm py-1 transition-colors ${selectedPriceRange === r.label ? "text-accent font-medium" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <h4 className="font-ui text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Size</h4>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((s) => (
                      <button
                        key={s}
                        onClick={() => setFilter("size", selectedSize === s ? "" : s)}
                        className={`w-10 h-10 flex items-center justify-center font-ui text-xs border transition-all ${selectedSize === s ? "border-accent bg-accent text-accent-foreground" : "border-border text-muted-foreground hover:border-foreground"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fabric */}
                <div>
                  <h4 className="font-ui text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Fabric</h4>
                  <div className="space-y-2">
                    <button onClick={() => setFilter("fabric", "")} className={`block w-full text-left font-body text-sm py-1 transition-colors ${!selectedFabric ? "text-accent font-medium" : "text-muted-foreground hover:text-foreground"}`}>
                      All Fabrics
                    </button>
                    {fabricTypes.map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter("fabric", selectedFabric === f ? "" : f)}
                        className={`block w-full text-left font-body text-sm py-1 transition-colors ${selectedFabric === f ? "text-accent font-medium" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active filters chips */}
        {activeFilterCount > 0 && (
          <motion.div layout className="flex flex-wrap gap-2 mb-6">
            {selectedCategory && (
              <span className="flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent font-ui text-xs tracking-wider">
                {categories.find((c) => c.slug === selectedCategory)?.name}
                <button onClick={() => setFilter("category", "")}><X size={12} /></button>
              </span>
            )}
            {selectedPriceRange && (
              <span className="flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent font-ui text-xs tracking-wider">
                {selectedPriceRange}
                <button onClick={() => setFilter("price", "")}><X size={12} /></button>
              </span>
            )}
            {selectedSize && (
              <span className="flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent font-ui text-xs tracking-wider">
                Size: {selectedSize}
                <button onClick={() => setFilter("size", "")}><X size={12} /></button>
              </span>
            )}
            {selectedFabric && (
              <span className="flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent font-ui text-xs tracking-wider">
                {selectedFabric}
                <button onClick={() => setFilter("fabric", "")}><X size={12} /></button>
              </span>
            )}
          </motion.div>
        )}

        {/* Products Grid */}
        <div ref={gridRef}>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-muted" />
                  <div className="mt-3 h-4 bg-muted rounded w-3/4" />
                  <div className="mt-2 h-3 bg-muted rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : loadError ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
              <ShoppingBag size={56} className="mx-auto text-destructive/30 mb-4" />
              <h3 className="font-display text-2xl text-foreground mb-2">Products failed to load</h3>
              <p className="font-body text-muted-foreground mb-2">{loadError}</p>
              <p className="font-body text-sm text-muted-foreground mb-6">Refresh the page or verify that your Supabase project is reachable.</p>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-accent text-accent-foreground font-ui text-sm tracking-[0.2em] uppercase hover:bg-gold-dark transition-colors"
              >
                Retry
              </button>
            </motion.div>
          ) : products.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
              <ShoppingBag size={56} className="mx-auto text-muted-foreground/20 mb-4" />
              <h3 className="font-display text-2xl text-foreground mb-2">No products found</h3>
              <p className="font-body text-muted-foreground mb-6">Try adjusting your filters or browse all collections.</p>
              <button onClick={clearFilters} className="px-8 py-3 bg-accent text-accent-foreground font-ui text-sm tracking-[0.2em] uppercase hover:bg-gold-dark transition-colors">
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <motion.div layout className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              <AnimatePresence mode="popLayout">
                {products.map((product, i) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 40 }}
                    animate={gridInView ? { opacity: 1, y: 0 } : {}}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, delay: i * 0.06 }}
                    className="group cursor-pointer"
                    onClick={() => navigate(`/product/${product.slug}`)}
                  >
                    <div className="relative overflow-hidden aspect-[3/4] mb-4">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <ShoppingBag size={32} className="text-muted-foreground/30" />
                        </div>
                      )}

                      {/* Tags */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        {product.compare_at_price && (
                          <span className="px-2 py-0.5 bg-primary text-primary-foreground font-ui text-[10px] tracking-wider">
                            {Math.round((1 - product.price / product.compare_at_price) * 100)}% OFF
                          </span>
                        )}
                        {product.is_featured && (
                          <span className="px-2 py-0.5 bg-accent text-accent-foreground font-ui text-[10px] tracking-wider">
                            FEATURED
                          </span>
                        )}
                        {product.stock_quantity <= product.low_stock_threshold && product.stock_quantity > 0 && (
                          <span className="px-2 py-0.5 bg-destructive text-destructive-foreground font-ui text-[10px] tracking-wider">
                            LOW STOCK
                          </span>
                        )}
                        {product.stock_quantity === 0 && (
                          <span className="px-2 py-0.5 bg-muted text-muted-foreground font-ui text-[10px] tracking-wider">
                            SOLD OUT
                          </span>
                        )}
                      </div>

                      {/* Hover actions */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 opacity-100 transition-all duration-300 sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                        <button
                          onClick={(event) => {
                            void handleAddToBag(event, product);
                          }}
                          className="flex-1 py-2.5 bg-background/90 backdrop-blur-sm flex items-center justify-center gap-2 font-ui text-[10px] tracking-wider uppercase hover:bg-accent hover:text-accent-foreground transition-colors"
                          disabled={product.stock_quantity === 0}
                          aria-label={`Add ${product.name} to bag`}
                        >
                          <ShoppingBag size={14} /> Add to Bag
                        </button>
                        <button
                          onClick={(event) => {
                            void handleWishlistToggle(event, product);
                          }}
                          className={`w-10 h-10 bg-background/90 backdrop-blur-sm flex items-center justify-center transition-colors ${
                            wishlistedIds.includes(product.id)
                              ? "text-primary hover:text-primary"
                              : "hover:bg-accent hover:text-accent-foreground"
                          }`}
                          aria-label={`Save ${product.name} to wishlist`}
                        >
                          <Heart size={16} className={wishlistedIds.includes(product.id) ? "fill-current" : ""} />
                        </button>
                        <button
                          onClick={(event) => handleQuickView(event, product.slug)}
                          className="w-10 h-10 bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                          aria-label={`View ${product.name}`}
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div>
                      <p className="font-ui text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                        {product.category?.name}
                      </p>
                      <h3 className="font-display text-base sm:text-lg text-foreground mb-1 group-hover:text-accent transition-colors duration-300">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="font-ui text-sm font-semibold text-foreground">₹{product.price.toLocaleString("en-IN")}</span>
                        {product.compare_at_price && (
                          <span className="font-ui text-xs text-muted-foreground line-through">₹{product.compare_at_price.toLocaleString("en-IN")}</span>
                        )}
                      </div>
                      {product.fabric && (
                        <p className="font-body text-xs text-muted-foreground mt-1">{product.fabric}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductListing;
