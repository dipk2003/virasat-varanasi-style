CREATE TABLE IF NOT EXISTS public.admin_bootstrap_settings (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  bootstrap_admin_email TEXT,
  auto_assign_on_signup BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_bootstrap_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'admin_bootstrap_settings'
      AND policyname = 'Admins view admin bootstrap settings'
  ) THEN
    CREATE POLICY "Admins view admin bootstrap settings"
    ON public.admin_bootstrap_settings FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'admin_bootstrap_settings'
      AND policyname = 'Admins manage admin bootstrap settings'
  ) THEN
    CREATE POLICY "Admins manage admin bootstrap settings"
    ON public.admin_bootstrap_settings FOR ALL
    USING (public.has_role(auth.uid(), 'admin'::public.app_role))
    WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END
$$;

DROP TRIGGER IF EXISTS update_admin_bootstrap_settings_updated_at ON public.admin_bootstrap_settings;
CREATE TRIGGER update_admin_bootstrap_settings_updated_at
  BEFORE UPDATE ON public.admin_bootstrap_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.is_bootstrap_admin_email(candidate_email TEXT)
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
      AND bootstrap_admin_email IS NOT NULL
      AND lower(bootstrap_admin_email) = lower(candidate_email)
  )
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

  RETURN NEW;
END;
$$;

INSERT INTO public.admin_bootstrap_settings (id, bootstrap_admin_email, auto_assign_on_signup)
VALUES (true, 'admin@example.com', true)
ON CONFLICT (id) DO NOTHING;
