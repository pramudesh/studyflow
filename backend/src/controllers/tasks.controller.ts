import { Request, Response } from "express";
import { localDb } from "../config/localDb";
import { isLocalDb } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

/** GET /api/tasks — list with optional filters, sorting, pagination */
export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  const queryParams = req.query as unknown as {
    subjectId?: string;
    priority?: "low" | "medium" | "high";
    completed?: boolean;
    dueBefore?: string;
    dueAfter?: string;
    search?: string;
    sortBy: "due_date" | "priority" | "created_at" | "title";
    sortDir: "asc" | "desc";
    limit: number;
    offset: number;
  };

  if (isLocalDb) {
    const result = localDb.listTasks(req.user!.id, queryParams);
    res.json(result);
    return;
  }

  let query = req
    .supabase!.from("tasks")
    .select("*, subjects(id, name, code, color)", { count: "exact" });

  if (queryParams.subjectId) query = query.eq("subject_id", queryParams.subjectId);
  if (queryParams.priority) query = query.eq("priority", queryParams.priority);
  if (queryParams.completed !== undefined) query = query.eq("is_completed", queryParams.completed);
  if (queryParams.dueBefore) query = query.lte("due_date", queryParams.dueBefore);
  if (queryParams.dueAfter) query = query.gte("due_date", queryParams.dueAfter);
  if (queryParams.search) query = query.ilike("title", `%${queryParams.search}%`);

  const sortBy = queryParams.sortBy || "created_at";
  const ascending = queryParams.sortDir === "asc";
  const offset = Number(queryParams.offset) || 0;
  const limit = Math.min(Number(queryParams.limit) || 100, 100);

  query = query
    .order(sortBy, { ascending, nullsFirst: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw ApiError.internal(error.message);
  res.json({ tasks: data || [], total: count ?? data?.length ?? 0, limit, offset });
});

/** GET /api/tasks/:id */
export const getTask = asyncHandler(async (req: Request, res: Response) => {
  if (isLocalDb) {
    const task = localDb.getTask(req.params.id, req.user!.id);
    if (!task) throw ApiError.notFound("Task not found");
    res.json({ task });
    return;
  }

  const { data, error } = await req
    .supabase!.from("tasks")
    .select("*, subjects(id, name, code, color)")
    .eq("id", req.params.id)
    .maybeSingle();

  if (error) throw ApiError.internal(error.message);
  if (!data) throw ApiError.notFound("Task not found");
  res.json({ task: data });
});

/** POST /api/tasks */
export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const {
    subjectId,
    title,
    notes,
    priority,
    dueDate,
    dueTime,
    durationMinutes,
    reminderEnabled,
  } = req.body;

  if (isLocalDb) {
    const task = localDb.createTask(req.user!.id, {
      subjectId,
      title,
      notes,
      priority,
      dueDate,
      dueTime,
      durationMinutes,
      reminderEnabled,
    });
    res.status(201).json({ task });
    return;
  }

  const { data, error } = await req
    .supabase!.from("tasks")
    .insert({
      user_id: req.user!.id,
      subject_id: subjectId ?? null,
      title,
      notes: notes ?? null,
      priority: priority ?? "medium",
      due_date: dueDate ?? null,
      due_time: dueTime ?? null,
      duration_minutes: durationMinutes ?? null,
      reminder_enabled: reminderEnabled ?? false,
    })
    .select("*, subjects(id, name, code, color)")
    .single();

  if (error) throw ApiError.internal(error.message);
  res.status(201).json({ task: data });
});

const UPDATABLE_FIELDS: Record<string, string> = {
  subjectId: "subject_id",
  title: "title",
  notes: "notes",
  priority: "priority",
  dueDate: "due_date",
  dueTime: "due_time",
  durationMinutes: "duration_minutes",
  reminderEnabled: "reminder_enabled",
};

/** PATCH /api/tasks/:id */
export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  if (isLocalDb) {
    const task = localDb.updateTask(req.params.id, req.user!.id, req.body);
    if (!task) throw ApiError.notFound("Task not found");
    res.json({ task });
    return;
  }

  const updates: Record<string, unknown> = {};
  for (const [bodyKey, column] of Object.entries(UPDATABLE_FIELDS)) {
    if (bodyKey in req.body) updates[column] = req.body[bodyKey];
  }

  if (Object.keys(updates).length === 0) {
    throw ApiError.badRequest("No fields provided to update");
  }

  const { data, error } = await req
    .supabase!.from("tasks")
    .update(updates)
    .eq("id", req.params.id)
    .select("*, subjects(id, name, code, color)")
    .maybeSingle();

  if (error) throw ApiError.internal(error.message);
  if (!data) throw ApiError.notFound("Task not found");
  res.json({ task: data });
});

/**
 * PATCH /api/tasks/:id/complete
 */
export const setTaskCompletion = asyncHandler(async (req: Request, res: Response) => {
  const { isCompleted } = req.body;

  if (isLocalDb) {
    const task = localDb.setTaskCompletion(req.params.id, req.user!.id, isCompleted);
    if (!task) throw ApiError.notFound("Task not found");
    res.json({ task });
    return;
  }

  const { data, error } = await req
    .supabase!.from("tasks")
    .update({ is_completed: isCompleted })
    .eq("id", req.params.id)
    .select("*, subjects(id, name, code, color)")
    .maybeSingle();

  if (error) throw ApiError.internal(error.message);
  if (!data) throw ApiError.notFound("Task not found");
  res.json({ task: data });
});

/** DELETE /api/tasks/:id */
export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  if (isLocalDb) {
    const deleted = localDb.deleteTask(req.params.id, req.user!.id);
    if (!deleted) throw ApiError.notFound("Task not found");
    res.status(204).send();
    return;
  }

  const { data, error } = await req
    .supabase!.from("tasks")
    .delete()
    .eq("id", req.params.id)
    .select("id")
    .maybeSingle();

  if (error) throw ApiError.internal(error.message);
  if (!data) throw ApiError.notFound("Task not found");
  res.status(204).send();
});
