-- Create international_interest table to track user interest for international payments
CREATE TABLE public.international_interest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  course_id UUID,
  course_type TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.international_interest ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert their own interest" 
ON public.international_interest 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.email() = email);

CREATE POLICY "Users can view their own interest" 
ON public.international_interest 
FOR SELECT 
USING (auth.uid() = user_id OR auth.email() = email);

CREATE POLICY "Admins can view all interests" 
ON public.international_interest 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all interests" 
ON public.international_interest 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));