"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.canViewDashboard = void 0;
const permissions_1 = require("../utils/permissions");
const rolePermissionManager_1 = __importDefault(require("../utils/rolePermissionManager"));
/**
 * Middleware para verificar acceso al dashboard
 */
const canViewDashboard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }
        const userInfo = yield rolePermissionManager_1.default.getUserRoleInfo(userId);
        // Permitir acceso a admin y entrenadores por defecto (robusto a códigos faltantes)
        const isAdmin = yield rolePermissionManager_1.default.isUserAdmin(userId);
        const isTrainer = yield rolePermissionManager_1.default.isUserTrainer(userId);
        if (isAdmin || isTrainer || userInfo.role === 'R001' || userInfo.role === 'R002') {
            return next();
        }
        // Para otros roles, verificar privilegios específicos
        const hasViewPrivilege = (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CONTRACT_READ) ||
            (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.ASIST_STATS) ||
            (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CONTRACT_STATS);
        if (!hasViewPrivilege) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver el dashboard'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewDashboard:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewDashboard = canViewDashboard;
