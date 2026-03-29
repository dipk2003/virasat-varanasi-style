import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Palette,
  Phone,
  RotateCw,
  RotateCcw,
  Ruler,
  Shield,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { sizeChartData, sizeMeasurementTips } from "@/lib/sizeGuide";

export type StorefrontInfoPageKey =
  | "custom-design"
  | "track-order"
  | "returns-and-refunds"
  | "size-guide"
  | "contact-us"
  | "privacy-policy"
  | "terms-of-service"
  | "shipping-info"
  | "view-360-styles";

type PageAction = {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
};

type PageFeature = {
  title: string;
  description: string;
  icon: typeof Sparkles;
};

type PageSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

type PageLink = {
  label: string;
  to: string;
};

type PageContent = {
  eyebrow: string;
  title: string;
  description: string;
  features: PageFeature[];
  sections: PageSection[];
  primaryAction: PageAction;
  secondaryAction?: PageAction;
  relatedLinks: PageLink[];
};

type Style360Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  images: string[] | null;
  category?: { name: string; slug: string } | null;
};

const PageActionButton = ({ action }: { action: PageAction }) => (
  <button
    type="button"
    onClick={action.onClick}
    className={
      action.variant === "secondary"
        ? "inline-flex items-center justify-center rounded-full border border-border bg-background/70 px-6 py-3 font-ui text-[11px] tracking-[0.24em] uppercase text-foreground transition-colors hover:border-accent hover:text-accent"
        : "inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 font-ui text-[11px] tracking-[0.24em] uppercase text-accent-foreground transition-colors hover:bg-gold-dark"
    }
  >
    {action.label}
  </button>
);

const FeatureCard = ({ feature }: { feature: PageFeature }) => (
  <div className="rounded-[24px] border border-border/80 bg-card/95 p-6 shadow-[0_18px_40px_-36px_hsl(var(--foreground)/0.4)]">
    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-accent/5 text-accent">
      <feature.icon size={20} />
    </div>
    <h3 className="font-display text-2xl text-foreground">{feature.title}</h3>
    <p className="mt-3 font-body text-sm leading-7 text-muted-foreground">{feature.description}</p>
  </div>
);

const ContentSectionBlock = ({ section }: { section: PageSection }) => (
  <section className="rounded-[26px] border border-border/80 bg-card/95 p-6 shadow-[0_20px_55px_-44px_hsl(var(--foreground)/0.6)] sm:p-8">
    <h2 className="font-display text-3xl text-foreground">{section.title}</h2>
    <div className="mt-4 space-y-4">
      {section.paragraphs.map((paragraph) => (
        <p key={paragraph} className="font-body text-sm leading-7 text-muted-foreground sm:text-base">
          {paragraph}
        </p>
      ))}
    </div>
    {section.bullets && (
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {section.bullets.map((bullet) => (
          <div
            key={bullet}
            className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 font-body text-sm text-foreground"
          >
            {bullet}
          </div>
        ))}
      </div>
    )}
  </section>
);

const buildDashboardRedirect = (tab: string) => `/dashboard?tab=${tab}`;

