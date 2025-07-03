import Role from '../models/role';
import Permission from '../models/permission';
import Privilege from '../models/privilege';
import { PERMISSIONS, PRIVILEGES, PERMISSION_GROUPS } from './permissions';

export class RolePermissionManager {
    
    /**
     * Crea permisos básicos en la base de datos si no existen
     */
    static async createBasicPermissions(): Promise<void> {
        const permissionsList = Object.values(PERMISSIONS);
        
        for (const permission of permissionsList) {
            await Permission.findOrCreate({
                where: { nombre: permission },
                defaults: {
                    nombre: permission,
                    estado: true
                }
            });
        }
    }

    /**
     * Crea privilegios básicos en la base de datos si no existen
     */
    static async createBasicPrivileges(): Promise<void> {
        const privilegesList = Object.values(PRIVILEGES);
        
        for (const privilege of privilegesList) {
            // Buscar un permiso relacionado para asociar el privilegio
            const permission = await Permission.findOne({
                where: { estado: true }
            });
            
            if (permission) {
                await Privilege.findOrCreate({
                    where: { nombre: privilege },
                    defaults: {
                        nombre: privilege,
                        id_permiso: permission.id
                    }
                });
            }
        }
    }

    /**
     * Asigna permisos a un rol específico
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
                nombre: permissions,
                estado: true
            }
        });

        if (permissionRecords.length !== permissions.length) {
            const foundPermissions = permissionRecords.map(p => p.nombre);
            const missingPermissions = permissions.filter(p => !foundPermissions.includes(p));
            throw new Error(`Permisos no encontrados: ${missingPermissions.join(', ')}`);
        }

        await role.setPermisos(permissionRecords);
    }

    /**
     * Asigna privilegios a un rol específico
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
                nombre: privileges
            }
        });

        if (privilegeRecords.length !== privileges.length) {
            const foundPrivileges = privilegeRecords.map(p => p.nombre);
            const missingPrivileges = privileges.filter(p => !foundPrivileges.includes(p));
            throw new Error(`Privilegios no encontrados: ${missingPrivileges.join(', ')}`);
        }

        await role.setPrivilegios(privilegeRecords);
    }

    /**
     * Configura roles con permisos predefinidos
     */
    static async setupDefaultRoles(): Promise<void> {
        try {
            // Configurar rol de Administrador
            await this.assignPermissionsToRole('ADMIN', PERMISSION_GROUPS.ADMIN_PERMISSIONS);
            await this.assignPrivilegesToRole('ADMIN', [
                PRIVILEGES.SUPER_ADMIN,
                PRIVILEGES.FULL_USER_ACCESS,
                PRIVILEGES.BACKUP_RESTORE
            ]);

            // Configurar rol de Entrenador
            await this.assignPermissionsToRole('TRAINER', PERMISSION_GROUPS.TRAINER_PERMISSIONS);
            await this.assignPrivilegesToRole('TRAINER', [
                PRIVILEGES.ASSIGN_TRAINING_PLANS,
                PRIVILEGES.VIEW_CLIENT_PROGRESS
            ]);

            // Configurar rol de Recepcionista (si existe)
            try {
                await this.assignPermissionsToRole('RECEPTIONIST', PERMISSION_GROUPS.RECEPTIONIST_PERMISSIONS);
                await this.assignPrivilegesToRole('RECEPTIONIST', [
                    PRIVILEGES.READONLY_USER_ACCESS
                ]);
            } catch (error) {
                console.log('Rol RECEPTIONIST no encontrado, saltando configuración');
            }

            console.log('Roles configurados exitosamente');
        } catch (error) {
            console.error('Error configurando roles:', error);
            throw error;
        }
    }

    /**
     * Obtiene todos los permisos de un usuario
     */
    static async getUserPermissions(userId: number): Promise<string[]> {
        const user = await Role.findOne({
            include: [{
                model: Permission,
                as: 'permisos',
                where: { estado: true },
                required: false
            }],
            where: { id: userId }
        });

        return user?.permisos?.map(p => p.nombre) || [];
    }

    /**
     * Obtiene todos los privilegios de un usuario
     */
    static async getUserPrivileges(userId: number): Promise<string[]> {
        const user = await Role.findOne({
            include: [{
                model: Privilege,
                as: 'privilegios',
                required: false
            }],
            where: { id: userId }
        });

        return user?.privilegios?.map(p => p.nombre) || [];
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
}

export default RolePermissionManager;
