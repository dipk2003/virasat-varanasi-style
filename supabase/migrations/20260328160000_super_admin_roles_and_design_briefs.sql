DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum enum
    JOIN pg_type type ON type.oid = enum.enumtypid
    WHERE type.typname = 'app_role'
      AND enum.enumlabel = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Missing enum value public.app_role.super_admin. Run 20260328159000_add_super_admin_to_app_role.sql first.';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND (
        role = _role
        OR (_role = 'admin'::public.app_role AND role = 'super_admin'::public.app_role)
        OR (_role = 'user'::public.app_role AND role IN ('user'::public.app_role, 'admin'::public.app_role, 'super_admin'::public.app_role))
      )
  )
$$;

CREATE OR REPLACE FUNCTION public.ensure_super_admin_role(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'super_admin'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_roles'
      AND policyname = 'Admins view all roles'
  ) THEN
    CREATE POLICY "Admins view all roles"
    ON public.user_roles FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_roles'
      AND policyname = 'Super admins manage roles'
  ) THEN
    CREATE POLICY "Super admins manage roles"
    ON public.user_roles FOR ALL
    USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
    WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));
  END IF;
END;
$$;

ALTER TABLE public.admin_bootstrap_settings
ADD COLUMN IF NOT EXISTS bootstrap_super_admin_email TEXT;

DROP POLICY IF EXISTS "Admins manage admin bootstrap settings" ON public.admin_bootstrap_settings;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'admin_bootstrap_settings'
      AND policyname = 'Super admins manage admin bootstrap settings'
  ) THEN
    CREATE POLICY "Super admins manage admin bootstrap settings"
    ON public.admin_bootstrap_settings FOR ALL
    USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
    WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_bootstrap_super_admin_email(candidate_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_bootstrap_settings
    WHERE id = true
      AND auto_assign_on_signup = true
      AND bootstrap_super_admin_email IS NOT NULL
      AND lower(bootstrap_super_admin_email) = lower(candidate_email)
  )
$$;

CREATE OR REPLACE FUNCTION public.promote_user_to_super_admin_by_email(target_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  matched_user auth.users%ROWTYPE;
BEGIN
  IF target_email IS NULL OR btrim(target_email) = '' THEN
    RETURN NULL;
  END IF;

  SELECT *
  INTO matched_user
  FROM auth.users
  WHERE lower(email) = lower(target_email)
  ORDER BY created_at ASC
  LIMIT 1;

  IF matched_user.id IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    matched_user.id,
    COALESCE(matched_user.raw_user_meta_data ->> 'full_name', 'Platform Owner')
  )
  ON CONFLICT (user_id) DO UPDATE
  SET full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (matched_user.id, 'user'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  PERFORM public.ensure_super_admin_role(matched_user.id);

  RETURN matched_user.id;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (user_id) DO UPDATE
  SET full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  IF NEW.email IS NOT NULL AND public.is_bootstrap_admin_email(NEW.email) THEN
    PERFORM public.ensure_admin_role(NEW.id);
  END IF;

  IF NEW.email IS NOT NULL AND public.is_bootstrap_super_admin_email(NEW.email) THEN
    PERFORM public.ensure_super_admin_role(NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

ALTER TABLE public.custom_designs
ADD COLUMN IF NOT EXISTS product_category TEXT DEFAULT 'kurti',
ADD COLUMN IF NOT EXISTS weave_style TEXT,
ADD COLUMN IF NOT EXISTS occasion TEXT,
ADD COLUMN IF NOT EXISTS fit_type TEXT,
ADD COLUMN IF NOT EXISTS sleeve_style TEXT,
ADD COLUMN IF NOT EXISTS neckline TEXT,
ADD COLUMN IF NOT EXISTS blouse_style TEXT,
ADD COLUMN IF NOT EXISTS length_preference TEXT,
ADD COLUMN IF NOT EXISTS embroidery_style TEXT,
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS deadline_date DATE,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS delivery_city TEXT,
ADD COLUMN IF NOT EXISTS delivery_state TEXT,
ADD COLUMN IF NOT EXISTS inspiration_notes TEXT,
ADD COLUMN IF NOT EXISTS measurements JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS addons JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal';

CREATE INDEX IF NOT EXISTS idx_custom_designs_category
ON public.custom_designs(product_category, created_at DESC);

INSERT INTO public.delivery_providers (code, name, provider_type, is_active, capabilities)
VALUES
  ('manual', 'Manual Fulfillment', 'manual', true, '{"tracking": false, "label_generation": false, "reverse_pickup": false}'::jsonb),
  ('shiprocket', 'Shiprocket', 'aggregator', true, '{"tracking": true, "ndr": true, "reverse_pickup": true, "label_generation": true}'::jsonb),
  ('delhivery', 'Delhivery', 'courier', false, '{"tracking": true, "reverse_pickup": true, "label_generation": true}'::jsonb),
  ('porter', 'Porter', 'hyperlocal', false, '{"tracking": true, "same_day": true}'::jsonb)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.admin_bootstrap_settings (
  id,
  bootstrap_admin_email,
  bootstrap_super_admin_email,
  auto_assign_on_signup
)
VALUES (
  true,
  'admin@example.com',
  'owner@example.com',
  true
)
ON CONFLICT (id) DO UPDATE
SET bootstrap_admin_email = COALESCE(public.admin_bootstrap_settings.bootstrap_admin_email, EXCLUDED.bootstrap_admin_email),
    bootstrap_super_admin_email = COALESCE(public.admin_bootstrap_settings.bootstrap_super_admin_email, EXCLUDED.bootstrap_super_admin_email),
    auto_assign_on_signup = true,
    updated_at = now();

DO $$
DECLARE
  bootstrap_admin TEXT;
  bootstrap_super_admin TEXT;
BEGIN
  SELECT bootstrap_admin_email, bootstrap_super_admin_email
  INTO bootstrap_admin, bootstrap_super_admin
  FROM public.admin_bootstrap_settings
  WHERE id = true;

  PERFORM public.promote_user_to_admin_by_email(bootstrap_admin);
  PERFORM public.promote_user_to_super_admin_by_email(bootstrap_super_admin);
END;
$$;
