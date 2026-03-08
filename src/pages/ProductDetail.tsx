import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, ShoppingBag, Star, Minus, Plus, Truck, RotateCcw, Shield, ZoomIn, RotateCw, Ruler, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";

// Size chart data for Indian kurti sizes
const sizeChartData = [
  { size: "XS", bust: "32", waist: "26", hip: "35", length: "38" },
  { size: "S", bust: "34", waist: "28", hip: "37", length: "39" },
  { size: "M", bust: "36", waist: "30", hip: "39", length: "40" },
  { size: "L", bust: "38", waist: "32", hip: "41", length: "41" },
  { size: "XL", bust: "40", waist: "34", hip: "43", length: "42" },
  { size: "XXL", bust: "42", waist: "36", hip: "45", length: "43" },
];

// Zoom-on-hover image component
const ZoomableImage = ({ src, alt }: { src: string; alt: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState("center center");

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setTransformOrigin(`${x}% ${y}%`);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden aspect-[3/4] cursor-zoom-in"
      onMouseEnter={() => setIsZoomed(true)}
      onMouseLeave={() => setIsZoomed(false)}
      onMouseMove={handleMouseMove}
    >
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-300 ease-out"
        style={{
          transformOrigin,
          transform: isZoomed ? "scale(2.2)" : "scale(1)",
        }}
      />
      {!isZoomed && (
        <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 flex items-center gap-1.5 pointer-events-none">
          <ZoomIn size={14} className="text-accent" />
          <span className="font-ui text-[10px] tracking-wider uppercase text-muted-foreground">Hover to Zoom</span>
        </div>
      )}
    </div>
  );
};

