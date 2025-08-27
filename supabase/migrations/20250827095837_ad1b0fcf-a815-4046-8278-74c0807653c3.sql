-- Add plans field to courses to list available plan types for a course
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS plans TEXT[] NOT NULL DEFAULT '{}';