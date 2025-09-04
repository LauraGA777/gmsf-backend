"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboardmobile_controller_1 = require("../controllers/dashboardmobile.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const dashboard_middleware_1 = require("../middlewares/dashboard.middleware");
const router = (0, express_1.Router)();
// GET /api/dashboard-mobile/health - Health check básico
router.get("/health", auth_middleware_1.verifyToken, dashboard_middleware_1.canViewDashboard, dashboardmobile_controller_1.getMobileDashboardHealthCheck);
// GET /api/dashboard-mobile/quick-summary - Resumen rápido optimizado para móvil
router.get("/quick-summary", auth_middleware_1.verifyToken, dashboard_middleware_1.canViewDashboard, dashboardmobile_controller_1.getMobileDashboardQuickSummary);
// GET /api/dashboard-mobile/main-metrics - Métricas principales para móvil
router.get("/main-metrics", auth_middleware_1.verifyToken, dashboard_middleware_1.canViewDashboard, dashboardmobile_controller_1.getMobileDashboardMainMetrics);
// GET /api/dashboard-mobile/widget - Widget compacto para móvil
router.get("/widget", auth_middleware_1.verifyToken, dashboard_middleware_1.canViewDashboard, dashboardmobile_controller_1.getMobileDashboardWidget);
// GET /api/dashboard-mobile/diagnostic - Diagnóstico de base de datos
router.get("/diagnostic", auth_middleware_1.verifyToken, dashboard_middleware_1.canViewDashboard, dashboardmobile_controller_1.getMobileDashboardDiagnostic);
exports.default = router;
