import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import type { AssemblyStep } from "@/data/industrialContent";

type LayerConfig = {
  clipPath: string;
  offsetX: number;
  offsetY: number;
  rotateX: number;
  rotateY: number;
};

const layers: LayerConfig[] = [
  {
    clipPath: "polygon(8% 18%, 56% 14%, 48% 86%, 0% 82%)",
    offsetX: -100,
    offsetY: 96,
    rotateX: 18,
    rotateY: -28,
  },
  {
    clipPath: "polygon(34% 8%, 76% 10%, 74% 48%, 38% 44%)",
    offsetX: 18,
    offsetY: -80,
    rotateX: -18,
    rotateY: 16,
  },
  {
    clipPath: "polygon(52% 20%, 100% 20%, 100% 64%, 62% 56%)",
    offsetX: 120,
    offsetY: -12,
    rotateX: 14,
    rotateY: 26,
  },
  {
    clipPath: "polygon(28% 44%, 88% 36%, 86% 100%, 24% 100%)",
    offsetX: 54,
    offsetY: 120,
    rotateX: -12,
    rotateY: -16,
  },
];

const AssemblyLayer = ({
  imageSrc,
  imageAlt,
  progress,
  layer,
  index,
}: {
  imageSrc: string;
  imageAlt: string;
  progress: MotionValue<number>;
  layer: LayerConfig;
  index: number;
}) => {
  const start = 0.08 + index * 0.12;
  const end = start + 0.28;
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const x = useTransform(progress, [start, end], [layer.offsetX, 0]);
  const y = useTransform(progress, [start, end], [layer.offsetY, 0]);
  const rotateX = useTransform(progress, [start, end], [layer.rotateX, 0]);
  const rotateY = useTransform(progress, [start, end], [layer.rotateY, 0]);
  const scale = useTransform(progress, [start, end], [0.9, 1]);

  return (
    <motion.div
      className="absolute inset-0"
      style={{ opacity, x, y, rotateX, rotateY, scale, transformStyle: "preserve-3d" }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-[28px]" style={{ clipPath: layer.clipPath }}>
        <img src={imageSrc} alt={imageAlt} className="h-full w-full object-contain drop-shadow-[0_40px_70px_rgba(10,15,30,0.55)]" />
      </div>
    </motion.div>
  );
};

const MachineAssemblyShowcase = ({
  imageSrc,
  imageAlt,
  steps,
}: {
  imageSrc: string;
  imageAlt: string;
  steps: AssemblyStep[];
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [18, 2, -14]);
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-18, 0, 12]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 0.96]);
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.05, 0.9]);

  return (
    <div ref={ref} className="relative">
      <div className="absolute inset-0 rounded-[2rem] bg-industrial-grid opacity-40" />
      <motion.div
        className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-industrial backdrop-blur"
        style={{ rotateX, rotateY, scale, transformStyle: "preserve-3d", perspective: 1600 }}
      >
        <motion.div
          className="absolute left-1/2 top-[54%] h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/30 blur-[90px]"
          style={{ scale: glowScale }}
        />
        <motion.div
          className="absolute bottom-8 left-1/2 h-12 w-72 -translate-x-1/2 rounded-full bg-primary/25 blur-[48px]"
          animate={{ opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="pointer-events-none absolute inset-6 rounded-[26px] border border-white/10" />
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative mx-auto aspect-square max-w-[560px]">
          <div className="absolute inset-0 rounded-[30px] border border-dashed border-white/10" />
          {layers.map((layer, index) => (
            <AssemblyLayer
              key={index}
              imageSrc={imageSrc}
              imageAlt={imageAlt}
              progress={scrollYProgress}
              layer={layer}
              index={index}
            />
          ))}

          <motion.div
            className="absolute inset-[12%] rounded-[30px] border border-primary/30"
            animate={{ rotate: [0, 1.5, 0, -1.5, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute right-10 top-10 rounded-full border border-accent/40 bg-background/70 px-4 py-2 font-ui text-[11px] uppercase tracking-[0.28em] text-accent"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          >
            3D Assembly View
          </motion.div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-[1.4rem] border border-white/10 bg-background/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/35 bg-accent/10 font-display text-base text-accent">
                  0{index + 1}
                </div>
                <div>
                  <p className="font-ui text-[10px] uppercase tracking-[0.24em] text-primary">Stage</p>
                  <h3 className="font-display text-lg text-foreground">{step.title}</h3>
                </div>
              </div>
              <p className="font-body text-base leading-relaxed text-muted-foreground">{step.description}</p>
              <p className="mt-3 font-ui text-[11px] uppercase tracking-[0.22em] text-accent">{step.metric}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default MachineAssemblyShowcase;
