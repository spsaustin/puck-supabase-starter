-- =============================================================================
-- 0001 — editor content and the admin list
--
-- Paste into Supabase → SQL Editor and run once (or `supabase db push`).
-- Idempotent: running it again is harmless.
--
--   pages          what the editor last published, one row per page
--   page_versions  one row per publish; rolling back republishes an old row
--   admins         who may edit, checked on every request by the site
--
-- The site writes through the service-role key, which bypasses row security.
-- Row security is on with no policies, so the anon and authenticated API
-- roles can read and write nothing here.
-- =============================================================================

create table if not exists public.pages (
  page_key        text primary key check (page_key ~ '^[a-z0-9][a-z0-9-]*(/[a-z0-9][a-z0-9-]*)*$'),
  data            jsonb not null,
  version         integer not null default 1,
  last_edited_by  text not null,
  last_edited_at  timestamptz not null default now()
);

create table if not exists public.page_versions (
  id          bigserial primary key,
  page_key    text not null references public.pages (page_key) on delete cascade,
  version     integer not null,
  data        jsonb not null,
  edited_by   text not null,
  edited_at   timestamptz not null default now(),
  unique (page_key, version)
);

create table if not exists public.admins (
  email     text primary key check (email = lower(email)),
  added_at  timestamptz not null default now(),
  note      text
);

alter table public.pages          enable row level security;
alter table public.page_versions  enable row level security;
alter table public.admins         enable row level security;

-- One publish = current row upserted + version row appended, atomically.
create or replace function public.publish_page(p_page_key text, p_data jsonb, p_actor text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare v integer;
begin
  insert into public.pages (page_key, data, version, last_edited_by, last_edited_at)
    values (p_page_key, p_data, 1, p_actor, now())
  on conflict (page_key) do update
    set data = excluded.data,
        version = public.pages.version + 1,
        last_edited_by = excluded.last_edited_by,
        last_edited_at = now()
  returning version into v;
  insert into public.page_versions (page_key, version, data, edited_by)
    values (p_page_key, v, p_data, p_actor);
  return v;
end;
$$;

-- Only the service role may call it.
revoke all on function public.publish_page(text, jsonb, text) from public, anon, authenticated;
grant execute on function public.publish_page(text, jsonb, text) to service_role;
