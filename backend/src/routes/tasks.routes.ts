import { Router } from "express";
import * as tasksController from "../controllers/tasks.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createTaskSchema,
  listTasksQuerySchema,
  taskIdParamSchema,
  toggleCompleteSchema,
  updateTaskSchema,
} from "../validators/task.validators";

const router = Router();

router.use(requireAuth);

router.get("/", validate(listTasksQuerySchema, "query"), tasksController.listTasks);
router.post("/", validate(createTaskSchema), tasksController.createTask);

router.get(
  "/:id",
  validate(taskIdParamSchema, "params"),
  tasksController.getTask
);
router.patch(
  "/:id",
  validate(taskIdParamSchema, "params"),
  validate(updateTaskSchema),
  tasksController.updateTask
);
router.patch(
  "/:id/complete",
  validate(taskIdParamSchema, "params"),
  validate(toggleCompleteSchema),
  tasksController.setTaskCompletion
);
router.delete(
  "/:id",
  validate(taskIdParamSchema, "params"),
  tasksController.deleteTask
);

export default router;
