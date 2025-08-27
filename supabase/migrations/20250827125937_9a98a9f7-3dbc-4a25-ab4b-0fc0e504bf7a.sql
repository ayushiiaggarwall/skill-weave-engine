-- Security Fix 1: CRITICAL - Fix Public Coupon Code Exposure
-- Remove public access to coupons table, only allow authenticated users during payment validation
DROP POLICY IF EXISTS "Everyone can view active coupons" ON public.coupons;

-- Create new policy that only allows admins to view coupons
-- Coupon validation will be handled server-side in edge functions
CREATE POLICY "Only admins can view coupons" 
ON public.coupons 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Security Fix 2: MEDIUM - Secure Profile Role Field
-- Create a function for secure profile updates that excludes role field
CREATE OR REPLACE FUNCTION public.update_profile_secure(
  p_name text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_date_of_birth date DEFAULT NULL,
  p_about text DEFAULT NULL,
  p_profile_picture_url text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    name = COALESCE(p_name, name),
    email = COALESCE(p_email, email),
    date_of_birth = COALESCE(p_date_of_birth, date_of_birth),
    about = COALESCE(p_about, about),
    profile_picture_url = COALESCE(p_profile_picture_url, profile_picture_url),
    updated_at = now()
  WHERE id = auth.uid();
END;
$$;

-- Create admin-only function for role updates
CREATE OR REPLACE FUNCTION public.update_user_role(
  p_user_id uuid,
  p_role app_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins to update roles
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: Only admins can update user roles';
  END IF;
  
  UPDATE public.profiles 
  SET 
    role = p_role,
    updated_at = now()
  WHERE id = p_user_id;
END;
$$;

-- Update profiles RLS policy to prevent direct role updates
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new policy that excludes role field from direct updates
CREATE POLICY "Users can update their own profile (excluding role)" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  -- Ensure role field is not being changed directly
  role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);

-- Security Fix 3: LOW - Fix Database Functions Security
-- Update existing functions to include proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND role = _role
  )
$$;