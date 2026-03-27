DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum enum
    JOIN pg_type type ON type.oid = enum.enumtypid
    WHERE type.typname = 'app_role'
      AND enum.enumlabel = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Missing enum value public.app_role.super_admin. Run 20260328159000_add_super_admin_to_app_role.sql and 20260328160000_super_admin_roles_and_design_briefs.sql first.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'admin_bootstrap_settings'
      AND column_name = 'bootstrap_super_admin_email'
  ) THEN
    RAISE EXCEPTION 'Missing public.admin_bootstrap_settings.bootstrap_super_admin_email. Run 20260328160000_super_admin_roles_and_design_briefs.sql first.';
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.access_seed_accounts (
  email TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  intended_role public.app_role NOT NULL DEFAULT 'user'::public.app_role,
  portal_path TEXT NOT NULL DEFAULT '/auth',
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.access_seed_accounts ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_access_seed_accounts_updated_at ON public.access_seed_accounts;
CREATE TRIGGER update_access_seed_accounts_updated_at
  BEFORE UPDATE ON public.access_seed_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'access_seed_accounts'
      AND policyname = 'Admins view access seed accounts'
  ) THEN
    CREATE POLICY "Admins view access seed accounts"
    ON public.access_seed_accounts FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'access_seed_accounts'
      AND policyname = 'Super admins manage access seed accounts'
  ) THEN
    CREATE POLICY "Super admins manage access seed accounts"
    ON public.access_seed_accounts FOR ALL
    USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
    WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_seeded_access_role(candidate_email TEXT)
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT intended_role
  FROM public.access_seed_accounts
  WHERE is_active = true
    AND lower(email) = lower(candidate_email)
  ORDER BY CASE intended_role
    WHEN 'super_admin'::public.app_role THEN 3
    WHEN 'admin'::public.app_role THEN 2
    ELSE 1
  END DESC
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.promote_seed_account_by_email(target_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  matched_user auth.users%ROWTYPE;
  seed_account public.access_seed_accounts%ROWTYPE;
BEGIN
  IF target_email IS NULL OR btrim(target_email) = '' THEN
    RETURN NULL;
  END IF;

  SELECT *
  INTO seed_account
  FROM public.access_seed_accounts
  WHERE is_active = true
    AND lower(email) = lower(target_email)
  LIMIT 1;

  IF seed_account.email IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT *
  INTO matched_user
  FROM auth.users
  WHERE lower(email) = lower(seed_account.email)
  ORDER BY created_at ASC
  LIMIT 1;

  IF matched_user.id IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    matched_user.id,
    COALESCE(seed_account.full_name, matched_user.raw_user_meta_data ->> 'full_name', 'Demo Account')
  )
  ON CONFLICT (user_id) DO UPDATE
  SET full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (matched_user.id, 'user'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  IF seed_account.intended_role = 'admin'::public.app_role THEN
    PERFORM public.ensure_admin_role(matched_user.id);
  ELSIF seed_account.intended_role = 'super_admin'::public.app_role THEN
    PERFORM public.ensure_super_admin_role(matched_user.id);
  END IF;

  RETURN matched_user.id;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  seeded_role public.app_role;
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (user_id) DO UPDATE
  SET full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  seeded_role := CASE
    WHEN NEW.email IS NULL THEN NULL
    ELSE public.get_seeded_access_role(NEW.email)
  END;

  IF seeded_role = 'admin'::public.app_role THEN
    PERFORM public.ensure_admin_role(NEW.id);
  ELSIF seeded_role = 'super_admin'::public.app_role THEN
    PERFORM public.ensure_super_admin_role(NEW.id);
  ELSIF NEW.email IS NOT NULL AND public.is_bootstrap_admin_email(NEW.email) THEN
    PERFORM public.ensure_admin_role(NEW.id);
  ELSIF NEW.email IS NOT NULL AND public.is_bootstrap_super_admin_email(NEW.email) THEN
    PERFORM public.ensure_super_admin_role(NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

INSERT INTO public.access_seed_accounts (email, full_name, intended_role, portal_path, notes)
VALUES
  ('customer1@example.com', 'Demo Customer 1', 'user'::public.app_role, '/auth', 'Demo storefront customer'),
  ('customer2@example.com', 'Demo Customer 2', 'user'::public.app_role, '/auth', 'Demo storefront customer'),
  ('customer3@example.com', 'Demo Customer 3', 'user'::public.app_role, '/auth', 'Demo storefront customer'),
  ('customer4@example.com', 'Demo Customer 4', 'user'::public.app_role, '/auth', 'Demo storefront customer'),
  ('customer5@example.com', 'Demo Customer 5', 'user'::public.app_role, '/auth', 'Demo storefront customer'),
  ('admin@example.com', 'Demo Admin 1', 'admin'::public.app_role, '/admin/login', 'Demo operations admin'),
  ('ops@example.com', 'Demo Admin 2', 'admin'::public.app_role, '/admin/login', 'Demo merchandising admin'),
  ('owner@example.com', 'Demo Super Admin', 'super_admin'::public.app_role, '/superadmin', 'Demo platform owner')
ON CONFLICT (email) DO UPDATE
SET full_name = EXCLUDED.full_name,
    intended_role = EXCLUDED.intended_role,
    portal_path = EXCLUDED.portal_path,
    notes = EXCLUDED.notes,
    is_active = true,
    updated_at = now();

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
SET bootstrap_admin_email = EXCLUDED.bootstrap_admin_email,
    bootstrap_super_admin_email = EXCLUDED.bootstrap_super_admin_email,
    auto_assign_on_signup = true,
    updated_at = now();

DO $$
DECLARE
  seed_account RECORD;
BEGIN
  FOR seed_account IN
    SELECT email
    FROM public.access_seed_accounts
    WHERE is_active = true
  LOOP
    PERFORM public.promote_seed_account_by_email(seed_account.email);
  END LOOP;
END;
$$;
