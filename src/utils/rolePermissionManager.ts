import Role from '../models/role';
import Permission from '../models/permission';
import Privilege from '../models/privilege';
import User from '../models/user';
import { PERMISSIONS, PRIVILEGES, PERMISSION_GROUPS, PRIVILEGE_GROUPS } from './permissions';

// Interfaces para el tipado correcto
interface PermissionInstance {
    codigo: string;
    id: number;
    nombre: string;
    estado: boolean;
}

interface PrivilegeInstance {
    codigo: string;
    id: number;
    nombre: string;
}

interface RoleInstanceWithPermissions {
    permisos?: PermissionInstance[];
}

interface RoleInstanceWithPrivileges {
    privilegios?: PrivilegeInstance[];
}

interface UserInstanceWithRole {
    rol?: RoleInstanceWithPermissions;
}

interface UserInstanceWithRolePrivileges {
    rol?: RoleInstanceWithPrivileges;
}

export class RolePermissionManager {
    
    /**
     * No necesita crear permisos básicos - ya están en BD
     * Solo verifica que existan
     */
    static async verifyBasicPermissions(): Promise<void> {
        const permissionsList = Object.values(PERMISSIONS);
        
        for (const permission of permissionsList) {
            try {
                const exists = await Permission.findOne({
                    where: { codigo: permission }
                });
                
                if (!exists) {
                    console.warn(`Permiso ${permission} no encontrado en BD`);
                }
            } catch (error) {
                console.error(`Error verificando permiso ${permission}:`, error);
            }
        }
    }

    /**
     * No necesita crear privilegios básicos - ya están en BD
     * Solo verifica que existan
     */
    static async verifyBasicPrivileges(): Promise<void> {
        const privilegesList = Object.values(PRIVILEGES);
        
        for (const privilege of privilegesList) {
            try {
                const exists = await Privilege.findOne({
                    where: { codigo: privilege }
                });
                
                if (!exists) {
                    console.warn(`Privilegio ${privilege} no encontrado en BD`);
                }
            } catch (error) {
                console.error(`Error verificando privilegio ${privilege}:`, error);
            }
        }
    }

    /**
     * Asigna permisos a un rol específico usando códigos de BD
     */
    static async assignPermissionsToRole(roleCodigo: string, permissions: string[]): Promise<void> {
        try {
            const role = await Role.findOne({
                where: { codigo: roleCodigo }
            });

            if (!role) {
                throw new Error(`Rol con código ${roleCodigo} no encontrado`);
            }

            const permissionRecords = await Permission.findAll({
                where: {
                    codigo: permissions,
                    estado: true
                }
            });

            if (permissionRecords.length !== permissions.length) {
                const foundPermissions = permissionRecords.map((p: any) => p.codigo);
                const missingPermissions = permissions.filter(p => !foundPermissions.includes(p));
                throw new Error(`Permisos no encontrados: ${missingPermissions.join(', ')}`);
            }

            // Usar any para evitar problemas de tipado de Sequelize
            await (role as any).setPermisos(permissionRecords);
        } catch (error) {
            console.error(`Error asignando permisos al rol ${roleCodigo}:`, error);
            throw error;
        }
    }

    /**
     * Asigna privilegios a un rol específico usando códigos de BD
     */
    static async assignPrivilegesToRole(roleCodigo: string, privileges: string[]): Promise<void> {
        try {
            const role = await Role.findOne({
                where: { codigo: roleCodigo }
            });

            if (!role) {
                throw new Error(`Rol con código ${roleCodigo} no encontrado`);
            }

            const privilegeRecords = await Privilege.findAll({
                where: {
                    codigo: privileges
                }
            });

            if (privilegeRecords.length !== privileges.length) {
                const foundPrivileges = privilegeRecords.map((p: any) => p.codigo);
                const missingPrivileges = privileges.filter(p => !foundPrivileges.includes(p));
                throw new Error(`Privilegios no encontrados: ${missingPrivileges.join(', ')}`);
            }

            // Usar any para evitar problemas de tipado de Sequelize
            await (role as any).setPrivilegios(privilegeRecords);
        } catch (error) {
            console.error(`Error asignando privilegios al rol ${roleCodigo}:`, error);
            throw error;
        }
    }

