import { Request, Response } from "express";
import { localDb } from "../config/localDb";
import { isLocalDb } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

/** GET /api/subjects */
export const listSubjects = asyncHandler(async (req: Request, res: Response) => {
  if (isLocalDb) {
    const subjects = localDb.listSubjects(req.user!.id);
    res.json({ subjects });
    return;
  }

  const { data, error } = await req
    .supabase!.from("subjects")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw ApiError.internal(error.message);
  res.json({ subjects: data || [] });
});

/** GET /api/subjects/:id */
export const getSubject = asyncHandler(async (req: Request, res: Response) => {
  if (isLocalDb) {
    const subject = localDb.getSubject(req.params.id, req.user!.id);
    if (!subject) throw ApiError.notFound("Subject not found");
    res.json({ subject });
    return;
  }

  const { data, error } = await req
    .supabase!.from("subjects")
    .select("*")
    .eq("id", req.params.id)
    .maybeSingle();

  if (error) throw ApiError.internal(error.message);
  if (!data) throw ApiError.notFound("Subject not found");
  res.json({ subject: data });
});

/** POST /api/subjects */
export const createSubject = asyncHandler(async (req: Request, res: Response) => {
  const { code, name, instructor, credits, color } = req.body;

  if (isLocalDb) {
    const subject = localDb.createSubject(req.user!.id, {
      code,
      name,
      instructor,
      credits,
      color,
    });
    res.status(201).json({ subject });
    return;
  }

  const { data, error } = await req
    .supabase!.from("subjects")
    .insert({
      user_id: req.user!.id,
      code: code ?? null,
      name,
      instructor: instructor ?? null,
      credits: credits ?? null,
      color: color ?? "#2563EB",
    })
    .select("*")
    .single();

  if (error) throw ApiError.internal(error.message);
  res.status(201).json({ subject: data });
});

/** PATCH /api/subjects/:id */
export const updateSubject = asyncHandler(async (req: Request, res: Response) => {
  if (isLocalDb) {
    const subject = localDb.updateSubject(req.params.id, req.user!.id, req.body);
    if (!subject) throw ApiError.notFound("Subject not found");
    res.json({ subject });
    return;
  }

  const updates: Record<string, unknown> = {};
  for (const key of ["code", "name", "instructor", "credits", "color"] as const) {
    if (key in req.body) updates[key] = req.body[key];
  }

  if (Object.keys(updates).length === 0) {
    throw ApiError.badRequest("No fields provided to update");
  }

  const { data, error } = await req
    .supabase!.from("subjects")
    .update(updates)
    .eq("id", req.params.id)
    .select("*")
    .maybeSingle();

  if (error) throw ApiError.internal(error.message);
  if (!data) throw ApiError.notFound("Subject not found");
  res.json({ subject: data });
});

/** DELETE /api/subjects/:id */
export const deleteSubject = asyncHandler(async (req: Request, res: Response) => {
  if (isLocalDb) {
    const deleted = localDb.deleteSubject(req.params.id, req.user!.id);
    if (!deleted) throw ApiError.notFound("Subject not found");
    res.status(204).send();
    return;
  }

  const { data, error } = await req
    .supabase!.from("subjects")
    .delete()
    .eq("id", req.params.id)
    .select("id")
    .maybeSingle();

  if (error) throw ApiError.internal(error.message);
  if (!data) throw ApiError.notFound("Subject not found");
  res.status(204).send();
});
