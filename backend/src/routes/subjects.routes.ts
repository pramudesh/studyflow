import { Router } from "express";
import * as subjectsController from "../controllers/subjects.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createSubjectSchema,
  subjectIdParamSchema,
  updateSubjectSchema,
} from "../validators/subject.validators";

const router = Router();

router.use(requireAuth);

router.get("/", subjectsController.listSubjects);
router.post("/", validate(createSubjectSchema), subjectsController.createSubject);

router.get(
  "/:id",
  validate(subjectIdParamSchema, "params"),
  subjectsController.getSubject
);
router.patch(
  "/:id",
  validate(subjectIdParamSchema, "params"),
  validate(updateSubjectSchema),
  subjectsController.updateSubject
);
router.delete(
  "/:id",
  validate(subjectIdParamSchema, "params"),
  subjectsController.deleteSubject
);

export default router;
