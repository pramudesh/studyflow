-- ============================================================================
-- StudyFlow Backend — Dashboard stats
-- A security_invoker view, so it runs with the caller's permissions and RLS
-- on public.tasks/public.subjects still applies — each user only ever sees
-- their own aggregates.
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

-- Per-subject completion breakdown, used for the Progress/Analytics page.
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
