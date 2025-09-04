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
exports.adminUserManagement = exports.adminOrSelfAccess = exports.adminOnlyAccess = void 0;
const rolePermissionManager_1 = __importDefault(require("../utils/rolePermissionManager"));
/*Middleware que verifica que SOLO administradores accedan a rutas de roles*/
const adminOnlyAccess = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
            return;
        }
        // Verificar que el usuario sea administrador
        const isAdmin = yield rolePermissionManager_1.default.isUserAdmin(userId);
        if (!isAdmin) {
            res.status(403).json({
                status: 'error',
                message: 'Acceso denegado. Solo administradores pueden realizar esta acción.'
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Error en adminOnlyAccess:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.adminOnlyAccess = adminOnlyAccess;
/**
 * Middleware que verifica acceso a usuarios (Admin o el propio usuario)
 */
const adminOrSelfAccess = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const targetUserId = parseInt(req.params.id);
        if (!userId) {
            res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
            return;
        }
        // Los administradores pueden acceder a cualquier usuario
        const isAdmin = yield rolePermissionManager_1.default.isUserAdmin(userId);
        if (isAdmin || userId === targetUserId) {
            next();
        }
        else {
            res.status(403).json({
                status: 'error',
                message: 'Acceso denegado. Solo puedes acceder a tu propia información.'
            });
        }
    }
    catch (error) {
        console.error('Error en adminOrSelfAccess:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.adminOrSelfAccess = adminOrSelfAccess;
/**
 * Middleware para verificar que solo ADMIN puede ver/asignar roles a usuarios
 */
const adminUserManagement = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
            return;
        }
        // Solo administradores pueden gestionar usuarios del sistema
        const isAdmin = yield rolePermissionManager_1.default.isUserAdmin(userId);
        if (!isAdmin) {
            res.status(403).json({
                status: 'error',
                message: 'Acceso denegado. Solo administradores pueden gestionar usuarios del sistema.'
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Error en adminUserManagement:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.adminUserManagement = adminUserManagement;
