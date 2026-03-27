-- Foundation schema to move the current boutique-store prototype toward
-- a sellable ecommerce product for apparel brands.

-- Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE public.payment_status AS ENUM (
      'pending',
      'authorized',
      'captured',
      'failed',
      'cancelled',
      'refunded',
      'partially_refunded'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shipment_status') THEN
    CREATE TYPE public.shipment_status AS ENUM (
      'draft',
      'created',
      'pickup_scheduled',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'failed_delivery',
      'rto_in_transit',
      'rto_delivered',
      'cancelled'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'return_status_v2') THEN
    CREATE TYPE public.return_status_v2 AS ENUM (
      'requested',
      'approved',
      'rejected',
      'pickup_scheduled',
      'picked_up',
      'received',
      'quality_checked',
      'refunded',
      'closed'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_status') THEN
    CREATE TYPE public.ticket_status AS ENUM (
      'open',
      'in_progress',
      'waiting_for_customer',
      'resolved',
      'closed'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_priority') THEN
    CREATE TYPE public.ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'billing_cycle') THEN
    CREATE TYPE public.billing_cycle AS ENUM ('monthly', 'quarterly', 'yearly');
  END IF;
END
$$;

-- Store settings / branding
CREATE TABLE IF NOT EXISTS public.store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT NOT NULL DEFAULT 'Brand Store',
  brand_slug TEXT UNIQUE,
  legal_name TEXT,
  support_email TEXT,
  support_phone TEXT,
  currency_code TEXT NOT NULL DEFAULT 'INR',
  locale_code TEXT NOT NULL DEFAULT 'en-IN',
  logo_url TEXT,
  favicon_url TEXT,
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  theme_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  seo_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  shipping_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  return_policy JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store settings viewable by everyone"
ON public.store_settings FOR SELECT
USING (true);

CREATE POLICY "Admins manage store settings"
ON public.store_settings FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_store_settings_updated_at
  BEFORE UPDATE ON public.store_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Saved addresses
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Home',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  company_name TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  landmark TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  pincode TEXT NOT NULL,
  is_default_shipping BOOLEAN NOT NULL DEFAULT false,
  is_default_billing BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own addresses"
ON public.customer_addresses FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all addresses"
ON public.customer_addresses FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_customer_addresses_user_id
ON public.customer_addresses(user_id, created_at DESC);

CREATE TRIGGER update_customer_addresses_updated_at
  BEFORE UPDATE ON public.customer_addresses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Collections / merchandising
CREATE TABLE IF NOT EXISTS public.product_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  hero_image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  seo_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.product_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collections viewable by everyone"
ON public.product_collections FOR SELECT
USING (true);

CREATE POLICY "Admins manage collections"
ON public.product_collections FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_product_collections_updated_at
  BEFORE UPDATE ON public.product_collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.collection_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.product_collections(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(collection_id, product_id)
);

ALTER TABLE public.collection_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collection products viewable by everyone"
ON public.collection_products FOR SELECT
USING (true);

CREATE POLICY "Admins manage collection products"
ON public.collection_products FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Payment orchestration
CREATE TABLE IF NOT EXISTS public.payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_code TEXT NOT NULL,
  provider_order_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency_code TEXT NOT NULL DEFAULT 'INR',
  status public.payment_status NOT NULL DEFAULT 'pending',
  checkout_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own payment orders"
ON public.payment_orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users create own payment orders"
ON public.payment_orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage payment orders"
ON public.payment_orders FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_payment_orders_order_id
ON public.payment_orders(order_id);

CREATE TRIGGER update_payment_orders_updated_at
  BEFORE UPDATE ON public.payment_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_order_id UUID NOT NULL REFERENCES public.payment_orders(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_code TEXT NOT NULL,
  provider_payment_id TEXT,
  provider_signature TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency_code TEXT NOT NULL DEFAULT 'INR',
  status public.payment_status NOT NULL DEFAULT 'pending',
  method TEXT,
  gateway_fee DECIMAL(10,2),
  tax_amount DECIMAL(10,2),
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own payment transactions"
ON public.payment_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins manage payment transactions"
ON public.payment_transactions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id
ON public.payment_transactions(order_id, created_at DESC);

-- Order timeline
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  old_status public.order_status,
  new_status public.order_status NOT NULL,
  note TEXT,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own order status history"
ON public.order_status_history FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.orders
    WHERE orders.id = order_status_history.order_id
      AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Admins manage order status history"
ON public.order_status_history FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id
ON public.order_status_history(order_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.order_status_history (order_id, old_status, new_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS track_order_status_change ON public.orders;
CREATE TRIGGER track_order_status_change
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.log_order_status_change();

-- Logistics provider abstraction
CREATE TABLE IF NOT EXISTS public.delivery_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  provider_type TEXT NOT NULL DEFAULT 'aggregator',
  is_active BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  capabilities JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.delivery_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage delivery providers"
ON public.delivery_providers FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_delivery_providers_updated_at
  BEFORE UPDATE ON public.delivery_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.order_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES public.delivery_providers(id) ON DELETE SET NULL,
  status public.shipment_status NOT NULL DEFAULT 'draft',
  provider_order_id TEXT,
  awb_number TEXT,
  label_url TEXT,
  tracking_url TEXT,
  pickup_location_code TEXT,
  courier_name TEXT,
  courier_service_code TEXT,
  estimated_delivery_date DATE,
  last_synced_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.order_shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own shipments"
ON public.order_shipments FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.orders
    WHERE orders.id = order_shipments.order_id
      AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Admins manage shipments"
ON public.order_shipments FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_order_shipments_order_id
ON public.order_shipments(order_id, created_at DESC);

CREATE TRIGGER update_order_shipments_updated_at
  BEFORE UPDATE ON public.order_shipments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.shipment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES public.order_shipments(id) ON DELETE CASCADE,
  provider_status TEXT,
  event_code TEXT,
  event_description TEXT NOT NULL,
  location TEXT,
  event_at TIMESTAMPTZ NOT NULL,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own shipment events"
ON public.shipment_events FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.order_shipments s
    JOIN public.orders o ON o.id = s.order_id
    WHERE s.id = shipment_events.shipment_id
      AND o.user_id = auth.uid()
  )
);

CREATE POLICY "Admins manage shipment events"
ON public.shipment_events FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_shipment_events_shipment_id
ON public.shipment_events(shipment_id, event_at DESC);

-- Returns / refunds
CREATE TABLE IF NOT EXISTS public.return_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES public.order_items(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.return_status_v2 NOT NULL DEFAULT 'requested',
  reason_code TEXT,
  reason_note TEXT,
  pickup_required BOOLEAN NOT NULL DEFAULT true,
  pickup_address JSONB,
  resolution_note TEXT,
  refund_amount DECIMAL(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own returns"
ON public.return_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users create own returns"
ON public.return_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage returns"
ON public.return_requests FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_return_requests_order_id
ON public.return_requests(order_id, created_at DESC);

CREATE TRIGGER update_return_requests_updated_at
  BEFORE UPDATE ON public.return_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inventory ledger
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  quantity_delta INTEGER NOT NULL,
  movement_type TEXT NOT NULL,
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage inventory movements"
ON public.inventory_movements FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id
ON public.inventory_movements(product_id, created_at DESC);

-- Support / CRM
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status public.ticket_status NOT NULL DEFAULT 'open',
  priority public.ticket_priority NOT NULL DEFAULT 'medium',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'web',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own support tickets"
ON public.support_tickets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users create own support tickets"
ON public.support_tickets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own support tickets"
ON public.support_tickets FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins manage support tickets"
ON public.support_tickets FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id
ON public.support_tickets(user_id, created_at DESC);

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Platform revenue / annual maintenance support
CREATE TABLE IF NOT EXISTS public.maintenance_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  billing_cycle public.billing_cycle NOT NULL DEFAULT 'yearly',
  amount DECIMAL(10,2) NOT NULL,
  inclusions JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.maintenance_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage maintenance plans"
ON public.maintenance_plans FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_maintenance_plans_updated_at
  BEFORE UPDATE ON public.maintenance_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.maintenance_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES public.maintenance_plans(id) ON DELETE SET NULL,
  contract_name TEXT NOT NULL,
  client_label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  starts_on DATE NOT NULL,
  ends_on DATE,
  amount DECIMAL(10,2) NOT NULL,
  billing_cycle public.billing_cycle NOT NULL DEFAULT 'yearly',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.maintenance_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage maintenance contracts"
ON public.maintenance_contracts FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_maintenance_contracts_updated_at
  BEFORE UPDATE ON public.maintenance_contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Webhook / auditability
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_code TEXT NOT NULL,
  event_type TEXT NOT NULL,
  external_event_id TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage webhook events"
ON public.webhook_events FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  before_state JSONB,
  after_state JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view audit logs"
ON public.audit_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Seed foundation records
INSERT INTO public.store_settings (store_name, brand_slug)
SELECT 'Brand Store', 'brand-store'
WHERE NOT EXISTS (
  SELECT 1 FROM public.store_settings WHERE brand_slug = 'brand-store'
);

INSERT INTO public.delivery_providers (code, name, provider_type, is_active, capabilities)
VALUES
  (
    'shiprocket',
    'Shiprocket',
    'aggregator',
    true,
    '{"tracking": true, "ndr": true, "reverse_pickup": true, "label_generation": true}'::jsonb
  ),
  (
    'delhivery',
    'Delhivery',
    'courier',
    false,
    '{"tracking": true, "ndr": true, "reverse_pickup": true, "label_generation": true}'::jsonb
  )
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.maintenance_plans (name, billing_cycle, amount, inclusions)
VALUES
  (
    'Launch AMC',
    'yearly',
    25000,
    '["Hosting checks", "Minor bug fixes", "Monthly backup review", "Payment and shipping connector monitoring"]'::jsonb
  ),
  (
    'Growth AMC',
    'yearly',
    60000,
    '["Everything in Launch", "Campaign setup", "Quarterly CRO review", "SEO landing page support", "Ops dashboard review"]'::jsonb
  ),
  (
    'Scale AMC',
    'yearly',
    120000,
    '["Everything in Growth", "Priority SLA", "Webhook incident support", "Advanced reporting", "RTO and return optimization"]'::jsonb
  )
ON CONFLICT (name) DO NOTHING;
