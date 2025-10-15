// 创建 Admin 用户的测试脚本
// 在项目根目录运行：node scripts/create-admin-user.js

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// 手动读取 .env.local 文件
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) {
    envVars[key.trim()] = value.trim()
  }
})

// 设置环境变量
process.env.NEXT_PUBLIC_SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL
process.env.SUPABASE_SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { 
    auth: { 
      autoRefreshToken: false, 
      persistSession: false 
    } 
  }
)

async function createAdminUser() {
  const email = 'admin@example.com' // 修改为你的邮箱
  const password = 'AdminPassword123!' // 修改为你的密码
  
  try {
    console.log('Creating admin user...')
    
    // 创建用户
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    
    if (createError) {
      console.error('Error creating user:', createError)
      return
    }
    
    console.log('User created:', createData.user.email)
    
    // 设置角色
    const { error: roleError } = await supabaseAdmin.auth.admin.updateUserById(createData.user.id, {
      app_metadata: { role: 'admin' }
    })
    
    if (roleError) {
      console.error('Error setting role:', roleError)
      return
    }
    
    console.log('✅ Admin user created successfully!')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('Role: admin')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

createAdminUser()
