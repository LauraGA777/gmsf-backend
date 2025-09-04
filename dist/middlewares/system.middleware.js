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
exports.canPerformCriticalActions = exports.requireSystemPrivileges = exports.canAdministerSystem = exports.canManageSystem = exports.canMaintenanceSystem = exports.canRestoreSystem = exports.canBackupSystem = exports.canViewLogs = exports.canAssignPermissions = exports.canDeletePermissions = exports.canUpdatePermissions = exports.canCreatePermissions = exports.canViewPermissions = exports.canAssignRoles = exports.canDeleteRoles = exports.canUpdateRoles = exports.canCreateRoles = exports.canViewRoles = void 0;
const permissions_1 = require("../utils/permissions");
const rolePermissionManager_1 = __importDefault(require("../utils/rolePermissionManager"));
/**
 * Middleware para verificar privilegio de ver roles del sistema
 */
const canViewRoles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SYSTEM_VIEW_ROLES)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver roles del sistema'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewRoles:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewRoles = canViewRoles;
/**
 * Middleware para verificar privilegio de crear roles
 */
const canCreateRoles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }
        // Verificar si es administrador primero
        const isAdmin = yield rolePermissionManager_1.default.isUserAdmin(userId);
        if (isAdmin) {
            return next();
        }
        const userInfo = yield rolePermissionManager_1.default.getUserRoleInfo(userId);
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SYSTEM_CREATE_ROLES)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para crear roles'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canCreateRoles:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canCreateRoles = canCreateRoles;
/**
 * Middleware para verificar privilegio de actualizar roles
 */
const canUpdateRoles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }
        // Verificar si es administrador primero
        const isAdmin = yield rolePermissionManager_1.default.isUserAdmin(userId);
        if (isAdmin) {
            return next();
        }
        const userInfo = yield rolePermissionManager_1.default.getUserRoleInfo(userId);
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SYSTEM_UPDATE_ROLES)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para actualizar roles'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canUpdateRoles:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canUpdateRoles = canUpdateRoles;
/**
 * Middleware para verificar privilegio de eliminar roles
 */
const canDeleteRoles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }
        // Verificar si es administrador primero
        const isAdmin = yield rolePermissionManager_1.default.isUserAdmin(userId);
        if (isAdmin) {
            return next();
        }
        const userInfo = yield rolePermissionManager_1.default.getUserRoleInfo(userId);
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SYSTEM_DELETE_ROLES)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para eliminar roles'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canDeleteRoles:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canDeleteRoles = canDeleteRoles;
/**
 * Middleware para verificar privilegio de asignar roles
 */
const canAssignRoles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SYSTEM_ASSIGN_ROLES)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para asignar roles'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canAssignRoles:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canAssignRoles = canAssignRoles;
/**
 * Middleware para verificar privilegio de ver permisos del sistema
 */
const canViewPermissions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SYSTEM_VIEW_PERMISSIONS)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver permisos del sistema'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewPermissions:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewPermissions = canViewPermissions;
/**
 * Middleware para verificar privilegio de crear permisos
 */
const canCreatePermissions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }
        // Verificar si es administrador primero
        const isAdmin = yield rolePermissionManager_1.default.isUserAdmin(userId);
        if (isAdmin) {
            return next();
        }
        const userInfo = yield rolePermissionManager_1.default.getUserRoleInfo(userId);
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SYSTEM_CREATE_PERMISSIONS)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para crear permisos'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canCreatePermissions:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canCreatePermissions = canCreatePermissions;
/**
 * Middleware para verificar privilegio de actualizar permisos
 */
const canUpdatePermissions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }
        // Verificar si es administrador primero
        const isAdmin = yield rolePermissionManager_1.default.isUserAdmin(userId);
        if (isAdmin) {
            return next();
        }
        const userInfo = yield rolePermissionManager_1.default.getUserRoleInfo(userId);
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SYSTEM_UPDATE_PERMISSIONS)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para actualizar permisos'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canUpdatePermissions:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canUpdatePermissions = canUpdatePermissions;
/**
 * Middleware para verificar privilegio de eliminar permisos
 */
