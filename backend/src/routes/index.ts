import { Router } from "express";
import authRoutes from "./auth.routes";
import subjectsRoutes from "./subjects.routes";
import tasksRoutes from "./tasks.routes";
import dashboardRoutes from "./dashboard.routes";

const router = Router();

router.get("/health", (_req, res) => res.json({ status: "ok" }));

router.use("/auth", authRoutes);
router.use("/subjects", subjectsRoutes);
router.use("/tasks", tasksRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
