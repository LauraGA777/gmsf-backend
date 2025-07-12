import { Request, Response, NextFunction } from 'express';
import { userHasPrivilege, PRIVILEGES } from '../utils/permissions';
import RolePermissionManager from '../utils/rolePermissionManager';

/**
 * Middleware para verificar privilegio de ver roles del sistema
 */
export const canViewRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.SYSTEM_VIEW_ROLES)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver roles del sistema'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewRoles:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de crear roles
 */
export const canCreateRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        // Verificar si es administrador primero
        const isAdmin = await RolePermissionManager.isUserAdmin(userId);
        if (isAdmin) {
            return next();
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.SYSTEM_CREATE_ROLES)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para crear roles'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canCreateRoles:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de actualizar roles
 */
export const canUpdateRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        // Verificar si es administrador primero
        const isAdmin = await RolePermissionManager.isUserAdmin(userId);
        if (isAdmin) {
            return next();
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.SYSTEM_UPDATE_ROLES)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para actualizar roles'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canUpdateRoles:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de eliminar roles
 */
export const canDeleteRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        // Verificar si es administrador primero
        const isAdmin = await RolePermissionManager.isUserAdmin(userId);
        if (isAdmin) {
            return next();
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.SYSTEM_DELETE_ROLES)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para eliminar roles'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canDeleteRoles:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de asignar roles
 */
export const canAssignRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.SYSTEM_ASSIGN_ROLES)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para asignar roles'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canAssignRoles:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de ver permisos del sistema
 */
export const canViewPermissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.SYSTEM_VIEW_PERMISSIONS)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver permisos del sistema'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewPermissions:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de crear permisos
 */
export const canCreatePermissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        // Verificar si es administrador primero
        const isAdmin = await RolePermissionManager.isUserAdmin(userId);
        if (isAdmin) {
            return next();
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.SYSTEM_CREATE_PERMISSIONS)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para crear permisos'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canCreatePermissions:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de actualizar permisos
 */
export const canUpdatePermissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        // Verificar si es administrador primero
        const isAdmin = await RolePermissionManager.isUserAdmin(userId);
        if (isAdmin) {
            return next();
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.SYSTEM_UPDATE_PERMISSIONS)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para actualizar permisos'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canUpdatePermissions:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de eliminar permisos
 */
export const canDeletePermissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        // Verificar si es administrador primero
        const isAdmin = await RolePermissionManager.isUserAdmin(userId);
        if (isAdmin) {
            return next();
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.SYSTEM_DELETE_PERMISSIONS)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para eliminar permisos'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canDeletePermissions:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de asignar permisos
 */
export const canAssignPermissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.SYSTEM_ASSIGN_PERMISSIONS)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para asignar permisos'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canAssignPermissions:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de ver logs del sistema
 */
export const canViewLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.SYSTEM_VIEW_LOGS)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver logs del sistema'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewLogs:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de realizar backup
 */
export const canBackupSystem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.SYSTEM_BACKUP)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para realizar backup del sistema'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canBackupSystem:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de restaurar sistema
 */
export const canRestoreSystem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.SYSTEM_RESTORE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para restaurar el sistema'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canRestoreSystem:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de mantenimiento del sistema
 */
export const canMaintenanceSystem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.SYSTEM_MAINTENANCE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para realizar mantenimiento del sistema'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canMaintenanceSystem:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de gestión completa del sistema
 */
export const canManageSystem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        // Verificar si tiene al menos uno de los privilegios de gestión del sistema
        const hasManagementPrivilege = userHasPrivilege(userInfo.privileges, PRIVILEGES.SYSTEM_CREATE_ROLES) ||
            userHasPrivilege(userInfo.privileges, PRIVILEGES.SYSTEM_UPDATE_ROLES) ||
            userHasPrivilege(userInfo.privileges, PRIVILEGES.SYSTEM_DELETE_ROLES) ||
            userHasPrivilege(userInfo.privileges, PRIVILEGES.SYSTEM_ASSIGN_ROLES) ||
            userHasPrivilege(userInfo.privileges, PRIVILEGES.SYSTEM_CREATE_PERMISSIONS) ||
            userHasPrivilege(userInfo.privileges, PRIVILEGES.SYSTEM_UPDATE_PERMISSIONS) ||
            userHasPrivilege(userInfo.privileges, PRIVILEGES.SYSTEM_DELETE_PERMISSIONS) ||
            userHasPrivilege(userInfo.privileges, PRIVILEGES.SYSTEM_ASSIGN_PERMISSIONS);

        if (!hasManagementPrivilege) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para gestionar el sistema'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canManageSystem:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegios de administración total
 */
export const canAdministerSystem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        // Solo administradores pueden administrar el sistema
        if (userInfo.role !== 'R001') {
            return res.status(403).json({
                status: 'error',
                message: 'Solo administradores pueden administrar el sistema'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canAdministerSystem:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware combinado para verificar múltiples privilegios del sistema
 */
export const requireSystemPrivileges = (requiredPrivileges: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req.user as any)?.id;

            if (!userId) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Usuario no autenticado'
                });
            }

            const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

            // Verificar si tiene al menos uno de los privilegios requeridos
            const hasRequiredPrivilege = requiredPrivileges.some(privilege =>
                userHasPrivilege(userInfo.privileges, privilege)
            );

            if (!hasRequiredPrivilege) {
                return res.status(403).json({
                    status: 'error',
                    message: 'No tienes los permisos necesarios para esta acción del sistema'
                });
            }

            next();
        } catch (error) {
            console.error('Error en middleware requireSystemPrivileges:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor'
            });
        }
    };
};

/**
 * Middleware para verificar privilegios críticos del sistema
 */
export const canPerformCriticalActions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        // Verificar si tiene privilegios críticos
        const hasCriticalPrivilege = userHasPrivilege(userInfo.privileges, PRIVILEGES.SYSTEM_BACKUP) ||
            userHasPrivilege(userInfo.privileges, PRIVILEGES.SYSTEM_RESTORE) ||
            userHasPrivilege(userInfo.privileges, PRIVILEGES.SYSTEM_MAINTENANCE);

        if (!hasCriticalPrivilege) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para realizar acciones críticas del sistema'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canPerformCriticalActions:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};