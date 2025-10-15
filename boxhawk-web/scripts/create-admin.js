// 创建第一个 Admin 用户的脚本
// 使用方法：在 Supabase Dashboard 的 SQL Editor 中运行

-- 方法1：如果你已经有用户，直接更新角色
-- 将 'your-email@example.com' 替换为你的邮箱
UPDATE auth.users 
SET app_metadata = jsonb_set(
  COALESCE(app_metadata, '{}'::jsonb), 
  '{role}', 
  '"admin"'
)
WHERE email = 'your-email@example.com';

-- 方法2：创建新的 Admin 用户（需要 Supabase Admin API）
-- 这个需要在 Supabase Dashboard 的 Authentication > Users 中手动创建
-- 然后在用户详情页面的 App metadata 中添加：
-- {
--   "role": "admin"
-- }

-- 验证用户角色
SELECT 
  email,
  app_metadata->>'role' as role,
  created_at
FROM auth.users 
WHERE app_metadata->>'role' = 'admin';


