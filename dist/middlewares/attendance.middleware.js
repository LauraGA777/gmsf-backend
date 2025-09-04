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
exports.canViewMyAttendanceStats = exports.canViewMyAttendanceHistory = exports.canViewClientHistory = exports.canViewClientStats = exports.canViewClientInfo = exports.requireAttendancePrivileges = exports.canViewOwnAttendances = exports.canManageAttendances = exports.canViewAttendanceStats = exports.canDeleteAttendances = exports.canUpdateAttendances = exports.canViewAttendanceDetails = exports.canSearchAttendances = exports.canCreateAttendances = exports.canViewAttendances = void 0;
const permissions_1 = require("../utils/permissions");
const rolePermissionManager_1 = __importDefault(require("../utils/rolePermissionManager"));
/**
 * Middleware para verificar privilegio de ver asistencias
 * Privilegio: ASIST_READ
 */
const canViewAttendances = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.ASIST_READ)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver asistencias'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewAttendances:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewAttendances = canViewAttendances;
/**
 * Middleware para verificar privilegio de crear/registrar asistencias
 * Privilegio: ASIST_CREATE
 */
const canCreateAttendances = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.ASIST_CREATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para crear asistencias'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canCreateAttendances:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canCreateAttendances = canCreateAttendances;
/**
 * Middleware para verificar privilegio de buscar asistencias
 * Privilegio: ASIST_SEARCH
 */
const canSearchAttendances = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.ASIST_SEARCH)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para buscar asistencias'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canSearchAttendances:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canSearchAttendances = canSearchAttendances;
/**
 * Middleware para verificar privilegio de ver detalles de asistencia
 * Privilegio: ASIST_DETAILS
 */
const canViewAttendanceDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.ASIST_DETAILS)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver detalles de asistencias'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewAttendanceDetails:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewAttendanceDetails = canViewAttendanceDetails;
/**
 * Middleware para verificar privilegio de actualizar asistencias
 * Privilegio: ASIST_UPDATE
 */
const canUpdateAttendances = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.ASIST_UPDATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para actualizar asistencias'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canUpdateAttendances:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canUpdateAttendances = canUpdateAttendances;
/**
 * Middleware para verificar privilegio de eliminar asistencias
 * Privilegio: ASIST_DELETE
 */
const canDeleteAttendances = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.ASIST_DELETE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para eliminar asistencias'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canDeleteAttendances:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canDeleteAttendances = canDeleteAttendances;
/**
 * Middleware para verificar privilegio de ver estadísticas de asistencias
 * Privilegio: ASIST_STATS
 */
const canViewAttendanceStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.ASIST_STATS)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver estadísticas de asistencias'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewAttendanceStats:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewAttendanceStats = canViewAttendanceStats;
/**
 * Middleware para verificar privilegio de gestión completa de asistencias
 * Privilegio: ASIST_CREATE || ASIST_UPDATE || ASIST_DELETE
 */
const canManageAttendances = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        // Verificar si tiene al menos uno de los privilegios de gestión
        const hasManagementPrivilege = (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.ASIST_CREATE) ||
            (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.ASIST_UPDATE) ||
            (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.ASIST_DELETE);
        if (!hasManagementPrivilege) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para gestionar asistencias'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canManageAttendances:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canManageAttendances = canManageAttendances;
/**
 * Middleware para verificar acceso a asistencias propias (para clientes)
 * Privilegio: ASIST_READ (con filtro por usuario para roles R003 y R004)
 */
const canViewOwnAttendances = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        // Verificar si tiene privilegio de lectura
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.ASIST_READ)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver asistencias'
            });
        }
        // Si es cliente o beneficiario, agregar filtro por usuario
        if (userInfo.role === 'R003' || userInfo.role === 'R004') {
            req.userFilter = { id_usuario: userId };
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewOwnAttendances:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewOwnAttendances = canViewOwnAttendances;
/**
 * Middleware combinado para verificar múltiples privilegios
 */
const requireAttendancePrivileges = (requiredPrivileges) => {
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
                    message: 'No tienes los permisos necesarios para esta acción'
                });
            }
            next();
        }
        catch (error) {
            console.error('Error en middleware requireAttendancePrivileges:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor'
            });
        }
    });
};
exports.requireAttendancePrivileges = requireAttendancePrivileges;
/**
 * Middleware para verificar privilegio de ver información del cliente
 * Privilegio: ASIST_CLIENT_INFO
 */
const canViewClientInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { userId: targetUserId } = req.params;
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
        // Si es el mismo usuario, permitir acceso a su propia información
        if (userId.toString() === targetUserId) {
            return next();
        }
        // Si no es el mismo usuario, verificar privilegios administrativos
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.ASIST_CLIENT_INFO)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver información de clientes'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewClientInfo:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewClientInfo = canViewClientInfo;
/**
 * Middleware para verificar privilegio de ver estadísticas del cliente
 * Privilegio: ASIST_CLIENT_STATS
 */
const canViewClientStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { userId: targetUserId } = req.params;
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
        // Si es el mismo usuario, permitir acceso a sus propias estadísticas
        if (userId.toString() === targetUserId) {
            return next();
        }
        // Si no es el mismo usuario, verificar privilegios de estadísticas
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.ASIST_CLIENT_STATS)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver estadísticas de clientes'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewClientStats:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewClientStats = canViewClientStats;
/**
 * Middleware para verificar privilegio de ver historial de asistencias del cliente
 * Privilegio: ASIST_CLIENT_HISTORY
 */
const canViewClientHistory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { userId: targetUserId } = req.params;
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
        // Si es el mismo usuario, permitir acceso a su propio historial
        if (userId.toString() === targetUserId) {
            return next();
        }
        // Si no es el mismo usuario, verificar privilegios de lectura
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.ASIST_CLIENT_HISTORY)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver el historial de asistencias de otros clientes'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewClientHistory:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewClientHistory = canViewClientHistory;
/**
 * Middleware para verificar privilegio de ver historial personal de asistencias
 * Privilegio: ASIST_MY_HISTORY
 */
const canViewMyAttendanceHistory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        // Verificar privilegio específico para historial personal
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.ASIST_MY_HISTORY)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver tu historial de asistencias'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewMyAttendanceHistory:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewMyAttendanceHistory = canViewMyAttendanceHistory;
/**
 * Middleware para verificar privilegio de ver estadísticas personales de asistencias
 * Privilegio: ASIST_MY_STATS
 */
const canViewMyAttendanceStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        // Verificar privilegio específico para estadísticas personales
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.ASIST_MY_STATS)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver tus estadísticas de asistencias'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewMyAttendanceStats:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewMyAttendanceStats = canViewMyAttendanceStats;
