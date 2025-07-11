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

export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            res.status(401).json({
                status: 'error',
                message: 'No se proporcionó token de acceso'
            });
            return;
        }

        // Verificar si el token está en la lista negra
        if (TokenBlacklist.has(token)) {
            res.status(401).json({
                status: 'error',
                message: 'Token inválido o expirado'
            });
            return;
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
            res.status(error.status).json({
                status: 'error',
                message: error.message
            });
            return;
        }

        res.status(401).json({
            status: 'error',
            message: 'Token inválido o expirado'
        });
    }
};

// Middleware para verificar permisos específicos
export const hasPermission = (permissionName: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    status: 'error',
                    message: 'Usuario no autenticado'
                });
                return;
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
                res.status(403).json({
                    status: 'error',
                    message: `Acceso denegado. Se requiere el permiso: ${permissionName}`
                });
                return;
            }

            next();
        } catch (error) {
            console.error('Error en hasPermission:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error al verificar permisos'
            });
        }
    };
};

// Middleware para verificar privilegios específicos
export const hasPrivilege = (privilegeName: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    status: 'error',
                    message: 'Usuario no autenticado'
                });
                return;
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
                res.status(403).json({
                    status: 'error',
                    message: `Acceso denegado. Se requiere el privilegio: ${privilegeName}`
                });
                return;
            }

            next();
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Error al verificar privilegios'
            });
        }
    };
};

// Middleware para verificar múltiples permisos (cualquiera de ellos)
export const hasAnyPermission = (permissions: string[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    status: 'error',
                    message: 'Usuario no autenticado'
                });
                return;
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
                res.status(403).json({
                    status: 'error',
                    message: `Acceso denegado. Se requiere alguno de estos permisos: ${permissions.join(', ')}`
                });
                return;
            }

            next();
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Error al verificar permisos'
            });
        }
    };
};

// Middleware para verificar múltiples permisos (todos requeridos)
export const hasAllPermissions = (permissions: string[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    status: 'error',
                    message: 'Usuario no autenticado'
                });
                return;
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
                res.status(403).json({
                    status: 'error',
                    message: 'Acceso denegado. No se encontraron permisos para este rol'
                });
                return;
            }

            // Verificar que el usuario tenga todos los permisos requeridos
            const userPermissions = userRole.permisos.map(p => p.nombre);
            const missingPermissions = permissions.filter(p => !userPermissions.includes(p));

            if (missingPermissions.length > 0) {
                res.status(403).json({
                    status: 'error',
                    message: `Acceso denegado. Faltan los siguientes permisos: ${missingPermissions.join(', ')}`
                });
                return;
            }

            next();
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Error al verificar permisos'
            });
        }
    };
};

// Middleware combinado para verificar permisos Y privilegios
export const hasPermissionAndPrivilege = (permissionName: string, privilegeName: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    status: 'error',
                    message: 'Usuario no autenticado'
                });
                return;
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
                res.status(403).json({
                    status: 'error',
                    message: `Acceso denegado. Se requiere el permiso '${permissionName}' y el privilegio '${privilegeName}'`
                });
                return;
            }

            next();
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Error al verificar permisos y privilegios'
            });
        }
    };
};

