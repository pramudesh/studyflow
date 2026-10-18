import { z } from "zod";

const hexColor = z
  .string()
  .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Must be a hex color like #2563EB");

export const createSubjectSchema = z.object({
  code: z.string().max(40).optional(),
  name: z.string().min(1, "Subject name is required").max(160),
  instructor: z.string().max(160).optional(),
  credits: z.number().int().min(0).max(20).optional(),
  color: hexColor.optional(),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export const subjectIdParamSchema = z.object({
  id: z.string().uuid("Invalid subject id"),
});
