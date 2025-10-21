-- Create detail table for submission images
create table if not exists public.photo_submission_images (
  id uuid primary key default gen_random_uuid(),
  submission_id bigint not null references public.photo_submissions(id) on delete cascade,
  storage_path text not null,
  status text not null default 'active' check (status in ('active','deleted')),
  width int,
  height int,
  size_bytes bigint,
  mime_type text,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Simple audit log
create table if not exists public.photo_submission_image_logs (
  id uuid primary key default gen_random_uuid(),
  image_id uuid not null references public.photo_submission_images(id) on delete cascade,
  action text not null, -- 'upload'|'reassign'|'delete_soft'|'delete_hard'
  from_submission_id uuid,
  to_submission_id uuid,
  operator_id uuid,
  reason text,
  created_at timestamptz default now()
);

-- Helper view to aggregate active image paths into an array
create or replace view public.photo_submissions_with_images as
select
  s.*,
  coalesce(
    (
      select array_agg(i.storage_path order by i.created_at)
      from public.photo_submission_images i
      where i.submission_id = s.id and i.status = 'active'
    ),
    '{}'
  ) as images
from public.photo_submissions s;


