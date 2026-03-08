import { motion } from "framer-motion";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background image */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <img
          src={heroBanner}
          alt="Virasat Collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-hero-gradient" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="font-ui text-xs tracking-[0.4em] uppercase text-gold-light mb-6"
            style={{ color: "hsl(var(--gold-light))" }}
          >
            From the Looms of Varanasi
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="font-display text-5xl sm:text-7xl lg:text-8xl font-light tracking-wider mb-6"
            style={{ color: "hsl(var(--cream))" }}
          >
            विरासत
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="gold-divider w-32 mx-auto mb-6"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="font-body text-xl sm:text-2xl font-light tracking-wide mb-10"
            style={{ color: "hsl(var(--cream-dark))" }}
          >
            Heritage Woven in Every Thread — Limited Banarasi Kurti Collection
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="#categories"
              className="px-10 py-4 bg-accent text-accent-foreground font-ui text-sm tracking-[0.2em] uppercase hover:bg-gold-dark transition-colors duration-300"
            >
              Explore Collection
            </a>
            <a
              href="#new-arrivals"
              className="px-10 py-4 font-ui text-sm tracking-[0.2em] uppercase transition-colors duration-300"
              style={{
                border: "1px solid hsl(var(--gold))",
                color: "hsl(var(--gold))",
              }}
            >
              New Arrivals
            </a>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-ui text-[10px] tracking-[0.3em] uppercase" style={{ color: "hsl(var(--gold-light))" }}>
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-[1px] h-8"
          style={{ background: "hsl(var(--gold))" }}
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;
