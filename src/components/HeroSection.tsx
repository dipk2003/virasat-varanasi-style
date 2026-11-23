import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";
import { MagneticButton } from "@/components/AnimationUtils";
import { HomepageHeroBannerSection } from "@/lib/commerce";
import { CinematicScene } from "@/components/cinematic/Cinematic";

const isExternalTarget = (target: string) =>
  /^https?:\/\//i.test(target) || target.startsWith("mailto:") || target.startsWith("tel:");

const HeroSection = ({ content }: { content: HomepageHeroBannerSection }) => {
  const ref = useRef(null);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 250]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.4], [0, -80]);
  const backgroundImage = content.background_image_url.trim() || heroBanner;

  const goToTarget = (target: string) => {
    const nextTarget = target.trim() || "/shop";

    if (nextTarget.startsWith("/#")) {
      document.getElementById(nextTarget.slice(2))?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (nextTarget.startsWith("#")) {
      document.getElementById(nextTarget.slice(1))?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (isExternalTarget(nextTarget)) {
      window.location.assign(nextTarget);
      return;
    }

    navigate(nextTarget);
  };

  if (!content.enabled) {
    return null;
  }

  return (
    <section ref={ref} className="relative h-screen overflow-hidden">
      <motion.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0 will-change-transform">
        <motion.img
          src={backgroundImage}
          alt={content.title_latin || content.title_native || "Homepage banner"}
          className="h-[120%] w-full object-cover"
          initial={{ scale: 1.15, filter: "blur(10px)" }}
          animate={{ scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-hero-gradient" />
      </motion.div>

      <CinematicScene preset="silk" />
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, index) => (
          <motion.div
            key={index}
            className="absolute h-1 w-1 rounded-full"
            style={{
              left: `${15 + index * 15}%`,
              top: `${20 + (index % 3) * 25}%`,
              background: "hsl(var(--gold) / 0.3)",
            }}
            animate={{ y: [-20, 20, -20], opacity: [0.2, 0.6, 0.2] }}
            transition={{
              duration: 4 + index,
              repeat: Infinity,
              delay: index * 0.5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 flex h-full items-center justify-center px-4 text-center"
      >
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mb-6 font-ui text-xs uppercase tracking-[0.5em]"
            style={{ color: "hsl(var(--gold-light))" }}
          >
            {content.eyebrow}
          </motion.p>

          {content.title_native.trim() && (
            <motion.h1
              initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.8, duration: 1.2 }}
              className="mb-2 font-display text-5xl font-light tracking-wider sm:text-7xl lg:text-8xl"
              style={{ color: "hsl(var(--cream))" }}
            >
              {content.title_native}
            </motion.h1>
          )}

          {content.title_latin.trim() && (
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="mb-6 font-display text-xl font-light uppercase tracking-[0.3em] sm:text-2xl"
              style={{ color: "hsl(var(--gold))" }}
            >
              {content.title_latin}
            </motion.h2>
          )}

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="gold-divider mx-auto mb-6 w-32"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="mb-10 font-body text-xl font-light tracking-wide sm:text-2xl"
            style={{ color: "hsl(var(--cream-dark))" }}
          >
            {content.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <MagneticButton>
              <button
                type="button"
                onClick={() => goToTarget(content.primary_button_link)}
                className="bg-accent px-10 py-4 font-ui text-sm uppercase tracking-[0.2em] text-accent-foreground transition-colors duration-300 hover:bg-gold-dark"
              >
                {content.primary_button_label}
              </button>
            </MagneticButton>

            <MagneticButton>
              <button
                type="button"
                onClick={() => goToTarget(content.secondary_button_link)}
                className="px-10 py-4 font-ui text-sm uppercase tracking-[0.2em] transition-all duration-300 hover:bg-gold/10"
                style={{ border: "1px solid hsl(var(--gold))", color: "hsl(var(--gold))" }}
              >
                {content.secondary_button_label}
              </button>
            </MagneticButton>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        style={{ opacity: contentOpacity }}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="font-ui text-[10px] uppercase tracking-[0.3em]" style={{ color: "hsl(var(--gold-light))" }}>
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-8 w-[1px]"
          style={{ background: "hsl(var(--gold))" }}
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;
