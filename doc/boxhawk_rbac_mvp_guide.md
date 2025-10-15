
# Boxhawk Web MVP — Role‑Based Access Control (RBAC) Implementation Guide

> **Stack**: Next.js (App Router) + Supabase (Auth, Postgres, Storage)  
> **Roles**: `photouser`, `expert`, `admin`, `superadmin`  
> **Scope**: A complete, copy‑pasteable plan to **create users**, **assign roles**, and **enforce permissions** across **database tables** and **Storage buckets**. Includes minimal server endpoints, SQL policies, and frontend usage.

---

## 0) Why this design

- **Auth is fully managed** by Supabase; we do **not** store passwords or build login flows manually. The prebuilt **Auth UI** component already handles email/password + (later) social providers. 
- **Roles live in JWT `app_metadata`**, written **server‑side** via Supabase **Auth Admin API**; RLS policies read the claim with `auth.jwt()` to gate access. This pattern is officially documented for RBAC with custom claims. 
- **Storage permissions** are enforced with RLS policies on `storage.objects` (e.g., allow INSERT to upload). Supabase documents the minimum policies required. 
- Optionally, use **Signed Upload URLs** to avoid broad client write policies for Storage. citeturn0search4

---

## 1) Roles & Responsibilities

| Role         | Can upload photos | Can review/edit items | Can manage users | Notes |
|--------------|-------------------|------------------------|------------------|-------|
| `photouser`  | ✅ own uploads     | ❌                    | ❌               | Volunteers who submit photos (min 4, max 10) |
| `expert`     | ✅                 | ✅ all review queues  | ❌               | Extract info & finalize form |
| `admin`      | ✅                 | ✅                    | ✅ invite/assign | Operational admins |
| `superadmin` | ✅                 | ✅                    | ✅ all + system  | Technical owner |

> We store this as a **string** in `app_metadata.role`. JWTs carry this claim to the DB/Storage layer. 

---

## 2) Account creation flows

### A) Self‑sign up (Photouser)
- Use the existing `/login` page with the Supabase **Auth UI** component. Users sign up with email/password (and later Google/Apple). 
- Newly created users default to `photouser` (front‑end treats missing role as `photouser`; admins may promote later).

### B) Admin‑created / Invited (Expert/Admin/SuperAdmin)
Use **Auth Admin API** from **server code** (requires `service_role` key; *never* expose client‑side):  
- `auth.admin.createUser()` → create an account (no invite email by default).  
- `auth.admin.inviteUserByEmail()` → send invite email; user sets their own password.  
- `auth.admin.updateUserById()` → set `app_metadata.role`.  
These endpoints are documented by Supabase and must be called on the **server**. 

---

## 3) Server: minimal admin endpoints (Next.js App Router)

> **Environment** (`.env.local`):  
> `NEXT_PUBLIC_SUPABASE_URL=...`  
> `SUPABASE_SERVICE_ROLE_KEY=...`  ← **server‑only**

**`lib/supabaseAdmin.ts`** — server‑side client:
```ts
// lib/supabaseAdmin.ts (server-only)
import { createClient } from '@supabase/supabase-js'

export const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // NEVER expose to the browser
  { auth: { autoRefreshToken: false, persistSession: false } }
)
```

**Create/Invite endpoint** — `app/api/admin/users/create/route.ts`:
```ts
import { NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  const { email, password, role = 'photouser', invite = false } = await req.json()

  try {
    let userId: string

    if (invite) {
      const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email)
      if (error) throw error
      userId = data.user!.id
    } else {
      const { data, error } = await adminClient.auth.admin.createUser({
        email, password, email_confirm: true
      })
      if (error) throw error
      userId = data.user!.id
    }

    const { error: updErr } = await adminClient.auth.admin.updateUserById(userId, {
      app_metadata: { role }
    })
    if (updErr) throw updErr

    return NextResponse.json({ ok: true, userId })
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e.message }, { status: 400 })
  }
}
```

**Change role** — `app/api/admin/users/role/route.ts`:
```ts
import { NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  const { userId, role } = await req.json()
  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    app_metadata: { role }
  })
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
```
> Admin API methods and server‑only requirement are documented by Supabase. 

**Admin UI (quick)** — a simple protected page that posts to these endpoints is enough for MVP.

---

## 4) Database & Storage authorization (RLS)

### 4.1 Helper function to read role
```sql
create or replace function public.jwt_role()
returns text
language sql stable as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), 'photouser')
$$;
```
> Reading custom claims from JWT inside RLS policies is an official pattern. JWT refresh matters after role changes. 

### 4.2 Storage bucket & policies

**Bucket**: `mp-images` (public read, controlled write).  
Enable RLS on `storage.objects` and add policies:

