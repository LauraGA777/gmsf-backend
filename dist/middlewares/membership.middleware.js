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
exports.canViewMyMembershipBenefits = exports.canViewMyMembershipHistory = exports.canViewMyMembership = exports.canChangeMembershipStatus = exports.requireMembershipPrivileges = exports.canAccessMemberships = exports.canManageMemberships = exports.canReactivateMemberships = exports.canDeactivateMemberships = exports.canUpdateMemberships = exports.canViewMembershipDetails = exports.canSearchMemberships = exports.canCreateMemberships = exports.canViewMemberships = void 0;
const permissions_1 = require("../utils/permissions");
const rolePermissionManager_1 = __importDefault(require("../utils/rolePermissionManager"));
/**
 * Middleware para verificar privilegio de ver membresías
 */
const canViewMemberships = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.MEMBERSHIP_READ)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver membresías'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewMemberships:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewMemberships = canViewMemberships;
/**
 * Middleware para verificar privilegio de crear membresías
 */
const canCreateMemberships = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.MEMBERSHIP_CREATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para crear membresías'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canCreateMemberships:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canCreateMemberships = canCreateMemberships;
/**
 * Middleware para verificar privilegio de buscar membresías
 */
const canSearchMemberships = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.MEMBERSHIP_SEARCH)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para buscar membresías'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canSearchMemberships:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canSearchMemberships = canSearchMemberships;
/**
 * Middleware para verificar privilegio de ver detalles de membresías
 */
const canViewMembershipDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.MEMBERSHIP_DETAILS)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver detalles de membresías'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewMembershipDetails:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewMembershipDetails = canViewMembershipDetails;
/**
 * Middleware para verificar privilegio de actualizar membresías
 */
const canUpdateMemberships = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.MEMBERSHIP_UPDATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para actualizar membresías'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canUpdateMemberships:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canUpdateMemberships = canUpdateMemberships;
/**
 * Middleware para verificar privilegio de desactivar membresías
 */
const canDeactivateMemberships = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.MEMBERSHIP_DEACTIVATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para desactivar membresías'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canDeactivateMemberships:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canDeactivateMemberships = canDeactivateMemberships;
/**
 * Middleware para verificar privilegio de reactivar membresías
 */
const canReactivateMemberships = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.MEMBERSHIP_REACTIVATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para reactivar membresías'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canReactivateMemberships:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canReactivateMemberships = canReactivateMemberships;
/**
 * Middleware para verificar privilegio de gestión completa de membresías
 */
const canManageMemberships = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const hasManagementPrivilege = (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.MEMBERSHIP_CREATE) ||
            (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.MEMBERSHIP_UPDATE) ||
            (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.MEMBERSHIP_DEACTIVATE) ||
            (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.MEMBERSHIP_REACTIVATE);
        if (!hasManagementPrivilege) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para gestionar membresías'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canManageMemberships:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canManageMemberships = canManageMemberships;
/**
 * Middleware para verificar acceso a membresías (solo admin puede gestionar)
 */
const canAccessMemberships = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        // Verificar si tiene privilegio de lectura mínimo
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.MEMBERSHIP_READ)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para acceder a membresías'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canAccessMemberships:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canAccessMemberships = canAccessMemberships;
/**
 * Middleware combinado para verificar múltiples privilegios
 */
const requireMembershipPrivileges = (requiredPrivileges) => {
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
            console.error('Error en middleware requireMembershipPrivileges:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor'
            });
        }
    });
};
exports.requireMembershipPrivileges = requireMembershipPrivileges;
/**
 * Middleware para verificar privilegios específicos de estado
 */
const canChangeMembershipStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const canChangeStatus = (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.MEMBERSHIP_DEACTIVATE) ||
            (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.MEMBERSHIP_REACTIVATE);
        if (!canChangeStatus) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para cambiar el estado de membresías'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canChangeMembershipStatus:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canChangeMembershipStatus = canChangeMembershipStatus;
// Middleware para ver mi membresía activa
const canViewMyMembership = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        console.log('🔍 Verificando privilegio MEMBERSHIP_MY_VIEW para usuario:', userId);
        if (!userId) {
            console.log('❌ Usuario no autenticado');
            res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
            return;
        }
        const userInfo = yield rolePermissionManager_1.default.getUserRoleInfo(userId);
        console.log('📋 Privilegios del usuario:', userInfo.privileges);
        console.log('🎯 Privilegio requerido:', permissions_1.PRIVILEGES.MEMBERSHIP_MY_VIEW);
        // ✅ CAMBIO: Usar el privilegio específico para clientes
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.MEMBERSHIP_MY_VIEW)) {
            console.log('❌ Usuario sin privilegio MEMBERSHIP_MY_VIEW');
            res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver tu membresía'
            });
            return;
        }
        console.log('✅ Privilegio verificado correctamente');
        next();
    }
    catch (error) {
        console.error('💥 Error in canViewMyMembership middleware:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error de servidor en middleware de autorización'
        });
    }
});
exports.canViewMyMembership = canViewMyMembership;
// Middleware para ver mi historial de membresías
const canViewMyMembershipHistory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const userInfo = yield rolePermissionManager_1.default.getUserRoleInfo(userId);
        // ✅ CAMBIO: Usar el privilegio específico
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.MEMBERSHIP_MY_HISTORY)) {
            res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver tu historial de membresías'
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Error in canViewMyMembershipHistory middleware:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error de servidor en middleware de autorización'
        });
    }
});
exports.canViewMyMembershipHistory = canViewMyMembershipHistory;
// Middleware para ver beneficios de mi membresía
const canViewMyMembershipBenefits = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const userInfo = yield rolePermissionManager_1.default.getUserRoleInfo(userId);
        // ✅ CAMBIO: Usar el privilegio específico
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.MEMBERSHIP_MY_BENEFITS)) {
            res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver los beneficios de tu membresía'
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Error in canViewMyMembershipBenefits middleware:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error de servidor en middleware de autorización'
        });
    }
});
exports.canViewMyMembershipBenefits = canViewMyMembershipBenefits;
