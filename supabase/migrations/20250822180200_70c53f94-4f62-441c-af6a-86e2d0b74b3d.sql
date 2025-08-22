-- Create course content table for admin-uploaded materials
CREATE TABLE public.course_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL,
  week_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'document', 'link', 'assignment')),
  content_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Enable RLS
ALTER TABLE public.course_content ENABLE ROW LEVEL SECURITY;

-- Admins can manage all content
CREATE POLICY "Admins can manage course content" 
ON public.course_content 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Enrolled users can view visible content for their courses
CREATE POLICY "Enrolled users can view course content" 
ON public.course_content 
FOR SELECT 
USING (
  is_visible = true AND 
  EXISTS (
    SELECT 1 FROM enrollments e
    JOIN cohorts c ON e.cohort_id = c.id
    WHERE e.user_id = auth.uid() 
    AND e.payment_status IN ('completed', 'paid')
    AND c.is_active = true
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_course_content_updated_at
BEFORE UPDATE ON public.course_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for course_content
ALTER TABLE public.course_content REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.course_content;