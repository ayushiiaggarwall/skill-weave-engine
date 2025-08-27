-- Update courses table to add total_weeks and remove content and week_number
ALTER TABLE public.courses 
ADD COLUMN total_weeks integer DEFAULT 5;

ALTER TABLE public.courses 
DROP COLUMN content,
DROP COLUMN week_number;