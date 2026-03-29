import { supabase } from "@/integrations/supabase/client";

type UntypedFrom = (table: string) => ReturnType<typeof supabase.from>;

export type AppRole = "user" | "admin" | "super_admin";
export type TicketStatus = "open" | "in_progress" | "waiting_for_customer" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "dispatched"
  | "delivered"
  | "cancelled"
  | "refund_requested"
  | "refunded";

export interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  company_name?: string;
  landmark?: string;
  country?: string;
}

export interface CustomerAddress extends ShippingAddress {
  id: string;
  user_id: string;
  label: string;
  is_default_shipping: boolean;
  is_default_billing: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreSettings {
  id?: string;
  store_name: string;
  brand_slug: string;
  legal_name: string;
  support_email: string;
  support_phone: string;
  currency_code: string;
  locale_code: string;
  logo_url: string;
  favicon_url: string;
  theme_config?: Record<string, unknown>;
}

export interface HomepageTestimonialSection {
  enabled: boolean;
  eyebrow: string;
  quote: string;
  author: string;
}

export interface HomepageAnnouncementBar {
  enabled: boolean;
  message_primary: string;
  message_secondary: string;
}

export interface HomepageSaleBannerSection {
  enabled: boolean;
  eyebrow: string;
  title_prefix: string;
  title_highlight: string;
  description: string;
  countdown_label: string;
  countdown_days: string;
  countdown_hours: string;
  countdown_minutes: string;
  countdown_seconds: string;
  button_label: string;
  button_link: string;
}

export interface HomepageCollectionCtaSection {
  enabled: boolean;
  eyebrow: string;
  title: string;
  description: string;
  button_label: string;
  button_link: string;
}

export interface HomepageHeroBannerSection {
  enabled: boolean;
  eyebrow: string;
  title_native: string;
  title_latin: string;
  description: string;
  primary_button_label: string;
  primary_button_link: string;
  secondary_button_label: string;
  secondary_button_link: string;
  background_image_url: string;
}

export interface HomepageFeatureBannerSection {
  enabled: boolean;
  eyebrow: string;
  badge: string;
  title: string;
  description: string;
  primary_button_label: string;
  primary_button_link: string;
  secondary_button_label: string;
  secondary_button_link: string;
}

export interface HomepageContentConfig {
  announcement_bar: HomepageAnnouncementBar;
  hero_banner: HomepageHeroBannerSection;
  sale_banner: HomepageSaleBannerSection;
  testimonial_banner: HomepageTestimonialSection;
  collection_cta: HomepageCollectionCtaSection;
  feature_banner: HomepageFeatureBannerSection;
}

export interface DeliveryProvider {
  id: string;
  code: string;
  name: string;
  provider_type: string;
  is_active: boolean;
  config: Record<string, unknown>;
  capabilities: Record<string, unknown>;
}

export interface AdminBootstrapSettings {
  id: boolean;
  bootstrap_admin_email: string | null;
  bootstrap_super_admin_email: string | null;
  auto_assign_on_signup: boolean;
}

export interface OrderStatusHistoryEntry {
  id: string;
  order_id: string;
  old_status: OrderStatus | null;
  new_status: OrderStatus;
  note: string | null;
  changed_by: string | null;
  created_at: string;
}

export interface ShipmentEvent {
  id: string;
  shipment_id: string;
  provider_status: string | null;
  event_code: string | null;
  event_description: string;
  location: string | null;
  event_at: string;
  created_at: string;
}

export interface OrderShipment {
  id: string;
  order_id: string;
  status: string;
  provider_order_id: string | null;
  awb_number: string | null;
  tracking_url: string | null;
  courier_name: string | null;
  courier_service_code: string | null;
  estimated_delivery_date: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  metadata?: Record<string, unknown>;
  shipment_events?: ShipmentEvent[];
}

export interface OrderTimelineData {
  relationReady: boolean;
  statusHistory: OrderStatusHistoryEntry[];
  shipments: OrderShipment[];
}

export interface CustomDesignRequest {
  admin_reference_images?: string[] | null;
  id: string;
  user_id: string;
  admin_notes: string | null;
  addons?: string[] | null;
  blouse_style?: string | null;
  budget_range: string | null;
  color_preference: string | null;
  contact_phone?: string | null;
  created_at: string;
  deadline_date?: string | null;
  delivery_city?: string | null;
  delivery_state?: string | null;
  design_description: string;
  embroidery_style?: string | null;
  estimated_price: number | null;
  fabric_type: string | null;
  fit_type?: string | null;
  inspiration_notes?: string | null;
  length_preference?: string | null;
  measurements?: Record<string, string> | null;
  occasion?: string | null;
  priority?: string | null;
  product_category?: string | null;
  quantity?: number | null;
  reference_images: string[] | null;
  size: string | null;
  sleeve_style?: string | null;
  status: string;
  updated_at: string;
  weave_style?: string | null;
}

export interface SupportTicket {
  id: string;
  user_id: string | null;
  order_id: string | null;
  product_id?: string | null;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigned_to: string | null;
  source: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string | null;
  sender_role: AppRole;
  message: string;
  attachments?: string[] | null;
  is_read: boolean;
  created_at: string;
}

export const untypedDb = supabase as unknown as { from: UntypedFrom };

const missingRelationCodes = new Set(["PGRST205", "42P01"]);

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refund_requested: "Refund Requested",
  refunded: "Refunded",
};

