-- Create certificates table
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_locked BOOLEAN NOT NULL DEFAULT true,
  certificate_url TEXT,
  credential_id_prefix TEXT NOT NULL DEFAULT 'CERT',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Create policies for certificates
CREATE POLICY "Admins can manage certificates" 
ON public.certificates 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Enrolled users can view unlocked certificates" 
ON public.certificates 
FOR SELECT 
USING (
  NOT is_locked AND 
  EXISTS (
    SELECT 1 
    FROM enrollments e
    JOIN cohorts c ON e.cohort_id = c.id
    WHERE e.user_id = auth.uid() 
    AND e.payment_status = 'paid'::payment_status
    AND c.is_active = true
  )
);

-- Create user_certificates table to track earned certificates
CREATE TABLE public.user_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  certificate_id UUID NOT NULL REFERENCES public.certificates(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, certificate_id)
);

-- Enable RLS on user_certificates
ALTER TABLE public.user_certificates ENABLE ROW LEVEL SECURITY;

-- Create policies for user_certificates
CREATE POLICY "Admins can manage user certificates" 
ON public.user_certificates 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own certificates" 
ON public.user_certificates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert user certificates" 
ON public.user_certificates 
FOR INSERT 
WITH CHECK (true);

-- Add trigger for updated_at on certificates
CREATE TRIGGER update_certificates_updated_at
BEFORE UPDATE ON public.certificates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for certificates tables
ALTER TABLE public.certificates REPLICA IDENTITY FULL;
ALTER TABLE public.user_certificates REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.certificates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_certificates;