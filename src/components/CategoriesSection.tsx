import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/AnimationUtils";
import categorySilk from "@/assets/category-silk.jpg";
import categoryDesigner from "@/assets/category-designer.jpg";

const CATALOG_EVENT_KEY = "catalog-updated-at";

type CategoryCard = {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  countLabel: string;
};

const fallbackCategories: CategoryCard[] = [
  {
    name: "Premium Sarees",
    slug: "banarasi-silk",
    image_url: categorySilk,
    countLabel: "Luxury Drapes",
  },
  {
    name: "Premium Kurtis",
    slug: "designer-kurtis",
    image_url: categoryDesigner,
    countLabel: "Statement Kurtis",
  },
];

const fallbackImages = [categorySilk, categoryDesigner];

const CategoriesSection = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [categories, setCategories] = useState<CategoryCard[]>(fallbackCategories);

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      const [categoryRes, productRes] = await Promise.all([
        supabase.from("categories").select("id, name, slug, description, image_url").eq("is_active", true).order("sort_order"),
        supabase.from("products").select("category_id").eq("is_active", true),
      ]);

      if (!active || categoryRes.error || productRes.error || !categoryRes.data?.length) {
        return;
      }

      const countByCategoryId = (productRes.data || []).reduce<Record<string, number>>((acc, product) => {
        const categoryId = product.category_id;
        if (typeof categoryId === "string" && categoryId.length > 0) {
          acc[categoryId] = (acc[categoryId] || 0) + 1;
        }
        return acc;
      }, {});

      setCategories(
        categoryRes.data.map((category, index) => {
          const productCount = countByCategoryId[category.id] || 0;
          return {
            ...category,
            image_url: category.image_url || fallbackImages[index % fallbackImages.length],
            countLabel: `${productCount > 0 ? productCount : "New"} ${productCount === 1 ? "Product" : "Products"}`,
          };
        })
      );
    };

    const handleFocus = () => {
      void loadCategories();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void loadCategories();
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === CATALOG_EVENT_KEY) {
        void loadCategories();
      }
    };

    void loadCategories();
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

  return (
    <section id="categories" className="bg-background py-24" ref={ref}>
      <div className="container mx-auto px-4">
        <ScrollReveal className="mb-16 text-center">
          <p className="mb-4 font-ui text-xs uppercase tracking-[0.4em] text-muted-foreground">
            Curated With Love
          </p>
          <h2 className="mb-4 font-display text-4xl font-light text-foreground sm:text-5xl">
            Our Collections
          </h2>
          <div className="gold-divider mx-auto w-24" />
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3" staggerDelay={0.12}>
          {categories.map((category) => (
            <StaggerItem key={category.slug} className="group relative overflow-hidden cursor-pointer">
              <div
                className="relative h-[420px] overflow-hidden"
                onClick={() => navigate(`/shop?category=${category.slug}`)}
              >
                <motion.img
                  src={category.image_url || fallbackImages[0]}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  whileHover={{ filter: "brightness(1.05)" }}
                />
                <div className="absolute inset-0 bg-warm-black/35 transition-all duration-700 group-hover:bg-warm-black/55" />

                <div className="absolute inset-0 flex flex-col justify-between p-6">
                  <div>
                    <span
                      className="inline-block bg-background/10 px-3 py-1 font-ui text-[10px] uppercase tracking-[0.28em]"
                      style={{ color: "hsl(var(--gold-light))" }}
                    >
                      {category.countLabel}
                    </span>
                  </div>

                  <motion.div
                    className="max-w-sm"
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h3
                      className="mb-3 font-display text-2xl font-light tracking-wider sm:text-3xl"
                      style={{ color: "hsl(var(--cream))" }}
                    >
                      {category.name}
                    </h3>

                    {category.description && (
                      <p className="mb-4 font-body text-sm leading-6 text-primary-foreground/72">
                        {category.description}
                      </p>
                    )}

                    <motion.div
                      className="h-[1px]"
                      style={{ background: "hsl(var(--gold))" }}
                      initial={{ width: 0 }}
                      whileInView={{ width: 72 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    />
                    <motion.span
                      className="mt-4 inline-block font-ui text-[10px] uppercase tracking-[0.3em] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      style={{ color: "hsl(var(--gold))" }}
                    >
                      Shop Category →
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
