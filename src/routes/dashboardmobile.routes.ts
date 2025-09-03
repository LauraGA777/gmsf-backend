import { RequestHandler, Router } from "express";
import { 
    getMobileDashboardQuickSummary, 
    getMobileDashboardMainMetrics, 
    getMobileDashboardWidget 
} from "../controllers/dashboardmobile.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { canViewDashboard } from "../middlewares/dashboard.middleware";

const router = Router();

// GET /api/dashboard-mobile/quick-summary - Resumen rápido optimizado para móvil
router.get("/quick-summary", 
    verifyToken as unknown as RequestHandler,
    canViewDashboard as unknown as RequestHandler,
    getMobileDashboardQuickSummary as unknown as RequestHandler
);

// GET /api/dashboard-mobile/main-metrics - Métricas principales para móvil
router.get("/main-metrics", 
    verifyToken as unknown as RequestHandler,
    canViewDashboard as unknown as RequestHandler,
    getMobileDashboardMainMetrics as unknown as RequestHandler
);

// GET /api/dashboard-mobile/widget - Widget compacto para móvil
router.get("/widget", 
    verifyToken as unknown as RequestHandler,
    canViewDashboard as unknown as RequestHandler,
    getMobileDashboardWidget as unknown as RequestHandler
);

export default router;
