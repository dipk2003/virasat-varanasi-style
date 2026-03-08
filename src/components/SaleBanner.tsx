import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Sparkles, Clock } from "lucide-react";

const SaleBanner = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="sale" className="py-4" ref={ref}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
        className="bg-maroon-gradient relative overflow-hidden"
      >
        {/* Decorative shimmer */}
        <div className="absolute inset-0 shimmer" />

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="flex items-center gap-2 justify-center lg:justify-start mb-4"
              >
                <Sparkles size={16} style={{ color: "hsl(var(--gold))" }} />
                <span className="font-ui text-xs tracking-[0.4em] uppercase" style={{ color: "hsl(var(--gold))" }}>
                  Festival Special
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-light tracking-wider mb-3"
                style={{ color: "hsl(var(--cream))" }}
              >
                Flat <span className="text-gold-gradient">30% Off</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.7, duration: 0.7 }}
                className="font-body text-lg"
                style={{ color: "hsl(var(--cream-dark))" }}
              >
                On our entire Banarasi Silk Kurti Collection. Limited stock available.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.8, duration: 0.7 }}
              className="flex flex-col items-center gap-4"
            >
              {/* Countdown */}
              <div className="flex items-center gap-2 mb-2" style={{ color: "hsl(var(--gold-light))" }}>
                <Clock size={14} />
                <span className="font-ui text-xs tracking-[0.2em] uppercase">Offer Ends In</span>
              </div>
              <div className="flex gap-3">
                {[
                  { value: "02", label: "Days" },
                  { value: "14", label: "Hours" },
                  { value: "36", label: "Mins" },
                  { value: "52", label: "Secs" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center px-4 py-3 rounded-sm"
                    style={{ background: "hsl(var(--warm-black) / 0.3)", border: "1px solid hsl(var(--gold) / 0.2)" }}
                  >
                    <span className="font-display text-3xl font-light" style={{ color: "hsl(var(--cream))" }}>
                      {item.value}
                    </span>
                    <span className="font-ui text-[9px] tracking-[0.2em] uppercase" style={{ color: "hsl(var(--gold-light))" }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <a
                href="#"
                className="mt-4 px-10 py-3 bg-accent text-accent-foreground font-ui text-sm tracking-[0.2em] uppercase hover:bg-gold-dark transition-colors duration-300"
              >
                Shop The Sale
              </a>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default SaleBanner;
