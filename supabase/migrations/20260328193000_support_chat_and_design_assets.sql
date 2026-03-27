INSERT INTO storage.buckets (id, name, public)
SELECT 'design-reference-images', 'design-reference-images', true
WHERE NOT EXISTS (
  SELECT 1
  FROM storage.buckets
  WHERE id = 'design-reference-images'
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Authenticated can upload design reference images'
  ) THEN
    CREATE POLICY "Authenticated can upload design reference images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'design-reference-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Authenticated can update design reference images'
  ) THEN
    CREATE POLICY "Authenticated can update design reference images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'design-reference-images')
    WITH CHECK (bucket_id = 'design-reference-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Authenticated can delete design reference images'
  ) THEN
    CREATE POLICY "Authenticated can delete design reference images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'design-reference-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Anyone can view design reference images'
  ) THEN
    CREATE POLICY "Anyone can view design reference images"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'design-reference-images');
  END IF;
END
$$;

ALTER TABLE public.custom_designs
ADD COLUMN IF NOT EXISTS admin_reference_images TEXT[] NOT NULL DEFAULT '{}'::text[];

ALTER TABLE public.support_tickets
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_role public.app_role NOT NULL DEFAULT 'user'::public.app_role,
  message TEXT NOT NULL,
  attachments TEXT[] NOT NULL DEFAULT '{}'::text[],
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_created
ON public.support_messages(ticket_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_support_tickets_last_message
ON public.support_tickets(last_message_at DESC, created_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'support_messages'
      AND policyname = 'Users view messages for own tickets'
  ) THEN
    CREATE POLICY "Users view messages for own tickets"
    ON public.support_messages FOR SELECT
    USING (
      EXISTS (
        SELECT 1
        FROM public.support_tickets
        WHERE public.support_tickets.id = support_messages.ticket_id
          AND public.support_tickets.user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'support_messages'
      AND policyname = 'Users send messages for own tickets'
  ) THEN
    CREATE POLICY "Users send messages for own tickets"
    ON public.support_messages FOR INSERT
    WITH CHECK (
      sender_id = auth.uid()
      AND EXISTS (
        SELECT 1
        FROM public.support_tickets
        WHERE public.support_tickets.id = support_messages.ticket_id
          AND public.support_tickets.user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'support_messages'
      AND policyname = 'Admins manage support messages'
  ) THEN
    CREATE POLICY "Admins manage support messages"
    ON public.support_messages FOR ALL
    USING (public.has_role(auth.uid(), 'admin'::public.app_role))
    WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.touch_support_ticket_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.support_tickets
  SET last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.ticket_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS touch_support_ticket_activity_on_message ON public.support_messages;
CREATE TRIGGER touch_support_ticket_activity_on_message
AFTER INSERT ON public.support_messages
FOR EACH ROW EXECUTE FUNCTION public.touch_support_ticket_activity();

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
  END;
END
$$;
