# Supabase admin setup and verification

This file explains how to create an admin user in your Supabase project and verify they can view restaurants.

Two approaches are provided:

- A) Recommended — Create an Auth user (via Supabase Auth UI or sign-up), then grant the admin role with SQL.
- B) Development shortcut — Insert a synthetic admin user and profile directly (useful for local testing only).

---

## A) Recommended: create an Auth user and grant admin

1. Create the user

- Use the Supabase Auth > Users UI and create a new user with an email and password (or sign up via the app).

2. Find the user's UUID

- In the Supabase SQL editor, run:

  SELECT id, email FROM auth.users WHERE email = 'admin@example.com';

- Note the returned id (UUID).

3. Grant admin role and (optionally) link a restaurant

- Run the following SQL, replacing '<USER_UUID>' with the user's id and optionally provide a restaurant_id to link:

  BEGIN;
  -- Grant admin app role
  INSERT INTO public.user_roles (user_id, role)
  VALUES ('<USER_UUID>'::uuid, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Optional: link as a restaurant admin for an existing restaurant
  -- INSERT INTO public.restaurant_admins (restaurant_id, user_id)
  -- VALUES ('<RESTAURANT_UUID>'::uuid, '<USER_UUID>'::uuid)
  -- ON CONFLICT (restaurant_id, user_id) DO NOTHING;
  COMMIT;

4. Verify the admin can see restaurants

- From the Admin app (or using the Supabase SQL editor as that user), the admin should be able to query `public.restaurants`. To check via the SQL editor (server role) run:

  SELECT * FROM public.restaurants LIMIT 50;

---

## B) Development shortcut: insert a test admin (not recommended for production)

1. Create a synthetic auth user id (a UUID) and insert profile and roles directly. Note: this will not create a matching auth.users session — useful only for testing DB behavior via SQL.

  BEGIN;
  -- Replace these placeholder values
  -- Remember: do NOT use this in production; prefer creating real auth user via Supabase Auth UI
  INSERT INTO public.profiles (id, user_id, full_name)
  VALUES (gen_random_uuid(), '<USER_UUID>'::uuid, 'Admin User');

  INSERT INTO public.user_roles (id, user_id, role)
  VALUES (gen_random_uuid(), '<USER_UUID>'::uuid, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  COMMIT;

2. Verify restaurants listing (server-side):

  SELECT * FROM public.restaurants LIMIT 50;

---

## Notes and troubleshooting

- Make sure the migration SQL (enum types, user_roles, has_role function and RLS policies) is applied in the same Supabase project as your client `VITE_SUPABASE_URL`.
- If a real user signs up via the app with `is_restaurant = true`, the trigger `on_auth_user_created` will automatically create a restaurant and assign the `hotel_admin` role.
- If admin can't view restaurants from the client app: verify the JWT issuer and project URL in your frontend `.env` and the `auth` session stored in the browser corresponds to the Supabase project you're inspecting.