export const defaultStoreSettings: StoreSettings = {
  store_name: "Brand Store",
  brand_slug: "brand-store",
  legal_name: "",
  support_email: "",
  support_phone: "",
  currency_code: "INR",
  locale_code: "en-IN",
  logo_url: "",
  favicon_url: "",
  theme_config: {},
};

export const defaultHomepageContent: HomepageContentConfig = {
  announcement_bar: {
    enabled: true,
    message_primary: "✦ Limited Collection — Flat 30% Off on Banarasi Silk ✦",
    message_secondary: "✦ Free Shipping on Orders Above ₹2,999 ✦",
  },
  hero_banner: {
    enabled: true,
    eyebrow: "From the Looms of Varanasi",
    title_native: "विरासत",
    title_latin: "Virasat",
    description: "Heritage Woven in Every Thread — Limited Banarasi Kurti Collection",
    primary_button_label: "Explore Collection",
    primary_button_link: "/shop",
    secondary_button_label: "New Arrivals",
    secondary_button_link: "/#new-arrivals",
    background_image_url: "",
  },
  sale_banner: {
    enabled: true,
    eyebrow: "Festival Special",
    title_prefix: "Flat",
    title_highlight: "30% Off",
    description: "On our entire Banarasi Silk Kurti Collection. Limited stock available.",
    countdown_label: "Offer Ends In",
    countdown_days: "02",
    countdown_hours: "14",
    countdown_minutes: "36",
    countdown_seconds: "52",
    button_label: "Shop The Sale",
    button_link: "/shop?category=banarasi-silk",
  },
  testimonial_banner: {
    enabled: true,
    eyebrow: "Voices of Our Patrons",
    quote: "\"The moment I wore my Virasat kurti, I felt like I was draped in history itself.\"",
    author: "— Priya Sharma, New Delhi",
  },
  collection_cta: {
    enabled: true,
    eyebrow: "Discover Your Style",
    title: "Browse Our Full Collection",
    description: "From everyday elegance to festive grandeur — find the perfect kurti for every occasion.",
    button_label: "Shop All Products",
    button_link: "/shop",
  },
  feature_banner: {
    enabled: true,
    eyebrow: "Platform Feature",
    badge: "Admin Controlled",
    title: "Launch premium campaigns without touching code",
    description: "Create category-led homepage stories, push sellable CTAs, and keep your storefront configurable from the admin side.",
    primary_button_label: "Explore Collections",
    primary_button_link: "/shop",
    secondary_button_label: "Open Categories",
    secondary_button_link: "/#categories",
  },
};

export const roleLabels: Record<AppRole, string> = {
  user: "Customer",
  admin: "Admin",
  super_admin: "Super Admin",
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const readString = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim() ? value : fallback;

const readBoolean = (value: unknown, fallback: boolean) =>
  typeof value === "boolean" ? value : fallback;

export const isMissingRelationError = (error: { code?: string; message?: string | null } | null | undefined) => {
  if (!error) return false;

  if (error.code && missingRelationCodes.has(error.code)) {
    return true;
  }

  const message = (error.message || "").toLowerCase();
  return message.includes("could not find the table") || message.includes("does not exist");
};

export const normalizeAddress = (address?: Partial<ShippingAddress> | null): ShippingAddress => ({
  full_name: address?.full_name || "",
  phone: address?.phone || "",
  address_line1: address?.address_line1 || "",
  address_line2: address?.address_line2 || "",
  city: address?.city || "",
  state: address?.state || "",
  pincode: address?.pincode || "",
  company_name: address?.company_name || "",
  landmark: address?.landmark || "",
  country: address?.country || "India",
});

export const formatAddressLines = (address?: Partial<ShippingAddress> | null) => {
  if (!address) return [];

  return [
    address.full_name,
    [address.address_line1, address.address_line2].filter(Boolean).join(", "),
    [address.landmark, address.city].filter(Boolean).join(", "),
    [address.state, address.pincode, address.country || "India"].filter(Boolean).join(", "),
    [address.phone, address.company_name].filter(Boolean).join(" | "),
  ].filter(Boolean) as string[];
};

export const formatCurrency = (amount: number | string | null | undefined) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

export const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

export const asStringRecord = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value).reduce<Record<string, string>>((acc, [key, entry]) => {
    if (typeof entry === "string" && entry.trim()) {
      acc[key] = entry;
    }

    return acc;
  }, {});
};

