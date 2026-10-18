-- ============================================================================
-- StudyFlow Backend — Functions & Triggers
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Keep updated_at fresh on every row update
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- Stamp completed_at whenever is_completed flips to true, clear it when
-- flipped back to false. Keeps the API from having to manage this field.
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- Auto-create a profiles row whenever a new auth.users row appears
-- (i.e. right after signup).
-- ----------------------------------------------------------------------------
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