```sql
-- Allow authenticated users with these roles to INSERT (upload) to mp-images
create policy "mp-images: insert by role"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'mp-images'
  and public.jwt_role() in ('photouser','expert','admin','superadmin')
);

-- Optional: allow update only by owner (who uploaded)
create policy "mp-images: update own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'mp-images'
  and owner = auth.uid()
  and public.jwt_role() in ('photouser','expert','admin','superadmin')
);
```
> Supabase states that **uploading** requires at minimum an **INSERT** policy on `storage.objects`; **upsert** requires SELECT+UPDATE as well. 

**Alternative for stricter security**: generate a **signed upload URL** on the server and call `uploadToSignedUrl` from the client — then you can avoid broad INSERT policies. 

### 4.3 Tables & policies (example: `public.photo_submissions`)

Assume this table captures one submission group (name, manufacturer, 4‑10 image paths, status).

```sql
create table if not exists public.photo_submissions (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  name text,
  manufacturer text,
  images text[] check (array_length(images, 1) between 4 and 10),
  status text not null default 'pending', -- pending | in_review | done
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_photo_submissions_created_by on public.photo_submissions(created_by);

alter table public.photo_submissions enable row level security;

-- Photouser can insert their own rows
create policy "ps: insert own"
on public.photo_submissions
for insert
to authenticated
with check ( created_by = auth.uid() and public.jwt_role() = 'photouser' );

-- Photouser can read their own rows
create policy "ps: select own"
on public.photo_submissions
for select
to authenticated
using ( created_by = auth.uid() );

-- Experts/Admins/SuperAdmins can read/update all
create policy "ps: reviewers read all"
on public.photo_submissions
for select
to authenticated
using ( public.jwt_role() in ('expert','admin','superadmin') );

create policy "ps: reviewers update all"
on public.photo_submissions
for update
to authenticated
using ( public.jwt_role() in ('expert','admin','superadmin') );
```

For your normalized tables (e.g., `items`, `images`, etc.), mirror the same idea: **photouser** never edits finalized entities; **expert/admin** can review & update; **admin/superadmin** can manage/global.

---

## 5) Frontend usage

### 5.1 Read role from session
```ts
const { data: { session } } = await supabase.auth.getSession()
const role = session?.user?.app_metadata?.role ?? 'photouser'
```

### 5.2 Guard pages/features
- Hide admin pages if `role` is not `admin/superadmin`.  
- Hide “Review” entry on Home for `photouser`.  
- After changing a user’s role in Admin UI, ask the user to **relogin or refresh** to get a fresh JWT (RLS evaluates the JWT). 

---

## 6) Optional: Signed upload URL flow

When you want **zero client write policies** on Storage:

1) Server creates a signed upload token for the desired path.  
2) Client uploads with `uploadToSignedUrl(path, token, file)`.

```ts
// server route: app/api/storage/signed-upload/route.ts
import { NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  const { path } = await req.json()
  const { data, error } = await adminClient.storage
    .from('mp-images')
    .createSignedUploadUrl(path)
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, ...data })
}
```
Client:
```ts
const res = await fetch('/api/storage/signed-upload', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ path: `photos/${Date.now()}.jpg` })
});
const { token, path } = await res.json();
await supabase.storage.from('mp-images').uploadToSignedUrl(path, token, file);
```
> API reference for `uploadToSignedUrl`. 

---

## 7) Admin checklist

- [ ] Auth UI on `/login` works (email/password; social later). 
- [ ] Admin endpoints deployed with `SUPABASE_SERVICE_ROLE_KEY` (server only).
- [ ] Policies enabled on `storage.objects` and business tables. 
- [ ] After role changes, users refresh JWT (logout/login) to reflect new permissions. 

---

## 8) Notes & gotchas

- **Never** use `service_role` in the browser; only server routes/functions may use it. citeturn0search0
- If uploads return *“new row violates row‑level security policy”*, re‑check Storage policies or use signed upload URLs. Related community threads show this exact symptom. citeturn0search2turn0search7
- Keep JWT payload small (custom claims add size). Supabase docs note JWT size considerations for cookie‑based auth. 

---

## 9) What you can build next

- `/admin/users` page to invite users and assign roles (calls the admin endpoints).  
- Home page that conditionally shows **Scan new** (photouser) or **Review photos** (expert/admin).  
- Review screen backed by `photo_submissions` + OCR outputs, and finalize into your normalized tables.

---

**Appendix — References**  
- Supabase Auth — overview & methods. citeturn0search11  
- Supabase Auth UI for React (prebuilt login component). citeturn0search3  
- Auth Admin API create/invite/update (server‑only). citeturn0search0  
- Custom claims & RBAC with RLS (`auth.jwt()` pattern) & JWT freshness notes. citeturn0search6turn0search1  
- Storage access control & required policies for upload/upsert. citeturn0search2  
- Signed upload URLs (`uploadToSignedUrl`). citeturn0search4
