import { Request, Response, NextFunction } from 'express';
import { userHasPrivilege, PRIVILEGES } from '../utils/permissions';
import RolePermissionManager from '../utils/rolePermissionManager';

export const canViewClients = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.CLIENT_READ)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver clientes'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewClients:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

export const canCreateClients = async (req: Request, res: Response, next: NextFunction) => {
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
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.CLIENT_CREATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para crear clientes'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canCreateClients:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

export const canUpdateClients = async (req: Request, res: Response, next: NextFunction) => {
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
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.CLIENT_UPDATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para actualizar clientes'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canUpdateClients:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

export const canDeleteClients = async (req: Request, res: Response, next: NextFunction) => {
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
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.CLIENT_DELETE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para eliminar clientes'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canDeleteClients:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

export const canSearchClients = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.CLIENT_SEARCH_DOC)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para buscar clientes'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canSearchClients:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar que un cliente puede acceder a su propia información
 * o que un administrador/entrenador puede acceder a cualquier cliente
 */
export const canAccessClientData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        const clientId = req.params.id || req.params.clientId; // ID del cliente desde la URL
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        if (!clientId) {
            return res.status(400).json({
                status: 'error',
                message: 'ID del cliente requerido'
            });
        }

        // Verificar si es administrador - acceso total
        const isAdmin = await RolePermissionManager.isUserAdmin(userId);
        if (isAdmin) {
            return next();
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        // Asegúrate de que userInfo.role sea un objeto con propiedad 'codigo'
        const roleObj = typeof userInfo.role === 'string'
            ? { codigo: userInfo.role }
            : userInfo.role;

        // Si es entrenador, verificar permisos de lectura de clientes
        if (roleObj?.codigo === 'R002') { // Entrenador
            if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.CLIENT_READ)) {
                return res.status(403).json({
                    status: 'error',
                    message: 'No tienes permisos para ver información de clientes'
                });
            }
            return next();
        }

        // Si es cliente o beneficiario, solo puede acceder a su propia información
        if (roleObj?.codigo === 'R003' || roleObj?.codigo === 'R004') {
            // Verificar que el usuario esté intentando acceder a su propia información
            if (userId.toString() !== clientId.toString()) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Solo puedes acceder a tu propia información'
                });
            }
            return next();
        }

        // Para cualquier otro rol, denegar acceso
        return res.status(403).json({
            status: 'error',
            message: 'No tienes permisos para acceder a esta información'
        });

    } catch (error) {
        console.error('Error en middleware canAccessClientData:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar que un usuario puede ver detalles de clientes
 * (incluyendo su propia información)
 */
export const canViewClientDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        const clientId = req.params.id || req.params.clientId;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        // Verificar si es administrador
        const isAdmin = await RolePermissionManager.isUserAdmin(userId);
        if (isAdmin) {
            return next();
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        // Normalizar userInfo.role para asegurar que tenga la propiedad 'codigo'
        const roleObj = typeof userInfo.role === 'string'
            ? { codigo: userInfo.role }
            : userInfo.role;

        // Si es entrenador, verificar privilegio específico
        if (roleObj?.codigo === 'R002') {
            if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.CLIENT_DETAILS)) {
                return res.status(403).json({
                    status: 'error',
                    message: 'No tienes permisos para ver detalles de clientes'
                });
            }
            return next();
        }

        // Si es cliente/beneficiario y está viendo su propia información
        if ((roleObj?.codigo === 'R003' || roleObj?.codigo === 'R004') && 
            clientId && userId.toString() === clientId.toString()) {
            return next();
        }

        // Si es cliente/beneficiario pero no especifica ID, permitir ver su propia info
        if ((roleObj?.codigo === 'R003' || roleObj?.codigo === 'R004') && !clientId) {
            return next();
        }

        return res.status(403).json({
            status: 'error',
            message: 'No tienes permisos para ver esta información'
        });

    } catch (error) {
        console.error('Error en middleware canViewClientDetails:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar que un usuario puede actualizar información de cliente
 * (incluyendo su propia información)
 */
export const canUpdateOwnClientData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        const clientId = req.params.id || req.params.clientId;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        // Verificar si es administrador
        const isAdmin = await RolePermissionManager.isUserAdmin(userId);
        if (isAdmin) {
            return next();
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        // Normalizar userInfo.role para asegurar que tenga la propiedad 'codigo'
        const roleObj = typeof userInfo.role === 'string'
            ? { codigo: userInfo.role }
            : userInfo.role;

        // Si es entrenador, verificar privilegio de actualización
        if (roleObj?.codigo === 'R002') {
            if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.CLIENT_UPDATE)) {
                return res.status(403).json({
                    status: 'error',
                    message: 'No tienes permisos para actualizar clientes'
                });
            }
            return next();
        }

        // Si es cliente/beneficiario, solo puede actualizar su propia información
        if ((roleObj?.codigo === 'R003' || roleObj?.codigo === 'R004')) {
            if (clientId && userId.toString() !== clientId.toString()) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Solo puedes actualizar tu propia información'
                });
            }
            return next();
        }

        return res.status(403).json({
            status: 'error',
            message: 'No tienes permisos para actualizar esta información'
        });

    } catch (error) {
        console.error('Error en middleware canUpdateOwnClientData:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar acceso a beneficiarios
 * Un cliente puede ver sus beneficiarios, un admin puede ver todos
 */
export const canViewBeneficiaries = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        const clientId = req.params.id || req.params.clientId;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        // Verificar si es administrador
        const isAdmin = await RolePermissionManager.isUserAdmin(userId);
        if (isAdmin) {
            return next();
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        // Normalizar userInfo.role para asegurar que tenga la propiedad 'codigo'
        const roleObj = typeof userInfo.role === 'string'
            ? { codigo: userInfo.role }
            : userInfo.role;

        // Si es entrenador, verificar privilegio
        if (roleObj?.codigo === 'R002') {
            if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.CLIENT_BENEFICIARIES)) {
                return res.status(403).json({
                    status: 'error',
                    message: 'No tienes permisos para ver beneficiarios'
                });
            }
            return next();
        }

        // Si es cliente, solo puede ver sus propios beneficiarios
        if (roleObj?.codigo === 'R003') {
            if (clientId && userId.toString() !== clientId.toString()) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Solo puedes ver tus propios beneficiarios'
                });
            }
            return next();
        }

        return res.status(403).json({
            status: 'error',
            message: 'No tienes permisos para ver beneficiarios'
        });

    } catch (error) {
        console.error('Error en middleware canViewBeneficiaries:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};