CREATE TABLE public.lead_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  company_name TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  machine_interest TEXT,
  quantity TEXT,
  message TEXT,
  source TEXT NOT NULL DEFAULT 'website',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_lead_requests_created_at ON public.lead_requests(created_at DESC);

CREATE POLICY "Anyone can create lead requests"
ON public.lead_requests
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Admins can manage lead requests"
ON public.lead_requests
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));
