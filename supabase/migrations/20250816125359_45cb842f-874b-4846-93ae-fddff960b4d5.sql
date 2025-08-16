-- Create pricing settings table for admin to manage course pricing and early bird offers
CREATE TABLE public.pricing_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usd_early_bird integer NOT NULL DEFAULT 129,
  usd_regular integer NOT NULL DEFAULT 149,
  usd_mrp integer NOT NULL DEFAULT 199,
  inr_early_bird integer NOT NULL DEFAULT 5499,
  inr_regular integer NOT NULL DEFAULT 6499,
  inr_mrp integer NOT NULL DEFAULT 9999,
  early_bird_duration_hours integer NOT NULL DEFAULT 4,
  is_early_bird_active boolean NOT NULL DEFAULT true,
  early_bird_end_time timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pricing_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage pricing settings" 
ON public.pricing_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Everyone can view pricing settings" 
ON public.pricing_settings 
FOR SELECT 
USING (true);

-- Insert default pricing settings
INSERT INTO public.pricing_settings (
  usd_early_bird, usd_regular, usd_mrp,
  inr_early_bird, inr_regular, inr_mrp,
  early_bird_duration_hours, is_early_bird_active
) VALUES (
  129, 149, 199,
  5499, 6499, 9999,
  4, true
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pricing_settings_updated_at
BEFORE UPDATE ON public.pricing_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();