export const extractHomepageContent = (themeConfig: unknown): HomepageContentConfig => {
  const homepageConfig = isRecord(themeConfig) && isRecord(themeConfig.homepage) ? themeConfig.homepage : {};
  const announcementBarConfig = isRecord(homepageConfig.announcement_bar) ? homepageConfig.announcement_bar : {};
  const heroBannerConfig = isRecord(homepageConfig.hero_banner) ? homepageConfig.hero_banner : {};
  const saleBannerConfig = isRecord(homepageConfig.sale_banner) ? homepageConfig.sale_banner : {};
  const testimonialConfig = isRecord(homepageConfig.testimonial_banner) ? homepageConfig.testimonial_banner : {};
  const collectionCtaConfig = isRecord(homepageConfig.collection_cta) ? homepageConfig.collection_cta : {};
  const featureBannerConfig = isRecord(homepageConfig.feature_banner) ? homepageConfig.feature_banner : {};

  return {
    announcement_bar: {
      enabled: readBoolean(announcementBarConfig.enabled, defaultHomepageContent.announcement_bar.enabled),
      message_primary: readString(announcementBarConfig.message_primary, defaultHomepageContent.announcement_bar.message_primary),
      message_secondary: readString(announcementBarConfig.message_secondary, defaultHomepageContent.announcement_bar.message_secondary),
    },
    hero_banner: {
      enabled: readBoolean(heroBannerConfig.enabled, defaultHomepageContent.hero_banner.enabled),
      eyebrow: readString(heroBannerConfig.eyebrow, defaultHomepageContent.hero_banner.eyebrow),
      title_native: readString(heroBannerConfig.title_native, defaultHomepageContent.hero_banner.title_native),
      title_latin: readString(heroBannerConfig.title_latin, defaultHomepageContent.hero_banner.title_latin),
      description: readString(heroBannerConfig.description, defaultHomepageContent.hero_banner.description),
      primary_button_label: readString(
        heroBannerConfig.primary_button_label,
        defaultHomepageContent.hero_banner.primary_button_label
      ),
      primary_button_link: readString(
        heroBannerConfig.primary_button_link,
        defaultHomepageContent.hero_banner.primary_button_link
      ),
      secondary_button_label: readString(
        heroBannerConfig.secondary_button_label,
        defaultHomepageContent.hero_banner.secondary_button_label
      ),
      secondary_button_link: readString(
        heroBannerConfig.secondary_button_link,
        defaultHomepageContent.hero_banner.secondary_button_link
      ),
      background_image_url: readString(
        heroBannerConfig.background_image_url,
        defaultHomepageContent.hero_banner.background_image_url
      ),
    },
    sale_banner: {
      enabled: readBoolean(saleBannerConfig.enabled, defaultHomepageContent.sale_banner.enabled),
      eyebrow: readString(saleBannerConfig.eyebrow, defaultHomepageContent.sale_banner.eyebrow),
      title_prefix: readString(saleBannerConfig.title_prefix, defaultHomepageContent.sale_banner.title_prefix),
      title_highlight: readString(saleBannerConfig.title_highlight, defaultHomepageContent.sale_banner.title_highlight),
      description: readString(saleBannerConfig.description, defaultHomepageContent.sale_banner.description),
      countdown_label: readString(saleBannerConfig.countdown_label, defaultHomepageContent.sale_banner.countdown_label),
      countdown_days: readString(saleBannerConfig.countdown_days, defaultHomepageContent.sale_banner.countdown_days),
      countdown_hours: readString(saleBannerConfig.countdown_hours, defaultHomepageContent.sale_banner.countdown_hours),
      countdown_minutes: readString(saleBannerConfig.countdown_minutes, defaultHomepageContent.sale_banner.countdown_minutes),
      countdown_seconds: readString(saleBannerConfig.countdown_seconds, defaultHomepageContent.sale_banner.countdown_seconds),
      button_label: readString(saleBannerConfig.button_label, defaultHomepageContent.sale_banner.button_label),
      button_link: readString(saleBannerConfig.button_link, defaultHomepageContent.sale_banner.button_link),
    },
    testimonial_banner: {
      enabled: readBoolean(testimonialConfig.enabled, defaultHomepageContent.testimonial_banner.enabled),
      eyebrow: readString(testimonialConfig.eyebrow, defaultHomepageContent.testimonial_banner.eyebrow),
      quote: readString(testimonialConfig.quote, defaultHomepageContent.testimonial_banner.quote),
      author: readString(testimonialConfig.author, defaultHomepageContent.testimonial_banner.author),
    },
    collection_cta: {
      enabled: readBoolean(collectionCtaConfig.enabled, defaultHomepageContent.collection_cta.enabled),
      eyebrow: readString(collectionCtaConfig.eyebrow, defaultHomepageContent.collection_cta.eyebrow),
      title: readString(collectionCtaConfig.title, defaultHomepageContent.collection_cta.title),
      description: readString(collectionCtaConfig.description, defaultHomepageContent.collection_cta.description),
      button_label: readString(collectionCtaConfig.button_label, defaultHomepageContent.collection_cta.button_label),
      button_link: readString(collectionCtaConfig.button_link, defaultHomepageContent.collection_cta.button_link),
    },
    feature_banner: {
      enabled: readBoolean(featureBannerConfig.enabled, defaultHomepageContent.feature_banner.enabled),
      eyebrow: readString(featureBannerConfig.eyebrow, defaultHomepageContent.feature_banner.eyebrow),
      badge: readString(featureBannerConfig.badge, defaultHomepageContent.feature_banner.badge),
      title: readString(featureBannerConfig.title, defaultHomepageContent.feature_banner.title),
      description: readString(featureBannerConfig.description, defaultHomepageContent.feature_banner.description),
      primary_button_label: readString(
        featureBannerConfig.primary_button_label,
        defaultHomepageContent.feature_banner.primary_button_label
      ),
      primary_button_link: readString(
        featureBannerConfig.primary_button_link,
        defaultHomepageContent.feature_banner.primary_button_link
      ),
      secondary_button_label: readString(
        featureBannerConfig.secondary_button_label,
        defaultHomepageContent.feature_banner.secondary_button_label
      ),
      secondary_button_link: readString(
        featureBannerConfig.secondary_button_link,
        defaultHomepageContent.feature_banner.secondary_button_link
      ),
    },
  };
};

