import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import categorySilk from "@/assets/category-silk.jpg";
import categoryCotton from "@/assets/category-cotton.jpg";
import categoryFestive from "@/assets/category-festive.jpg";
import categoryDesigner from "@/assets/category-designer.jpg";

const products = [
  {
    name: "Zari Brocade Kurti",
    price: "₹4,999",
    originalPrice: "₹6,999",
    image: categorySilk,
    tag: "Bestseller",
    discount: "30% Off",
  },
  {
    name: "Ivory Chikankari",
    price: "₹3,499",
    originalPrice: null,
    image: categoryCotton,
    tag: "New",
    discount: null,
  },
  {
    name: "Bridal Red Silk",
    price: "₹7,999",
    originalPrice: "₹10,999",
    image: categoryFestive,
    tag: "Limited",
    discount: "27% Off",
  },
  {
    name: "Teal Kalamkari Fusion",
    price: "₹3,999",
    originalPrice: null,
    image: categoryDesigner,
    tag: "New",
    discount: null,
  },
];

const NewArrivals = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

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
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Image */}
              <div className="relative overflow-hidden mb-4 aspect-[3/4]">
                <img
                  src={product.image}
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
                {product.discount && (
                  <span className="absolute top-3 right-3 px-2 py-1 bg-primary text-primary-foreground font-ui text-[10px] tracking-wider">
                    {product.discount}
                  </span>
                )}

                {/* Hover actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={hoveredIdx === i ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute bottom-3 left-3 right-3 flex justify-center gap-2"
                >
                  {[
                    { icon: Heart, label: "Wishlist" },
                    { icon: ShoppingBag, label: "Add to Cart" },
                    { icon: Eye, label: "Quick View" },
                  ].map((action) => (
                    <button
                      key={action.label}
                      className="w-10 h-10 bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                      title={action.label}
                    >
                      <action.icon size={16} />
                    </button>
                  ))}
                </motion.div>
              </div>

              {/* Info */}
              <div className="text-center">
                <h3 className="font-display text-lg font-medium text-foreground mb-1">
                  {product.name}
                </h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-ui text-sm font-semibold text-foreground">
                    {product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="font-ui text-sm text-muted-foreground line-through">
                      {product.originalPrice}
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
          <a
            href="#"
            className="inline-block px-10 py-4 border border-foreground text-foreground font-ui text-sm tracking-[0.2em] uppercase hover:bg-foreground hover:text-background transition-all duration-300"
          >
            View All Products
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default NewArrivals;
