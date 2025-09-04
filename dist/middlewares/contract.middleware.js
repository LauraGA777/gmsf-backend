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
exports.requireContractPrivileges = exports.canViewOwnContracts = exports.canManageContracts = exports.canViewContractStats = exports.canExportContracts = exports.canDeactivateContracts = exports.canActivateContracts = exports.canViewContractHistory = exports.canRenewContracts = exports.canCancelContracts = exports.canDeleteContracts = exports.canUpdateContracts = exports.canViewContractDetails = exports.canSearchContracts = exports.canCreateContracts = exports.canViewContracts = void 0;
const permissions_1 = require("../utils/permissions");
const rolePermissionManager_1 = __importDefault(require("../utils/rolePermissionManager"));
const person_model_1 = __importDefault(require("../models/person.model"));
/**
 * Middleware para verificar privilegio de ver contratos
 */
const canViewContracts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }
        // Admin y entrenador: acceso por defecto a la vista de contratos
        const isAdmin = yield rolePermissionManager_1.default.isUserAdmin(userId);
        const isTrainer = yield rolePermissionManager_1.default.isUserTrainer(userId);
        if (isAdmin || isTrainer) {
            return next();
        }
        const userInfo = yield rolePermissionManager_1.default.getUserRoleInfo(userId);
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CONTRACT_READ)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver contratos'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewContracts:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewContracts = canViewContracts;
/**
 * Middleware para verificar privilegio de crear contratos
 */
const canCreateContracts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CONTRACT_CREATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para crear contratos'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canCreateContracts:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canCreateContracts = canCreateContracts;
/**
 * Middleware para verificar privilegio de buscar contratos
 */
const canSearchContracts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CONTRACT_SEARCH)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para buscar contratos'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canSearchContracts:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canSearchContracts = canSearchContracts;
/**
 * Middleware para verificar privilegio de ver detalles de contratos
 */
const canViewContractDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }
        // Admin/entrenador pueden ver detalles
        const isAdmin = yield rolePermissionManager_1.default.isUserAdmin(userId);
        const isTrainer = yield rolePermissionManager_1.default.isUserTrainer(userId);
        if (isAdmin || isTrainer) {
            return next();
        }
        const userInfo = yield rolePermissionManager_1.default.getUserRoleInfo(userId);
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CONTRACT_DETAILS)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver detalles de contratos'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewContractDetails:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewContractDetails = canViewContractDetails;
/**
 * Middleware para verificar privilegio de actualizar contratos
 */
const canUpdateContracts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CONTRACT_UPDATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para actualizar contratos'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canUpdateContracts:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canUpdateContracts = canUpdateContracts;
/**
 * Middleware para verificar privilegio de eliminar contratos
 */
const canDeleteContracts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CONTRACT_DELETE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para eliminar contratos'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canDeleteContracts:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canDeleteContracts = canDeleteContracts;
/**
 * Middleware para verificar privilegio de cancelar contratos
 */
const canCancelContracts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CONTRACT_CANCEL)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para cancelar contratos'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canCancelContracts:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canCancelContracts = canCancelContracts;
/**
 * Middleware para verificar privilegio de renovar contratos
 */
const canRenewContracts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CONTRACT_RENEW)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para renovar contratos'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canRenewContracts:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canRenewContracts = canRenewContracts;
/**
 * Middleware para verificar privilegio de ver historial de contratos
 */
const canViewContractHistory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CONTRACT_HISTORY)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver historial de contratos'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewContractHistory:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewContractHistory = canViewContractHistory;
/**
 * Middleware para verificar privilegio de activar contratos
 */
const canActivateContracts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CONTRACT_ACTIVATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para activar contratos'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canActivateContracts:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canActivateContracts = canActivateContracts;
/**
 * Middleware para verificar privilegio de desactivar contratos
 */
const canDeactivateContracts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CONTRACT_DEACTIVATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para desactivar contratos'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canDeactivateContracts:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canDeactivateContracts = canDeactivateContracts;
/**
 * Middleware para verificar privilegio de exportar contratos
 */
