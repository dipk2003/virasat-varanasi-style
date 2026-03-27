-- Legacy admin seed.
-- Skip safely when the referenced auth user does not exist.
DO $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  SELECT '88344e62-de16-43a0-b3e0-c889979be090'::UUID, 'admin'::public.app_role
  WHERE EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = '88344e62-de16-43a0-b3e0-c889979be090'::UUID
  )
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;
