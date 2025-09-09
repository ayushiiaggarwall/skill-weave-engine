-- Add induction_date column to courses table
ALTER TABLE public.courses 
ADD COLUMN induction_date date;