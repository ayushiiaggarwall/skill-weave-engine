-- Update the handle_new_user function to include referral source
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if this is the first user
  IF NOT EXISTS (SELECT 1 FROM public.profiles LIMIT 1) THEN
    -- First user gets admin role
    INSERT INTO public.profiles (id, name, email, role, referral_source)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
      NEW.email,
      'admin'::app_role,
      NEW.raw_user_meta_data ->> 'referral_source'
    );
  ELSE
    -- Subsequent users get student role (default)
    INSERT INTO public.profiles (id, name, email, referral_source)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
      NEW.email,
      NEW.raw_user_meta_data ->> 'referral_source'
    );
  END IF;

  RETURN NEW;
END;
$function$