const canExportContracts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CONTRACT_EXPORT)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para exportar contratos'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canExportContracts:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canExportContracts = canExportContracts;
/**
 * Middleware para verificar privilegio de ver estadísticas de contratos
 */
const canViewContractStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CONTRACT_STATS)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver estadísticas de contratos'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewContractStats:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewContractStats = canViewContractStats;
/**
 * Middleware para verificar privilegio de gestión completa de contratos
 */
const canManageContracts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const hasManagementPrivilege = (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CONTRACT_CREATE) ||
            (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CONTRACT_UPDATE) ||
            (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CONTRACT_DELETE) ||
            (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CONTRACT_CANCEL);
        if (!hasManagementPrivilege) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para gestionar contratos'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canManageContracts:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canManageContracts = canManageContracts;
/**
 * Middleware para verificar acceso a contratos propios (para clientes)
 */
const canViewOwnContracts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        console.log("🔍 DEBUG canViewOwnContracts: Usuario ID:", userId);
        if (!userId) {
            console.error("❌ DEBUG canViewOwnContracts: Usuario no autenticado");
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }
        // Permitir a administradores y entrenadores sin exigir privilegios granulares
        const isAdmin = yield rolePermissionManager_1.default.isUserAdmin(userId);
        const isTrainer = yield rolePermissionManager_1.default.isUserTrainer(userId);
        if (isAdmin || isTrainer) {
            console.log("✅ DEBUG canViewOwnContracts: Admin/Entrenador detectado, acceso permitido");
            return next();
        }
        const userInfo = yield rolePermissionManager_1.default.getUserRoleInfo(userId);
        console.log("🔍 DEBUG canViewOwnContracts: Información del usuario:", userInfo);
        // Verificar si tiene privilegio de lectura
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CONTRACT_READ)) {
            console.error("❌ DEBUG canViewOwnContracts: No tiene privilegios para leer contratos");
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver contratos'
            });
        }
        console.log("✅ DEBUG canViewOwnContracts: Usuario tiene privilegios para leer contratos");
        // Si es cliente o beneficiario, agregar filtro por id_persona
        if (userInfo.role === 'R003' || userInfo.role === 'R004') {
            console.log("🔍 DEBUG canViewOwnContracts: Usuario es cliente/beneficiario, aplicando filtro");
            try {
                // Buscar la persona que corresponde al usuario logueado
                const persona = yield person_model_1.default.findOne({
                    where: { id_usuario: userId }
                });
                console.log("🔍 DEBUG canViewOwnContracts: Persona encontrada:", persona);
                if (persona) {
                    req.userFilter = { id_persona: persona.id_persona };
                    console.log(`✅ DEBUG canViewOwnContracts: Filtro aplicado: id_persona = ${persona.id_persona}`);
                }
                else {
                    console.warn(`⚠️ DEBUG canViewOwnContracts: No se encontró persona para usuario ID: ${userId}`);
                    return res.status(404).json({
                        status: 'error',
                        message: 'No se encontró información de cliente'
                    });
                }
            }
            catch (personError) {
                console.error('❌ DEBUG canViewOwnContracts: Error buscando persona:', personError);
                return res.status(500).json({
                    status: 'error',
                    message: 'Error al verificar información del cliente'
                });
            }
        }
        else {
            console.log("🔍 DEBUG canViewOwnContracts: Usuario NO es cliente/beneficiario, no aplicando filtro");
        }
        console.log("✅ DEBUG canViewOwnContracts: Middleware completado exitosamente");
        next();
    }
    catch (error) {
        console.error('❌ DEBUG canViewOwnContracts: Error en middleware:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewOwnContracts = canViewOwnContracts;
/**
 * Middleware combinado para verificar múltiples privilegios
 */
const requireContractPrivileges = (requiredPrivileges) => {
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
            console.error('Error en middleware requireContractPrivileges:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor'
            });
        }
    });
};
exports.requireContractPrivileges = requireContractPrivileges;
