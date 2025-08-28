-- Create idempotency table for webhook events
CREATE TABLE IF NOT EXISTS public.payment_events (
  event_id text PRIMARY KEY,
  received_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS and add safe policies
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'payment_events' AND policyname = 'Admins can view payment events'
  ) THEN
    CREATE POLICY "Admins can view payment events"
      ON public.payment_events
      FOR SELECT
      USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'payment_events' AND policyname = 'System can insert payment events'
  ) THEN
    CREATE POLICY "System can insert payment events"
      ON public.payment_events
      FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- Add helpful columns to order_enrollments if missing
ALTER TABLE public.order_enrollments
  ADD COLUMN IF NOT EXISTS payment_id text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- Add index for quick lookup by Razorpay order_id
CREATE INDEX IF NOT EXISTS idx_order_enrollments_order_id
  ON public.order_enrollments(order_id);