const canDeletePermissions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }
        // Verificar si es administrador primero
        const isAdmin = yield rolePermissionManager_1.default.isUserAdmin(userId);
        if (isAdmin) {
            return next();
        }
        const userInfo = yield rolePermissionManager_1.default.getUserRoleInfo(userId);
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SYSTEM_DELETE_PERMISSIONS)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para eliminar permisos'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canDeletePermissions:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canDeletePermissions = canDeletePermissions;
/**
 * Middleware para verificar privilegio de asignar permisos
 */
const canAssignPermissions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SYSTEM_ASSIGN_PERMISSIONS)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para asignar permisos'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canAssignPermissions:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canAssignPermissions = canAssignPermissions;
/**
 * Middleware para verificar privilegio de ver logs del sistema
 */
const canViewLogs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SYSTEM_VIEW_LOGS)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver logs del sistema'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewLogs:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewLogs = canViewLogs;
/**
 * Middleware para verificar privilegio de realizar backup
 */
const canBackupSystem = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SYSTEM_BACKUP)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para realizar backup del sistema'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canBackupSystem:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canBackupSystem = canBackupSystem;
/**
 * Middleware para verificar privilegio de restaurar sistema
 */
const canRestoreSystem = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SYSTEM_RESTORE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para restaurar el sistema'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canRestoreSystem:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canRestoreSystem = canRestoreSystem;
/**
 * Middleware para verificar privilegio de mantenimiento del sistema
 */
const canMaintenanceSystem = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SYSTEM_MAINTENANCE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para realizar mantenimiento del sistema'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canMaintenanceSystem:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canMaintenanceSystem = canMaintenanceSystem;
/**
 * Middleware para verificar privilegio de gestión completa del sistema
 */
const canManageSystem = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        // Verificar si tiene al menos uno de los privilegios de gestión del sistema
        const hasManagementPrivilege = (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SYSTEM_CREATE_ROLES) ||
            (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SYSTEM_UPDATE_ROLES) ||
            (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SYSTEM_DELETE_ROLES) ||
            (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SYSTEM_ASSIGN_ROLES) ||
            (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SYSTEM_CREATE_PERMISSIONS) ||
            (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SYSTEM_UPDATE_PERMISSIONS) ||
            (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SYSTEM_DELETE_PERMISSIONS) ||
            (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SYSTEM_ASSIGN_PERMISSIONS);
        if (!hasManagementPrivilege) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para gestionar el sistema'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canManageSystem:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canManageSystem = canManageSystem;
/**
 * Middleware para verificar privilegios de administración total
 */
const canAdministerSystem = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        // Solo administradores pueden administrar el sistema
        if (userInfo.role !== 'R001') {
            return res.status(403).json({
                status: 'error',
                message: 'Solo administradores pueden administrar el sistema'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canAdministerSystem:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canAdministerSystem = canAdministerSystem;
/**
 * Middleware combinado para verificar múltiples privilegios del sistema
 */
const requireSystemPrivileges = (requiredPrivileges) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
            // Verificar si tiene al menos uno de los privilegios requeridos
            const hasRequiredPrivilege = requiredPrivileges.some(privilege => (0, permissions_1.userHasPrivilege)(userInfo.privileges, privilege));
            if (!hasRequiredPrivilege) {
                return res.status(403).json({
                    status: 'error',
                    message: 'No tienes los permisos necesarios para esta acción del sistema'
                });
            }
            next();
        }
        catch (error) {
            console.error('Error en middleware requireSystemPrivileges:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor'
            });
        }
    });
};
exports.requireSystemPrivileges = requireSystemPrivileges;
/**
 * Middleware para verificar privilegios críticos del sistema
 */
const canPerformCriticalActions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        // Verificar si tiene privilegios críticos
        const hasCriticalPrivilege = (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SYSTEM_BACKUP) ||
            (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SYSTEM_RESTORE) ||
            (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SYSTEM_MAINTENANCE);
        if (!hasCriticalPrivilege) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para realizar acciones críticas del sistema'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canPerformCriticalActions:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canPerformCriticalActions = canPerformCriticalActions;
