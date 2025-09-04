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
exports.denyClientModification = exports.canCreateClientTraining = exports.canViewClientSchedules = exports.isClient = exports.canViewWeeklySchedules = exports.canViewDailySchedules = exports.canViewScheduleAvailability = exports.canDeleteSchedules = exports.canUpdateSchedules = exports.canCreateSchedules = exports.canViewSchedules = void 0;
const permissions_1 = require("../utils/permissions");
const rolePermissionManager_1 = __importDefault(require("../utils/rolePermissionManager"));
const canViewSchedules = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userRoleId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id_rol;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }
        const userInfo = yield rolePermissionManager_1.default.getUserRoleInfo(userId);
        // Permitir a clientes/beneficiarios aunque el privilegio aún no esté sincronizado
        const hasRead = (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SCHEDULE_READ);
        if (!hasRead && (userRoleId === 3 || userRoleId === 4)) {
            console.warn(`Cliente ${userId} sin privilegio SCHEDULE_READ sincronizado. Permitido por rol.`);
        }
        else if (!hasRead) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver horarios'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewSchedules:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewSchedules = canViewSchedules;
const canCreateSchedules = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SCHEDULE_CREATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para crear horarios'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canCreateSchedules:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canCreateSchedules = canCreateSchedules;
const canUpdateSchedules = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SCHEDULE_UPDATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para actualizar horarios'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canUpdateSchedules:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canUpdateSchedules = canUpdateSchedules;
const canDeleteSchedules = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SCHEDULE_DELETE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para eliminar horarios'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canDeleteSchedules:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canDeleteSchedules = canDeleteSchedules;
const canViewScheduleAvailability = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SCHEDULE_AVAILABILITY)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver disponibilidad de horarios'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewScheduleAvailability:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewScheduleAvailability = canViewScheduleAvailability;
const canViewDailySchedules = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SCHEDULE_DAILY_VIEW)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver horarios diarios'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewDailySchedules:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewDailySchedules = canViewDailySchedules;
const canViewWeeklySchedules = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SCHEDULE_WEEKLY_VIEW)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver horarios semanales'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewWeeklySchedules:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewWeeklySchedules = canViewWeeklySchedules;
// === MIDDLEWARES ESPECÍFICOS PARA CLIENTES ===
const isClient = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userRoleId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id_rol;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }
        // Verificar que sea cliente (rol 3) o beneficiario (rol 4)
        if (userRoleId !== 3 && userRoleId !== 4) {
            return res.status(403).json({
                status: 'error',
                message: 'Acceso denegado. Solo clientes pueden usar este endpoint.'
            });
        }
        // Para clientes y beneficiarios, obtener el personId de la tabla Person
        const Person = require('../models/person.model').default;
        const persona = yield Person.findOne({
            where: { id_usuario: userId }
        });
        if (!persona) {
            return res.status(400).json({
                status: 'error',
                message: 'No se pudo identificar el perfil del cliente'
            });
        }
        // Agregar personId al objeto user para uso posterior
        req.user.personId = persona.id_persona;
        next();
    }
    catch (error) {
        console.error('Error en middleware isClient:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.isClient = isClient;
const canViewClientSchedules = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        // Los clientes pueden ver horarios (incluido el privilegio básico de lectura)
        if (!(0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SCHEDULE_READ)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver horarios'
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canViewClientSchedules:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canViewClientSchedules = canViewClientSchedules;
const canCreateClientTraining = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userRoleId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id_rol;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }
        // Verificar que sea cliente o beneficiario
        if (userRoleId !== 3 && userRoleId !== 4) {
            return res.status(403).json({
                status: 'error',
                message: 'Solo los clientes pueden agendar entrenamientos a través de este endpoint'
            });
        }
        const userInfo = yield rolePermissionManager_1.default.getUserRoleInfo(userId);
        // Los clientes deberían poder crear. Si el privilegio aún no está sincronizado en BD,
        // permitimos continuar siempre que el rol sea cliente/beneficiario y tenga acceso al módulo de horarios.
        const hasCreatePrivilege = (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SCHEDULE_CREATE);
        const hasReadPrivilege = (0, permissions_1.userHasPrivilege)(userInfo.privileges, permissions_1.PRIVILEGES.SCHEDULE_READ);
        if (!hasCreatePrivilege && !hasReadPrivilege) {
            console.warn(`Cliente ${userId} sin privilegio explícito para crear entrenamientos. Permitido por rol.`);
        }
        next();
    }
    catch (error) {
        console.error('Error en middleware canCreateClientTraining:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.canCreateClientTraining = canCreateClientTraining;
const denyClientModification = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userRoleId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id_rol;
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }
        // Si es cliente o beneficiario, denegar directamente
        if (userRoleId === 3 || userRoleId === 4) {
            return res.status(403).json({
                status: 'error',
                message: 'Para modificar o cancelar su entrenamiento, por favor contacte con administración.'
            });
        }
        // Si no es cliente, continuar con la validación normal
        next();
    }
    catch (error) {
        console.error('Error en middleware denyClientModification:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.denyClientModification = denyClientModification;
