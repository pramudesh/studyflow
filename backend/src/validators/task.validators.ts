import { z } from "zod";

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected date format YYYY-MM-DD");

const timeOnly = z
  .string()
  .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Expected time format HH:MM or HH:MM:SS");

export const createTaskSchema = z.object({
  subjectId: z.string().uuid().nullable().optional(),
  title: z.string().min(1, "Title is required").max(240),
  notes: z.string().max(2000).optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: dateOnly.nullable().optional(),
  dueTime: timeOnly.nullable().optional(),
  durationMinutes: z.number().int().min(0).max(1440).nullable().optional(),
  reminderEnabled: z.boolean().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskIdParamSchema = z.object({
  id: z.string().uuid("Invalid task id"),
});

export const listTasksQuerySchema = z.object({
  subjectId: z.string().uuid().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  completed: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  dueBefore: dateOnly.optional(),
  dueAfter: dateOnly.optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(["due_date", "priority", "created_at", "title"]).default("due_date"),
  sortDir: z.enum(["asc", "desc"]).default("asc"),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const toggleCompleteSchema = z.object({
  isCompleted: z.boolean(),
});
