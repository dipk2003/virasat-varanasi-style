import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/AnimationUtils";
import categorySilk from "@/assets/category-silk.jpg";
import categoryCotton from "@/assets/category-cotton.jpg";
import categoryFestive from "@/assets/category-festive.jpg";
import categoryDesigner from "@/assets/category-designer.jpg";
import categoryCasual from "@/assets/category-casual.jpg";

const categories = [
  { name: "Banarasi Silk", slug: "banarasi-silk", image: categorySilk, count: "24 Pieces" },
  { name: "Cotton Elegance", slug: "cotton-elegance", image: categoryCotton, count: "18 Pieces" },
  { name: "Festive Collection", slug: "festive-collection", image: categoryFestive, count: "12 Pieces" },
  { name: "Designer Kurtis", slug: "designer-kurtis", image: categoryDesigner, count: "15 Pieces" },
  { name: "Casual Comfort", slug: "casual-comfort", image: categoryCasual, count: "20 Pieces" },
];

const CategoriesSection = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="categories" className="py-24 bg-background" ref={ref}>
      <div className="container mx-auto px-4">
        <ScrollReveal className="text-center mb-16">
          <p className="font-ui text-xs tracking-[0.4em] uppercase text-muted-foreground mb-4">
            Curated With Love
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-light text-foreground mb-4">
            Our Collections
          </h2>
          <div className="gold-divider w-24 mx-auto" />
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.12}>
          {categories.map((cat, i) => (
            <StaggerItem
              key={cat.name}
              className={`group relative overflow-hidden cursor-pointer ${
                i === 0 ? "sm:col-span-2 lg:col-span-2 lg:row-span-2" : ""
              }`}
            >
              <div
                className={`relative overflow-hidden ${i === 0 ? "h-[500px] lg:h-full" : "h-[350px]"}`}
                onClick={() => navigate(`/shop?category=${cat.slug}`)}
              >
                <motion.img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  whileHover={{ filter: "brightness(1.05)" }}
                />
                <div className="absolute inset-0 bg-warm-black/30 group-hover:bg-warm-black/50 transition-all duration-700" />
                
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 px-4">
                  <motion.div
                    className="text-center"
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.4 }}
                  >
                    <p className="font-ui text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: "hsl(var(--gold-light))" }}>
                      {cat.count}
                    </p>
                    <h3 className="font-display text-2xl sm:text-3xl font-light tracking-wider mb-3" style={{ color: "hsl(var(--cream))" }}>
                      {cat.name}
                    </h3>
                    <motion.div
                      className="h-[1px] mx-auto"
                      style={{ background: "hsl(var(--gold))" }}
                      initial={{ width: 0 }}
                      whileInView={{ width: 64 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    />
                    <motion.span
                      className="inline-block mt-4 font-ui text-[10px] tracking-[0.3em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ color: "hsl(var(--gold))" }}
                    >
                      Shop Now →
                    </motion.span>
                  </motion.div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default CategoriesSection;
