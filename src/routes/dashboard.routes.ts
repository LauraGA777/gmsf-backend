import { RequestHandler, Router } from "express";
import { getDashboardStats, getDashboardOptimizedStats } from "../controllers/dashboard.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { canViewDashboard } from "../middlewares/dashboard.middleware";

const router = Router();

// GET /api/dashboard/stats - Get dashboard statistics
router.get("/stats", 
    verifyToken as unknown as RequestHandler,
    canViewDashboard as unknown as RequestHandler,
    getDashboardStats as unknown as RequestHandler
);

// GET /api/dashboard/optimized - Get optimized dashboard statistics (single request)
router.get("/optimized", 
    verifyToken as unknown as RequestHandler,
    canViewDashboard as unknown as RequestHandler,
    getDashboardOptimizedStats as unknown as RequestHandler
);

export default router; 