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
      )
  )
$$;

CREATE OR REPLACE FUNCTION public.set_user_role(target_user_id UUID, target_role public.app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.user_roles
  WHERE user_id = target_user_id
    AND role <> target_role;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, target_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_admin_role(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.set_user_role(target_user_id, 'admin'::public.app_role);
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_super_admin_role(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.set_user_role(target_user_id, 'super_admin'::public.app_role);
END;
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

  PERFORM public.ensure_super_admin_role(matched_user.id);

  RETURN matched_user.id;
END;
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

  PERFORM public.set_user_role(matched_user.id, seed_account.intended_role);

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
  assigned_role public.app_role := 'user'::public.app_role;
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (user_id) DO UPDATE
  SET full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);

  seeded_role := CASE
    WHEN NEW.email IS NULL THEN NULL
    ELSE public.get_seeded_access_role(NEW.email)
  END;

  IF seeded_role IS NOT NULL THEN
    assigned_role := seeded_role;
  ELSIF NEW.email IS NOT NULL AND public.is_bootstrap_super_admin_email(NEW.email) THEN
    assigned_role := 'super_admin'::public.app_role;
  ELSIF NEW.email IS NOT NULL AND public.is_bootstrap_admin_email(NEW.email) THEN
    assigned_role := 'admin'::public.app_role;
  END IF;

  PERFORM public.set_user_role(NEW.id, assigned_role);

  RETURN NEW;
END;
$$;

WITH ranked_roles AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY CASE role
        WHEN 'super_admin'::public.app_role THEN 1
        WHEN 'admin'::public.app_role THEN 2
        ELSE 3
      END
    ) AS role_rank
  FROM public.user_roles
)
DELETE FROM public.user_roles user_roles
USING ranked_roles
WHERE user_roles.id = ranked_roles.id
  AND ranked_roles.role_rank > 1;

INSERT INTO public.user_roles (user_id, role)
SELECT auth_users.id, 'user'::public.app_role
FROM auth.users auth_users
WHERE NOT EXISTS (
  SELECT 1
  FROM public.user_roles
  WHERE user_id = auth_users.id
);