    /**
     * Configura roles con permisos de BD (ya existentes)
     */
    static async setupDefaultRoles(): Promise<void> {
        try {
            console.log('Iniciando configuración de roles...');

            // Verificar que permisos y privilegios existan
            await this.verifyBasicPermissions();
            await this.verifyBasicPrivileges();

            // Configurar Administrador
            console.log('Configurando rol Administrador...');
            await this.assignPermissionsToRole('R001', PERMISSION_GROUPS.ADMIN_PERMISSIONS);
            await this.assignPrivilegesToRole('R001', PRIVILEGE_GROUPS.ADMIN_PRIVILEGES);

            // Configurar Entrenador  
            console.log('Configurando rol Entrenador...');
            await this.assignPermissionsToRole('R002', PERMISSION_GROUPS.TRAINER_PERMISSIONS);
            await this.assignPrivilegesToRole('R002', PRIVILEGE_GROUPS.TRAINER_PRIVILEGES);

            // Configurar Cliente
            console.log('Configurando rol Cliente...');
            await this.assignPermissionsToRole('R003', PERMISSION_GROUPS.CLIENT_PERMISSIONS);
            await this.assignPrivilegesToRole('R003', PRIVILEGE_GROUPS.CLIENT_PRIVILEGES);

            // Configurar Beneficiario
            console.log('Configurando rol Beneficiario...');
            await this.assignPermissionsToRole('R004', PERMISSION_GROUPS.BENEFICIARY_PERMISSIONS);
            await this.assignPrivilegesToRole('R004', PRIVILEGE_GROUPS.BENEFICIARY_PRIVILEGES);

            console.log('✅ Roles configurados exitosamente con permisos de BD');
        } catch (error) {
            console.error('❌ Error configurando roles:', error);
            throw error;
        }
    }

    /**
     * Obtiene todos los permisos de un usuario a través de su rol
     */
    static async getUserPermissions(userId: number): Promise<string[]> {
        try {
            const user = await User.findOne({
                where: { id: userId },
                include: [{
                    model: Role,
                    as: 'rol',
                    include: [{
                        model: Permission,
                        as: 'permisos',
                        where: { estado: true },
                        required: false
                    }]
                }]
            });

            const typedUser = user as UserInstanceWithRole | null;
            return typedUser?.rol?.permisos?.map((p: PermissionInstance) => p.codigo) || [];
        } catch (error) {
            console.error(`Error obteniendo permisos del usuario ${userId}:`, error);
            return [];
        }
    }

    /**
     * Obtiene todos los privilegios de un usuario a través de su rol
     */
    static async getUserPrivileges(userId: number): Promise<string[]> {
        try {
            const user = await User.findOne({
                where: { id: userId },
                include: [{
                    model: Role,
                    as: 'rol',
                    include: [{
                        model: Privilege,
                        as: 'privilegios',
                        required: false
                    }]
                }]
            });

            const typedUser = user as UserInstanceWithRolePrivileges | null;
            return typedUser?.rol?.privilegios?.map((p: PrivilegeInstance) => p.codigo) || [];
        } catch (error) {
            console.error(`Error obteniendo privilegios del usuario ${userId}:`, error);
            return [];
        }
    }

    /**
     * Verifica si un usuario tiene un permiso específico
     */
    static async userHasPermission(userId: number, permission: string): Promise<boolean> {
        try {
            const userPermissions = await this.getUserPermissions(userId);
            return userPermissions.includes(permission);
        } catch (error) {
            console.error(`Error verificando permiso ${permission} para usuario ${userId}:`, error);
            return false;
        }
    }

    /**
     * Verifica si un usuario tiene un privilegio específico
     */
    static async userHasPrivilege(userId: number, privilege: string): Promise<boolean> {
        try {
            const userPrivileges = await this.getUserPrivileges(userId);
            return userPrivileges.includes(privilege);
        } catch (error) {
            console.error(`Error verificando privilegio ${privilege} para usuario ${userId}:`, error);
            return false;
        }
    }

    /**
     * Verifica si un usuario puede realizar una acción específica
     */
    static async userCanPerformAction(userId: number, requiredPermission: string, requiredPrivilege?: string): Promise<boolean> {
        try {
            const hasPermission = await this.userHasPermission(userId, requiredPermission);
            
            if (!requiredPrivilege) {
                return hasPermission;
            }
            
            const hasPrivilege = await this.userHasPrivilege(userId, requiredPrivilege);
            return hasPermission && hasPrivilege;
        } catch (error) {
            console.error(`Error verificando acción para usuario ${userId}:`, error);
            return false;
        }
    }

    /**
     * Verifica si un usuario tiene cualquiera de varios permisos
     */
    static async userHasAnyPermission(userId: number, permissions: string[]): Promise<boolean> {
        try {
            const userPermissions = await this.getUserPermissions(userId);
            return permissions.some(permission => userPermissions.includes(permission));
        } catch (error) {
            console.error(`Error verificando permisos múltiples para usuario ${userId}:`, error);
            return false;
        }
    }

