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
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionService = void 0;
const permissions_1 = require("../utils/permissions");
class PermissionService {
    /**
     * Obtener permisos por rol
     */
    getPermissionsByRole(roleId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🔍 Obteniendo permisos para rol ID:', roleId);
                let permissions = [];
                switch (roleId) {
                    case 1: // ADMIN
                        permissions = permissions_1.PERMISSION_GROUPS.ADMIN_PERMISSIONS;
                        break;
                    case 2: // TRAINER
                        permissions = permissions_1.PERMISSION_GROUPS.TRAINER_PERMISSIONS;
                        break;
                    case 3: // CLIENT
                        permissions = permissions_1.PERMISSION_GROUPS.CLIENT_PERMISSIONS;
                        break;
                    case 4: // BENEFICIARY
                        permissions = permissions_1.PERMISSION_GROUPS.BENEFICIARY_PERMISSIONS;
                        break;
                    default:
                        console.warn('⚠️ Rol desconocido:', roleId);
                        permissions = [];
                        break;
                }
                console.log('✅ Permisos encontrados:', permissions.length);
                return permissions;
            }
            catch (error) {
                console.error('❌ Error al obtener permisos por rol:', error);
                throw error;
            }
        });
    }
    /**
     * Obtener privilegios por rol
     */
    getPrivilegesByRole(roleId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let privileges = [];
                switch (roleId) {
                    case 1: // ADMIN
                        privileges = permissions_1.PRIVILEGE_GROUPS.ADMIN_PRIVILEGES;
                        break;
                    case 2: // TRAINER
                        privileges = permissions_1.PRIVILEGE_GROUPS.TRAINER_PRIVILEGES;
                        break;
                    case 3: // CLIENT
                        privileges = permissions_1.PRIVILEGE_GROUPS.CLIENT_PRIVILEGES;
                        break;
                    case 4: // BENEFICIARY
                        privileges = permissions_1.PRIVILEGE_GROUPS.BENEFICIARY_PRIVILEGES;
                        break;
                    default:
                        privileges = [];
                        break;
                }
                return privileges;
            }
            catch (error) {
                console.error('❌ Error al obtener privilegios por rol:', error);
                throw error;
            }
        });
    }
    /**
     * Generar hash de permisos
     */
    generatePermissionsHash(permissions) {
        return Buffer.from(JSON.stringify(permissions.sort())).toString('base64');
    }
    /**
     * Obtener módulos accesibles por rol
     */
    getAccessibleModulesByRole(roleId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const permissions = yield this.getPermissionsByRole(roleId);
                // Mapear permisos a módulos únicos
                const modules = [...new Set(permissions.map(permission => {
                        // Extraer el módulo base del permiso
                        return permission.split('_')[0] || permission;
                    }))];
                return modules;
            }
            catch (error) {
                console.error('❌ Error al obtener módulos accesibles:', error);
                throw error;
            }
        });
    }
    /**
     * Verificar si un rol tiene acceso a un módulo
     */
    hasModuleAccess(roleId, moduleName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const permissions = yield this.getPermissionsByRole(roleId);
                return permissions.includes(moduleName);
            }
            catch (error) {
                console.error('❌ Error al verificar acceso al módulo:', error);
                return false;
            }
        });
    }
    /**
     * Verificar si un rol tiene un privilegio específico
     */
    hasPrivilege(roleId, privilegeName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const privileges = yield this.getPrivilegesByRole(roleId);
                return privileges.includes(privilegeName);
            }
            catch (error) {
                console.error('❌ Error al verificar privilegio:', error);
                return false;
            }
        });
    }
}
exports.permissionService = new PermissionService();
