-- Helper function to read role from JWT
create or replace function public.jwt_role()
returns text
language sql stable as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), 'photouser')
$$;

-- Storage policies for mp-images bucket
create policy "mp-images: insert by role"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'mp-images'
  and public.jwt_role() in ('photouser','expert','admin','superadmin')
);

create policy "mp-images: update own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'mp-images'
  and owner = auth.uid()
  and public.jwt_role() in ('photouser','expert','admin','superadmin')
);

-- Photo submissions table policies
create policy "ps: insert own"
on public.photo_submissions
for insert
to authenticated
with check ( 
  created_by = auth.uid() 
  and public.jwt_role() = 'photouser' 
);

create policy "ps: select own"
on public.photo_submissions
for select
to authenticated
using ( created_by = auth.uid() );

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


