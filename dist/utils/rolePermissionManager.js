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
exports.RolePermissionManager = void 0;
const role_1 = __importDefault(require("../models/role"));
const permission_1 = __importDefault(require("../models/permission"));
const privilege_1 = __importDefault(require("../models/privilege"));
const user_1 = __importDefault(require("../models/user"));
const permissions_1 = require("./permissions");
class RolePermissionManager {
    /**
     * No necesita crear permisos básicos - ya están en BD
     * Solo verifica que existan
     */
    static verifyBasicPermissions() {
        return __awaiter(this, void 0, void 0, function* () {
            const permissionsList = Object.values(permissions_1.PERMISSIONS);
            for (const permission of permissionsList) {
                try {
                    const exists = yield permission_1.default.findOne({
                        where: { codigo: permission }
                    });
                    if (!exists) {
                        console.warn(`Permiso ${permission} no encontrado en BD`);
                    }
                }
                catch (error) {
                    console.error(`Error verificando permiso ${permission}:`, error);
                }
            }
        });
    }
    /**
     * No necesita crear privilegios básicos - ya están en BD
     * Solo verifica que existan
     */
    static verifyBasicPrivileges() {
        return __awaiter(this, void 0, void 0, function* () {
            const privilegesList = Object.values(permissions_1.PRIVILEGES);
            for (const privilege of privilegesList) {
                try {
                    const exists = yield privilege_1.default.findOne({
                        where: { codigo: privilege }
                    });
                    if (!exists) {
                        console.warn(`Privilegio ${privilege} no encontrado en BD`);
                    }
                }
                catch (error) {
                    console.error(`Error verificando privilegio ${privilege}:`, error);
                }
            }
        });
    }
    /**
     * Asigna permisos a un rol específico usando códigos de BD
     */
    static assignPermissionsToRole(roleCodigo, permissions) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const role = yield role_1.default.findOne({
                    where: { codigo: roleCodigo }
                });
                if (!role) {
                    throw new Error(`Rol con código ${roleCodigo} no encontrado`);
                }
                const permissionRecords = yield permission_1.default.findAll({
                    where: {
                        codigo: permissions,
                        estado: true
                    }
                });
                if (permissionRecords.length !== permissions.length) {
                    const foundPermissions = permissionRecords.map((p) => p.codigo);
                    const missingPermissions = permissions.filter(p => !foundPermissions.includes(p));
                    throw new Error(`Permisos no encontrados: ${missingPermissions.join(', ')}`);
                }
                // Usar any para evitar problemas de tipado de Sequelize
                yield role.setPermisos(permissionRecords);
            }
            catch (error) {
                console.error(`Error asignando permisos al rol ${roleCodigo}:`, error);
                throw error;
            }
        });
    }
    /**
     * Asigna privilegios a un rol específico usando códigos de BD
     */
    static assignPrivilegesToRole(roleCodigo, privileges) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const role = yield role_1.default.findOne({
                    where: { codigo: roleCodigo }
                });
                if (!role) {
                    throw new Error(`Rol con código ${roleCodigo} no encontrado`);
                }
                const privilegeRecords = yield privilege_1.default.findAll({
                    where: {
                        codigo: privileges
                    }
                });
                if (privilegeRecords.length !== privileges.length) {
                    const foundPrivileges = privilegeRecords.map((p) => p.codigo);
                    const missingPrivileges = privileges.filter(p => !foundPrivileges.includes(p));
                    throw new Error(`Privilegios no encontrados: ${missingPrivileges.join(', ')}`);
                }
                // Usar any para evitar problemas de tipado de Sequelize
                yield role.setPrivilegios(privilegeRecords);
            }
            catch (error) {
                console.error(`Error asignando privilegios al rol ${roleCodigo}:`, error);
                throw error;
            }
        });
    }
    /**
     * Configura roles con permisos de BD (ya existentes)
     */
    static setupDefaultRoles() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Iniciando configuración de roles...');
                // Verificar que permisos y privilegios existan
                yield this.verifyBasicPermissions();
                yield this.verifyBasicPrivileges();
                // Configurar Administrador
                console.log('Configurando rol Administrador...');
                yield this.assignPermissionsToRole('R001', permissions_1.PERMISSION_GROUPS.ADMIN_PERMISSIONS);
                yield this.assignPrivilegesToRole('R001', permissions_1.PRIVILEGE_GROUPS.ADMIN_PRIVILEGES);
                // Configurar Entrenador  
                console.log('Configurando rol Entrenador...');
                yield this.assignPermissionsToRole('R002', permissions_1.PERMISSION_GROUPS.TRAINER_PERMISSIONS);
                yield this.assignPrivilegesToRole('R002', permissions_1.PRIVILEGE_GROUPS.TRAINER_PRIVILEGES);
                // Configurar Cliente
                console.log('Configurando rol Cliente...');
                yield this.assignPermissionsToRole('R003', permissions_1.PERMISSION_GROUPS.CLIENT_PERMISSIONS);
                yield this.assignPrivilegesToRole('R003', permissions_1.PRIVILEGE_GROUPS.CLIENT_PRIVILEGES);
                // Configurar Beneficiario
                console.log('Configurando rol Beneficiario...');
                yield this.assignPermissionsToRole('R004', permissions_1.PERMISSION_GROUPS.BENEFICIARY_PERMISSIONS);
                yield this.assignPrivilegesToRole('R004', permissions_1.PRIVILEGE_GROUPS.BENEFICIARY_PRIVILEGES);
                console.log('✅ Roles configurados exitosamente con permisos de BD');
            }
            catch (error) {
                console.error('❌ Error configurando roles:', error);
                throw error;
            }
        });
    }
    /**
     * Obtiene todos los permisos de un usuario a través de su rol
     */
    static getUserPermissions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const user = yield user_1.default.findOne({
                    where: { id: userId },
                    include: [{
                            model: role_1.default,
                            as: 'rol',
                            include: [{
                                    model: permission_1.default,
                                    as: 'permisos',
                                    where: { estado: true },
                                    required: false
                                }]
                        }]
                });
                const typedUser = user;
                return ((_b = (_a = typedUser === null || typedUser === void 0 ? void 0 : typedUser.rol) === null || _a === void 0 ? void 0 : _a.permisos) === null || _b === void 0 ? void 0 : _b.map((p) => p.codigo)) || [];
            }
            catch (error) {
                console.error(`Error obteniendo permisos del usuario ${userId}:`, error);
                return [];
            }
        });
    }
    /**
     * Obtiene todos los privilegios de un usuario a través de su rol
     */
    static getUserPrivileges(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const user = yield user_1.default.findOne({
                    where: { id: userId },
                    include: [{
                            model: role_1.default,
                            as: 'rol',
                            include: [{
                                    model: privilege_1.default,
                                    as: 'privilegios',
                                    required: false
                                }]
                        }]
                });
                const typedUser = user;
                return ((_b = (_a = typedUser === null || typedUser === void 0 ? void 0 : typedUser.rol) === null || _a === void 0 ? void 0 : _a.privilegios) === null || _b === void 0 ? void 0 : _b.map((p) => p.codigo)) || [];
            }
            catch (error) {
                console.error(`Error obteniendo privilegios del usuario ${userId}:`, error);
                return [];
            }
        });
    }
    /**
     * Verifica si un usuario tiene un permiso específico
     */
    static userHasPermission(userId, permission) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userPermissions = yield this.getUserPermissions(userId);
                return userPermissions.includes(permission);
            }
            catch (error) {
                console.error(`Error verificando permiso ${permission} para usuario ${userId}:`, error);
                return false;
            }
        });
    }
    /**
     * Verifica si un usuario tiene un privilegio específico
     */
    static userHasPrivilege(userId, privilege) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userPrivileges = yield this.getUserPrivileges(userId);
                return userPrivileges.includes(privilege);
            }
            catch (error) {
                console.error(`Error verificando privilegio ${privilege} para usuario ${userId}:`, error);
                return false;
            }
        });
    }
    /**
     * Verifica si un usuario puede realizar una acción específica
     */
    static userCanPerformAction(userId, requiredPermission, requiredPrivilege) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hasPermission = yield this.userHasPermission(userId, requiredPermission);
                if (!requiredPrivilege) {
                    return hasPermission;
                }
                const hasPrivilege = yield this.userHasPrivilege(userId, requiredPrivilege);
                return hasPermission && hasPrivilege;
            }
            catch (error) {
                console.error(`Error verificando acción para usuario ${userId}:`, error);
                return false;
            }
        });
    }
    /**
     * Verifica si un usuario tiene cualquiera de varios permisos
     */
    static userHasAnyPermission(userId, permissions) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userPermissions = yield this.getUserPermissions(userId);
                return permissions.some(permission => userPermissions.includes(permission));
            }
            catch (error) {
                console.error(`Error verificando permisos múltiples para usuario ${userId}:`, error);
                return false;
            }
        });
    }
    /**
     * Verifica si un usuario tiene cualquiera de varios privilegios
     */
    static userHasAnyPrivilege(userId, privileges) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userPrivileges = yield this.getUserPrivileges(userId);
                return privileges.some(privilege => userPrivileges.includes(privilege));
            }
            catch (error) {
                console.error(`Error verificando privilegios múltiples para usuario ${userId}:`, error);
                return false;
            }
        });
    }
    /**
     * Verifica si un usuario tiene todos los permisos especificados
     */
    static userHasAllPermissions(userId, permissions) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userPermissions = yield this.getUserPermissions(userId);
                return permissions.every(permission => userPermissions.includes(permission));
            }
            catch (error) {
                console.error(`Error verificando todos los permisos para usuario ${userId}:`, error);
                return false;
            }
        });
    }
    /**
     * Verifica si un usuario tiene todos los privilegios especificados
     */
    static userHasAllPrivileges(userId, privileges) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userPrivileges = yield this.getUserPrivileges(userId);
                return privileges.every(privilege => userPrivileges.includes(privilege));
            }
            catch (error) {
                console.error(`Error verificando todos los privilegios para usuario ${userId}:`, error);
                return false;
            }
        });
    }
    /**
     * Obtiene información completa de un usuario con sus permisos y privilegios
     */
    static getUserRoleInfo(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_1.default.findOne({
                    where: { id: userId },
                    include: [{
                            model: role_1.default,
                            as: 'rol',
                            include: [
                                {
                                    model: permission_1.default,
                                    as: 'permisos',
                                    where: { estado: true },
                                    required: false
                                },
                                {
                                    model: privilege_1.default,
                                    as: 'privilegios',
                                    required: false
                                }
                            ]
                        }]
                });
                if (!user || !user.rol) {
                    return {
                        role: '',
                        permissions: [],
                        privileges: []
                    };
                }
                return {
                    role: user.rol.codigo || '',
                    permissions: (user.rol.permisos || []).map((p) => p.codigo),
                    privileges: (user.rol.privilegios || []).map((p) => p.codigo)
                };
            }
            catch (error) {
                console.error(`Error obteniendo información de rol del usuario ${userId}:`, error);
                return {
                    role: '',
                    permissions: [],
                    privileges: []
                };
            }
        });
    }
    /**
     * Verifica si un usuario puede realizar acciones específicas del controlador User
     */
    static canUserManageUsers(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [canView, canCreate, canUpdate, canDelete, canActivate, canDeactivate, canSearch, canViewRoles, canAssignRoles] = yield Promise.all([
                    this.userCanPerformAction(userId, permissions_1.PERMISSIONS.VIEW_USERS, permissions_1.PRIVILEGES.USER_READ),
                    this.userCanPerformAction(userId, permissions_1.PERMISSIONS.CREATE_USERS, permissions_1.PRIVILEGES.USER_CREATE),
                    this.userCanPerformAction(userId, permissions_1.PERMISSIONS.UPDATE_USERS, permissions_1.PRIVILEGES.USER_UPDATE),
                    this.userCanPerformAction(userId, permissions_1.PERMISSIONS.DELETE_USERS, permissions_1.PRIVILEGES.USER_DELETE),
                    this.userCanPerformAction(userId, permissions_1.PERMISSIONS.ACTIVATE_USERS, permissions_1.PRIVILEGES.USER_ACTIVATE),
                    this.userCanPerformAction(userId, permissions_1.PERMISSIONS.DEACTIVATE_USERS, permissions_1.PRIVILEGES.USER_DEACTIVATE),
                    this.userCanPerformAction(userId, permissions_1.PERMISSIONS.VIEW_USERS, permissions_1.PRIVILEGES.USER_SEARCH),
                    this.userCanPerformAction(userId, permissions_1.PERMISSIONS.MANAGE_ROLES, permissions_1.PRIVILEGES.USER_VIEW_ROLES),
                    this.userCanPerformAction(userId, permissions_1.PERMISSIONS.MANAGE_ROLES, permissions_1.PRIVILEGES.USER_ASSIGN_ROLES)
                ]);
                return {
                    canView,
                    canCreate,
                    canUpdate,
                    canDelete,
                    canActivate,
                    canDeactivate,
                    canSearch,
                    canViewRoles,
                    canAssignRoles
                };
            }
            catch (error) {
                console.error(`Error verificando capacidades de gestión de usuarios para ${userId}:`, error);
                return {
                    canView: false,
                    canCreate: false,
                    canUpdate: false,
                    canDelete: false,
                    canActivate: false,
                    canDeactivate: false,
                    canSearch: false,
                    canViewRoles: false,
                    canAssignRoles: false
                };
            }
        });
    }
    /**
     * Obtiene los permisos del usuario filtrados por módulo
     */
    static getUserPermissionsByModule(userId, module) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allPermissions = yield this.getUserPermissions(userId);
                return allPermissions.filter(permission => permission === module);
            }
            catch (error) {
                console.error(`Error obteniendo permisos del módulo ${module} para usuario ${userId}:`, error);
                return [];
            }
        });
    }
    /**
     * Verifica si un usuario es administrador
     */
    static isUserAdmin(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_1.default.findByPk(userId, {
                    include: [{
                            model: role_1.default,
                            as: 'rol',
                            attributes: ['codigo', 'estado']
                        }]
                });
                if (!user || !user.rol) {
                    return false;
                }
                const role = user.rol;
                return role.codigo === 'R001' && role.estado === true;
            }
            catch (error) {
                console.error('Error verificando si es admin:', error);
                return false;
            }
        });
    }
    /**
     * Verifica si un usuario es entrenador
     */
    static isUserTrainer(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userInfo = yield this.getUserRoleInfo(userId);
                return userInfo.role === 'R002'; // Código de Entrenador
            }
            catch (error) {
                console.error(`Error verificando si usuario ${userId} es entrenador:`, error);
                return false;
            }
        });
    }
    /**
     * Verifica si un usuario es cliente
     */
    static isUserClient(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userInfo = yield this.getUserRoleInfo(userId);
                return userInfo.role === 'R003'; // Código de Cliente
            }
            catch (error) {
                console.error(`Error verificando si usuario ${userId} es cliente:`, error);
                return false;
            }
        });
    }
    /**
     * Verifica si un usuario es beneficiario
     */
    static isUserBeneficiary(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userInfo = yield this.getUserRoleInfo(userId);
                return userInfo.role === 'R004'; // Código de Beneficiario
            }
            catch (error) {
                console.error(`Error verificando si usuario ${userId} es beneficiario:`, error);
                return false;
            }
        });
    }
    /**
     * Obtiene el código del rol de un usuario
     */
    static getUserRoleCode(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userInfo = yield this.getUserRoleInfo(userId);
                return userInfo.role || null;
            }
            catch (error) {
                console.error(`Error obteniendo código de rol para usuario ${userId}:`, error);
                return null;
            }
        });
    }
    /**
     * Método helper para validar acceso a recursos propios
     */
    static canAccessOwnResource(userId, resourceOwnerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Los administradores y entrenadores pueden acceder a cualquier recurso
                const isAdmin = yield this.isUserAdmin(userId);
                const isTrainer = yield this.isUserTrainer(userId);
                if (isAdmin || isTrainer) {
                    return true;
                }
                // Clientes y beneficiarios solo pueden acceder a sus propios recursos
                return userId === resourceOwnerId;
            }
            catch (error) {
                console.error(`Error verificando acceso a recurso propio:`, error);
                return false;
            }
        });
    }
    static getUserPermissionsCached(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cached = this.userPermissionsCache.get(userId);
            const now = Date.now();
            if (cached && (now - cached.timestamp) < this.CACHE_EXPIRY) {
                return {
                    permissions: cached.permissions,
                    privileges: cached.privileges
                };
            }
            // Obtener permisos frescos
            const [permissions, privileges] = yield Promise.all([
                this.getUserPermissions(userId),
                this.getUserPrivileges(userId)
            ]);
            // Guardar en caché
            this.userPermissionsCache.set(userId, {
                permissions,
                privileges,
                timestamp: now
            });
            return { permissions, privileges };
        });
    }
    /**
     * Limpia la caché de permisos (llamar cuando se actualicen roles/permisos)
     */
    static clearPermissionsCache(userId) {
        if (userId) {
            this.userPermissionsCache.delete(userId);
        }
        else {
            this.userPermissionsCache.clear();
        }
    }
    /**
     * Middleware helper para verificar permisos de forma eficiente
     */
    static checkUserAccess(userId, requiredPermission, requiredPrivilege) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { permissions, privileges } = yield this.getUserPermissionsCached(userId);
                const hasPermission = permissions.includes(requiredPermission);
                if (!hasPermission) {
                    return {
                        hasAccess: false,
                        reason: `Usuario no tiene el permiso: ${requiredPermission}`
                    };
                }
                if (requiredPrivilege) {
                    const hasPrivilege = privileges.includes(requiredPrivilege);
                    if (!hasPrivilege) {
                        return {
                            hasAccess: false,
                            reason: `Usuario no tiene el privilegio: ${requiredPrivilege}`
                        };
                    }
                }
                return { hasAccess: true };
            }
            catch (error) {
                console.error(`Error verificando acceso para usuario ${userId}:`, error);
                return {
                    hasAccess: false,
                    reason: 'Error interno verificando permisos'
                };
            }
        });
    }
}
exports.RolePermissionManager = RolePermissionManager;
/**
 * Carga en caché los permisos de un usuario (para optimización)
 */
RolePermissionManager.userPermissionsCache = new Map();
RolePermissionManager.CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutos
exports.default = RolePermissionManager;
