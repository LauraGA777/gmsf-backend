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
exports.hasPermissionAndPrivilege = exports.hasAllPermissions = exports.hasAnyPermission = exports.hasPrivilege = exports.hasPermission = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const token_blacklist_1 = __importDefault(require("../utils/token-blacklist"));
const auth_controller_1 = require("../controllers/auth.controller");
const role_1 = __importDefault(require("../models/role"));
const permission_1 = __importDefault(require("../models/permission"));
const privilege_1 = __importDefault(require("../models/privilege"));
const verifyToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            res.status(401).json({
                status: 'error',
                message: 'No se proporcionó token de acceso'
            });
            return;
        }
        // Verificar si el token está en la lista negra
        if (token_blacklist_1.default.has(token)) {
            res.status(401).json({
                status: 'error',
                message: 'Token inválido o expirado'
            });
            return;
        }
        // Verificar el token
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        // Verificar si el usuario existe y obtener sus datos
        const user = yield (0, auth_controller_1.verifyUser)(decoded.userId);
        // Agregar información del usuario a la request
        req.user = user;
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        if (error.status) {
            res.status(error.status).json({
                status: 'error',
                message: error.message
            });
            return;
        }
        res.status(401).json({
            status: 'error',
            message: 'Token inválido o expirado'
        });
    }
});
exports.verifyToken = verifyToken;
// Middleware para verificar permisos específicos
const hasPermission = (permissionName) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                res.status(401).json({
                    status: 'error',
                    message: 'Usuario no autenticado'
                });
                return;
            }
            // Obtener el rol del usuario con sus permisos
            const userRole = yield role_1.default.findByPk(req.user.id_rol, {
                include: [{
                        model: permission_1.default,
                        as: 'permisos',
                        where: {
                            codigo: permissionName,
                            estado: true
                        },
                        required: false
                    }]
            });
            if (!userRole || !userRole.permisos || userRole.permisos.length === 0) {
                res.status(403).json({
                    status: 'error',
                    message: `Acceso denegado. Se requiere el permiso: ${permissionName}`
                });
                return;
            }
            next();
        }
        catch (error) {
            console.error('Error en hasPermission:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error al verificar permisos'
            });
        }
    });
};
exports.hasPermission = hasPermission;
// Middleware para verificar privilegios específicos
const hasPrivilege = (privilegeName) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                res.status(401).json({
                    status: 'error',
                    message: 'Usuario no autenticado'
                });
                return;
            }
            // Obtener el rol del usuario con sus privilegios
            const userRole = yield role_1.default.findByPk(req.user.id_rol, {
                include: [{
                        model: privilege_1.default,
                        as: 'privilegios',
                        where: {
                            nombre: privilegeName
                        },
                        required: false
                    }]
            });
            if (!userRole || !userRole.privilegios || userRole.privilegios.length === 0) {
                res.status(403).json({
                    status: 'error',
                    message: `Acceso denegado. Se requiere el privilegio: ${privilegeName}`
                });
                return;
            }
            next();
        }
        catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Error al verificar privilegios'
            });
        }
    });
};
exports.hasPrivilege = hasPrivilege;
// Middleware para verificar múltiples permisos (cualquiera de ellos)
const hasAnyPermission = (permissions) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                res.status(401).json({
                    status: 'error',
                    message: 'Usuario no autenticado'
                });
                return;
            }
            // Obtener el rol del usuario con sus permisos
            const userRole = yield role_1.default.findByPk(req.user.id_rol, {
                include: [{
                        model: permission_1.default,
                        as: 'permisos',
                        where: {
                            nombre: permissions,
                            estado: true
                        },
                        required: false
                    }]
            });
            if (!userRole || !userRole.permisos || userRole.permisos.length === 0) {
                res.status(403).json({
                    status: 'error',
                    message: `Acceso denegado. Se requiere alguno de estos permisos: ${permissions.join(', ')}`
                });
                return;
            }
            next();
        }
        catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Error al verificar permisos'
            });
        }
    });
};
exports.hasAnyPermission = hasAnyPermission;
// Middleware para verificar múltiples permisos (todos requeridos)
const hasAllPermissions = (permissions) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                res.status(401).json({
                    status: 'error',
                    message: 'Usuario no autenticado'
                });
                return;
            }
            // Obtener el rol del usuario con sus permisos
            const userRole = yield role_1.default.findByPk(req.user.id_rol, {
                include: [{
                        model: permission_1.default,
                        as: 'permisos',
                        where: {
                            estado: true
                        },
                        required: false
                    }]
            });
            if (!userRole || !userRole.permisos) {
                res.status(403).json({
                    status: 'error',
                    message: 'Acceso denegado. No se encontraron permisos para este rol'
                });
                return;
            }
            // Verificar que el usuario tenga todos los permisos requeridos
            const userPermissions = userRole.permisos.map(p => p.nombre);
            const missingPermissions = permissions.filter(p => !userPermissions.includes(p));
            if (missingPermissions.length > 0) {
                res.status(403).json({
                    status: 'error',
                    message: `Acceso denegado. Faltan los siguientes permisos: ${missingPermissions.join(', ')}`
                });
                return;
            }
            next();
        }
        catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Error al verificar permisos'
            });
        }
    });
};
exports.hasAllPermissions = hasAllPermissions;
// Middleware combinado para verificar permisos Y privilegios
const hasPermissionAndPrivilege = (permissionName, privilegeName) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                res.status(401).json({
                    status: 'error',
                    message: 'Usuario no autenticado'
                });
                return;
            }
            // Obtener el rol del usuario con permisos y privilegios
            const userRole = yield role_1.default.findByPk(req.user.id_rol, {
                include: [
                    {
                        model: permission_1.default,
                        as: 'permisos',
                        where: {
                            nombre: permissionName,
                            estado: true
                        },
                        required: false
                    },
                    {
                        model: privilege_1.default,
                        as: 'privilegios',
                        where: {
                            nombre: privilegeName
                        },
                        required: false
                    }
                ]
            });
            const hasPermission = (userRole === null || userRole === void 0 ? void 0 : userRole.permisos) && userRole.permisos.length > 0;
            const hasPrivilege = (userRole === null || userRole === void 0 ? void 0 : userRole.privilegios) && userRole.privilegios.length > 0;
            if (!hasPermission || !hasPrivilege) {
                res.status(403).json({
                    status: 'error',
                    message: `Acceso denegado. Se requiere el permiso '${permissionName}' y el privilegio '${privilegeName}'`
                });
                return;
            }
            next();
        }
        catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Error al verificar permisos y privilegios'
            });
        }
    });
};
exports.hasPermissionAndPrivilege = hasPermissionAndPrivilege;
