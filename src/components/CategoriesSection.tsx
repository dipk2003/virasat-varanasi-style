import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import categorySilk from "@/assets/category-silk.jpg";
import categoryCotton from "@/assets/category-cotton.jpg";
import categoryFestive from "@/assets/category-festive.jpg";
import categoryDesigner from "@/assets/category-designer.jpg";
import categoryCasual from "@/assets/category-casual.jpg";

const categories = [
  { name: "Banarasi Silk", image: categorySilk, count: "24 Pieces" },
  { name: "Cotton Elegance", image: categoryCotton, count: "18 Pieces" },
  { name: "Festive Collection", image: categoryFestive, count: "12 Pieces" },
  { name: "Designer Kurtis", image: categoryDesigner, count: "15 Pieces" },
  { name: "Casual Comfort", image: categoryCasual, count: "20 Pieces" },
];

const CategoriesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="categories" className="py-24 bg-background" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="font-ui text-xs tracking-[0.4em] uppercase text-muted-foreground mb-4">
            Curated With Love
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-light text-foreground mb-4">
            Our Collections
          </h2>
          <div className="gold-divider w-24 mx-auto" />
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className={`group relative overflow-hidden cursor-pointer ${
                i === 0 ? "sm:col-span-2 lg:col-span-2 lg:row-span-2" : ""
              }`}
            >
              <div className={`relative overflow-hidden ${i === 0 ? "h-[500px] lg:h-full" : "h-[350px]"}`}>
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-warm-black/30 group-hover:bg-warm-black/50 transition-colors duration-500" />
                
                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 px-4">
                  <motion.div
                    className="text-center"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="font-ui text-[10px] tracking-[0.3em] uppercase text-gold-light mb-2" style={{ color: "hsl(var(--gold-light))" }}>
                      {cat.count}
                    </p>
                    <h3 className="font-display text-2xl sm:text-3xl font-light tracking-wider mb-3" style={{ color: "hsl(var(--cream))" }}>
                      {cat.name}
                    </h3>
                    <div className="w-0 group-hover:w-16 h-[1px] mx-auto transition-all duration-500" style={{ background: "hsl(var(--gold))" }} />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
