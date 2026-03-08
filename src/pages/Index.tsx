import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import SaleBanner from "@/components/SaleBanner";
import NewArrivals from "@/components/NewArrivals";
import CustomDesignBanner from "@/components/CustomDesignBanner";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { ScrollReveal } from "@/components/AnimationUtils";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background overflow-x-hidden"
    >
      <Navbar />
      <CartDrawer />
      <HeroSection />
      <CategoriesSection />
      <SaleBanner />
      <NewArrivals />

      {/* Cinematic testimonial / brand story strip */}
      <section className="py-20 bg-foreground relative overflow-hidden">
        <div className="absolute inset-0 shimmer opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal className="text-center max-w-3xl mx-auto">
            <p className="font-ui text-xs tracking-[0.4em] uppercase mb-6" style={{ color: "hsl(var(--gold))" }}>
              Our Heritage
            </p>
            <blockquote className="font-display text-2xl sm:text-4xl font-light italic leading-relaxed mb-6" style={{ color: "hsl(var(--cream))" }}>
              "Each thread carries centuries of tradition. Each weave tells a story of Varanasi's timeless artistry."
            </blockquote>
            <div className="gold-divider w-16 mx-auto mb-4" />
            <p className="font-body text-sm" style={{ color: "hsl(var(--cream-dark) / 0.6)" }}>
              — Master Weaver, Varanasi
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA to shop */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 text-center">
          <ScrollReveal>
            <p className="font-ui text-xs tracking-[0.4em] uppercase text-muted-foreground mb-4">
              Discover More
            </p>
            <h2 className="font-display text-3xl sm:text-5xl font-light text-foreground mb-6">
              Browse Our Full Collection
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              From everyday elegance to festive grandeur — find the perfect kurti for every occasion.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/shop")}
              className="px-12 py-4 bg-accent text-accent-foreground font-ui text-sm tracking-[0.2em] uppercase hover:bg-gold-dark transition-colors duration-300"
            >
              Shop All Products
            </motion.button>
          </ScrollReveal>
        </div>
      </section>

      <CustomDesignBanner />
      <Footer />
    </motion.div>
  );
};

export default Index;