// 360-degree view component
const View360 = ({ images, productName }: { images: string[]; productName: string }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const dragStartX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameCount = images.length;

  // Auto-rotate
  useEffect(() => {
    if (!autoRotate || isDragging || frameCount <= 1) return;
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frameCount);
    }, 200);
    return () => clearInterval(interval);
  }, [autoRotate, isDragging, frameCount]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setAutoRotate(false);
    dragStartX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - dragStartX.current;
    if (Math.abs(diff) > 30) {
      const dir = diff > 0 ? 1 : -1;
      setCurrentFrame((prev) => (prev + dir + frameCount) % frameCount);
      dragStartX.current = e.clientX;
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setAutoRotate(false);
    dragStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - dragStartX.current;
    if (Math.abs(diff) > 20) {
      const dir = diff > 0 ? 1 : -1;
      setCurrentFrame((prev) => (prev + dir + frameCount) % frameCount);
      dragStartX.current = e.touches[0].clientX;
    }
  };

  if (frameCount <= 1) return null;

  return (
    <div
      ref={containerRef}
      className="relative aspect-[3/4] overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={currentFrame}
          src={images[currentFrame]}
          alt={`${productName} - View ${currentFrame + 1}`}
          className="w-full h-full object-cover"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
        />
      </AnimatePresence>

      {/* 360 overlay indicator */}
      <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 flex items-center gap-1.5">
        <RotateCw size={14} className={`text-accent ${autoRotate ? "animate-spin" : ""}`} style={{ animationDuration: "3s" }} />
        <span className="font-ui text-[10px] tracking-wider uppercase text-muted-foreground">360° View</span>
      </div>

      {/* Progress dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
        {images.map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentFrame ? "bg-accent" : "bg-muted-foreground/30"}`} />
        ))}
      </div>

      {/* Drag hint */}
      {!isDragging && !autoRotate && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1.5">
          <span className="font-ui text-[10px] tracking-wider text-muted-foreground">← Drag to rotate →</span>
        </div>
      )}

      {/* Auto rotate toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); setAutoRotate(!autoRotate); }}
        className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm w-8 h-8 flex items-center justify-center hover:bg-background transition-colors"
      >
        <RotateCw size={14} className={autoRotate ? "text-accent" : "text-muted-foreground"} />
      </button>
    </div>
  );
};

// Size Chart Modal
const SizeChartModal = ({ isOpen, onClose, sizes }: { isOpen: boolean; onClose: () => void; sizes: string[] }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg bg-background border border-border z-50 overflow-auto max-h-[90vh]"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Ruler size={20} className="text-accent" />
                <h3 className="font-display text-xl text-foreground">Size Guide</h3>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={22} />
              </button>
            </div>

            <p className="font-body text-sm text-muted-foreground mb-6">All measurements are in inches. For the best fit, measure yourself and compare with the chart below.</p>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["Size", "Bust", "Waist", "Hip", "Length"].map((h) => (
                      <th key={h} className="py-3 px-3 font-ui text-[10px] tracking-[0.2em] uppercase text-muted-foreground text-center">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sizeChartData
                    .filter((row) => sizes.length === 0 || sizes.includes(row.size))
                    .map((row, i) => (
                      <motion.tr
                        key={row.size}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`border-b border-border/50 ${sizes.includes(row.size) ? "" : "opacity-50"}`}
                      >
                        <td className="py-3 px-3 text-center font-ui text-xs font-semibold text-foreground">{row.size}</td>
                        <td className="py-3 px-3 text-center font-body text-sm text-muted-foreground">{row.bust}"</td>
                        <td className="py-3 px-3 text-center font-body text-sm text-muted-foreground">{row.waist}"</td>
                        <td className="py-3 px-3 text-center font-body text-sm text-muted-foreground">{row.hip}"</td>
                        <td className="py-3 px-3 text-center font-body text-sm text-muted-foreground">{row.length}"</td>
                      </motion.tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-accent/5 border border-accent/20">
              <p className="font-ui text-[10px] tracking-wider uppercase text-accent mb-2">How to Measure</p>
              <ul className="font-body text-xs text-muted-foreground space-y-1">
                <li>• <strong>Bust:</strong> Measure around the fullest part of your chest</li>
                <li>• <strong>Waist:</strong> Measure around the narrowest part of your waist</li>
                <li>• <strong>Hip:</strong> Measure around the widest part of your hips</li>
                <li>• <strong>Length:</strong> Measure from shoulder to desired kurti length</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [viewMode, setViewMode] = useState<"gallery" | "360">("gallery");
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  // Get active variant for selected size/color
  const activeVariant = variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor && v.is_active
  );
  const displayPrice = activeVariant?.price_override ?? product?.price ?? 0;
  const displayComparePrice = activeVariant?.compare_at_price_override ?? product?.compare_at_price;
  const variantStock = activeVariant ? activeVariant.stock_quantity : product?.stock_quantity ?? 0;
  const hasVariants = variants.length > 0;

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("products")
        .select("*, category:categories(name, slug)")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (!data) { setLoading(false); return; }
      setProduct(data);
      setSelectedSize(data.sizes?.[0] || "");
      setSelectedColor(data.colors?.[0] || "");

      const [reviewsRes, relatedRes, variantsRes] = await Promise.all([
        supabase.from("reviews").select("*").eq("product_id", data.id).eq("is_approved", true).order("created_at", { ascending: false }).limit(10),
        supabase.from("products").select("*, category:categories(name, slug)").eq("category_id", data.category_id).neq("id", data.id).eq("is_active", true).limit(4),
        supabase.from("product_variants").select("*").eq("product_id", data.id).eq("is_active", true),
      ]);
      setReviews(reviewsRes.data || []);
      setRelatedProducts(relatedRes.data || []);
      setVariants(variantsRes.data || []);

      if (user) {
        const { data: wl } = await supabase.from("wishlist").select("id").eq("user_id", user.id).eq("product_id", data.id).maybeSingle();
        setIsWishlisted(!!wl);
      }
      setLoading(false);
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug, user]);

  const handleAddToCart = async () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      await addToCart(product.id, selectedSize, selectedColor);
    }
  };

  const toggleWishlist = async () => {
    if (!user || !product) return;
    if (isWishlisted) {
      await supabase.from("wishlist").delete().eq("user_id", user.id).eq("product_id", product.id);
      setIsWishlisted(false);
    } else {
      await supabase.from("wishlist").insert({ user_id: user.id, product_id: product.id });
      setIsWishlisted(true);
    }
  };

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-[3/4] bg-muted animate-pulse" />
            <div className="space-y-4 pt-8">
              <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
              <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
              <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <h1 className="font-display text-3xl text-foreground mb-4">Product Not Found</h1>
          <Link to="/shop" className="font-ui text-sm tracking-wider text-accent hover:underline">← Back to Shop</Link>
        </div>
      </div>
    );
  }

  const discount = displayComparePrice ? Math.round((1 - displayPrice / displayComparePrice) * 100) : 0;
  const hasMultipleImages = product.images && product.images.length > 1;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />
      <SizeChartModal isOpen={sizeChartOpen} onClose={() => setSizeChartOpen(false)} sizes={product.sizes || []} />

      <div className="pt-28 pb-16">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 mb-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 font-ui text-xs tracking-wider text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
            {product.category && (
              <>
                <span>/</span>
                <Link to={`/shop?category=${product.category.slug}`} className="hover:text-foreground transition-colors">{product.category.name}</Link>
              </>
            )}
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </motion.div>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              {/* View mode toggle */}
              {hasMultipleImages && (
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setViewMode("gallery")}
                    className={`flex items-center gap-1.5 px-4 py-2 font-ui text-[10px] tracking-wider uppercase border transition-all ${
                      viewMode === "gallery" ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-foreground"
                    }`}
                  >
                    <ZoomIn size={14} /> Gallery
                  </button>
                  <button
                    onClick={() => setViewMode("360")}
                    className={`flex items-center gap-1.5 px-4 py-2 font-ui text-[10px] tracking-wider uppercase border transition-all ${
                      viewMode === "360" ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-foreground"
                    }`}
                  >
                    <RotateCw size={14} /> 360° View
                  </button>
                </div>
              )}

              <AnimatePresence mode="wait">
                {viewMode === "gallery" ? (
                  <motion.div key="gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {/* Main zoomable image */}
                    <div className="relative mb-4">
                      <ZoomableImage
                        src={product.images?.[selectedImage] || "/placeholder.svg"}
                        alt={product.name}
                      />
                      {discount > 0 && (
                        <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-primary-foreground font-ui text-xs tracking-wider z-10">
                          {discount}% OFF
                        </span>
                      )}
                    </div>

                    {/* Thumbnails */}
                    {hasMultipleImages && (
                      <div className="flex gap-3">
                        {product.images.map((img: string, i: number) => (
                          <motion.button
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedImage(i)}
                            className={`w-20 h-24 overflow-hidden border-2 transition-all ${
                              selectedImage === i ? "border-accent shadow-lg" : "border-transparent hover:border-border opacity-70 hover:opacity-100"
                            }`}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="360" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <View360 images={product.images || []} productName={product.name} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Product Info */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="lg:pt-4">
              <p className="font-ui text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">{product.category?.name}</p>
              <h1 className="font-display text-3xl sm:text-4xl text-foreground mb-4">{product.name}</h1>

              {/* Rating */}
              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={16} className={s <= Math.round(avgRating) ? "fill-accent text-accent" : "text-muted-foreground/30"} />
                    ))}
                  </div>
                  <span className="font-ui text-xs text-muted-foreground">({reviews.length} reviews)</span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-display text-3xl text-foreground">₹{displayPrice.toLocaleString("en-IN")}</span>
                {displayComparePrice && (
                  <span className="font-ui text-lg text-muted-foreground line-through">₹{displayComparePrice.toLocaleString("en-IN")}</span>
                )}
                {discount > 0 && (
                  <span className="font-ui text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5">Save {discount}%</span>
                )}
                {hasVariants && activeVariant && (
                  <span className="font-ui text-[10px] tracking-wider text-muted-foreground">
                    ({activeVariant.stock_quantity} in stock)
                  </span>
                )}
              </div>

              <p className="font-body text-base text-muted-foreground leading-relaxed mb-8">{product.description}</p>

              {/* Fabric */}
              {product.fabric && (
                <div className="mb-6">
                  <span className="font-ui text-xs tracking-[0.2em] uppercase text-muted-foreground">Fabric</span>
                  <p className="font-body text-sm text-foreground mt-1">{product.fabric}</p>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-ui text-xs tracking-[0.2em] uppercase text-muted-foreground">Size</span>
                    <button
                      onClick={() => setSizeChartOpen(true)}
                      className="flex items-center gap-1 font-ui text-[10px] tracking-wider text-accent hover:underline"
                    >
                      <Ruler size={12} /> Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size: string) => (
                      <motion.button
                        key={size}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[48px] h-12 px-4 flex items-center justify-center font-ui text-xs tracking-wider border transition-all ${
                          selectedSize === size ? "border-accent bg-accent text-accent-foreground" : "border-border text-foreground hover:border-foreground"
                        }`}
                      >
                        {size}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-8">
                  <span className="font-ui text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3 block">
                    Color: <span className="text-foreground">{selectedColor}</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color: string) => (
                      <motion.button
                        key={color}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 font-ui text-xs tracking-wider border transition-all ${
                          selectedColor === color ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                        }`}
                      >
                        {color}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity + Add to Cart */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-border">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center hover:bg-muted transition-colors">
                    <Minus size={16} />
                  </button>
                  <span className="w-12 h-12 flex items-center justify-center font-ui text-sm border-x border-border">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center hover:bg-muted transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 0 25px hsl(var(--gold) / 0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={variantStock === 0}
                  className="flex-1 h-12 bg-accent text-accent-foreground font-ui text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={18} />
                  {variantStock === 0 ? "Sold Out" : "Add to Bag"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleWishlist}
                  className={`w-12 h-12 border flex items-center justify-center transition-colors ${isWishlisted ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"}`}
                >
                  <Heart size={20} className={isWishlisted ? "fill-current" : ""} />
                </motion.button>
              </div>

              {variantStock > 0 && variantStock <= (product.low_stock_threshold || 5) && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-ui text-xs text-destructive tracking-wider mb-6 flex items-center gap-1"
                >
                  <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                  Only {variantStock} left in stock — order soon!
                </motion.p>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                {[
                  { icon: Truck, label: "Free Shipping", desc: "On orders above ₹2,999" },
                  { icon: RotateCcw, label: "Easy Returns", desc: "7-day return policy" },
                  { icon: Shield, label: "Authentic", desc: "100% genuine products" },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="text-center">
                    <Icon size={20} className="mx-auto text-accent mb-1" />
                    <p className="font-ui text-[10px] tracking-wider uppercase text-foreground">{label}</p>
                    <p className="font-body text-[10px] text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Reviews Section */}
          <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mt-20">
            <h2 className="font-display text-2xl text-foreground mb-8">Customer Reviews</h2>
            {reviews.length === 0 ? (
              <div className="text-center py-12 border border-border">
                <Star size={32} className="mx-auto text-muted-foreground/20 mb-3" />
                <p className="font-display text-lg text-foreground mb-1">No reviews yet</p>
                <p className="font-body text-sm text-muted-foreground">Be the first to share your experience.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Rating summary */}
                <div className="flex items-center gap-6 p-6 border border-border mb-6">
                  <div className="text-center">
                    <div className="font-display text-5xl text-foreground">{avgRating.toFixed(1)}</div>
                    <div className="flex mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={14} className={s <= Math.round(avgRating) ? "fill-accent text-accent" : "text-muted-foreground/30"} />
                      ))}
                    </div>
                    <p className="font-ui text-xs text-muted-foreground mt-1">{reviews.length} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter((r) => r.rating === star).length;
                      const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="font-ui text-xs text-muted-foreground w-3">{star}</span>
                          <Star size={10} className="text-accent fill-accent" />
                          <div className="flex-1 h-2 bg-muted overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${pct}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.8 }}
                              className="h-full bg-accent"
                            />
                          </div>
                          <span className="font-ui text-[10px] text-muted-foreground w-6 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {reviews.map((review, i) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border pb-6"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={14} className={s <= review.rating ? "fill-accent text-accent" : "text-muted-foreground/30"} />
                        ))}
                      </div>
                      <span className="font-ui text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    </div>
                    {review.title && <h4 className="font-display text-sm text-foreground mb-1">{review.title}</h4>}
                    {review.comment && <p className="font-body text-sm text-muted-foreground">{review.comment}</p>}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mt-20">
              <h2 className="font-display text-2xl text-foreground mb-8">You May Also Like</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group cursor-pointer"
                    onClick={() => navigate(`/product/${p.slug}`)}
                  >
                    <div className="aspect-[3/4] overflow-hidden mb-3">
                      <img src={p.images?.[0] || "/placeholder.svg"} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <p className="font-ui text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{p.category?.name}</p>
                    <h3 className="font-display text-sm text-foreground group-hover:text-accent transition-colors">{p.name}</h3>
                    <span className="font-ui text-sm font-semibold text-foreground">₹{p.price.toLocaleString("en-IN")}</span>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
