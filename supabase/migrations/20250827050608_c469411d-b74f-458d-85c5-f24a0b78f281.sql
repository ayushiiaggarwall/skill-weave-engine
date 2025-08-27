-- Add early bird settings to course_pricing table
ALTER TABLE public.course_pricing 
ADD COLUMN early_bird_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_early_bird_active BOOLEAN DEFAULT false;