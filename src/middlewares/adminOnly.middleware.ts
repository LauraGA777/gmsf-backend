import { Request, Response, NextFunction } from 'express';
import RolePermissionManager from '../utils/rolePermissionManager';

/*Middleware que verifica que SOLO administradores accedan a rutas de roles*/
export const adminOnlyAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        
        if (!userId) {
            res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
            return;
        }

        // Verificar que el usuario sea administrador
        const isAdmin = await RolePermissionManager.isUserAdmin(userId);
        
        if (!isAdmin) {
            res.status(403).json({
                status: 'error',
                message: 'Acceso denegado. Solo administradores pueden realizar esta acción.'
            });
            return;
        }

        next();
    } catch (error) {
        console.error('Error en adminOnlyAccess:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware que verifica acceso a usuarios (Admin o el propio usuario)
 */
export const adminOrSelfAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const targetUserId = parseInt(req.params.id);
        
        if (!userId) {
            res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
            return;
        }

        // Los administradores pueden acceder a cualquier usuario
        const isAdmin = await RolePermissionManager.isUserAdmin(userId);
        
        if (isAdmin || userId === targetUserId) {
            next();
        } else {
            res.status(403).json({
                status: 'error',
                message: 'Acceso denegado. Solo puedes acceder a tu propia información.'
            });
        }
    } catch (error) {
        console.error('Error en adminOrSelfAccess:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar que solo ADMIN puede ver/asignar roles a usuarios
 */
export const adminUserManagement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        
        if (!userId) {
            res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
            return;
        }

        // Solo administradores pueden gestionar usuarios del sistema
        const isAdmin = await RolePermissionManager.isUserAdmin(userId);
        
        if (!isAdmin) {
            res.status(403).json({
                status: 'error',
                message: 'Acceso denegado. Solo administradores pueden gestionar usuarios del sistema.'
            });
            return;
        }

        next();
    } catch (error) {
        console.error('Error en adminUserManagement:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};