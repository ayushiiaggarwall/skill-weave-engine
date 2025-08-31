-- 0) Strengthen cleanup trigger to also remove email-linked rows
CREATE OR REPLACE FUNCTION public.cleanup_user_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Delete dependent rows that reference this user (by id or email where applicable)
  DELETE FROM public.user_certificates WHERE user_id = OLD.id;
  DELETE FROM public.submissions WHERE user_id = OLD.id;
  DELETE FROM public.enrollments WHERE user_id = OLD.id;
  DELETE FROM public.order_enrollments WHERE user_id = OLD.id OR user_email = OLD.email;
  DELETE FROM public.international_interest WHERE user_id = OLD.id OR email = OLD.email;

  -- Finally remove the profile
  DELETE FROM public.profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

-- 1) One-time orphan cleanup to fix existing data inconsistencies
-- Remove records whose user_id doesn't exist in profiles, or email has no profile
DELETE FROM public.order_enrollments oe
WHERE (oe.user_id IS NOT NULL AND NOT EXISTS (
         SELECT 1 FROM public.profiles p WHERE p.id = oe.user_id
      ))
   OR (oe.user_id IS NULL AND oe.user_email IS NOT NULL AND NOT EXISTS (
         SELECT 1 FROM public.profiles p WHERE p.email = oe.user_email
      ));

DELETE FROM public.international_interest ii
WHERE (ii.user_id IS NOT NULL AND NOT EXISTS (
         SELECT 1 FROM public.profiles p WHERE p.id = ii.user_id
      ))
   OR (ii.user_id IS NULL AND ii.email IS NOT NULL AND NOT EXISTS (
         SELECT 1 FROM public.profiles p WHERE p.email = ii.email
      ));

DELETE FROM public.enrollments e
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = e.user_id
);

DELETE FROM public.submissions s
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = s.user_id
);

DELETE FROM public.user_certificates uc
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = uc.user_id
);

-- 2) Add cascading foreign keys so deleting a profile removes related rows automatically
-- Note: FKs allow NULL values, so existing rows with NULL user_id are fine
ALTER TABLE public.enrollments
  ADD CONSTRAINT fk_enrollments_user
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.submissions
  ADD CONSTRAINT fk_submissions_user
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.user_certificates
  ADD CONSTRAINT fk_user_certificates_user
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.international_interest
  ADD CONSTRAINT fk_international_interest_user
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.order_enrollments
  ADD CONSTRAINT fk_order_enrollments_user
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;