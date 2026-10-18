-- ============================================================================
-- StudyFlow Backend — Schema
-- Run in Supabase SQL editor (or via `supabase db push`) in order: 001 → 004
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
create type public.task_priority as enum ('low', 'medium', 'high');

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
