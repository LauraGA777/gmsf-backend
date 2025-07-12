import { Request, Response, NextFunction } from 'express';
import { userHasPrivilege, PRIVILEGES } from '../utils/permissions';
import RolePermissionManager from '../utils/rolePermissionManager';

/**
 * Middleware para verificar privilegio de ver asistencias
 * Privilegio: ASIST_READ 
 */
export const canViewAttendances = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.ASIST_READ)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver asistencias'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewAttendances:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de crear/registrar asistencias
 * Privilegio: ASIST_CREATE
 */
export const canCreateAttendances = async (req: Request, res: Response, next: NextFunction) => {
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

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.ASIST_CREATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para crear asistencias'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canCreateAttendances:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de buscar asistencias
 * Privilegio: ASIST_SEARCH
 */
export const canSearchAttendances = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.ASIST_SEARCH)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para buscar asistencias'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canSearchAttendances:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de ver detalles de asistencia
 * Privilegio: ASIST_DETAILS
 */
export const canViewAttendanceDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.ASIST_DETAILS)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver detalles de asistencias'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewAttendanceDetails:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de actualizar asistencias
 * Privilegio: ASIST_UPDATE
 */
export const canUpdateAttendances = async (req: Request, res: Response, next: NextFunction) => {
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

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.ASIST_UPDATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para actualizar asistencias'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canUpdateAttendances:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de eliminar asistencias
 * Privilegio: ASIST_DELETE
 */
export const canDeleteAttendances = async (req: Request, res: Response, next: NextFunction) => {
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

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.ASIST_DELETE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para eliminar asistencias'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canDeleteAttendances:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de ver estadísticas de asistencias
 * Privilegio: ASIST_STATS
 */
export const canViewAttendanceStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.ASIST_STATS)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver estadísticas de asistencias'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewAttendanceStats:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de gestión completa de asistencias
 * Privilegio: ASIST_CREATE || ASIST_UPDATE || ASIST_DELETE
 */
export const canManageAttendances = async (req: Request, res: Response, next: NextFunction) => {
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
        const hasManagementPrivilege = userHasPrivilege(userInfo.privileges, PRIVILEGES.ASIST_CREATE) ||
            userHasPrivilege(userInfo.privileges, PRIVILEGES.ASIST_UPDATE) ||
            userHasPrivilege(userInfo.privileges, PRIVILEGES.ASIST_DELETE);

        if (!hasManagementPrivilege) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para gestionar asistencias'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canManageAttendances:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar acceso a asistencias propias (para clientes) 
 * Privilegio: ASIST_READ (con filtro por usuario para roles R003 y R004)
 */
export const canViewOwnAttendances = async (req: Request, res: Response, next: NextFunction) => {
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
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.ASIST_READ)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver asistencias'
            });
        }

        // Si es cliente o beneficiario, agregar filtro por usuario
        if (userInfo.role === 'R003' || userInfo.role === 'R004') {
            (req as any).userFilter = { id_usuario: userId };
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewOwnAttendances:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware combinado para verificar múltiples privilegios
 */
export const requireAttendancePrivileges = (requiredPrivileges: string[]) => {
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
            console.error('Error en middleware requireAttendancePrivileges:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor'
            });
        }
    };
};

/**
 * Middleware para verificar privilegio de ver información del cliente
 * Privilegio: ASIST_CLIENT_INFO
 */
export const canViewClientInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        const { userId: targetUserId } = req.params;

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

        // Si es el mismo usuario, permitir acceso a su propia información
        if (userId.toString() === targetUserId) {
            return next();
        }

        // Si no es el mismo usuario, verificar privilegios administrativos
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.ASIST_CLIENT_INFO)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver información de clientes'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewClientInfo:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de ver estadísticas del cliente
 * Privilegio: ASIST_CLIENT_STATS
 */
export const canViewClientStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        const { userId: targetUserId } = req.params;

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

        // Si es el mismo usuario, permitir acceso a sus propias estadísticas
        if (userId.toString() === targetUserId) {
            return next();
        }

        // Si no es el mismo usuario, verificar privilegios de estadísticas
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.ASIST_CLIENT_STATS)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver estadísticas de clientes'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewClientStats:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar privilegio de ver historial de asistencias del cliente
 * Privilegio: ASIST_CLIENT_HISTORY
 */
export const canViewClientHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        const { userId: targetUserId } = req.params;

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

        // Si es el mismo usuario, permitir acceso a su propio historial
        if (userId.toString() === targetUserId) {
            return next();
        }

        // Si no es el mismo usuario, verificar privilegios de lectura
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.ASIST_CLIENT_HISTORY)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver el historial de asistencias de otros clientes'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewClientHistory:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};