import { motion } from "framer-motion";
import { Layers3, LayoutTemplate, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HomepageFeatureBannerSection } from "@/lib/commerce";

const isExternalTarget = (target: string) =>
  /^https?:\/\//i.test(target) || target.startsWith("mailto:") || target.startsWith("tel:");

const FeatureBanner = ({ content }: { content: HomepageFeatureBannerSection }) => {
  const navigate = useNavigate();

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
    <section className="relative overflow-hidden border-y border-border bg-[radial-gradient(circle_at_top_left,_hsl(var(--gold)/0.14),_transparent_40%),linear-gradient(135deg,hsl(var(--foreground))_0%,hsl(var(--warm-black))_100%)] py-20">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute left-[-8rem] top-[-8rem] h-64 w-64 rounded-full bg-accent blur-3xl" />
        <div className="absolute bottom-[-6rem] right-[-4rem] h-72 w-72 rounded-full bg-primary blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid items-center gap-10 lg:grid-cols-[1.35fr,0.85fr]">
          <div className="max-w-3xl">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="border border-accent/40 bg-accent/10 px-3 py-1 font-ui text-[10px] uppercase tracking-[0.28em] text-accent">
                {content.eyebrow}
              </span>
              <span className="bg-background/10 px-3 py-1 font-ui text-[10px] uppercase tracking-[0.24em] text-primary-foreground">
                {content.badge}
              </span>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl font-display text-4xl font-light leading-tight text-primary-foreground sm:text-5xl"
            >
              {content.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="mt-5 max-w-2xl font-body text-lg leading-8 text-primary-foreground/72"
            >
              {content.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.16 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <button
                type="button"
                onClick={() => goToTarget(content.primary_button_link)}
                className="bg-accent px-8 py-4 font-ui text-xs uppercase tracking-[0.25em] text-accent-foreground transition-colors hover:bg-gold-dark"
              >
                {content.primary_button_label}
              </button>
              <button
                type="button"
                onClick={() => goToTarget(content.secondary_button_link)}
                className="border border-primary-foreground/25 bg-primary-foreground/5 px-8 py-4 font-ui text-xs uppercase tracking-[0.25em] text-primary-foreground transition-colors hover:border-accent hover:text-accent"
              >
                {content.secondary_button_label}
              </button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1"
          >
            {[
              {
                icon: Layers3,
                title: "Category Ready",
                copy: "New categories can be pushed from admin and surfaced on the storefront.",
              },
              {
                icon: LayoutTemplate,
                title: "Banner Ready",
                copy: "Homepage messaging blocks can be swapped without touching frontend code.",
              },
              {
                icon: Sparkles,
                title: "Sellable Demo",
                copy: "Premium visuals and 360-ready products make the platform client-presentable.",
              },
            ].map(({ icon: Icon, title, copy }) => (
              <div
                key={title}
                className="border border-primary-foreground/10 bg-background/10 p-5 backdrop-blur-sm"
              >
                <Icon size={18} className="text-accent" />
                <h3 className="mt-4 font-ui text-xs uppercase tracking-[0.22em] text-primary-foreground">
                  {title}
                </h3>
                <p className="mt-3 font-body text-sm leading-6 text-primary-foreground/68">
                  {copy}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeatureBanner;
