-- grant_admin_role.sql
-- Usage: replace <USER_UUID> with the UUID of an existing auth.users record
-- Run this in the Supabase SQL editor (server role) after you have created the auth user via the Supabase UI or via the app.

BEGIN;
-- Grant 'admin' role to the user (app_role must exist)
INSERT INTO public.user_roles (id, user_id, role, created_at)
VALUES (gen_random_uuid(), '<USER_UUID>'::uuid, 'admin'::app_role, now())
ON CONFLICT (user_id, role) DO NOTHING;

-- If you have an existing restaurant to link, uncomment and set the restaurant id
-- INSERT INTO public.restaurant_admins (id, restaurant_id, user_id, created_at)
-- VALUES (gen_random_uuid(), '<RESTAURANT_UUID>'::uuid, '<USER_UUID>'::uuid, now())
-- ON CONFLICT (restaurant_id, user_id) DO NOTHING;

COMMIT;

-- Quick verification (run after commit):
-- SELECT * FROM public.user_roles WHERE user_id = '<USER_UUID>'::uuid;
-- SELECT * FROM public.restaurant_admins WHERE user_id = '<USER_UUID>'::uuid;
