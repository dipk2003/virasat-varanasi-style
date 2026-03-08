-- Create product_variants table
CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT,
  color TEXT,
  sku TEXT,
  price_override NUMERIC,
  compare_at_price_override NUMERIC,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, size, color)
);

-- RLS
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Variants viewable by everyone"
ON public.product_variants FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins manage variants"
ON public.product_variants FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Update trigger
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to decrement variant stock
CREATE OR REPLACE FUNCTION public.decrement_variant_stock(p_variant_id UUID, p_quantity INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE product_variants
  SET stock_quantity = GREATEST(0, stock_quantity - p_quantity)
  WHERE id = p_variant_id;
END;
$$;