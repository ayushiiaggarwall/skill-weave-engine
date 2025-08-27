-- Create table for weekly course metadata per course
CREATE TABLE IF NOT EXISTS public.course_weeks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  week_number integer NOT NULL,
  title text NOT NULL,
  objective text NOT NULL,
  content text NOT NULL,
  mini_project text,
  deliverables text[],
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.course_weeks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view visible course weeks"
ON public.course_weeks
FOR SELECT
USING (visible = true);

CREATE POLICY "Admins can manage course weeks"
ON public.course_weeks
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Indexes and constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_course_weeks_course_week_unique
  ON public.course_weeks (course_id, week_number);
CREATE INDEX IF NOT EXISTS idx_course_weeks_course
  ON public.course_weeks (course_id);

-- Trigger to maintain updated_at
CREATE TRIGGER update_course_weeks_updated_at
BEFORE UPDATE ON public.course_weeks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();