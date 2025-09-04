"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const dashboard_middleware_1 = require("../middlewares/dashboard.middleware");
const router = (0, express_1.Router)();
// GET /api/dashboard/stats - Get dashboard statistics
router.get("/stats", auth_middleware_1.verifyToken, dashboard_middleware_1.canViewDashboard, dashboard_controller_1.getDashboardStats);
// GET /api/dashboard/optimized - Get optimized dashboard statistics (single request)
router.get("/optimized", auth_middleware_1.verifyToken, dashboard_middleware_1.canViewDashboard, dashboard_controller_1.getDashboardOptimizedStats);
exports.default = router;
