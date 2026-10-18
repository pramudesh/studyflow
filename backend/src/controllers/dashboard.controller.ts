import { Request, Response } from "express";
import { localDb } from "../config/localDb";
import { isLocalDb } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { TaskDashboardStats } from "../types";

/**
 * GET /api/dashboard/stats
 */
export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  if (isLocalDb) {
    const stats = localDb.getDashboardStats(req.user!.id);
    res.json({ stats });
    return;
  }

  const { data } = await req
    .supabase!.from("task_dashboard_stats")
    .select("*")
    .maybeSingle();

  const zeroed: Omit<TaskDashboardStats, "user_id"> = {
    completed_count: 0,
    pending_count: 0,
    due_today_count: 0,
    overdue_count: 0,
    due_this_week_count: 0,
    high_priority_open_count: 0,
    completed_this_week_count: 0,
  };

  res.json({ stats: data ?? { user_id: req.user!.id, ...zeroed } });
});

/** GET /api/dashboard/subject-progress */
export const getSubjectProgress = asyncHandler(async (req: Request, res: Response) => {
  if (isLocalDb) {
    const subjectProgress = localDb.getSubjectProgress(req.user!.id);
    res.json({ subjectProgress });
    return;
  }

  const { data } = await req
    .supabase!.from("subject_progress_stats")
    .select("*")
    .order("name", { ascending: true });

  res.json({ subjectProgress: data || [] });
});

/** GET /api/dashboard/upcoming */
export const getUpcomingTasks = asyncHandler(async (req: Request, res: Response) => {
  if (isLocalDb) {
    const tasks = localDb.getUpcoming(req.user!.id);
    res.json({ tasks });
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const weekOut = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const { data, error } = await req
    .supabase!.from("tasks")
    .select("*, subjects(id, name, code, color)")
    .eq("is_completed", false)
    .gte("due_date", today)
    .lte("due_date", weekOut)
    .order("due_date", { ascending: true })
    .order("due_time", { ascending: true });

  if (error) throw ApiError.internal(error.message);
  res.json({ tasks: data });
});

/** GET /api/dashboard/overdue */
export const getOverdueTasks = asyncHandler(async (req: Request, res: Response) => {
  if (isLocalDb) {
    const tasks = localDb.getOverdue(req.user!.id);
    res.json({ tasks });
    return;
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await req
    .supabase!.from("tasks")
    .select("*, subjects(id, name, code, color)")
    .eq("is_completed", false)
    .lt("due_date", today)
    .order("due_date", { ascending: true });

  if (error) throw ApiError.internal(error.message);
  res.json({ tasks: data });
});
