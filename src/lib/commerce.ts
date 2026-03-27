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
};

export const roleLabels: Record<AppRole, string> = {
  user: "Customer",
  admin: "Admin",
  super_admin: "Super Admin",
};

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
