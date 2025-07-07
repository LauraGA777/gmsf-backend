import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import TokenBlacklist from '../utils/token-blacklist';
import { verifyUser } from '../controllers/auth.controller';
import Role from '../models/role';
import Permission from '../models/permission';
import Privilege from '../models/privilege';

// Extender el tipo Request para incluir el usuario
declare global {
    namespace Express {
        interface Request {
            user?: any;
            userId?: number;
        }
    }
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'No se proporcionó token de acceso'
            });
        }

        // Verificar si el token está en la lista negra
        if (TokenBlacklist.has(token)) {
            return res.status(401).json({
                status: 'error',
                message: 'Token inválido o expirado'
            });
        }

        // Verificar el token
        const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: number };

        // Verificar si el usuario existe y obtener sus datos
        const user = await verifyUser(decoded.userId);

        // Agregar información del usuario a la request
        req.user = user;
        req.userId = decoded.userId;

        next();
    } catch (error: any) {
        if (error.status) {
            return res.status(error.status).json({
                status: 'error',
                message: error.message
            });
        }

        return res.status(401).json({
            status: 'error',
            message: 'Token inválido o expirado'
        });
    }
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        if (req.user.id_rol !== 1) {
            return res.status(403).json({
                status: 'error',
                message: 'Acceso denegado. Se requieren permisos de administrador'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al verificar permisos de administrador'
        });
    }
};

// Middleware para verificar si el usuario es admin o entrenador
export const isTrainerOrAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        // Verificar si el rol es admin (1) o entrenador (2)
        if (req.user.id_rol !== 1 && req.user.id_rol !== 2) {
            return res.status(403).json({
                status: 'error',
                message: 'Acceso denegado: se requiere rol de administrador o entrenador'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al verificar el rol del usuario'
        });
    }
};

// Middleware para verificar permisos específicos
export const hasPermission = (permissionName: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Usuario no autenticado'
                });
            }

            // Obtener el rol del usuario con sus permisos
            const userRole = await Role.findByPk(req.user.id_rol, {
                include: [{
                    model: Permission,
                    as: 'permisos',
                    where: { 
                        codigo: permissionName,
                        estado: true 
                    },
                    required: false
                }]
            });

            if (!userRole || !userRole.permisos || userRole.permisos.length === 0) {
                return res.status(403).json({
                    status: 'error',
                    message: `Acceso denegado. Se requiere el permiso: ${permissionName}`
                });
            }

            next();
        } catch (error) {
            console.error('Error en hasPermission:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error al verificar permisos'
            });
        }
    };
};

// Middleware para verificar privilegios específicos
export const hasPrivilege = (privilegeName: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Usuario no autenticado'
                });
            }

            // Obtener el rol del usuario con sus privilegios
            const userRole = await Role.findByPk(req.user.id_rol, {
                include: [{
                    model: Privilege,
                    as: 'privilegios',
                    where: { 
                        nombre: privilegeName
                    },
                    required: false
                }]
            });

            if (!userRole || !userRole.privilegios || userRole.privilegios.length === 0) {
                return res.status(403).json({
                    status: 'error',
                    message: `Acceso denegado. Se requiere el privilegio: ${privilegeName}`
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Error al verificar privilegios'
            });
        }
    };
};

// Middleware para verificar múltiples permisos (cualquiera de ellos)
export const hasAnyPermission = (permissions: string[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Usuario no autenticado'
                });
            }

            // Obtener el rol del usuario con sus permisos
            const userRole = await Role.findByPk(req.user.id_rol, {
                include: [{
                    model: Permission,
                    as: 'permisos',
                    where: { 
                        nombre: permissions,
                        estado: true 
                    },
                    required: false
                }]
            });

            if (!userRole || !userRole.permisos || userRole.permisos.length === 0) {
                return res.status(403).json({
                    status: 'error',
                    message: `Acceso denegado. Se requiere alguno de estos permisos: ${permissions.join(', ')}`
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Error al verificar permisos'
            });
        }
    };
};

// Middleware para verificar múltiples permisos (todos requeridos)
export const hasAllPermissions = (permissions: string[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Usuario no autenticado'
                });
            }

            // Obtener el rol del usuario con sus permisos
            const userRole = await Role.findByPk(req.user.id_rol, {
                include: [{
                    model: Permission,
                    as: 'permisos',
                    where: { 
                        estado: true 
                    },
                    required: false
                }]
            });

            if (!userRole || !userRole.permisos) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Acceso denegado. No se encontraron permisos para este rol'
                });
            }

            // Verificar que el usuario tenga todos los permisos requeridos
            const userPermissions = userRole.permisos.map(p => p.nombre);
            const missingPermissions = permissions.filter(p => !userPermissions.includes(p));

            if (missingPermissions.length > 0) {
                return res.status(403).json({
                    status: 'error',
                    message: `Acceso denegado. Faltan los siguientes permisos: ${missingPermissions.join(', ')}`
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Error al verificar permisos'
            });
        }
    };
};

// Middleware combinado para verificar permisos Y privilegios
export const hasPermissionAndPrivilege = (permissionName: string, privilegeName: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Usuario no autenticado'
                });
            }

            // Obtener el rol del usuario con permisos y privilegios
            const userRole = await Role.findByPk(req.user.id_rol, {
                include: [
                    {
                        model: Permission,
                        as: 'permisos',
                        where: { 
                            nombre: permissionName,
                            estado: true 
                        },
                        required: false
                    },
                    {
                        model: Privilege,
                        as: 'privilegios',
                        where: { 
                            nombre: privilegeName
                        },
                        required: false
                    }
                ]
            });

            const hasPermission = userRole?.permisos && userRole.permisos.length > 0;
            const hasPrivilege = userRole?.privilegios && userRole.privilegios.length > 0;

            if (!hasPermission || !hasPrivilege) {
                return res.status(403).json({
                    status: 'error',
                    message: `Acceso denegado. Se requiere el permiso '${permissionName}' y el privilegio '${privilegeName}'`
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Error al verificar permisos y privilegios'
            });
        }
    };
};

