import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import TokenBlacklist from '../utils/token-blacklist';
import { verifyUser } from '../controllers/auth.controller';
import User from '../models/user';

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

