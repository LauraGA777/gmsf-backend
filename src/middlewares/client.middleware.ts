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