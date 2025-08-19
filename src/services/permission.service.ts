import { PERMISSION_GROUPS, PRIVILEGE_GROUPS } from '../utils/permissions';

class PermissionService {

    /**
     * Obtener permisos por rol
     */
    async getPermissionsByRole(roleId: number): Promise<string[]> {
        try {
            console.log('🔍 Obteniendo permisos para rol ID:', roleId);

            let permissions: string[] = [];

            switch (roleId) {
                case 1: // ADMIN
                    permissions = PERMISSION_GROUPS.ADMIN_PERMISSIONS;
                    break;
                case 2: // TRAINER
                    permissions = PERMISSION_GROUPS.TRAINER_PERMISSIONS;
                    break;
                case 3: // CLIENT
                    permissions = PERMISSION_GROUPS.CLIENT_PERMISSIONS;
                    break;
                case 4: // BENEFICIARY
                    permissions = PERMISSION_GROUPS.BENEFICIARY_PERMISSIONS;
                    break;
                default:
                    console.warn('⚠️ Rol desconocido:', roleId);
                    permissions = [];
                    break;
            }

            console.log('✅ Permisos encontrados:', permissions.length);
            return permissions;

        } catch (error) {
            console.error('❌ Error al obtener permisos por rol:', error);
            throw error;
        }
    }

    /**
     * Obtener privilegios por rol
     */
    async getPrivilegesByRole(roleId: number): Promise<string[]> {
        try {
            let privileges: string[] = [];

            switch (roleId) {
                case 1: // ADMIN
                    privileges = PRIVILEGE_GROUPS.ADMIN_PRIVILEGES;
                    break;
                case 2: // TRAINER
                    privileges = PRIVILEGE_GROUPS.TRAINER_PRIVILEGES;
                    break;
                case 3: // CLIENT
                    privileges = PRIVILEGE_GROUPS.CLIENT_PRIVILEGES;
                    break;
                case 4: // BENEFICIARY
                    privileges = PRIVILEGE_GROUPS.BENEFICIARY_PRIVILEGES;
                    break;
                default:
                    privileges = [];
                    break;
            }

            return privileges;

        } catch (error) {
            console.error('❌ Error al obtener privilegios por rol:', error);
            throw error;
        }
    }

    /**
     * Generar hash de permisos
     */
    generatePermissionsHash(permissions: string[]): string {
        return Buffer.from(JSON.stringify(permissions.sort())).toString('base64');
    }

    /**
     * Obtener módulos accesibles por rol
     */
    async getAccessibleModulesByRole(roleId: number): Promise<string[]> {
        try {
            const permissions = await this.getPermissionsByRole(roleId);

            // Mapear permisos a módulos únicos
            const modules = [...new Set(permissions.map(permission => {
                // Extraer el módulo base del permiso
                return permission.split('_')[0] || permission;
            }))];

            return modules;

        } catch (error) {
            console.error('❌ Error al obtener módulos accesibles:', error);
            throw error;
        }
    }

    /**
     * Verificar si un rol tiene acceso a un módulo
     */
    async hasModuleAccess(roleId: number, moduleName: string): Promise<boolean> {
        try {
            const permissions = await this.getPermissionsByRole(roleId);
            return permissions.includes(moduleName);
        } catch (error) {
            console.error('❌ Error al verificar acceso al módulo:', error);
            return false;
        }
    }

    /**
     * Verificar si un rol tiene un privilegio específico
     */
    async hasPrivilege(roleId: number, privilegeName: string): Promise<boolean> {
        try {
            const privileges = await this.getPrivilegesByRole(roleId);
            return privileges.includes(privilegeName);
        } catch (error) {
            console.error('❌ Error al verificar privilegio:', error);
            return false;
        }
    }
}

export const permissionService = new PermissionService();