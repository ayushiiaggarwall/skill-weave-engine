-- Update the handle_new_user function to set the first user as admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
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
  
  -- Auto-enroll in active cohort if exists
  INSERT INTO public.enrollments (user_id, cohort_id)
  SELECT NEW.id, id
  FROM public.cohorts
  WHERE is_active = true
  LIMIT 1;
  
  RETURN NEW;
END;
$function$;