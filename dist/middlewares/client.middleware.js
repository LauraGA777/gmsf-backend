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
exports.canViewBeneficiaries = exports.canUpdateOwnClientData = exports.canViewClientDetails = exports.canAccessClientData = exports.canSearchClients = exports.canDeleteClients = exports.canUpdateClients = exports.canCreateClients = exports.canViewClients = void 0;
const permissions_1 = require("../utils/permissions");
const rolePermissionManager_1 = __importDefault(require("../utils/rolePermissionManager"));
const canViewClients = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }
        // Admins y entrenadores pueden ver clientes por defecto
        const isAdmin = yield rolePermissionManager_1.default.isUserAdmin(userId);
        const isTrainer = yield rolePermissionManager_1.default.isUserTrainer(userId);
        if (isAdmin || isTrainer) {
            return next();
        }
        const userInfo = yield rolePermissionManager_1.default.getUserRoleInfo(userId);
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CLIENT_READ)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver clientes'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewClients:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewClients = canViewClients;
const canCreateClients = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CLIENT_CREATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para crear clientes'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canCreateClients:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canCreateClients = canCreateClients;
const canUpdateClients = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CLIENT_UPDATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para actualizar clientes'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canUpdateClients:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canUpdateClients = canUpdateClients;
const canDeleteClients = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CLIENT_DELETE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para eliminar clientes'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canDeleteClients:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canDeleteClients = canDeleteClients;
const canSearchClients = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CLIENT_SEARCH_DOC)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para buscar clientes'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canSearchClients:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canSearchClients = canSearchClients;
/**
 * Middleware para verificar que un cliente puede acceder a su propia información
 * o que un administrador/entrenador puede acceder a cualquier cliente
 */
