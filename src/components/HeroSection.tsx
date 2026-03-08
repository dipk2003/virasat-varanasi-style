import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";
import { MagneticButton } from "@/components/AnimationUtils";

const HeroSection = () => {
  const ref = useRef(null);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 250]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.4], [0, -80]);

  return (
    <section ref={ref} className="relative h-screen overflow-hidden">
      {/* Parallax Background */}
      <motion.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0 will-change-transform">
        <motion.img
          src={heroBanner}
          alt="Virasat Collection"
          className="w-full h-[120%] object-cover"
          initial={{ scale: 1.15, filter: "blur(10px)" }}
          animate={{ scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-hero-gradient" />
      </motion.div>

      {/* Animated particles / floating decorations */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              background: "hsl(var(--gold) / 0.3)",
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div style={{ opacity: contentOpacity, y: contentY }} className="relative z-10 h-full flex items-center justify-center text-center px-4">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="font-ui text-xs tracking-[0.5em] uppercase mb-6"
            style={{ color: "hsl(var(--gold-light))" }}
          >
            From the Looms of Varanasi
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.8, duration: 1.2 }}
            className="font-display text-5xl sm:text-7xl lg:text-8xl font-light tracking-wider mb-2"
            style={{ color: "hsl(var(--cream))" }}
          >
            विरासत
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="font-display text-xl sm:text-2xl font-light tracking-[0.3em] uppercase mb-6"
            style={{ color: "hsl(var(--gold))" }}
          >
            Virasat
          </motion.h2>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="gold-divider w-32 mx-auto mb-6"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
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
            <MagneticButton>
              <button
                onClick={() => navigate("/shop")}
                className="px-10 py-4 bg-accent text-accent-foreground font-ui text-sm tracking-[0.2em] uppercase hover:bg-gold-dark transition-colors duration-300"
              >
                Explore Collection
              </button>
            </MagneticButton>
            <MagneticButton>
              <button
                onClick={() => document.getElementById("new-arrivals")?.scrollIntoView({ behavior: "smooth" })}
                className="px-10 py-4 font-ui text-sm tracking-[0.2em] uppercase transition-all duration-300 hover:bg-gold/10"
                style={{ border: "1px solid hsl(var(--gold))", color: "hsl(var(--gold))" }}
              >
                New Arrivals
              </button>
            </MagneticButton>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        style={{ opacity: contentOpacity }}
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
