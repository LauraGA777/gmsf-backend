import { Request, Response, NextFunction } from 'express';
import { userHasPrivilege, PRIVILEGES } from '../utils/permissions';
import RolePermissionManager from '../utils/rolePermissionManager';

/**
 * Middleware para verificar privilegio de ver membresías
 */
export const canViewMemberships = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.MEMBERSHIP_READ)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver membresías'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewMemberships:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de crear membresías
 */
export const canCreateMemberships = async (req: Request, res: Response, next: NextFunction) => {
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
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.MEMBERSHIP_CREATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para crear membresías'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canCreateMemberships:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de buscar membresías
 */
export const canSearchMemberships = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.MEMBERSHIP_SEARCH)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para buscar membresías'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canSearchMemberships:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de ver detalles de membresías
 */
export const canViewMembershipDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.MEMBERSHIP_DETAILS)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver detalles de membresías'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewMembershipDetails:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de actualizar membresías
 */
export const canUpdateMemberships = async (req: Request, res: Response, next: NextFunction) => {
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
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.MEMBERSHIP_UPDATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para actualizar membresías'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canUpdateMemberships:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de desactivar membresías
 */
export const canDeactivateMemberships = async (req: Request, res: Response, next: NextFunction) => {
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
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.MEMBERSHIP_DEACTIVATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para desactivar membresías'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canDeactivateMemberships:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de reactivar membresías
 */
export const canReactivateMemberships = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.MEMBERSHIP_REACTIVATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para reactivar membresías'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canReactivateMemberships:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de gestión completa de membresías
 */
export const canManageMemberships = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        // Verificar si tiene al menos uno de los privilegios de gestión
        const hasManagementPrivilege = userHasPrivilege(userInfo.privileges, PRIVILEGES.MEMBERSHIP_CREATE) ||
            userHasPrivilege(userInfo.privileges, PRIVILEGES.MEMBERSHIP_UPDATE) ||
            userHasPrivilege(userInfo.privileges, PRIVILEGES.MEMBERSHIP_DEACTIVATE) ||
            userHasPrivilege(userInfo.privileges, PRIVILEGES.MEMBERSHIP_REACTIVATE);

        if (!hasManagementPrivilege) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para gestionar membresías'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canManageMemberships:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar acceso a membresías (solo admin puede gestionar)
 */
export const canAccessMemberships = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        // Verificar si tiene privilegio de lectura mínimo
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.MEMBERSHIP_READ)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para acceder a membresías'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canAccessMemberships:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware combinado para verificar múltiples privilegios
 */
export const requireMembershipPrivileges = (requiredPrivileges: string[]) => {
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
                    message: 'No tienes los permisos necesarios para esta acción'
                });
            }

            next();
        } catch (error) {
            console.error('Error en middleware requireMembershipPrivileges:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor'
            });
        }
    };
};

/**
 * Middleware para verificar privilegios específicos de estado
 */
export const canChangeMembershipStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        // Verificar si tiene privilegios para cambiar estado
        const canChangeStatus = userHasPrivilege(userInfo.privileges, PRIVILEGES.MEMBERSHIP_DEACTIVATE) ||
            userHasPrivilege(userInfo.privileges, PRIVILEGES.MEMBERSHIP_REACTIVATE);

        if (!canChangeStatus) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para cambiar el estado de membresías'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canChangeMembershipStatus:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};