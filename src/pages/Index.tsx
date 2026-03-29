import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import SaleBanner from "@/components/SaleBanner";
import NewArrivals from "@/components/NewArrivals";
import CustomDesignBanner from "@/components/CustomDesignBanner";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SearchOverlay from "@/components/SearchOverlay";
import {
  ScrollReveal,
  ScrollProgressLine,
  FloatingParticles,
  CinematicCard,
  HorizontalReveal,
  ZoomReveal,
  SplitReveal,
  TextReveal,
  AnimatedCounter,
  ScrollFade,
} from "@/components/AnimationUtils";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { Sparkles, Award, Users, Package } from "lucide-react";
import { useHomepageContent } from "@/hooks/use-homepage-content";

const Index = () => {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const homepageContent = useHomepageContent();

  // Full page scroll progress for cinematic transitions
  const containerRef = useRef(null);

  const handleHomepageCtaClick = () => {
    const target = homepageContent.collection_cta.button_link.trim() || "/shop";

    if (target.startsWith("/#")) {
      document.getElementById(target.slice(2))?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (target.startsWith("#")) {
      document.getElementById(target.slice(1))?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (/^https?:\/\//i.test(target) || target.startsWith("mailto:") || target.startsWith("tel:")) {
      window.location.assign(target);
      return;
    }

    navigate(target);
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background overflow-x-hidden"
    >
      {/* Scroll progress indicator */}
      <ScrollProgressLine />

      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <CartDrawer />
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <HeroSection content={homepageContent.hero_banner} />

      {/* Cinematic brand statement with split reveal */}
      <section className="py-24 bg-foreground relative overflow-hidden">
        <FloatingParticles count={30} />
        <div className="absolute inset-0 shimmer opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <SplitReveal className="text-center max-w-4xl mx-auto">
            <motion.p className="font-ui text-xs tracking-[0.5em] uppercase mb-8" style={{ color: "hsl(var(--gold))" }}>
              ✦ Established Heritage ✦
            </motion.p>
            <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-light leading-tight mb-8" style={{ color: "hsl(var(--cream))" }}>
              <TextReveal text="Where Centuries of Artistry Meet Modern Elegance" />
            </h2>
            <div className="gold-divider w-24 mx-auto mb-8" />
            <p className="font-body text-lg sm:text-xl leading-relaxed" style={{ color: "hsl(var(--cream-dark) / 0.7)" }}>
              Each Virasat kurti is a canvas — handwoven by master artisans of Varanasi, carrying
              stories of generations in every golden thread.
            </p>
          </SplitReveal>

          {/* Animated Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-16 max-w-3xl mx-auto">
            {[
              { icon: Award, value: 150, suffix: "+", label: "Years of Heritage" },
              { icon: Users, value: 5000, suffix: "+", label: "Happy Customers" },
              { icon: Package, value: 200, suffix: "+", label: "Unique Designs" },
              { icon: Sparkles, value: 50, suffix: "+", label: "Master Artisans" },
            ].map(({ icon: Icon, value, suffix, label }, i) => (
              <ScrollReveal key={label} delay={i * 0.1} className="text-center">
                <Icon size={24} className="mx-auto mb-3" style={{ color: "hsl(var(--gold))" }} />
                <div className="font-display text-3xl font-light" style={{ color: "hsl(var(--cream))" }}>
                  <AnimatedCounter value={value} />{suffix}
                </div>
                <p className="font-ui text-[10px] tracking-[0.2em] uppercase mt-1" style={{ color: "hsl(var(--gold-light) / 0.7)" }}>{label}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Categories with cinematic card tilt */}
      <CinematicCard>
        <CategoriesSection />
      </CinematicCard>

      {/* Sale Banner with horizontal reveal */}
      <HorizontalReveal from="left">
        <SaleBanner content={homepageContent.sale_banner} />
      </HorizontalReveal>

      {/* New Arrivals with zoom effect */}
      <NewArrivals />

      {homepageContent.testimonial_banner.enabled && (
        <section className="relative py-32 overflow-hidden">
          <div className="absolute inset-0 bg-maroon-gradient" />
          <FloatingParticles count={25} />

          <div className="container mx-auto px-4 relative z-10">
            <ScrollFade>
              <div className="max-w-4xl mx-auto text-center">
                <ZoomReveal>
                  <p className="font-ui text-xs tracking-[0.5em] uppercase mb-6" style={{ color: "hsl(var(--gold))" }}>
                    {homepageContent.testimonial_banner.eyebrow}
                  </p>
                  <blockquote className="font-display text-3xl sm:text-5xl font-light italic leading-relaxed mb-8" style={{ color: "hsl(var(--cream))" }}>
                    {homepageContent.testimonial_banner.quote}
                  </blockquote>
                  <div className="gold-divider w-20 mx-auto mb-4" />
                  <p className="font-body text-base" style={{ color: "hsl(var(--cream-dark) / 0.7)" }}>
                    {homepageContent.testimonial_banner.author}
                  </p>
                </ZoomReveal>
              </div>
            </ScrollFade>
          </div>
        </section>
      )}

      {homepageContent.collection_cta.enabled && (
        <section className="py-32 bg-card relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute w-[600px] h-[600px] rounded-full opacity-[0.04]"
              style={{ background: "radial-gradient(circle, hsl(var(--gold)), transparent)", left: "50%", top: "50%", x: "-50%", y: "-50%" }}
              animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <ZoomReveal>
              <p className="font-ui text-xs tracking-[0.5em] uppercase text-muted-foreground mb-4">
                {homepageContent.collection_cta.eyebrow}
              </p>
              <h2 className="font-display text-4xl sm:text-6xl font-light text-foreground mb-6">
                <TextReveal text={homepageContent.collection_cta.title} />
              </h2>
              <p className="font-body text-xl text-muted-foreground max-w-xl mx-auto mb-10">
                {homepageContent.collection_cta.description}
              </p>
              <motion.button
                whileHover={{ scale: 1.08, boxShadow: "0 0 40px hsl(var(--gold) / 0.3)" }}
                whileTap={{ scale: 0.97 }}
                onClick={handleHomepageCtaClick}
                className="px-14 py-5 bg-accent text-accent-foreground font-ui text-sm tracking-[0.25em] uppercase hover:bg-gold-dark transition-colors duration-300"
              >
                {homepageContent.collection_cta.button_label}
              </motion.button>
            </ZoomReveal>
          </div>
        </section>
      )}

      <CustomDesignBanner />
      <Footer />
    </motion.div>
  );
};

export default Index;