    /**
     * Verifica si un usuario tiene cualquiera de varios privilegios
     */
    static async userHasAnyPrivilege(userId: number, privileges: string[]): Promise<boolean> {
        try {
            const userPrivileges = await this.getUserPrivileges(userId);
            return privileges.some(privilege => userPrivileges.includes(privilege));
        } catch (error) {
            console.error(`Error verificando privilegios múltiples para usuario ${userId}:`, error);
            return false;
        }
    }

    /**
     * Verifica si un usuario tiene todos los permisos especificados
     */
    static async userHasAllPermissions(userId: number, permissions: string[]): Promise<boolean> {
        try {
            const userPermissions = await this.getUserPermissions(userId);
            return permissions.every(permission => userPermissions.includes(permission));
        } catch (error) {
            console.error(`Error verificando todos los permisos para usuario ${userId}:`, error);
            return false;
        }
    }

    /**
     * Verifica si un usuario tiene todos los privilegios especificados
     */
    static async userHasAllPrivileges(userId: number, privileges: string[]): Promise<boolean> {
        try {
            const userPrivileges = await this.getUserPrivileges(userId);
            return privileges.every(privilege => userPrivileges.includes(privilege));
        } catch (error) {
            console.error(`Error verificando todos los privilegios para usuario ${userId}:`, error);
            return false;
        }
    }

    /**
     * Obtiene información completa de un usuario con sus permisos y privilegios
     */
    static async getUserRoleInfo(userId: number): Promise<{
        role: string;
        permissions: string[];
        privileges: string[];
    }> {
        try {
            const user = await User.findOne({
                where: { id: userId },
                include: [{
                    model: Role,
                    as: 'rol',
                    include: [
                        {
                            model: Permission,
                            as: 'permisos',
                            where: { estado: true },
                            required: false
                        },
                        {
                            model: Privilege,
                            as: 'privilegios',
                            required: false
                        }
                    ]
                }]
            });

            if (!user || !(user as any).rol) {
                return {
                    role: '',
                    permissions: [],
                    privileges: []
                };
            }

            return {
                role: ((user as any).rol as any).codigo || '',
                permissions: (((user as any).rol as any).permisos || []).map((p: any) => p.codigo),
                privileges: (((user as any).rol as any).privilegios || []).map((p: any) => p.codigo)
            };
        } catch (error) {
            console.error(`Error obteniendo información de rol del usuario ${userId}:`, error);
            return {
                role: '',
                permissions: [],
                privileges: []
            };
        }
    }

