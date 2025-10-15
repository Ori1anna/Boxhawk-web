# 用户角色管理指南

## 🔧 如何创建和管理用户角色

### **方法一：通过 Supabase Dashboard（推荐）**

#### 1. 创建第一个 Admin 用户

1. **登录 Supabase Dashboard**
   - 访问 [supabase.com](https://supabase.com)
   - 选择你的项目

2. **进入 Authentication**
   - 左侧菜单：Authentication > Users
   - 点击 "Add user" 按钮

3. **创建用户**
   - Email: 输入你的邮箱
   - Password: 设置密码
   - 点击 "Create user"

4. **设置角色**
   - 找到刚创建的用户
   - 点击用户进入详情页
   - 在 "App metadata" 部分添加：
   ```json
   {
     "role": "admin"
   }
   ```

#### 2. 验证角色设置

1. **检查用户角色**
   - 在用户详情页确认 App metadata 中有 `"role": "admin"`
   - 或者运行 SQL 查询：
   ```sql
   SELECT email, app_metadata->>'role' as role 
   FROM auth.users 
   WHERE email = 'your-email@example.com';
   ```

2. **测试登录**
   - 使用设置的邮箱和密码登录应用
   - 确认能看到 Admin 功能

### **方法二：通过应用内管理（需要 Admin 权限）**

#### 1. 使用 Admin Users 页面

1. **登录为 Admin**
   - 使用已设置的 Admin 账户登录
   - 访问 `/admin/users` 页面

2. **添加新用户**
   - 点击 "Add User" 按钮
   - 填写用户信息：
     - Email: 用户邮箱
     - Password: 用户密码
     - Role: 选择角色（Photo User, Expert, Admin, Super Admin）

3. **管理现有用户**
   - 在用户列表中更改用户角色
   - 删除不需要的用户

### **方法三：通过 SQL 直接修改**

#### 1. 在 Supabase SQL Editor 中运行

```sql
-- 更新现有用户角色
UPDATE auth.users 
SET app_metadata = jsonb_set(
  COALESCE(app_metadata, '{}'::jsonb), 
  '{role}', 
  '"admin"'
)
WHERE email = 'your-email@example.com';

-- 查看所有用户角色
SELECT 
  email,
  app_metadata->>'role' as role,
  created_at
FROM auth.users 
ORDER BY created_at DESC;
```

## 📋 角色权限说明

### **角色层次结构**
1. **PhotoUser** (最低权限)
   - 可以上传照片和基本信息
   - 访问：首页、上传页面、成功页面

2. **Expert** (中等权限)
   - 可以审核和处理上传的项目
   - 访问：首页、Items 列表、Item 详情、Review 页面

3. **Admin** (高权限)
   - 可以管理用户账户
   - 访问：所有 Expert 功能 + 用户管理

4. **SuperAdmin** (最高权限)
   - 可以创建其他 SuperAdmin
   - 访问：所有功能

### **页面访问权限**

| 页面 | PhotoUser | Expert | Admin | SuperAdmin |
|------|-----------|--------|-------|------------|
| `/` | ✅ | ✅ | ✅ | ✅ |
| `/success` | ✅ | ✅ | ✅ | ✅ |
| `/photo/upload` | ✅ | ❌ | ❌ | ❌ |
| `/items` | ❌ | ✅ | ✅ | ✅ |
| `/items/[id]` | ❌ | ✅ | ✅ | ✅ |
| `/items/[id]/review` | ❌ | ✅ | ✅ | ✅ |
| `/admin/users` | ❌ | ❌ | ✅ | ✅ |

## 🚀 快速开始步骤

### **第一次设置**

1. **创建第一个 Admin**
   ```sql
   -- 在 Supabase SQL Editor 中运行
   UPDATE auth.users 
   SET app_metadata = jsonb_set(
     COALESCE(app_metadata, '{}'::jsonb), 
     '{role}', 
     '"admin"'
   )
   WHERE email = 'your-email@example.com';
   ```

2. **登录测试**
   - 使用设置的邮箱和密码登录
   - 确认能看到 "Manage Users" 卡片

3. **创建其他用户**
   - 访问 `/admin/users` 页面
   - 使用 "Add User" 功能创建不同角色的用户

### **测试不同角色**

1. **PhotoUser 测试**
   - 创建 PhotoUser 账户
   - 登录后应该只能看到上传功能

2. **Expert 测试**
   - 创建 Expert 账户
   - 登录后应该能看到 Items 管理功能

3. **Admin 测试**
   - 创建 Admin 账户
   - 登录后应该能看到用户管理功能

## ⚠️ 注意事项

1. **安全考虑**
   - 不要在生产环境中使用默认密码
   - 定期审查用户权限
   - 及时删除不需要的用户

2. **角色变更**
   - 用户角色变更后需要重新登录才能生效
   - 建议在角色变更后清除浏览器缓存

3. **权限验证**
   - 所有权限检查都在客户端和服务端进行
   - 确保 Supabase RLS 策略正确配置

## 🔍 故障排除

### **常见问题**

1. **用户无法访问页面**
   - 检查用户角色是否正确设置
   - 确认 `app_metadata.role` 字段存在

2. **角色变更不生效**
   - 用户需要重新登录
   - 清除浏览器缓存和 cookies

3. **Admin 功能不可见**
   - 确认用户角色为 `admin` 或 `superadmin`
   - 检查 Supabase 权限设置

### **调试方法**

1. **检查用户角色**
   ```javascript
   // 在浏览器控制台中运行
   const { data: { session } } = await supabase.auth.getSession()
   console.log('User role:', session?.user?.app_metadata?.role)
   ```

2. **查看所有用户**
   ```sql
   SELECT email, app_metadata->>'role' as role, created_at
   FROM auth.users 
   ORDER BY created_at DESC;
   ```


