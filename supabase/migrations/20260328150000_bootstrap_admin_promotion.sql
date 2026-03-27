-- Change this email before applying the migration if you want a different
-- default bootstrap admin account.
CREATE OR REPLACE FUNCTION public.promote_user_to_admin_by_email(target_email TEXT)
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
    COALESCE(matched_user.raw_user_meta_data ->> 'full_name', 'Test Admin')
  )
  ON CONFLICT (user_id) DO UPDATE
  SET full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);

  PERFORM public.ensure_admin_role(matched_user.id);

  RETURN matched_user.id;
END;
$$;

DO $$
DECLARE
  bootstrap_email TEXT := 'admin@example.com';
BEGIN
  INSERT INTO public.admin_bootstrap_settings (id, bootstrap_admin_email, auto_assign_on_signup)
  VALUES (true, bootstrap_email, true)
  ON CONFLICT (id) DO UPDATE
  SET bootstrap_admin_email = COALESCE(
        public.admin_bootstrap_settings.bootstrap_admin_email,
        EXCLUDED.bootstrap_admin_email
      ),
      auto_assign_on_signup = true,
      updated_at = now();

  PERFORM public.promote_user_to_admin_by_email(
    (
      SELECT bootstrap_admin_email
      FROM public.admin_bootstrap_settings
      WHERE id = true
    )
  );
END;
$$;
