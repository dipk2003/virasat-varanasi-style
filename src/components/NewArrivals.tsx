import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import categorySilk from "@/assets/category-silk.jpg";
import categoryCotton from "@/assets/category-cotton.jpg";
import categoryFestive from "@/assets/category-festive.jpg";
import categoryDesigner from "@/assets/category-designer.jpg";

const CATALOG_EVENT_KEY = "catalog-updated-at";

type ArrivalProduct = {
  id?: string;
  slug: string;
  name: string;
  price: number;
  compare_at_price?: number | null;
  image?: string;
  images?: string[] | null;
  sizes?: string[] | null;
  colors?: string[] | null;
  tag?: string;
  is_featured?: boolean;
};

const fallbackProducts: ArrivalProduct[] = [
  {
    slug: "gulnaar-zari-anarkali",
    name: "Zari Brocade Kurti",
    price: 4999,
    compare_at_price: 6999,
    image: categorySilk,
    tag: "Bestseller",
  },
  {
    slug: "ivory-chikankari-kurta-set",
    name: "Ivory Chikankari",
    price: 3499,
    compare_at_price: null,
    image: categoryCotton,
    tag: "New",
  },
  {
    slug: "bridal-kadwa-red-saree",
    name: "Bridal Red Silk",
    price: 7999,
    compare_at_price: 10999,
    image: categoryFestive,
    tag: "Limited",
  },
  {
    slug: "teal-kalamkari-fusion-kurti",
    name: "Teal Kalamkari Fusion",
    price: 3999,
    compare_at_price: null,
    image: categoryDesigner,
    tag: "New",
  },
];

const NewArrivals = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [products, setProducts] = useState<ArrivalProduct[]>(fallbackProducts);
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    let active = true;

    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, slug, name, price, compare_at_price, images, sizes, colors, is_featured")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(4);

      if (!active || error || !data || data.length === 0) {
        return;
      }

      setProducts(data as ArrivalProduct[]);
    };

    const handleFocus = () => {
      void fetchProducts();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void fetchProducts();
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === CATALOG_EVENT_KEY) {
        void fetchProducts();
      }
    };

    void fetchProducts();

    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      active = false;
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

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

  const requestSignIn = (productSlug: string) => {
    toast({
      title: "Sign in required",
      description: "Please sign in first to save items to your wishlist.",
    });

    navigate("/auth", {
      state: {
        redirectTo: `/product/${productSlug}`,
      },
    });
  };

  const handleOpenProduct = (productSlug: string) => {
    navigate(`/product/${productSlug}`);
  };

  const handleAddToBag = async (event: React.MouseEvent<HTMLButtonElement>, product: ArrivalProduct) => {
    event.stopPropagation();

    if (!product.id) {
      navigate(`/product/${product.slug}`);
      return;
    }

    await addToCart(product.id, product.sizes?.[0], product.colors?.[0]);
    setIsCartOpen(true);
  };

  const handleWishlistToggle = async (event: React.MouseEvent<HTMLButtonElement>, product: ArrivalProduct) => {
    event.stopPropagation();

    if (!product.id) {
      navigate(`/product/${product.slug}`);
      return;
    }

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

    setWishlistedIds((current) => [...current, product.id as string]);
  };

  return (
    <section id="new-arrivals" className="py-24 bg-card" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="font-ui text-xs tracking-[0.4em] uppercase text-muted-foreground mb-4">
            Just Landed
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-light text-foreground mb-4">
            New Arrivals
          </h2>
          <div className="gold-divider w-24 mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, i) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              className="group cursor-pointer"
              onClick={() => handleOpenProduct(product.slug)}
            >
              {/* Image */}
              <div className="relative overflow-hidden mb-4 aspect-[3/4]">
                <img
                  src={product.images?.[0] || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Tag */}
                {product.tag && (
                  <span
                    className={`absolute top-3 left-3 px-3 py-1 font-ui text-[10px] tracking-[0.2em] uppercase ${
                      product.tag === "Limited"
                        ? "bg-primary text-primary-foreground"
                        : product.tag === "Bestseller"
                        ? "bg-accent text-accent-foreground"
                        : "bg-foreground text-background"
                    }`}
                  >
                    {product.tag}
                  </span>
                )}

                {/* Discount badge */}
                {product.compare_at_price && (
                  <span className="absolute top-3 right-3 px-2 py-1 bg-primary text-primary-foreground font-ui text-[10px] tracking-wider">
                    {Math.round((1 - product.price / product.compare_at_price) * 100)}% Off
                  </span>
                )}

                {/* Hover actions */}
                <div className="absolute bottom-3 left-3 right-3 flex justify-center gap-2 opacity-100 transition-all duration-300 sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                  {[
                    { icon: Heart, label: "Wishlist", onClick: (event: React.MouseEvent<HTMLButtonElement>) => void handleWishlistToggle(event, product) },
                    { icon: ShoppingBag, label: "Add to Cart", onClick: (event: React.MouseEvent<HTMLButtonElement>) => void handleAddToBag(event, product) },
                    { icon: Eye, label: "Quick View", onClick: (event: React.MouseEvent<HTMLButtonElement>) => { event.stopPropagation(); handleOpenProduct(product.slug); } },
                  ].map((action) => (
                    <button
                      key={action.label}
                      onClick={action.onClick}
                      className="w-10 h-10 bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                      title={action.label}
                      aria-label={`${action.label} ${product.name}`}
                    >
                      <action.icon
                        size={16}
                        className={action.label === "Wishlist" && product.id && wishlistedIds.includes(product.id) ? "fill-current text-primary" : ""}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="text-center">
                <h3 className="font-display text-lg font-medium text-foreground mb-1">
                  {product.name}
                </h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-ui text-sm font-semibold text-foreground">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                  {product.compare_at_price && (
                    <span className="font-ui text-sm text-muted-foreground line-through">
                      ₹{product.compare_at_price.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center mt-12"
        >
          <button
            type="button"
            onClick={() => navigate("/shop")}
            className="inline-block px-10 py-4 border border-foreground text-foreground font-ui text-sm tracking-[0.2em] uppercase hover:bg-foreground hover:text-background transition-all duration-300"
          >
            View All Products
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default NewArrivals;
