-- Add course_id to order_enrollments table to link with courses
ALTER TABLE public.order_enrollments 
ADD COLUMN course_id uuid REFERENCES public.courses(id);

-- Update existing records to have a default course_id if needed
-- For now, we'll leave them as NULL since we don't know which course they bought