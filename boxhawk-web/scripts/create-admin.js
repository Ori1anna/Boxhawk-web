// Script to create the first Admin user
// Usage: Run in Supabase Dashboard SQL Editor

-- Method 1: If you already have a user, update the role directly
-- Replace 'your-email@example.com' with your email
UPDATE auth.users 
SET app_metadata = jsonb_set(
  COALESCE(app_metadata, '{}'::jsonb), 
  '{role}', 
  '"admin"'
)
WHERE email = 'your-email@example.com';

-- Method 2: Create a new Admin user (requires Supabase Admin API)
-- This needs to be created manually in Supabase Dashboard > Authentication > Users
-- Then add the following to App metadata in user details page:
-- {
--   "role": "admin"
-- }

-- Verify user role
SELECT 
  email,
  app_metadata->>'role' as role,
  created_at
FROM auth.users 
WHERE app_metadata->>'role' = 'admin';


