# Fresh Installation Test Guide

This guide helps you test the project as if you were a new team member setting it up for the first time.

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed (check with `node --version`)
- npm or yarn package manager
- Git (if cloning from repository)
- A Supabase project with credentials

## Step 1: Create a New Directory

### Option A: Clone from Git Repository (Recommended)

If your code is in a Git repository:

```bash
# Navigate to a different location (e.g., Desktop or Documents)
cd ~/Desktop  # or cd ~/Documents on Mac/Linux
# On Windows: cd C:\Users\YourName\Desktop

# Clone the repository
git clone <your-repository-url> boxhawk-test
cd boxhawk-test/boxhawk-web
```

### Option B: Copy the Project Folder

If you haven't pushed to Git yet:

```bash
# Navigate to a different location
cd ~/Desktop  # or your preferred location

# Copy the entire boxhawk-web folder
# On Mac/Linux:
cp -r "/path/to/Boxhawk-code/boxhawk-web" ./boxhawk-test

# On Windows (PowerShell):
Copy-Item -Path "D:\Play\Internship-Medical Pantry\Boxhawk-code\boxhawk-web" -Destination ".\boxhawk-test" -Recurse

# Navigate into the copied folder
cd boxhawk-test
```

## Step 2: Install Dependencies

```bash
# Install all npm packages
npm install
```

This will install all dependencies listed in `package.json`. It may take a few minutes.

**Expected output**: You should see a list of installed packages and no errors.

## Step 3: Set Up Environment Variables

Create a `.env.local` file in the root of `boxhawk-web`:

```bash
# Create the file
touch .env.local  # Mac/Linux
# or
New-Item .env.local  # Windows PowerShell
```

Add the following content to `.env.local`:

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Configuration (Optional - for invitations)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@boxhawk.com
```

**Important**: 
- Replace the placeholder values with your actual Supabase credentials
- Never commit `.env.local` to version control
- Get credentials from: Supabase Dashboard → Settings → API

## Step 4: Verify Database Setup

Ensure your Supabase database has the required tables and policies:

1. **Run SQL migrations** (if not already done):
   - Open Supabase Dashboard → SQL Editor
   - Run `database/create_photo_submission_images.sql`
   - Run `database/create_invitations_table.sql` (if using invitations)
   - Run `sql/rls-policies.sql`

2. **Verify storage bucket**:
   - Go to Storage in Supabase Dashboard
   - Ensure `mp-images` bucket exists
   - Make it public (Settings → Public bucket)

## Step 5: Run the Development Server

```bash
npm run dev
```

**Expected output**:
```
  ▲ Next.js 15.5.4
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in X seconds
```

## Step 6: Test the Application

1. **Open browser**: Navigate to `http://localhost:3000`

2. **Test landing page**: Should see the landing page

3. **Test login/signup**: 
   - Go to `/login`
   - Try signing up as a new user (should default to `photouser` role)

4. **Test admin access**:
   - Create an admin user using the script or Supabase Dashboard
   - Log in as admin
   - Access `/admin/users`

## Common Issues and Solutions

### Issue 1: `npm install` fails

**Error**: `npm ERR! code ERESOLVE`

**Solution**:
```bash
npm install --legacy-peer-deps
```

### Issue 2: Environment variables not loading

**Error**: `NEXT_PUBLIC_SUPABASE_URL is undefined`

**Solution**:
- Ensure `.env.local` is in the root of `boxhawk-web` folder
- Restart the dev server after creating/modifying `.env.local`
- Check for typos in variable names

### Issue 3: Database connection errors

**Error**: `Failed to fetch` or RLS policy errors

**Solution**:
- Verify Supabase URL and keys are correct
- Check RLS policies are set up (run `sql/rls-policies.sql`)
- Ensure storage bucket `mp-images` exists and is public

### Issue 4: Port 3000 already in use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Use a different port
npm run dev -- -p 3001
```

### Issue 5: Build errors

**Error**: Syntax errors or missing imports

**Solution**:
```bash
# Run linter to find issues
npm run lint

# Clear Next.js cache
rm -rf .next  # Mac/Linux
rmdir /s .next  # Windows
npm run dev
```

## Step 7: Create First Admin User

After successful setup, create your first admin user:

### Method 1: Using Script

```bash
# Edit scripts/create-admin-user.js
# Update email and password
node scripts/create-admin-user.js
```

### Method 2: Via Supabase Dashboard

1. Go to Authentication → Users
2. Create new user or find existing user
3. Edit `app_metadata`:
   ```json
   {
     "role": "admin"
   }
   ```

## Step 8: Verify All Features

Test the following to ensure everything works:

- [ ] Landing page loads
- [ ] User can sign up
- [ ] User can log in
- [ ] Photouser can access `/photo/upload`
- [ ] Photouser can upload photos
- [ ] Admin can access `/admin/users`
- [ ] Admin can create users
- [ ] Expert can access `/items`
- [ ] Expert can review items

## Step 9: Clean Up

After testing, you can remove the test folder:

```bash
# Navigate back to parent directory
cd ..

# Remove test folder
rm -rf boxhawk-test  # Mac/Linux
rmdir /s boxhawk-test  # Windows
```

## Success Criteria

The installation is successful if:
1. ✅ `npm install` completes without errors
2. ✅ `.env.local` is properly configured
3. ✅ `npm run dev` starts without errors
4. ✅ Application loads in browser
5. ✅ Can sign up and log in
6. ✅ Can access role-specific pages

## Notes for Handover

If you encounter any issues during this test:
1. Document the error message
2. Note which step failed
3. Check if it's mentioned in `PROJECT_HANDOVER.md`
4. Update the documentation if needed

This test ensures that the handover documentation is complete and accurate.

