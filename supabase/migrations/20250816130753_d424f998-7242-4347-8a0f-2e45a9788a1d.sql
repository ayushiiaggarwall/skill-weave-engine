-- Promote a specific user to admin by upserting into profiles
BEGIN;

-- Upsert profile for the target email and set role to 'admin'
WITH target_user AS (
  SELECT 
    id,
    email,
    COALESCE(
      raw_user_meta_data ->> 'name',
      raw_user_meta_data ->> 'full_name',
      split_part(email, '@', 1)
    ) AS name
  FROM auth.users
  WHERE email = 'ayushiaggarwaltech@gmail.com'
  LIMIT 1
)
INSERT INTO public.profiles (id, name, email, role)
SELECT id, name, email, 'admin'::app_role
FROM target_user
ON CONFLICT (id) DO UPDATE
SET role = EXCLUDED.role,
    updated_at = now();

COMMIT;