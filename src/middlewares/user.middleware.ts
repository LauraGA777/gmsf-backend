import { Request, Response, NextFunction } from 'express';
import { userHasPrivilege, PRIVILEGES } from '../utils/permissions';
import RolePermissionManager from '../utils/rolePermissionManager';

/**
 * Middleware para verificar privilegio de ver usuarios
 */
export const canViewUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.USER_READ)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver usuarios'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewUsers:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de buscar usuarios
 */
export const canSearchUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.USER_SEARCH)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para buscar usuarios'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canSearchUsers:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de ver detalles de usuarios
 */
export const canViewUserDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.USER_DETAILS)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver detalles de usuarios'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewUserDetails:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de crear usuarios
 */
export const canCreateUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.USER_CREATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para crear usuarios'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canCreateUsers:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de actualizar usuarios
 */
export const canUpdateUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.USER_UPDATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para actualizar usuarios'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canUpdateUsers:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de activar usuarios
 */
export const canActivateUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.USER_ACTIVATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para activar usuarios'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canActivateUsers:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de desactivar usuarios
 */
export const canDeactivateUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.USER_DEACTIVATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para desactivar usuarios'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canDeactivateUsers:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de eliminar usuarios
 */
export const canDeleteUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.USER_DELETE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para eliminar usuarios'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canDeleteUsers:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de verificar documento
 */
export const canCheckDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.USER_CHECK_DOCUMENT)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para verificar documentos'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canCheckDocument:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de verificar email
 */
export const canCheckEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.USER_CHECK_EMAIL)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para verificar emails'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canCheckEmail:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de ver roles de usuario
 */
export const canViewUserRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.USER_VIEW_ROLES)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver roles de usuarios'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewUserRoles:', error);
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

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.USER_ASSIGN_ROLES)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para asignar roles a usuarios'
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
 * Middleware para verificar privilegio de ver historial de usuarios
 */
export const canViewUserHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.USER_HISTORY)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver historial de usuarios'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewUserHistory:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de gestión completa de usuarios
 */
export const canManageUsers = async (req: Request, res: Response, next: NextFunction) => {
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
        const hasManagementPrivilege = userHasPrivilege(userInfo.privileges, PRIVILEGES.USER_CREATE) ||
            userHasPrivilege(userInfo.privileges, PRIVILEGES.USER_UPDATE) ||
            userHasPrivilege(userInfo.privileges, PRIVILEGES.USER_DELETE) ||
            userHasPrivilege(userInfo.privileges, PRIVILEGES.USER_ACTIVATE) ||
            userHasPrivilege(userInfo.privileges, PRIVILEGES.USER_DEACTIVATE);

        if (!hasManagementPrivilege) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para gestionar usuarios'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canManageUsers:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegios de cambio de estado
 */
export const canChangeUserStatus = async (req: Request, res: Response, next: NextFunction) => {
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
        const canChangeStatus = userHasPrivilege(userInfo.privileges, PRIVILEGES.USER_ACTIVATE) ||
            userHasPrivilege(userInfo.privileges, PRIVILEGES.USER_DEACTIVATE);

        if (!canChangeStatus) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para cambiar el estado de usuarios'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canChangeUserStatus:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar acceso a información propia
 */
export const canViewOwnProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        const requestedUserId = req.params.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        // Si es el mismo usuario, permitir acceso
        if (userId.toString() === requestedUserId) {
            return next();
        }

        // Si no es el mismo usuario, verificar permisos
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.USER_READ)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver información de otros usuarios'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewOwnProfile:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware combinado para verificar múltiples privilegios
 */
export const requireUserPrivileges = (requiredPrivileges: string[]) => {
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
            console.error('Error en middleware requireUserPrivileges:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor'
            });
        }
    };
};

/**
 * Middleware para verificar privilegios de validación
 */
export const canValidateUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        // Verificar si tiene privilegios para validar usuarios
        const canValidate = userHasPrivilege(userInfo.privileges, PRIVILEGES.USER_CHECK_DOCUMENT) ||
            userHasPrivilege(userInfo.privileges, PRIVILEGES.USER_CHECK_EMAIL);

        if (!canValidate) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para validar usuarios'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canValidateUsers:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};