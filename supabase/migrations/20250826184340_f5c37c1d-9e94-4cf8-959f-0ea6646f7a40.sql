-- First drop foreign key constraints that depend on cohorts table
ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS enrollments_cohort_id_fkey;
ALTER TABLE public.announcements DROP CONSTRAINT IF EXISTS announcements_cohort_id_fkey;

-- 1) Create per-course pricing table
CREATE TABLE IF NOT EXISTS public.course_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  inr_mrp integer NOT NULL,
  inr_regular integer NOT NULL,
  inr_early_bird integer NOT NULL,
  usd_mrp integer NOT NULL,
  usd_regular integer NOT NULL,
  usd_early_bird integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT course_pricing_course_unique UNIQUE (course_id)
);

-- Enable RLS and policies for course_pricing
ALTER TABLE public.course_pricing ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'course_pricing' AND policyname = 'Admins can manage course pricing'
  ) THEN
    CREATE POLICY "Admins can manage course pricing"
    ON public.course_pricing
    FOR ALL
    USING (has_role(auth.uid(), 'admin'::app_role))
    WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'course_pricing' AND policyname = 'Everyone can view course pricing'
  ) THEN
    CREATE POLICY "Everyone can view course pricing"
    ON public.course_pricing
    FOR SELECT
    USING (true);
  END IF;
END $$;

-- Trigger to auto-update updated_at on course_pricing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_course_pricing_updated_at'
  ) THEN
    CREATE TRIGGER update_course_pricing_updated_at
    BEFORE UPDATE ON public.course_pricing
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 2) Extend courses with start/end dates and is_active flag
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS end_date date,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT false;

-- 3) Prepare enrollments to reference courses instead of cohorts
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS course_id uuid;

-- 4) Announcements: add course_id column to support course-based announcements
ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS course_id uuid;

-- 5) Update RLS policies that referenced cohorts to now reference courses via enrollments.course_id
-- course_content SELECT policy
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='course_content' AND policyname='Enrolled users can view course content'
  ) THEN
    DROP POLICY "Enrolled users can view course content" ON public.course_content;
  END IF;

  CREATE POLICY "Enrolled users can view course content"
  ON public.course_content
  FOR SELECT
  USING (
    is_visible = true
    AND EXISTS (
      SELECT 1
      FROM public.enrollments e
      JOIN public.courses cr ON cr.id = e.course_id
      WHERE e.user_id = auth.uid()
        AND e.payment_status = 'paid'::payment_status
        AND cr.is_active = true
        AND e.course_id = course_content.course_id
    )
  );
END $$;

-- certificates SELECT policy
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='certificates' AND policyname='Enrolled users can view unlocked certificates'
  ) THEN
    DROP POLICY "Enrolled users can view unlocked certificates" ON public.certificates;
  END IF;

  CREATE POLICY "Enrolled users can view unlocked certificates"
  ON public.certificates
  FOR SELECT
  USING (
    NOT is_locked
    AND EXISTS (
      SELECT 1
      FROM public.enrollments e
      JOIN public.courses cr ON cr.id = e.course_id
      WHERE e.user_id = auth.uid()
        AND e.payment_status = 'paid'::payment_status
        AND cr.is_active = true
        AND certificates.course_id = e.course_id
    )
  );
END $$;

-- announcements SELECT policy switch from cohort-based to course-based
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='announcements' AND policyname = 'Students can view announcements for their cohort'
  ) THEN
    DROP POLICY "Students can view announcements for their cohort" ON public.announcements;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='announcements' AND policyname = 'Students can view announcements for their courses'
  ) THEN
    CREATE POLICY "Students can view announcements for their courses"
    ON public.announcements
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.enrollments e
        WHERE e.user_id = auth.uid()
          AND e.course_id = announcements.course_id
      )
    );
  END IF;
END $$;

-- 6) Update new user trigger to remove auto-enroll into cohorts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if this is the first user
  IF NOT EXISTS (SELECT 1 FROM public.profiles LIMIT 1) THEN
    -- First user gets admin role
    INSERT INTO public.profiles (id, name, email, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
      NEW.email,
      'admin'::app_role
    );
  ELSE
    -- Subsequent users get student role (default)
    INSERT INTO public.profiles (id, name, email)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
      NEW.email
    );
  END IF;

  -- Removed auto-enroll into cohorts. Enrollment will be handled explicitly per course.
  RETURN NEW;
END;
$$;

-- 7) Drop legacy tables
-- Drop pricing_settings as requested
DROP TABLE IF EXISTS public.pricing_settings;

-- Drop cohorts table as requested
DROP TABLE IF EXISTS public.cohorts;