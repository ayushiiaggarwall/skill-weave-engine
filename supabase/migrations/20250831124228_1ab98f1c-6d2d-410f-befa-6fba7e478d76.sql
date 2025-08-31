-- Auto-cleanup related data when an auth user is deleted
-- Creates a trigger on auth.users to remove associated rows across public tables

-- 1) Cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_user_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Remove the user's profile
  DELETE FROM public.profiles WHERE id = OLD.id;

  -- Remove user-linked records
  DELETE FROM public.enrollments WHERE user_id = OLD.id;
  DELETE FROM public.order_enrollments WHERE user_id = OLD.id;
  DELETE FROM public.international_interest WHERE user_id = OLD.id;
  DELETE FROM public.submissions WHERE user_id = OLD.id;
  DELETE FROM public.user_certificates WHERE user_id = OLD.id;

  -- Add more tables here if new user-linked tables are introduced in future
  RETURN OLD;
END;
$$;

-- 2) Trigger on auth.users for deletions
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
AFTER DELETE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.cleanup_user_data();