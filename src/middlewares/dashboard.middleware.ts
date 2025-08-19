import { Request, Response, NextFunction } from 'express';
import { userHasPrivilege, PRIVILEGES } from '../utils/permissions';
import RolePermissionManager from '../utils/rolePermissionManager';

/**
 * Middleware para verificar acceso al dashboard
 */
export const canViewDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);
        
        // Permitir acceso a admin y entrenadores por defecto (robusto a códigos faltantes)
        const isAdmin = await RolePermissionManager.isUserAdmin(userId);
        const isTrainer = await RolePermissionManager.isUserTrainer(userId);
        if (isAdmin || isTrainer || userInfo.role === 'R001' || userInfo.role === 'R002') {
            return next();
        }
        
        // Para otros roles, verificar privilegios específicos
        const hasViewPrivilege = userHasPrivilege(userInfo.privileges, PRIVILEGES.CONTRACT_READ) ||
                               userHasPrivilege(userInfo.privileges, PRIVILEGES.ASIST_STATS) ||
                               userHasPrivilege(userInfo.privileges, PRIVILEGES.CONTRACT_STATS);
        
        if (!hasViewPrivilege) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver el dashboard'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewDashboard:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
}; 