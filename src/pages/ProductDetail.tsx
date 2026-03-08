import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, ShoppingBag, ChevronLeft, Star, Minus, Plus, Share2, Truck, RotateCcw, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

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

      const [reviewsRes, relatedRes] = await Promise.all([
        supabase.from("reviews").select("*").eq("product_id", data.id).eq("is_approved", true).order("created_at", { ascending: false }).limit(10),
        supabase.from("products").select("*, category:categories(name, slug)").eq("category_id", data.category_id).neq("id", data.id).eq("is_active", true).limit(4),
      ]);
      setReviews(reviewsRes.data || []);
      setRelatedProducts(relatedRes.data || []);

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

  const discount = product.compare_at_price ? Math.round((1 - product.price / product.compare_at_price) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

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
              <div className="relative overflow-hidden aspect-[3/4] mb-4 group">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    src={product.images?.[selectedImage] || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                {discount > 0 && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-primary-foreground font-ui text-xs tracking-wider">
                    {discount}% OFF
                  </span>
                )}
              </div>
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3">
                  {product.images.map((img: string, i: number) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedImage(i)}
                      className={`w-20 h-24 overflow-hidden border-2 transition-colors ${selectedImage === i ? "border-accent" : "border-transparent hover:border-border"}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </motion.button>
                  ))}
                </div>
              )}
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
                <span className="font-display text-3xl text-foreground">₹{product.price.toLocaleString("en-IN")}</span>
                {product.compare_at_price && (
                  <span className="font-ui text-lg text-muted-foreground line-through">₹{product.compare_at_price.toLocaleString("en-IN")}</span>
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
                  <span className="font-ui text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3 block">Size</span>
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
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                  className="flex-1 h-12 bg-accent text-accent-foreground font-ui text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={18} />
                  {product.stock_quantity === 0 ? "Sold Out" : "Add to Bag"}
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

              {product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold && (
                <p className="font-ui text-xs text-destructive tracking-wider mb-6">Only {product.stock_quantity} left in stock!</p>
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
