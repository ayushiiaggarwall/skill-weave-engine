-- Create payment status enum
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- Create coupon type enum  
CREATE TYPE public.coupon_type AS ENUM ('percent', 'flat');

-- Create enrollments table for tracking orders
CREATE TABLE public.order_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  gateway TEXT NOT NULL CHECK (gateway IN ('razorpay', 'stripe')),
  order_id TEXT NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('INR', 'USD')),
  amount INTEGER NOT NULL,
  coupon_code TEXT,
  status payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create coupons table
CREATE TABLE public.coupons (
  code TEXT PRIMARY KEY,
  type coupon_type NOT NULL,
  value INTEGER NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.order_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- RLS policies for order_enrollments
CREATE POLICY "Users can view their own enrollments" 
ON public.order_enrollments 
FOR SELECT 
USING (auth.uid() = user_id OR auth.email() = user_email);

CREATE POLICY "Users can insert their own enrollments" 
ON public.order_enrollments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.email() = user_email);

CREATE POLICY "System can update enrollments" 
ON public.order_enrollments 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can manage all enrollments" 
ON public.order_enrollments 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for coupons
CREATE POLICY "Everyone can view active coupons" 
ON public.coupons 
FOR SELECT 
USING (active = true);

CREATE POLICY "Admins can manage coupons" 
ON public.coupons 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert sample coupons
INSERT INTO public.coupons (code, type, value, active) VALUES
('EARLY10', 'percent', 10, true),
('WELCOME500', 'flat', 50000, true), -- ₹500 in paise for INR
('WELCOME15', 'percent', 15, true),
('SAVE1000', 'flat', 100000, true); -- ₹1000 in paise for INR

-- Create trigger for updating updated_at
CREATE TRIGGER update_order_enrollments_updated_at
BEFORE UPDATE ON public.order_enrollments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();