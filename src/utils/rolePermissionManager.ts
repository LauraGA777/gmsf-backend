import Role from '../models/role';
import Permission from '../models/permission';
import Privilege from '../models/privilege';
import User from '../models/user';
import { PERMISSIONS, PRIVILEGES, PERMISSION_GROUPS, PRIVILEGE_GROUPS } from './permissions';

export class RolePermissionManager {
    
    /**
     * No necesita crear permisos básicos - ya están en BD
     * Solo verifica que existan
     */
    static async verifyBasicPermissions(): Promise<void> {
        const permissionsList = Object.values(PERMISSIONS);
        
        for (const permission of permissionsList) {
            const exists = await Permission.findOne({
                where: { codigo: permission }
            });
            
            if (!exists) {
                console.warn(`Permiso ${permission} no encontrado en BD`);
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
            const exists = await Privilege.findOne({
                where: { codigo: privilege }
            });
            
            if (!exists) {
                console.warn(`Privilegio ${privilege} no encontrado en BD`);
            }
        }
    }

    /**
     * Asigna permisos a un rol específico usando códigos de BD
     */
    static async assignPermissionsToRole(roleCodigo: string, permissions: string[]): Promise<void> {
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
            const foundPermissions = permissionRecords.map(p => p.codigo);
            const missingPermissions = permissions.filter(p => !foundPermissions.includes(p));
            throw new Error(`Permisos no encontrados: ${missingPermissions.join(', ')}`);
        }

        await role.setPermisos(permissionRecords);
    }

    /**
     * Asigna privilegios a un rol específico usando códigos de BD
     */
    static async assignPrivilegesToRole(roleCodigo: string, privileges: string[]): Promise<void> {
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
            const foundPrivileges = privilegeRecords.map(p => p.codigo);
            const missingPrivileges = privileges.filter(p => !foundPrivileges.includes(p));
            throw new Error(`Privilegios no encontrados: ${missingPrivileges.join(', ')}`);
        }

        await role.setPrivilegios(privilegeRecords);
    }

    /**
     * Configura roles con permisos de BD (ya existentes)
     */
    static async setupDefaultRoles(): Promise<void> {
        try {
            // Los roles ya existen en BD, solo asignar permisos y privilegios

            // Configurar Administrador
            await this.assignPermissionsToRole('R001', PERMISSION_GROUPS.ADMIN_PERMISSIONS);
            await this.assignPrivilegesToRole('R001', PRIVILEGE_GROUPS.ADMIN_PRIVILEGES);

            // Configurar Entrenador  
            await this.assignPermissionsToRole('R002', PERMISSION_GROUPS.TRAINER_PERMISSIONS);
            await this.assignPrivilegesToRole('R002', PRIVILEGE_GROUPS.TRAINER_PRIVILEGES);

            // Configurar Cliente
            await this.assignPermissionsToRole('R003', PERMISSION_GROUPS.CLIENT_PERMISSIONS);
            await this.assignPrivilegesToRole('R003', PRIVILEGE_GROUPS.CLIENT_PRIVILEGES);

            // Configurar Beneficiario
            await this.assignPermissionsToRole('R004', PERMISSION_GROUPS.BENEFICIARY_PERMISSIONS);
            await this.assignPrivilegesToRole('R004', PRIVILEGE_GROUPS.BENEFICIARY_PRIVILEGES);

            console.log('Roles configurados exitosamente con permisos de BD');
        } catch (error) {
            console.error('Error configurando roles:', error);
            throw error;
        }
    }

    /**
     * Obtiene todos los permisos de un usuario a través de su rol
     */
    static async getUserPermissions(userId: number): Promise<string[]> {
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

        interface PermissionInstance {
            codigo: string;
        }
        interface RoleInstanceWithPermissions {
            permisos?: PermissionInstance[];
        }
        interface UserInstanceWithRole {
            rol?: RoleInstanceWithPermissions;
        }

        const typedUser = user as UserInstanceWithRole | null;
        return typedUser?.rol?.permisos?.map((p: PermissionInstance) => p.codigo) || [];
    }

    /**
     * Obtiene todos los privilegios de un usuario a través de su rol
     */
    static async getUserPrivileges(userId: number): Promise<string[]> {
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

        interface PrivilegeInstance {
            codigo: string;
        }
        interface RoleInstanceWithPrivileges {
            privilegios?: PrivilegeInstance[];
        }
        interface UserInstanceWithRolePrivileges {
            rol?: RoleInstanceWithPrivileges;
        }

        const typedUser = user as UserInstanceWithRolePrivileges | null;
        return typedUser?.rol?.privilegios?.map((p: PrivilegeInstance) => p.codigo) || [];
    }

    /**
     * Verifica si un usuario tiene un permiso específico
     */
    static async userHasPermission(userId: number, permission: string): Promise<boolean> {
        const userPermissions = await this.getUserPermissions(userId);
        return userPermissions.includes(permission);
    }

    /**
     * Verifica si un usuario tiene un privilegio específico
     */
    static async userHasPrivilege(userId: number, privilege: string): Promise<boolean> {
        const userPrivileges = await this.getUserPrivileges(userId);
        return userPrivileges.includes(privilege);
    }

    /**
     * Verifica si un usuario puede realizar una acción específica
     */
    static async userCanPerformAction(userId: number, requiredPermission: string, requiredPrivilege?: string): Promise<boolean> {
        const hasPermission = await this.userHasPermission(userId, requiredPermission);
        
        if (!requiredPrivilege) {
            return hasPermission;
        }
        
        const hasPrivilege = await this.userHasPrivilege(userId, requiredPrivilege);
        return hasPermission && hasPrivilege;
    }
}

export default RolePermissionManager;
