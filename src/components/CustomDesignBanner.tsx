import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Palette, Scissors, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  { icon: Palette, title: "Choose Product & Fabric", desc: "Saree, kurti, lehenga, dupatta and premium Banarasi material options" },
  { icon: Scissors, title: "Custom Tailoring Brief", desc: "Measurements, blouse, sleeve, fall, pico, and fit details in one place" },
  { icon: MessageCircle, title: "Occasion to Delivery", desc: "Share deadline, budget, quantity, and styling notes with the team" },
];

const CustomDesignBanner = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartDesign = () => {
    if (user) {
      navigate("/dashboard?tab=custom");
      return;
    }

    navigate("/auth", { state: { redirectTo: "/dashboard?tab=custom" } });
  };

  return (
    <section id="custom" className="py-24 bg-background" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="font-ui text-xs tracking-[0.4em] uppercase text-muted-foreground mb-4">
            Make It Yours
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-light text-foreground mb-4">
            Custom Design Studio
          </h2>
          <div className="gold-divider w-24 mx-auto mb-6" />
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Design your dream saree, kurti, lehenga, blouse, or festive set with a full production brief.
            Fabric, weave, fit, budget, deadline, and delivery notes ek hi request me share karo.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.7 }}
              className="text-center p-8 border border-border hover:border-accent transition-colors duration-300 group"
            >
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-accent/30 group-hover:border-accent transition-colors duration-300">
                <feature.icon size={28} className="text-accent" />
              </div>
              <h3 className="font-display text-xl font-medium text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="font-body text-base text-muted-foreground">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="text-center"
        >
          <button
            type="button"
            onClick={handleStartDesign}
            className="inline-block px-10 py-4 bg-accent text-accent-foreground font-ui text-sm tracking-[0.2em] uppercase hover:bg-gold-dark transition-colors duration-300"
          >
            Start Custom Inquiry
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default CustomDesignBanner;
