import { Request, Response, NextFunction } from 'express';
import { userHasPrivilege, PRIVILEGES } from '../utils/permissions';
import RolePermissionManager from '../utils/rolePermissionManager';

/**
 * Middleware para verificar privilegio de ver contratos
 */
export const canViewContracts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.CONTRACT_READ)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver contratos'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewContracts:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de crear contratos
 */
export const canCreateContracts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.CONTRACT_CREATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para crear contratos'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canCreateContracts:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de buscar contratos
 */
export const canSearchContracts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.CONTRACT_SEARCH)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para buscar contratos'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canSearchContracts:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de ver detalles de contratos
 */
export const canViewContractDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.CONTRACT_DETAILS)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver detalles de contratos'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewContractDetails:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de actualizar contratos
 */
export const canUpdateContracts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.CONTRACT_UPDATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para actualizar contratos'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canUpdateContracts:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de eliminar contratos
 */
export const canDeleteContracts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.CONTRACT_DELETE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para eliminar contratos'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canDeleteContracts:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de cancelar contratos
 */
export const canCancelContracts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.CONTRACT_CANCEL)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para cancelar contratos'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canCancelContracts:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de renovar contratos
 */
export const canRenewContracts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.CONTRACT_RENEW)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para renovar contratos'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canRenewContracts:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de ver historial de contratos
 */
export const canViewContractHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.CONTRACT_HISTORY)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver historial de contratos'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewContractHistory:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de activar contratos
 */
export const canActivateContracts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.CONTRACT_ACTIVATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para activar contratos'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canActivateContracts:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de desactivar contratos
 */
export const canDeactivateContracts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.CONTRACT_DEACTIVATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para desactivar contratos'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canDeactivateContracts:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de exportar contratos
 */
export const canExportContracts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.CONTRACT_EXPORT)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para exportar contratos'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canExportContracts:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de ver estadísticas de contratos
 */
export const canViewContractStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.CONTRACT_STATS)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver estadísticas de contratos'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewContractStats:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de gestión completa de contratos
 */
export const canManageContracts = async (req: Request, res: Response, next: NextFunction) => {
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
        const hasManagementPrivilege = userHasPrivilege(userInfo.privileges, PRIVILEGES.CONTRACT_CREATE) ||
                                      userHasPrivilege(userInfo.privileges, PRIVILEGES.CONTRACT_UPDATE) ||
                                      userHasPrivilege(userInfo.privileges, PRIVILEGES.CONTRACT_DELETE) ||
                                      userHasPrivilege(userInfo.privileges, PRIVILEGES.CONTRACT_CANCEL);
        
        if (!hasManagementPrivilege) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para gestionar contratos'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canManageContracts:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar acceso a contratos propios (para clientes)
 */
export const canViewOwnContracts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);
        
        // Verificar si tiene privilegio de lectura
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.CONTRACT_READ)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver contratos'
            });
        }

        // Si es cliente o beneficiario, agregar filtro por usuario
        if (userInfo.role === 'R003' || userInfo.role === 'R004') {
            (req as any).userFilter = { id_persona: userId };
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewOwnContracts:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware combinado para verificar múltiples privilegios
 */
export const requireContractPrivileges = (requiredPrivileges: string[]) => {
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
            console.error('Error en middleware requireContractPrivileges:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor'
            });
        }
    };
};