import { Request, Response, NextFunction } from 'express';
import { userHasPrivilege, PRIVILEGES } from '../utils/permissions';
import RolePermissionManager from '../utils/rolePermissionManager';

export const canViewSchedules = async (req: Request, res: Response, next: NextFunction) => {
    try {
    const userId = (req.user as any)?.id;
    const userRoleId = (req.user as any)?.id_rol;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);

        // Permitir a clientes/beneficiarios aunque el privilegio aún no esté sincronizado
        const hasRead = userHasPrivilege(userInfo.privileges, PRIVILEGES.SCHEDULE_READ);
        if (!hasRead && (userRoleId === 3 || userRoleId === 4)) {
            console.warn(`Cliente ${userId} sin privilegio SCHEDULE_READ sincronizado. Permitido por rol.`);
        } else if (!hasRead) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver horarios'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewSchedules:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

export const canCreateSchedules = async (req: Request, res: Response, next: NextFunction) => {
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
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.SCHEDULE_CREATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para crear horarios'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canCreateSchedules:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

export const canUpdateSchedules = async (req: Request, res: Response, next: NextFunction) => {
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
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.SCHEDULE_UPDATE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para actualizar horarios'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canUpdateSchedules:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

export const canDeleteSchedules = async (req: Request, res: Response, next: NextFunction) => {
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
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.SCHEDULE_DELETE)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para eliminar horarios'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canDeleteSchedules:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

export const canViewScheduleAvailability = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.SCHEDULE_AVAILABILITY)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver disponibilidad de horarios'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewScheduleAvailability:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

export const canViewDailySchedules = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.SCHEDULE_DAILY_VIEW)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver horarios diarios'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewDailySchedules:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

export const canViewWeeklySchedules = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);
        
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.SCHEDULE_WEEKLY_VIEW)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver horarios semanales'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewWeeklySchedules:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

// === MIDDLEWARES ESPECÍFICOS PARA CLIENTES ===

export const isClient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        const userRoleId = (req.user as any)?.id_rol;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        // Verificar que sea cliente (rol 3) o beneficiario (rol 4)
        if (userRoleId !== 3 && userRoleId !== 4) {
            return res.status(403).json({
                status: 'error',
                message: 'Acceso denegado. Solo clientes pueden usar este endpoint.'
            });
        }

        // Para clientes y beneficiarios, obtener el personId de la tabla Person
        const Person = require('../models/person.model').default;
        const persona = await Person.findOne({
            where: { id_usuario: userId }
        });

        if (!persona) {
            return res.status(400).json({
                status: 'error',
                message: 'No se pudo identificar el perfil del cliente'
            });
        }

        // Agregar personId al objeto user para uso posterior
        (req.user as any).personId = persona.id_persona;

        next();
    } catch (error) {
        console.error('Error en middleware isClient:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

export const canViewClientSchedules = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);
        
        // Los clientes pueden ver horarios (incluido el privilegio básico de lectura)
        if (!userHasPrivilege(userInfo.privileges, PRIVILEGES.SCHEDULE_READ)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver horarios'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware canViewClientSchedules:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

export const canCreateClientTraining = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        const userRoleId = (req.user as any)?.id_rol;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        // Verificar que sea cliente o beneficiario
        if (userRoleId !== 3 && userRoleId !== 4) {
            return res.status(403).json({
                status: 'error',
                message: 'Solo los clientes pueden agendar entrenamientos a través de este endpoint'
            });
        }

        const userInfo = await RolePermissionManager.getUserRoleInfo(userId);
        
        // Los clientes deberían poder crear. Si el privilegio aún no está sincronizado en BD,
        // permitimos continuar siempre que el rol sea cliente/beneficiario y tenga acceso al módulo de horarios.
        const hasCreatePrivilege = userHasPrivilege(userInfo.privileges, PRIVILEGES.SCHEDULE_CREATE);
        const hasReadPrivilege = userHasPrivilege(userInfo.privileges, PRIVILEGES.SCHEDULE_READ);

        if (!hasCreatePrivilege && !hasReadPrivilege) {
            console.warn(`Cliente ${userId} sin privilegio explícito para crear entrenamientos. Permitido por rol.`);
        }

        next();
    } catch (error) {
        console.error('Error en middleware canCreateClientTraining:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

export const denyClientModification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.id;
        const userRoleId = (req.user as any)?.id_rol;
        
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        // Si es cliente o beneficiario, denegar directamente
        if (userRoleId === 3 || userRoleId === 4) {
            return res.status(403).json({
                status: 'error',
                message: 'Para modificar o cancelar su entrenamiento, por favor contacte con administración.'
            });
        }

        // Si no es cliente, continuar con la validación normal
        next();
    } catch (error) {
        console.error('Error en middleware denyClientModification:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};