const canAccessClientData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const clientId = req.params.id || req.params.clientId; // ID del cliente desde la URL
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }
        if (!clientId) {
            return res.status(400).json({
                status: 'error',
                message: 'ID del cliente requerido'
            });
        }
        // Verificar si es administrador - acceso total
        const isAdmin = yield rolePermissionManager_1.default.isUserAdmin(userId);
        if (isAdmin) {
            return next();
        }
        const userInfo = yield rolePermissionManager_1.default.getUserRoleInfo(userId);
        // Asegúrate de que userInfo.role sea un objeto con propiedad 'codigo'
        const roleObj = typeof userInfo.role === 'string'
            ? { codigo: userInfo.role }
            : userInfo.role;
        // Si es entrenador, verificar permisos de lectura de clientes
        if ((roleObj === null || roleObj === void 0 ? void 0 : roleObj.codigo) === 'R002') { // Entrenador
            if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CLIENT_READ)) {
                return res.status(403).json({
                    status: 'error',
                    message: 'No tienes permisos para ver información de clientes'
                });
            }
            return next();
        }
        // Si es cliente o beneficiario, solo puede acceder a su propia información
        if ((roleObj === null || roleObj === void 0 ? void 0 : roleObj.codigo) === 'R003' || (roleObj === null || roleObj === void 0 ? void 0 : roleObj.codigo) === 'R004') {
            // Verificar que el usuario esté intentando acceder a su propia información
            if (userId.toString() !== clientId.toString()) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Solo puedes acceder a tu propia información'
                });
            }
            return next();
        }
        // Para cualquier otro rol, denegar acceso
        return res.status(403).json({
            status: 'error',
            message: 'No tienes permisos para acceder a esta información'
        });
    }
    catch (error) {
        console.error('Error en middleware canAccessClientData:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canAccessClientData = canAccessClientData;
/**
 * Middleware para verificar que un usuario puede ver detalles de clientes
 * (incluyendo su propia información)
 */
const canViewClientDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const clientId = req.params.id || req.params.clientId;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }
        // Verificar si es administrador
        const isAdmin = yield rolePermissionManager_1.default.isUserAdmin(userId);
        if (isAdmin) {
            return next();
        }
        const userInfo = yield rolePermissionManager_1.default.getUserRoleInfo(userId);
        // Normalizar userInfo.role para asegurar que tenga la propiedad 'codigo'
        const roleObj = typeof userInfo.role === 'string'
            ? { codigo: userInfo.role }
            : userInfo.role;
        // Si es entrenador, verificar privilegio específico
        if ((roleObj === null || roleObj === void 0 ? void 0 : roleObj.codigo) === 'R002') {
            if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CLIENT_DETAILS)) {
                return res.status(403).json({
                    status: 'error',
                    message: 'No tienes permisos para ver detalles de clientes'
                });
            }
            return next();
        }
        // Si es cliente/beneficiario y está viendo su propia información
        if (((roleObj === null || roleObj === void 0 ? void 0 : roleObj.codigo) === 'R003' || (roleObj === null || roleObj === void 0 ? void 0 : roleObj.codigo) === 'R004') &&
            clientId && userId.toString() === clientId.toString()) {
            return next();
        }
        // Si es cliente/beneficiario pero no especifica ID, permitir ver su propia info
        if (((roleObj === null || roleObj === void 0 ? void 0 : roleObj.codigo) === 'R003' || (roleObj === null || roleObj === void 0 ? void 0 : roleObj.codigo) === 'R004') && !clientId) {
            return next();
        }
        return res.status(403).json({
            status: 'error',
            message: 'No tienes permisos para ver esta información'
        });
    }
    catch (error) {
        console.error('Error en middleware canViewClientDetails:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewClientDetails = canViewClientDetails;
/**
 * Middleware para verificar que un usuario puede actualizar información de cliente
 * (incluyendo su propia información)
 */
const canUpdateOwnClientData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const clientId = req.params.id || req.params.clientId;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }
        // Verificar si es administrador
        const isAdmin = yield rolePermissionManager_1.default.isUserAdmin(userId);
        if (isAdmin) {
            return next();
        }
        const userInfo = yield rolePermissionManager_1.default.getUserRoleInfo(userId);
        // Normalizar userInfo.role para asegurar que tenga la propiedad 'codigo'
        const roleObj = typeof userInfo.role === 'string'
            ? { codigo: userInfo.role }
            : userInfo.role;
        // Si es entrenador, verificar privilegio de actualización
        if ((roleObj === null || roleObj === void 0 ? void 0 : roleObj.codigo) === 'R002') {
            if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CLIENT_UPDATE)) {
                return res.status(403).json({
                    status: 'error',
                    message: 'No tienes permisos para actualizar clientes'
                });
            }
            return next();
        }
        // Si es cliente/beneficiario, solo puede actualizar su propia información
        if (((roleObj === null || roleObj === void 0 ? void 0 : roleObj.codigo) === 'R003' || (roleObj === null || roleObj === void 0 ? void 0 : roleObj.codigo) === 'R004')) {
            if (clientId && userId.toString() !== clientId.toString()) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Solo puedes actualizar tu propia información'
                });
            }
            return next();
        }
        return res.status(403).json({
            status: 'error',
            message: 'No tienes permisos para actualizar esta información'
        });
    }
    catch (error) {
        console.error('Error en middleware canUpdateOwnClientData:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canUpdateOwnClientData = canUpdateOwnClientData;
/**
 * Middleware para verificar acceso a beneficiarios
 * Un cliente puede ver sus beneficiarios, un admin puede ver todos
 */
const canViewBeneficiaries = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const clientId = req.params.id || req.params.clientId;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }
        // Verificar si es administrador
        const isAdmin = yield rolePermissionManager_1.default.isUserAdmin(userId);
        if (isAdmin) {
            return next();
        }
        const userInfo = yield rolePermissionManager_1.default.getUserRoleInfo(userId);
        // Normalizar userInfo.role para asegurar que tenga la propiedad 'codigo'
        const roleObj = typeof userInfo.role === 'string'
            ? { codigo: userInfo.role }
            : userInfo.role;
        // Si es entrenador, verificar privilegio
        if ((roleObj === null || roleObj === void 0 ? void 0 : roleObj.codigo) === 'R002') {
            if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.CLIENT_BENEFICIARIES)) {
                return res.status(403).json({
                    status: 'error',
                    message: 'No tienes permisos para ver beneficiarios'
                });
            }
            return next();
        }
        // Si es cliente, solo puede ver sus propios beneficiarios
        if ((roleObj === null || roleObj === void 0 ? void 0 : roleObj.codigo) === 'R003') {
            if (clientId && userId.toString() !== clientId.toString()) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Solo puedes ver tus propios beneficiarios'
                });
            }
            return next();
        }
        return res.status(403).json({
            status: 'error',
            message: 'No tienes permisos para ver beneficiarios'
        });
    }
    catch (error) {
        console.error('Error en middleware canViewBeneficiaries:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewBeneficiaries = canViewBeneficiaries;
