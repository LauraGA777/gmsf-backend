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
exports.canValidateUsers = exports.requireUserPrivileges = exports.canViewOwnProfile = exports.canChangeUserStatus = exports.canManageUsers = exports.canViewUserHistory = exports.canAssignRoles = exports.canViewUserRoles = exports.canCheckEmail = exports.canCheckDocument = exports.canDeleteUsers = exports.canDeactivateUsers = exports.canActivateUsers = exports.canUpdateUsers = exports.canCreateUsers = exports.canViewUserDetails = exports.canSearchUsers = exports.canViewUsers = void 0;
const permissions_1 = require("../utils/permissions");
const rolePermissionManager_1 = __importDefault(require("../utils/rolePermissionManager"));
/**
 * Middleware para verificar privilegio de ver usuarios
 */
const canViewUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.USER_READ)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver usuarios'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewUsers:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewUsers = canViewUsers;
/**
 * Middleware para verificar privilegio de buscar usuarios
 */
const canSearchUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.USER_SEARCH)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para buscar usuarios'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canSearchUsers:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canSearchUsers = canSearchUsers;
/**
 * Middleware para verificar privilegio de ver detalles de usuarios
 */
const canViewUserDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.USER_DETAILS)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver detalles de usuarios'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewUserDetails:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewUserDetails = canViewUserDetails;
/**
 * Middleware para verificar privilegio de crear usuarios
 */
const canCreateUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.USER_CREATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para crear usuarios'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canCreateUsers:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canCreateUsers = canCreateUsers;
/**
 * Middleware para verificar privilegio de actualizar usuarios
 */
const canUpdateUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.USER_UPDATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para actualizar usuarios'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canUpdateUsers:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canUpdateUsers = canUpdateUsers;
/**
 * Middleware para verificar privilegio de activar usuarios
 */
const canActivateUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.USER_ACTIVATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para activar usuarios'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canActivateUsers:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canActivateUsers = canActivateUsers;
/**
 * Middleware para verificar privilegio de desactivar usuarios
 */
const canDeactivateUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.USER_DEACTIVATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para desactivar usuarios'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canDeactivateUsers:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canDeactivateUsers = canDeactivateUsers;
/**
 * Middleware para verificar privilegio de eliminar usuarios
 */
const canDeleteUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.USER_DELETE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para eliminar usuarios'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canDeleteUsers:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canDeleteUsers = canDeleteUsers;
/**
 * Middleware para verificar privilegio de verificar documento
 */
const canCheckDocument = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.USER_CHECK_DOCUMENT)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para verificar documentos'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canCheckDocument:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canCheckDocument = canCheckDocument;
/**
 * Middleware para verificar privilegio de verificar email
 */
const canCheckEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.USER_CHECK_EMAIL)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para verificar emails'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canCheckEmail:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canCheckEmail = canCheckEmail;
/**
 * Middleware para verificar privilegio de ver roles de usuario
 */
const canViewUserRoles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.USER_VIEW_ROLES)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver roles de usuarios'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewUserRoles:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewUserRoles = canViewUserRoles;
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.USER_ASSIGN_ROLES)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para asignar roles a usuarios'
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
 * Middleware para verificar privilegio de ver historial de usuarios
 */
const canViewUserHistory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.USER_HISTORY)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver historial de usuarios'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewUserHistory:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewUserHistory = canViewUserHistory;
/**
 * Middleware para verificar privilegio de gestión completa de usuarios
 */
const canManageUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const hasManagementPrivilege = (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.USER_CREATE) ||
            (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.USER_UPDATE) ||
            (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.USER_DELETE) ||
            (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.USER_ACTIVATE) ||
            (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.USER_DEACTIVATE);
        if (!hasManagementPrivilege) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para gestionar usuarios'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canManageUsers:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canManageUsers = canManageUsers;
/**
 * Middleware para verificar privilegios de cambio de estado
 */
const canChangeUserStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        // Verificar si tiene privilegios para cambiar estado
        const canChangeStatus = (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.USER_ACTIVATE) ||
            (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.USER_DEACTIVATE);
        if (!canChangeStatus) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para cambiar el estado de usuarios'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canChangeUserStatus:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canChangeUserStatus = canChangeUserStatus;
/**
 * Middleware para verificar acceso a información propia
 */
const canViewOwnProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const requestedUserId = req.params.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }
        const userInfo = yield rolePermissionManager_1.default.getUserRoleInfo(userId);
        // Si es el mismo usuario, permitir acceso
        if (userId.toString() === requestedUserId) {
            return next();
        }
        // Si no es el mismo usuario, verificar permisos
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.USER_READ)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver información de otros usuarios'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewOwnProfile:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewOwnProfile = canViewOwnProfile;
/**
 * Middleware combinado para verificar múltiples privilegios
 */
const requireUserPrivileges = (requiredPrivileges) => {
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
            console.error('Error en middleware requireUserPrivileges:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor'
            });
        }
    });
};
exports.requireUserPrivileges = requireUserPrivileges;
/**
 * Middleware para verificar privilegios de validación
 */
const canValidateUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        // Verificar si tiene privilegios para validar usuarios
        const canValidate = (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.USER_CHECK_DOCUMENT) ||
            (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.USER_CHECK_EMAIL);
        if (!canValidate) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para validar usuarios'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canValidateUsers:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canValidateUsers = canValidateUsers;
