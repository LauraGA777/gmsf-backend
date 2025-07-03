import Role from '../models/role';
import Permission from '../models/permission';
import Privilege from '../models/privilege';
import User from '../models/user'; // Asumiendo que existe
import { PERMISSIONS, PRIVILEGES, PERMISSION_GROUPS } from './permissions';

export class RolePermissionManager {
    
    /**
     * Crea permisos básicos en la base de datos si no existen
     */
    static async createBasicPermissions(): Promise<void> {
        const permissionsList = Object.values(PERMISSIONS);
        
        for (const permission of permissionsList) {
            await Permission.findOrCreate({
                where: { codigo: permission }, // CORREGIDO: Usar código en lugar de nombre
                defaults: {
                    nombre: permission.replace(/_/g, ' ').toUpperCase(),
                    codigo: permission,
                    descripcion: `Permiso para ${permission.replace(/_/g, ' ')}`,
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
            await Privilege.findOrCreate({
                where: { codigo: privilege }, // CORREGIDO: Usar código
                defaults: {
                    nombre: privilege.replace(/_/g, ' ').toUpperCase(),
                    codigo: privilege,
                    descripcion: `Privilegio para ${privilege.replace(/_/g, ' ')}`
                }
            });
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
                codigo: permissions, // CORREGIDO: Usar código
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
                codigo: privileges // CORREGIDO: Usar código
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
     * Configura roles con permisos predefinidos
     */
    static async setupDefaultRoles(): Promise<void> {
        try {
            // Crear roles básicos si no existen
            await Role.findOrCreate({
                where: { codigo: 'R001' },
                defaults: {
                    codigo: 'R001',
                    nombre: 'Administrador',
                    descripcion: 'Rol con acceso completo al sistema',
                    estado: true
                }
            });

            await Role.findOrCreate({
                where: { codigo: 'R002' },
                defaults: {
                    codigo: 'R002',
                    nombre: 'Entrenador',
                    descripcion: 'Rol para entrenadores del gimnasio',
                    estado: true
                }
            });

            // Configurar permisos para Administrador
            await this.assignPermissionsToRole('R001', PERMISSION_GROUPS.ADMIN_PERMISSIONS);
            await this.assignPrivilegesToRole('R001', [
                PRIVILEGES.SUPER_ADMIN,
                PRIVILEGES.FULL_USER_ACCESS,
                PRIVILEGES.BACKUP_RESTORE
            ]);

            // Configurar permisos para Entrenador
            await this.assignPermissionsToRole('R002', PERMISSION_GROUPS.TRAINER_PERMISSIONS);
            await this.assignPrivilegesToRole('R002', [
                PRIVILEGES.ASSIGN_TRAINING_PLANS,
                PRIVILEGES.VIEW_CLIENT_PROGRESS
            ]);

            // Configurar rol de Recepcionista (si existe)
            try {
                await Role.findOrCreate({
                    where: { codigo: 'R003' },
                    defaults: {
                        codigo: 'R003',
                        nombre: 'Recepcionista',
                        descripcion: 'Rol para recepcionistas del gimnasio',
                        estado: true
                    }
                });

                await this.assignPermissionsToRole('R003', PERMISSION_GROUPS.RECEPTIONIST_PERMISSIONS);
                await this.assignPrivilegesToRole('R003', [
                    PRIVILEGES.READONLY_USER_ACCESS
                ]);
            } catch (error) {
                console.log('Error configurando rol RECEPTIONIST:', error);
            }

            console.log('Roles configurados exitosamente');
        } catch (error) {
            console.error('Error configurando roles:', error);
            throw error;
        }
    }

    /**
     * Obtiene todos los permisos de un usuario a través de su rol
     */
    static async getUserPermissions(userId: number): Promise<string[]> {
        const user = await User.findOne({ // CORREGIDO: Usar User en lugar de Role
            where: { id: userId },
            include: [{
                model: Role,
                as: 'rol', // Asumiendo que la relación se llama 'rol'
                include: [{
                    model: Permission,
                    as: 'permisos',
                    where: { estado: true },
                    required: false
                }]
            }]
        });

        return user?.rol?.permisos?.map(p => p.codigo) || [];
    }

    /**
     * Obtiene todos los privilegios de un usuario a través de su rol
     */
    static async getUserPrivileges(userId: number): Promise<string[]> {
        const user = await User.findOne({ // CORREGIDO: Usar User en lugar de Role
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

        return user?.rol?.privilegios?.map(p => p.codigo) || [];
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
