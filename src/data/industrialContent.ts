export type MachineCard = {
  id: string;
  name: string;
  category: string;
  image: string;
  alt: string;
  tagline: string;
  description: string;
  specs: string[];
  applications: string[];
};

export type ClientLogo = {
  name: string;
  image: string;
};

export type AssemblyStep = {
  title: string;
  description: string;
  metric: string;
};

export const seoDescription =
  "Spectra Pack Machines builds made-in-India packaging systems including L sealers, band sealers, and pallet stretch wrapping machines for FMCG, pharma, dairy, and dispatch operations.";

export const heroMetrics = [
  { value: "4", label: "Core machine lines" },
  { value: "18+", label: "Recognized client brands" },
  { value: "360°", label: "Visual product storytelling" },
  { value: "24h", label: "Quote response target" },
];

export const machineCatalog: MachineCard[] = [
  {
    id: "l-sealer-shrink-tunnel",
    name: "L Sealer With Shrink Tunnel",
    category: "Primary Packaging Line",
    image: "/machines/l-sealer-shrink-tunnel.png",
    alt: "L sealer with shrink tunnel machine",
    tagline: "Semi-automatic shrink packaging line for cartons, bottles and multipacks.",
    description:
      "A compact sealing and shrinking system that creates neat, retail-ready bundles with stable film finish and repeatable output.",
    specs: [
      "Electric driven sealing and shrinking",
      "Mild steel machine structure",
      "Ideal for shrink film bundling",
    ],
    applications: ["Cartons", "Bottles", "FMCG combo packs"],
  },
  {
    id: "pallet-stretch-wrapper",
    name: "Pallet Stretch Wrapping Machine",
    category: "End-of-Line Dispatch",
    image: "/machines/pallet-stretch-wrapper.jpg",
    alt: "Pallet stretch wrapping machine wrapping stacked cartons",
    tagline: "Stabilizes palletized loads for warehouse movement and dispatch.",
    description:
      "Designed for secure pallet wrapping with consistent film application, reduced manual labor, and cleaner outbound loads.",
    specs: [
      "Turntable based wrapping cycle",
      "Uniform film tension on pallet loads",
      "Suitable for warehouse and shipping areas",
    ],
    applications: ["Warehouse pallets", "Transport loads", "Bulk dispatch"],
  },
  {
    id: "horizontal-band-sealer",
    name: "Horizontal Band Sealer",
    category: "Continuous Pouch Sealing",
    image: "/machines/horizontal-band-sealer-master.avif",
    alt: "Horizontal band sealer machine",
    tagline: "Continuous heat sealing for pouches, laminates and retail packets.",
    description:
      "A compact conveyorized sealer for day-to-day pouch sealing where speed, seal consistency, and footprint all matter.",
    specs: [
      "Continuous feed sealing format",
      "Suitable for laminated pouches",
      "Compact production-floor footprint",
    ],
    applications: ["Snacks", "Powders", "Retail pouches"],
  },
  {
    id: "vertical-band-sealer",
    name: "Vertical Band Sealer",
    category: "Bag & Granule Packaging",
    image: "/machines/vertical-band-sealer.jpeg",
    alt: "Vertical band sealer machine",
    tagline: "Vertical conveyor sealing for standing bags, granules, liquids and powders.",
    description:
      "Built for packs that need an upright sealing path, especially where the product must remain stable during seal formation.",
    specs: [
      "Vertical sealing orientation",
      "Adjustable conveyor support",
      "Works for powder and granule packs",
    ],
    applications: ["Granules", "Liquids", "Standing pouches"],
  },
];

export const assemblySteps: AssemblyStep[] = [
  {
    title: "Film Roll Feed",
    description: "The roll is positioned for stable feed so every pack starts with controlled film tension.",
    metric: "Consistent infeed",
  },
  {
    title: "L-Seal Formation",
    description: "The sealing frame closes around the product and creates a clean edge before the tunnel stage.",
    metric: "Neat edge finish",
  },
  {
    title: "Shrink Tunnel Pass",
    description: "Heat contracts the film uniformly around the product bundle for a tighter and cleaner pack.",
    metric: "Secure shrink wrap",
  },
  {
    title: "Outfeed Conveyor",
    description: "Finished packs exit on conveyor ready for secondary packing, palletizing or dispatch.",
    metric: "Production ready output",
  },
];

export const industries = [
  "FMCG packaging",
  "Pharma lines",
  "Dairy products",
  "Contract packing",
  "Warehouse dispatch",
];

export const clientLogos: ClientLogo[] = [
  { name: "ITC", image: "/logos/itc.png" },
  { name: "Alkem", image: "/logos/alkem.png" },
  { name: "Amul", image: "/logos/amul.png" },
  { name: "Britannia", image: "/logos/britannia.jpg" },
  { name: "Cadbury", image: "/logos/cadbury.png" },
  { name: "Cipla", image: "/logos/cipla.png" },
  { name: "Coca-Cola", image: "/logos/coca-cola.png" },
  { name: "Godrej", image: "/logos/godrej.png" },
  { name: "Haldiram", image: "/logos/haldiram.png" },
  { name: "Hindustan Unilever", image: "/logos/hindustan-unilever.png" },
  { name: "Intas", image: "/logos/intas.png" },
  { name: "Johnson & Johnson", image: "/logos/johnson-johnson.png" },
  { name: "Lupin", image: "/logos/lupin.png" },
  { name: "Marico", image: "/logos/marico.png" },
  { name: "Mother Dairy", image: "/logos/mother-dairy.png" },
  { name: "Parle", image: "/logos/parle.png" },
  { name: "Sun Pharma", image: "/logos/sun-pharma.png" },
  { name: "Torrent", image: "/logos/torrent.png" },
];

export const faqs = [
  {
    question: "Which machine should I shortlist first?",
    answer:
      "If you need shrink bundling for cartons or combo packs, start with the L sealer line. If your challenge is pouch sealing, shortlist the horizontal or vertical band sealer. If dispatch stability is the issue, go with the pallet stretch wrapper.",
  },
  {
    question: "Can I request a quote without creating an account?",
    answer:
      "Yes. The popup and homepage form are both open lead forms. Visitors can submit name, phone, company, and machine interest directly.",
  },
  {
    question: "Is the animation SEO-safe?",
    answer:
      "Yes. The machine visuals are built with regular HTML images, text, and CSS transforms instead of canvas-only rendering, so Google and AI crawlers still see the core content.",
  },
  {
    question: "Do you cover multiple industries?",
    answer:
      "The page is positioned for FMCG, pharma, dairy, warehouse, and contract-packing use cases, with client logo proof shown directly on the landing page.",
  },
];
