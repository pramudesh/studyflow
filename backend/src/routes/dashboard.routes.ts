import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/stats", dashboardController.getDashboardStats);
router.get("/subject-progress", dashboardController.getSubjectProgress);
router.get("/upcoming", dashboardController.getUpcomingTasks);
router.get("/overdue", dashboardController.getOverdueTasks);

export default router;