    /**
     * Verifica si un usuario puede realizar acciones específicas del controlador User
     */
    static async canUserManageUsers(userId: number): Promise<{
        canView: boolean;
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;
        canActivate: boolean;
        canDeactivate: boolean;
        canSearch: boolean;
        canViewRoles: boolean;
        canAssignRoles: boolean;
    }> {
        try {
            const [
                canView,
                canCreate,
                canUpdate,
                canDelete,
                canActivate,
                canDeactivate,
                canSearch,
                canViewRoles,
                canAssignRoles
            ] = await Promise.all([
                this.userCanPerformAction(userId, PERMISSIONS.VIEW_USERS, PRIVILEGES.USER_READ),
                this.userCanPerformAction(userId, PERMISSIONS.CREATE_USERS, PRIVILEGES.USER_CREATE),
                this.userCanPerformAction(userId, PERMISSIONS.UPDATE_USERS, PRIVILEGES.USER_UPDATE),
                this.userCanPerformAction(userId, PERMISSIONS.DELETE_USERS, PRIVILEGES.USER_DELETE),
                this.userCanPerformAction(userId, PERMISSIONS.ACTIVATE_USERS, PRIVILEGES.USER_ACTIVATE),
                this.userCanPerformAction(userId, PERMISSIONS.DEACTIVATE_USERS, PRIVILEGES.USER_DEACTIVATE),
                this.userCanPerformAction(userId, PERMISSIONS.VIEW_USERS, PRIVILEGES.USER_SEARCH),
                this.userCanPerformAction(userId, PERMISSIONS.MANAGE_ROLES, PRIVILEGES.USER_VIEW_ROLES),
                this.userCanPerformAction(userId, PERMISSIONS.MANAGE_ROLES, PRIVILEGES.USER_ASSIGN_ROLES)
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
        } catch (error) {
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
    }

    /**
     * Obtiene los permisos del usuario filtrados por módulo
     */
    static async getUserPermissionsByModule(userId: number, module: string): Promise<string[]> {
        try {
            const allPermissions = await this.getUserPermissions(userId);
            return allPermissions.filter(permission => permission === module);
        } catch (error) {
            console.error(`Error obteniendo permisos del módulo ${module} para usuario ${userId}:`, error);
            return [];
        }
    }

    /**
     * Verifica si un usuario es administrador
     */
    static async isUserAdmin(userId: number): Promise<boolean> {
        try {
            const user = await User.findByPk(userId, {
                include: [{
                    model: Role,
                    as: 'rol',
                    attributes: ['codigo', 'estado']
                }]
            });

            if (!user || !(user as any).rol) {
                return false;
            }

            const role = (user as any).rol;
            return role.codigo === 'R001' && role.estado === true;

        } catch (error) {
            console.error('Error verificando si es admin:', error);
            return false;
        }
    }

    /**
     * Verifica si un usuario es entrenador
     */
    static async isUserTrainer(userId: number): Promise<boolean> {
        try {
            const userInfo = await this.getUserRoleInfo(userId);
            return userInfo.role === 'R002'; // Código de Entrenador
        } catch (error) {
            console.error(`Error verificando si usuario ${userId} es entrenador:`, error);
            return false;
        }
    }

    /**
     * Verifica si un usuario es cliente
     */
    static async isUserClient(userId: number): Promise<boolean> {
        try {
            const userInfo = await this.getUserRoleInfo(userId);
            return userInfo.role === 'R003'; // Código de Cliente
        } catch (error) {
            console.error(`Error verificando si usuario ${userId} es cliente:`, error);
            return false;
        }
    }

    /**
     * Verifica si un usuario es beneficiario
     */
    static async isUserBeneficiary(userId: number): Promise<boolean> {
        try {
            const userInfo = await this.getUserRoleInfo(userId);
            return userInfo.role === 'R004'; // Código de Beneficiario
        } catch (error) {
            console.error(`Error verificando si usuario ${userId} es beneficiario:`, error);
            return false;
        }
    }

    /**
     * Obtiene el código del rol de un usuario
     */
    static async getUserRoleCode(userId: number): Promise<string | null> {
        try {
            const userInfo = await this.getUserRoleInfo(userId);
            return userInfo.role || null;
        } catch (error) {
            console.error(`Error obteniendo código de rol para usuario ${userId}:`, error);
            return null;
        }
    }

    /**
     * Método helper para validar acceso a recursos propios
     */
    static async canAccessOwnResource(userId: number, resourceOwnerId: number): Promise<boolean> {
        try {
            // Los administradores y entrenadores pueden acceder a cualquier recurso
            const isAdmin = await this.isUserAdmin(userId);
            const isTrainer = await this.isUserTrainer(userId);
            
            if (isAdmin || isTrainer) {
                return true;
            }
            
            // Clientes y beneficiarios solo pueden acceder a sus propios recursos
            return userId === resourceOwnerId;
        } catch (error) {
            console.error(`Error verificando acceso a recurso propio:`, error);
            return false;
        }
    }

    /**
     * Carga en caché los permisos de un usuario (para optimización)
     */
    private static userPermissionsCache: Map<number, { permissions: string[], privileges: string[], timestamp: number }> = new Map();
    private static readonly CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutos

    static async getUserPermissionsCached(userId: number): Promise<{ permissions: string[], privileges: string[] }> {
        const cached = this.userPermissionsCache.get(userId);
        const now = Date.now();
        
        if (cached && (now - cached.timestamp) < this.CACHE_EXPIRY) {
            return {
                permissions: cached.permissions,
                privileges: cached.privileges
            };
        }
        
        // Obtener permisos frescos
        const [permissions, privileges] = await Promise.all([
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
    }

    /**
     * Limpia la caché de permisos (llamar cuando se actualicen roles/permisos)
     */
    static clearPermissionsCache(userId?: number): void {
        if (userId) {
            this.userPermissionsCache.delete(userId);
        } else {
            this.userPermissionsCache.clear();
        }
    }

    /**
     * Middleware helper para verificar permisos de forma eficiente
     */
    static async checkUserAccess(userId: number, requiredPermission: string, requiredPrivilege?: string): Promise<{
        hasAccess: boolean;
        reason?: string;
    }> {
        try {
            const { permissions, privileges } = await this.getUserPermissionsCached(userId);
            
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
        } catch (error) {
            console.error(`Error verificando acceso para usuario ${userId}:`, error);
            return {
                hasAccess: false,
                reason: 'Error interno verificando permisos'
            };
        }
    }
}

export default RolePermissionManager;
