-- verify_admin_and_restaurants.sql
-- Replace the email below with the admin email you want to check
\n-- 1) Check for an auth.user with this email
SELECT id, email, raw_user_meta_data, created_at
FROM auth.users
WHERE email = 'admin1@gmail.com';

-- 2) If the above returns a UUID replace <USER_UUID> below and run these checks
-- Check roles assigned to the user
SELECT * FROM public.user_roles WHERE user_id = '<USER_UUID>'::uuid;

-- Check if user is linked as a restaurant_admin
SELECT * FROM public.restaurant_admins WHERE user_id = '<USER_UUID>'::uuid;

-- List restaurants (server-side)
SELECT id, name, created_by, created_at FROM public.restaurants ORDER BY created_at DESC LIMIT 50;

-- 3) Quick creation steps if user is missing (optional):
-- Create a supabase auth user via the UI or use the following (server-side only) to insert a synthetic user:
-- DO NOT use in production. Instead create real auth user via Supabase Auth UI.
-- INSERT INTO auth.users (id, email, raw_user_meta_data, created_at)
-- VALUES (gen_random_uuid(), 'admin1@gmail.com', jsonb_build_object('full_name', 'Admin One'), now());

-- After creating an auth.user, run the following to grant admin role:
-- INSERT INTO public.user_roles (id, user_id, role, created_at)
-- VALUES (gen_random_uuid(), '<USER_UUID>'::uuid, 'admin'::app_role, now())
-- ON CONFLICT (user_id, role) DO NOTHING;
