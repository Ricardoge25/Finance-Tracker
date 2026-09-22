import { Router } from "express";
import { getDashboardMetrics, getBalanceHistory } from "./dashboard.controller.js";

const router = Router();

router.get("/metrics", getDashboardMetrics);
router.get("/history", getBalanceHistory);

export default router;