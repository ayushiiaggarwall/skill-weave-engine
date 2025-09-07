-- Create table to store referral click events
CREATE TABLE IF NOT EXISTS public.referral_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referral_clicks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can insert referral clicks"
ON public.referral_clicks
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Admins can view referral clicks"
ON public.referral_clicks
FOR SELECT
TO public
USING (has_role(auth.uid(), 'admin'::app_role));

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_referral_clicks_source ON public.referral_clicks (source);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_created_at ON public.referral_clicks (created_at);

-- Aggregate RPC for counts by source
CREATE OR REPLACE FUNCTION public.get_referral_click_counts()
RETURNS TABLE (source TEXT, clicks BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT source, count(*)::bigint AS clicks
  FROM public.referral_clicks
  GROUP BY source
  ORDER BY clicks DESC;
$$;