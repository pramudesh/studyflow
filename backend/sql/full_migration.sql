-- ============================================================================
-- StudyFlow Backend — Combined Complete Migration (001 → 004)
-- Run in Supabase SQL Editor or via `npm run db:migrate`
-- ============================================================================

-- ============================================================================
-- 001_schema.sql
-- ============================================================================
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ----------------------------------------------------------------------------
-- profiles
-- Mirrors a subset of auth.users so we have a public, queryable "who is this"
-- row. Auto-created by a trigger on auth.users (see 003_functions_triggers.sql)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- subjects
-- One row per course/subject a student is tracking.
-- ----------------------------------------------------------------------------
create table if not exists public.subjects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  code        text,                      -- e.g. "CS 301"
  name        text not null,             -- e.g. "Algorithms & Data Structures"
  instructor  text,
  credits     smallint check (credits is null or credits between 0 and 20),
  color       text not null default '#2563EB', -- hex, drives the card accent bar
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists subjects_user_id_idx on public.subjects (user_id);

-- ----------------------------------------------------------------------------
-- tasks
-- ----------------------------------------------------------------------------
do $$ begin
  create type public.task_priority as enum ('low', 'medium', 'high');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.tasks (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  subject_id       uuid references public.subjects (id) on delete set null,
  title            text not null check (char_length(trim(title)) > 0),
  notes            text,
  priority         public.task_priority not null default 'medium',
  due_date         date,
  due_time         time,
  duration_minutes integer check (duration_minutes is null or duration_minutes >= 0),
  reminder_enabled boolean not null default false,
  is_completed     boolean not null default false,
  completed_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_subject_id_idx on public.tasks (subject_id);
create index if not exists tasks_due_date_idx on public.tasks (due_date);
create index if not exists tasks_user_completed_idx on public.tasks (user_id, is_completed);

-- ============================================================================
-- 002_rls_policies.sql
-- ============================================================================
alter table public.profiles enable row level security;

do $$ begin
  create policy "profiles_select_own"
    on public.profiles for select
    using (auth.uid() = id);
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "profiles_update_own"
    on public.profiles for update
    using (auth.uid() = id)
    with check (auth.uid() = id);
exception
  when duplicate_object then null;
end $$;

alter table public.subjects enable row level security;

do $$ begin
  create policy "subjects_select_own"
    on public.subjects for select
    using (auth.uid() = user_id);
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "subjects_insert_own"
    on public.subjects for insert
    with check (auth.uid() = user_id);
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "subjects_update_own"
    on public.subjects for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "subjects_delete_own"
    on public.subjects for delete
    using (auth.uid() = user_id);
exception
  when duplicate_object then null;
end $$;

alter table public.tasks enable row level security;

do $$ begin
  create policy "tasks_select_own"
    on public.tasks for select
    using (auth.uid() = user_id);
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "tasks_insert_own"
    on public.tasks for insert
    with check (
      auth.uid() = user_id
      and (
        subject_id is null
        or exists (
          select 1 from public.subjects s
          where s.id = subject_id and s.user_id = auth.uid()
        )
      )
    );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "tasks_update_own"
    on public.tasks for update
    using (auth.uid() = user_id)
    with check (
      auth.uid() = user_id
      and (
        subject_id is null
        or exists (
          select 1 from public.subjects s
          where s.id = subject_id and s.user_id = auth.uid()
        )
      )
    );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "tasks_delete_own"
    on public.tasks for delete
    using (auth.uid() = user_id);
exception
  when duplicate_object then null;
end $$;

-- ============================================================================
-- 003_functions_triggers.sql
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.subjects;
create trigger set_updated_at
  before update on public.subjects
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.tasks;
create trigger set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

create or replace function public.set_task_completed_at()
returns trigger
language plpgsql
as $$
begin
  if new.is_completed = true and old.is_completed = false then
    new.completed_at = now();
  elsif new.is_completed = false and old.is_completed = true then
    new.completed_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists set_task_completed_at on public.tasks;
create trigger set_task_completed_at
  before update on public.tasks
  for each row execute function public.set_task_completed_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 004_dashboard_view.sql
-- ============================================================================
create or replace view public.task_dashboard_stats
with (security_invoker = true) as
select
  user_id,
  count(*) filter (where is_completed) as completed_count,
  count(*) filter (where not is_completed) as pending_count,
  count(*) filter (
    where not is_completed and due_date = current_date
  ) as due_today_count,
  count(*) filter (
    where not is_completed and due_date < current_date
  ) as overdue_count,
  count(*) filter (
    where not is_completed
      and due_date >= current_date
      and due_date < current_date + interval '7 days'
  ) as due_this_week_count,
  count(*) filter (where priority = 'high' and not is_completed) as high_priority_open_count,
  count(*) filter (
    where is_completed
      and completed_at >= date_trunc('week', now())
  ) as completed_this_week_count
from public.tasks
group by user_id;

create or replace view public.subject_progress_stats
with (security_invoker = true) as
select
  s.id as subject_id,
  s.user_id,
  s.name,
  s.code,
  s.color,
  count(t.id) as total_tasks,
  count(t.id) filter (where t.is_completed) as completed_tasks,
  case
    when count(t.id) = 0 then 0
    else round(100.0 * count(t.id) filter (where t.is_completed) / count(t.id), 1)
  end as completion_percent
from public.subjects s
left join public.tasks t on t.subject_id = s.id
group by s.id, s.user_id, s.name, s.code, s.color;