export const mergeHomepageContentIntoThemeConfig = (
  themeConfig: unknown,
  homepageContent: HomepageContentConfig
): Record<string, unknown> => {
  const nextThemeConfig = isRecord(themeConfig) ? { ...themeConfig } : {};
  const nextHomepageConfig = isRecord(nextThemeConfig.homepage) ? { ...nextThemeConfig.homepage } : {};

  nextHomepageConfig.announcement_bar = {
    ...homepageContent.announcement_bar,
  };
  nextHomepageConfig.hero_banner = {
    ...homepageContent.hero_banner,
  };
  nextHomepageConfig.sale_banner = {
    ...homepageContent.sale_banner,
  };
  nextHomepageConfig.testimonial_banner = {
    ...homepageContent.testimonial_banner,
  };
  nextHomepageConfig.collection_cta = {
    ...homepageContent.collection_cta,
  };
  nextHomepageConfig.feature_banner = {
    ...homepageContent.feature_banner,
  };

  nextThemeConfig.homepage = nextHomepageConfig;

  return nextThemeConfig;
};

export const buildFallbackStatusHistory = (order: {
  id: string;
  status: OrderStatus;
  created_at: string;
  updated_at?: string;
}): OrderStatusHistoryEntry[] => [
  {
    id: `fallback-${order.id}`,
    order_id: order.id,
    old_status: null,
    new_status: order.status,
    note: "Timeline becomes more detailed after the foundation migration is applied.",
    changed_by: null,
    created_at: order.updated_at || order.created_at,
  },
];

export const fetchOrderTimelineData = async (orderId: string): Promise<OrderTimelineData> => {
  const db = untypedDb;

  const [historyRes, shipmentsRes] = await Promise.all([
    db
      .from("order_status_history")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false }),
    db
      .from("order_shipments")
      .select("*, shipment_events(*)")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false }),
  ]);

  const historyMissing = isMissingRelationError(historyRes.error);
  const shipmentsMissing = isMissingRelationError(shipmentsRes.error);

  return {
    relationReady: !historyMissing && !shipmentsMissing,
    statusHistory: historyMissing ? [] : ((historyRes.data || []) as OrderStatusHistoryEntry[]),
    shipments: shipmentsMissing ? [] : ((shipmentsRes.data || []) as OrderShipment[]),
  };
};
