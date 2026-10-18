-- ============================================================================
-- StudyFlow Backend — Row Level Security
-- Every table is scoped to auth.uid() so a user can only ever see/modify
-- their own rows. The service-role key (used only server-side, never shipped
-- to the frontend) bypasses RLS entirely for admin/trusted operations.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Insert happens via the handle_new_user trigger (runs as the table owner),
-- so no end-user INSERT policy is needed or granted.

-- ----------------------------------------------------------------------------
-- subjects
-- ----------------------------------------------------------------------------
alter table public.subjects enable row level security;

create policy "subjects_select_own"
  on public.subjects for select
  using (auth.uid() = user_id);

create policy "subjects_insert_own"
  on public.subjects for insert
  with check (auth.uid() = user_id);

create policy "subjects_update_own"
  on public.subjects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "subjects_delete_own"
  on public.subjects for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- tasks
-- ----------------------------------------------------------------------------
alter table public.tasks enable row level security;

create policy "tasks_select_own"
  on public.tasks for select
  using (auth.uid() = user_id);

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

create policy "tasks_delete_own"
  on public.tasks for delete
  using (auth.uid() = user_id);