const StorefrontInfoPage = ({ pageKey }: { pageKey: StorefrontInfoPageKey }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const storeSettings = useStoreSettings();
  const [styles360, setStyles360] = useState<Style360Product[]>([]);

  const supportEmail = storeSettings.support_email.trim();
  const supportPhone = storeSettings.support_phone.trim();
  const storeName = storeSettings.store_name.trim() || "Virasat";

  const goToRoute = (to: string) => navigate(to);
  const goToAuthWithRedirect = (redirectTo: string) => navigate("/auth", { state: { redirectTo } });
  const openOrders = () => (user ? goToRoute(buildDashboardRedirect("orders")) : goToAuthWithRedirect(buildDashboardRedirect("orders")));
  const openCustomDesign = () => (user ? goToRoute(buildDashboardRedirect("custom")) : goToAuthWithRedirect(buildDashboardRedirect("custom")));
  const openSupport = () => (user ? goToRoute(buildDashboardRedirect("support")) : goToAuthWithRedirect(buildDashboardRedirect("support")));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pageKey]);

  useEffect(() => {
    const titles: Record<StorefrontInfoPageKey, string> = {
      "custom-design": "Custom Design",
      "track-order": "Track Order",
      "returns-and-refunds": "Returns & Refunds",
      "size-guide": "Size Guide",
      "contact-us": "Contact Us",
      "privacy-policy": "Privacy Policy",
      "terms-of-service": "Terms of Service",
      "shipping-info": "Shipping Info",
      "view-360-styles": "360 View Styles",
    };

    document.title = `${titles[pageKey]} | ${storeName}`;
  }, [pageKey, storeName]);

  useEffect(() => {
    if (pageKey !== "view-360-styles") {
      setStyles360([]);
      return;
    }

    let active = true;

    const load360Styles = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, slug, name, price, images, category:categories(name, slug)")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (!active || error || !data) {
        return;
      }

      setStyles360(
        ((data || []) as Style360Product[])
          .filter((product) => (product.images?.length ?? 0) >= 6)
          .slice(0, 6)
      );
    };

    void load360Styles();

    return () => {
      active = false;
    };
  }, [pageKey]);

  const pageContent: PageContent = (() => {
    switch (pageKey) {
      case "custom-design":
        return {
          eyebrow: "Made For You",
          title: "Custom design briefs that plug into the real buyer flow",
          description:
            "The storefront already routes signed-in shoppers to the dedicated custom design dashboard tab. This page explains the process clearly and then sends them into that working flow.",
          features: [
            {
              title: "Choose Your Base",
              description: "Start with saree, kurti, blouse, festive set, or a full made-to-order brief based on the occasion.",
              icon: Palette,
            },
            {
              title: "Share Production Notes",
              description: "Measurements, sleeves, neckline, fabric, quantity, budget, and deadline all sit in one structured request.",
              icon: MessageSquare,
            },
            {
              title: "Track It In Dashboard",
              description: "Once submitted, the request lives in the customer dashboard where updates and admin references can be reviewed.",
              icon: Package,
            },
          ],
          sections: [
            {
              title: "How the flow works",
              paragraphs: [
                "Customers do not need a separate tool outside the storefront. The live flow already exists inside the buyer dashboard under the Custom Designs tab.",
                "This keeps inquiry history, reference images, delivery notes, and admin responses in one account-linked place instead of scattering them over chat or email.",
              ],
              bullets: [
                "Step 1: open the custom design workspace",
                "Step 2: submit measurements and inspiration",
                "Step 3: review admin references and next actions",
                "Step 4: continue tracking from the same dashboard",
              ],
            },
            {
              title: "What to prepare before you submit",
              paragraphs: [
                "The strongest briefs include garment type, occasion, preferred silhouette, fabric direction, fit notes, delivery city, and realistic budget range.",
                "If you have inspiration images or references, upload them directly into the request so the production conversation starts with the right visual context.",
              ],
            },
          ],
          primaryAction: { label: "Start Custom Design", onClick: openCustomDesign },
          secondaryAction: { label: "Browse Premium Styles", onClick: () => goToRoute("/shop"), variant: "secondary" },
          relatedLinks: [
            { label: "Premium Sarees", to: "/shop?category=banarasi-silk" },
            { label: "Premium Kurtis", to: "/shop?category=designer-kurtis" },
            { label: "Contact Us", to: "/contact-us" },
          ],
        };

      case "track-order":
        return {
          eyebrow: "Order Timeline",
          title: "Track order progress through the existing customer dashboard",
          description:
            "Orders, shipment status, address details, and item history already live inside the authenticated account area. This page routes shoppers into that exact flow.",
          features: [
            {
              title: "Live Status Labels",
              description: "Pending, confirmed, processing, dispatched, delivered, and refund-related statuses are already surfaced inside orders.",
              icon: Package,
            },
            {
              title: "Shipment Visibility",
              description: "Tracking numbers and shipment events can be reviewed from the order details instead of relying on manual status updates.",
              icon: Truck,
            },
            {
              title: "One Place For Support",
              description: "If something looks wrong, customers can move from orders straight into support without leaving their account flow.",
              icon: MessageSquare,
            },
          ],
          sections: [
            {
              title: "Best way to track an order",
              paragraphs: [
                "The cleanest path in this project is the customer dashboard Orders tab. That is where the order list, status labels, items, shipping address, and timeline details already exist.",
                "If a shopper is not signed in yet, this page should send them through auth and then return them directly to that dashboard tab.",
              ],
              bullets: [
                "Signed-in users go straight to My Orders",
                "Signed-out users authenticate first and then land on My Orders",
                "Support issues can be escalated from the same account area",
              ],
            },
          ],
          primaryAction: { label: user ? "Open My Orders" : "Sign In To Track", onClick: openOrders },
          secondaryAction: { label: "Contact Support", onClick: openSupport, variant: "secondary" },
          relatedLinks: [
            { label: "Shipping Info", to: "/shipping-info" },
            { label: "Returns & Refunds", to: "/returns-and-refunds" },
            { label: "Contact Us", to: "/contact-us" },
          ],
        };

      case "returns-and-refunds":
        return {
          eyebrow: "Customer Care",
          title: "Returns and refund expectations for the storefront flow",
          description:
            "The product detail flow already signals easy returns, so this page turns that promise into a clear customer-facing policy page linked from the footer.",
          features: [
            {
              title: "Clear Eligibility",
              description: "Customers should know what can be returned, when to raise the request, and which condition standards apply.",
              icon: RotateCcw,
            },
            {
              title: "Refund Visibility",
              description: "Refund-requested and refunded statuses are already supported in the order status model.",
              icon: Shield,
            },
            {
              title: "Support Escalation",
              description: "If the item arrives damaged, incorrect, or delayed, support should be reachable from the same account flow.",
              icon: MessageSquare,
            },
          ],
          sections: [
            {
              title: "Returns window",
              paragraphs: [
                "Eligible ready-to-ship products should be reported within 7 days of delivery, matching the storefront promise already shown in the product experience.",
                "Returned items should remain unused, unwashed, and packed with original tags where applicable.",
              ],
              bullets: [
                "Raise the request quickly after delivery",
                "Share clear issue notes and supporting photos when relevant",
                "Wait for confirmation before shipping the parcel back",
              ],
            },
            {
              title: "Non-standard cases",
              paragraphs: [
                "Custom design orders, altered garments, or items damaged after delivery may require a manual review instead of an automatic approval path.",
                "If the order reaches refund-requested status, customers should continue monitoring their Orders tab until the case is resolved or refunded.",
              ],
            },
          ],
          primaryAction: { label: "Get Returns Help", onClick: openSupport },
          secondaryAction: { label: "Track Existing Order", onClick: openOrders, variant: "secondary" },
          relatedLinks: [
            { label: "Track Order", to: "/track-order" },
            { label: "Shipping Info", to: "/shipping-info" },
            { label: "Terms of Service", to: "/terms-of-service" },
          ],
        };

      case "size-guide":
        return {
          eyebrow: "Fit Guidance",
          title: "Size guidance aligned with the product detail flow",
          description:
            "Product pages already open a size guide modal. This standalone page gives the same information a stable footer route for shoppers who want sizing help before browsing.",
          features: [
            {
              title: "Simple Reference Table",
              description: "Use the same size grid shoppers expect while comparing kurtis and occasion-ready silhouettes.",
              icon: Ruler,
            },
            {
              title: "Measurement Tips",
              description: "Bust, waist, hip, and length guidance helps customers self-measure before placing the order.",
              icon: Sparkles,
            },
            {
              title: "Custom Fit Option",
              description: "If ready sizes are not enough, the custom design flow is the right next step.",
              icon: Palette,
            },
          ],
          sections: [
            {
              title: "How to use this chart",
              paragraphs: [
                "Treat this as a reference-first size chart for standard kurti measurements. Compare your body measurements before selecting a size in the product page.",
                "If you are between sizes, choose based on the fit you prefer and the fabric drape shown on the product page.",
              ],
            },
          ],
          primaryAction: { label: "Shop Premium Kurtis", onClick: () => goToRoute("/shop?category=designer-kurtis") },
          secondaryAction: { label: "Need Custom Fit", onClick: openCustomDesign, variant: "secondary" },
          relatedLinks: [
            { label: "Custom Design", to: "/custom-design" },
            { label: "Premium Kurtis", to: "/shop?category=designer-kurtis" },
            { label: "Contact Us", to: "/contact-us" },
          ],
        };

      case "contact-us":
        return {
          eyebrow: "Support Channels",
          title: "Contact the storefront through the right working channel",
          description:
            "This project already has authenticated support inside the customer dashboard. The footer contact page now makes that route clear while also surfacing admin-configured support details when available.",
          features: [
            {
              title: supportEmail || "Email Support Setup",
              description: supportEmail
                ? "Use the configured support email for order issues, delivery clarifications, or pre-purchase questions."
                : "A support email can be configured from Admin Settings and will automatically appear here.",
              icon: Mail,
            },
            {
              title: supportPhone || "Phone Support Setup",
              description: supportPhone
                ? "Customers can use the configured support number for urgent order coordination."
                : "A support phone number can be configured from Admin Settings and will automatically appear here.",
              icon: Phone,
            },
            {
              title: "Dashboard Support Thread",
              description: "Authenticated buyers can keep their support history attached to their account and orders instead of starting from scratch each time.",
              icon: MessageSquare,
            },
          ],
          sections: [
            {
              title: "Best contact path by use case",
              paragraphs: [
                "For order-specific issues, the cleanest route is the customer dashboard support area because it preserves account context and order history.",
                "For general browsing questions, customers can still use the configured email or phone support channels when those are available.",
              ],
              bullets: [
                "Order delay or dispatch question -> Track Order or Dashboard Support",
                "Sizing help -> Size Guide or Contact Support",
                "Custom brief help -> Custom Design workspace",
              ],
            },
          ],
          primaryAction: { label: "Open Support", onClick: openSupport },
          secondaryAction: { label: "Track Order", onClick: openOrders, variant: "secondary" },
          relatedLinks: [
            { label: "Size Guide", to: "/size-guide" },
            { label: "Track Order", to: "/track-order" },
            { label: "Custom Design", to: "/custom-design" },
          ],
        };

      case "privacy-policy":
        return {
          eyebrow: "Legal",
          title: "Privacy policy for the customer and admin data flow",
          description:
            "This storefront stores accounts, orders, addresses, support messages, reviews, wishlists, and custom-design references. The privacy page now explains that data relationship in plain language.",
          features: [
            {
              title: "Account Data",
              description: "Profile details, saved addresses, login-linked actions, and customer preferences support the core shopping flow.",
              icon: Shield,
            },
            {
              title: "Order Data",
              description: "Orders, payments, fulfillment events, and support interactions are retained so customers can review their purchase history.",
              icon: Package,
            },
            {
              title: "Design References",
              description: "Custom-design uploads and notes are used to interpret the shopper brief and continue that project conversation.",
              icon: Palette,
            },
          ],
          sections: [
            {
              title: "What information may be stored",
              paragraphs: [
                "The project can store customer account details, shipping addresses, order history, wishlist items, reviews, support conversations, and custom design submissions.",
                "Operational metadata such as order status changes, shipment events, and internal admin notes may also be retained to support fulfillment and service workflows.",
              ],
            },
            {
              title: "How that information is used",
              paragraphs: [
                "Data is used to authenticate customers, process orders, deliver products, respond to support issues, and manage custom-design requests inside the same account flow.",
                "The storefront should only use communication channels relevant to orders, support, promotions, and service follow-up consistent with customer expectations.",
              ],
              bullets: [
                "Order processing and delivery coordination",
                "Customer support and service recovery",
                "Wishlist, review, and account features",
                "Custom design consultation and production notes",
              ],
            },
            {
              title: "Access and review",
              paragraphs: [
                "Customers can review a meaningful portion of their account-linked data through the dashboard, including orders, addresses, wishlist items, reviews, and support history.",
                "If support contact details are configured, customers can also reach out for assistance regarding account-related questions.",
              ],
            },
          ],
          primaryAction: { label: "Contact Support", onClick: openSupport },
          secondaryAction: { label: "Terms Of Service", onClick: () => goToRoute("/terms-of-service"), variant: "secondary" },
          relatedLinks: [
            { label: "Terms of Service", to: "/terms-of-service" },
            { label: "Shipping Info", to: "/shipping-info" },
            { label: "Returns & Refunds", to: "/returns-and-refunds" },
          ],
        };

      case "terms-of-service":
        return {
          eyebrow: "Legal",
          title: "Terms aligned with the current storefront behavior",
          description:
            "This page documents the practical terms around browsing, account use, orders, custom requests, and post-purchase support using the flows that already exist in the product.",
          features: [
            {
              title: "Account Responsibility",
              description: "Customers should keep account details accurate so orders, addresses, and support interactions remain reliable.",
              icon: Shield,
            },
            {
              title: "Order Accuracy",
              description: "Pricing, availability, size selection, and shipping information should be reviewed before checkout.",
              icon: ShoppingBag,
            },
            {
              title: "Service Workflows",
              description: "Returns, refund requests, support follow-up, and custom design discussions each follow their own operational path.",
              icon: MessageSquare,
            },
          ],
          sections: [
            {
              title: "Using the storefront",
              paragraphs: [
                "Shoppers are expected to provide accurate details during account creation, checkout, support requests, and custom-design submissions.",
                "The storefront may limit or refuse abusive activity, fraudulent transactions, or misuse of account-linked features such as reviews, support, or media uploads.",
              ],
            },
            {
              title: "Orders and fulfillment",
              paragraphs: [
                "Orders are subject to product availability, operational review, and successful checkout completion.",
                "Shipping timelines, return handling, and refund outcomes may vary by order status, delivery progress, and product type.",
              ],
              bullets: [
                "Review size, address, and selected variants before purchase",
                "Track status from the dashboard after checkout",
                "Use support for order-specific exceptions",
              ],
            },
            {
              title: "Custom design requests",
              paragraphs: [
                "Custom design flows may require extra clarification, measurement confirmation, fabric discussion, and production review before they move ahead.",
                "Because those requests are more specific than ready-to-ship catalog products, final handling can differ from regular ready-stock orders.",
              ],
            },
          ],
          primaryAction: { label: "Read Shipping Info", onClick: () => goToRoute("/shipping-info") },
          secondaryAction: { label: "Read Privacy Policy", onClick: () => goToRoute("/privacy-policy"), variant: "secondary" },
          relatedLinks: [
            { label: "Privacy Policy", to: "/privacy-policy" },
            { label: "Returns & Refunds", to: "/returns-and-refunds" },
            { label: "Contact Us", to: "/contact-us" },
          ],
        };

      case "shipping-info":
        return {
          eyebrow: "Delivery Flow",
          title: "Shipping information mapped to checkout and order tracking",
          description:
            "The product already promises free shipping above the threshold and a tracked post-purchase flow. This page makes those delivery expectations explicit from the footer.",
          features: [
            {
              title: "Threshold Messaging",
              description: "The checkout flow already calculates free shipping above the configured minimum and shows the delivery charge otherwise.",
              icon: Truck,
            },
            {
              title: "Post-Purchase Tracking",
              description: "Once the order is placed, the best place to follow shipment progress is the customer dashboard order history.",
              icon: Package,
            },
            {
              title: "Support Backstop",
              description: "If tracking stalls or delivery details look wrong, the customer support flow is the next operational step.",
              icon: MessageSquare,
            },
          ],
          sections: [
            {
              title: "Delivery expectations",
              paragraphs: [
                "Ready-to-ship timelines can vary by location, operational load, and dispatch readiness, but customers should rely on the order timeline after checkout for the most current status.",
                "If an order crosses the free-shipping threshold, the checkout view already reflects that in the order summary.",
              ],
              bullets: [
                "Confirm shipping address carefully at checkout",
                "Use Track Order after purchase for live progress",
                "Contact support if the shipment timeline looks abnormal",
              ],
            },
            {
              title: "When shipping details change",
              paragraphs: [
                "Courier assignment, AWB creation, dispatch timing, and delivery estimates may update as fulfillment moves through processing.",
                "The dashboard order view is the right customer-facing place to review those updates when they are available.",
              ],
            },
          ],
          primaryAction: { label: "Track My Order", onClick: openOrders },
          secondaryAction: { label: "Continue Shopping", onClick: () => goToRoute("/shop"), variant: "secondary" },
          relatedLinks: [
            { label: "Track Order", to: "/track-order" },
            { label: "Returns & Refunds", to: "/returns-and-refunds" },
            { label: "Terms of Service", to: "/terms-of-service" },
          ],
        };

      case "view-360-styles":
        return {
          eyebrow: "Interactive Product View",
          title: "360-ready styles with richer multi-angle presentation",
          description:
            "This storefront already unlocks the 360 viewer on product detail pages when a style has enough frames. This page collects that value into one clear footer destination.",
          features: [
            {
              title: "Multi-Angle Product Stories",
              description: "Products with enough image frames expose the dedicated 360 view toggle on the product page.",
              icon: RotateCw,
            },
            {
              title: "Higher Confidence Browsing",
              description: "The feature is especially useful for premium drape, silhouette, and detail-heavy styles that need more than one photo.",
              icon: Sparkles,
            },
            {
              title: "Direct To PDP",
              description: "Every recommended style here links straight into its live product detail page where the gallery and 360 toggle already work.",
              icon: ArrowRight,
            },
          ],
          sections: [
            {
              title: "How the 360 flow works",
              paragraphs: [
                "The product detail page checks whether a style has enough images. If it does, the customer sees a 360 view switch next to the gallery mode.",
                "That means the correct destination for this footer item is not a random static page alone; it should ultimately guide users to PDPs that already support the feature.",
              ],
            },
          ],
          primaryAction: { label: "Browse All Products", onClick: () => goToRoute("/shop") },
          secondaryAction: { label: "See New Arrivals", onClick: () => goToRoute("/shop?sort=newest"), variant: "secondary" },
          relatedLinks: [
            { label: "Premium Sarees", to: "/shop?category=banarasi-silk" },
            { label: "Premium Kurtis", to: "/shop?category=designer-kurtis" },
            { label: "New Arrivals", to: "/shop?sort=newest" },
          ],
        };

      default:
        return {
          eyebrow: "Support Channels",
          title: "Contact the storefront through the right working channel",
          description:
            "This project already has authenticated support inside the customer dashboard. The footer contact page now makes that route clear while also surfacing admin-configured support details when available.",
          features: [
            {
              title: supportEmail || "Email Support Setup",
              description: supportEmail
                ? "Use the configured support email for order issues, delivery clarifications, or pre-purchase questions."
                : "A support email can be configured from Admin Settings and will automatically appear here.",
              icon: Mail,
            },
            {
              title: supportPhone || "Phone Support Setup",
              description: supportPhone
                ? "Customers can use the configured support number for urgent order coordination."
                : "A support phone number can be configured from Admin Settings and will automatically appear here.",
              icon: Phone,
            },
            {
              title: "Support Inbox",
              description: "Authenticated buyers can keep support history tied to their account and orders.",
              icon: MessageSquare,
            },
          ],
          sections: [],
          primaryAction: { label: "Open Support", onClick: openSupport },
          relatedLinks: [],
        };
    }
  })();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--background))_62%,hsl(var(--muted)/0.32))]">
      <Navbar />

      <div className="relative overflow-hidden border-b border-border/60 bg-foreground pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--gold)/0.12),transparent_34%),radial-gradient(circle_at_bottom_right,hsl(var(--maroon)/0.24),transparent_30%)]" />
        <div className="container relative z-10 mx-auto px-4 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="max-w-4xl"
          >
            <p className="font-ui text-[10px] tracking-[0.32em] uppercase text-accent">{pageContent.eyebrow}</p>
            <h1 className="mt-5 font-display text-4xl font-light leading-tight text-primary-foreground sm:text-6xl">
              {pageContent.title}
            </h1>
            <p className="mt-6 max-w-3xl font-body text-base leading-8 text-primary-foreground/72 sm:text-lg">
              {pageContent.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PageActionButton action={pageContent.primaryAction} />
              {pageContent.secondaryAction && <PageActionButton action={pageContent.secondaryAction} />}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {pageContent.features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>

        {pageKey === "contact-us" && (
          <section className="mt-8 rounded-[26px] border border-border/80 bg-card/95 p-6 shadow-[0_20px_55px_-44px_hsl(var(--foreground)/0.6)] sm:p-8">
            <h2 className="font-display text-3xl text-foreground">Current contact points</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-accent/30 text-accent">
                  <Mail size={18} />
                </div>
                <p className="font-ui text-[10px] tracking-[0.24em] uppercase text-muted-foreground">Support Email</p>
                <p className="mt-2 font-body text-sm text-foreground">{supportEmail || "Configure in admin settings"}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-accent/30 text-accent">
                  <Phone size={18} />
                </div>
                <p className="font-ui text-[10px] tracking-[0.24em] uppercase text-muted-foreground">Support Phone</p>
                <p className="mt-2 font-body text-sm text-foreground">{supportPhone || "Configure in admin settings"}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-accent/30 text-accent">
                  <MapPin size={18} />
                </div>
                <p className="font-ui text-[10px] tracking-[0.24em] uppercase text-muted-foreground">Brand</p>
                <p className="mt-2 font-body text-sm text-foreground">{storeName}</p>
              </div>
            </div>
          </section>
        )}

        {pageKey === "size-guide" && (
          <section className="mt-8 rounded-[26px] border border-border/80 bg-card/95 p-6 shadow-[0_20px_55px_-44px_hsl(var(--foreground)/0.6)] sm:p-8">
            <h2 className="font-display text-3xl text-foreground">Kurti size chart</h2>
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    {["Size", "Bust", "Waist", "Hip", "Length"].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 text-left font-ui text-[10px] tracking-[0.24em] uppercase text-muted-foreground"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sizeChartData.map((row) => (
                    <tr key={row.size} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-3 font-ui text-sm text-foreground">{row.size}</td>
                      <td className="px-4 py-3 font-body text-sm text-muted-foreground">{row.bust}</td>
                      <td className="px-4 py-3 font-body text-sm text-muted-foreground">{row.waist}</td>
                      <td className="px-4 py-3 font-body text-sm text-muted-foreground">{row.hip}</td>
                      <td className="px-4 py-3 font-body text-sm text-muted-foreground">{row.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {sizeMeasurementTips.map((tip) => (
                <div key={tip} className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 font-body text-sm text-foreground">
                  {tip}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 space-y-6">
          {pageContent.sections.map((section) => (
            <ContentSectionBlock key={section.title} section={section} />
          ))}
        </div>

        {pageKey === "view-360-styles" && styles360.length > 0 && (
          <section className="mt-8 rounded-[26px] border border-border/80 bg-card/95 p-6 shadow-[0_20px_55px_-44px_hsl(var(--foreground)/0.6)] sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-ui text-[10px] tracking-[0.24em] uppercase text-accent">Live Product Set</p>
                <h2 className="mt-3 font-display text-3xl text-foreground">360-ready styles in the catalog</h2>
              </div>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 font-ui text-[11px] tracking-[0.24em] uppercase text-accent transition-colors hover:text-gold-dark"
              >
                Browse All
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {styles360.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  className="group overflow-hidden rounded-[22px] border border-border/80 bg-background shadow-[0_18px_44px_-36px_hsl(var(--foreground)/0.5)]"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={product.images?.[0] || "/placeholder.svg"}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 font-ui text-[10px] tracking-[0.2em] uppercase text-accent">
                      360 Ready
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                      {product.category?.name || "Collection"}
                    </p>
                    <h3 className="mt-2 font-display text-2xl text-foreground transition-colors group-hover:text-accent">
                      {product.name}
                    </h3>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-ui text-sm text-foreground">₹{product.price.toLocaleString("en-IN")}</span>
                      <span className="inline-flex items-center gap-2 font-ui text-[10px] tracking-[0.2em] uppercase text-accent">
                        View Product
                        <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {pageContent.relatedLinks.length > 0 && (
          <section className="mt-8 rounded-[26px] border border-border/80 bg-[linear-gradient(145deg,hsl(var(--accent)/0.1),transparent_58%),linear-gradient(180deg,hsl(var(--card)),hsl(var(--card)))] p-6 shadow-[0_20px_55px_-44px_hsl(var(--foreground)/0.6)] sm:p-8">
            <p className="font-ui text-[10px] tracking-[0.24em] uppercase text-accent">Footer Navigation</p>
            <h2 className="mt-3 font-display text-3xl text-foreground">Keep browsing the right route</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {pageContent.relatedLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-2xl border border-border/70 bg-background/70 px-4 py-4 font-ui text-[10px] tracking-[0.22em] uppercase text-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default StorefrontInfoPage;
