import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { idSchema, updateUserSchema, searchUserSchema, userCreateSchema } from '../validators/user.validator';
import ApiResponse from '../utils/apiResponse';
import { UserService } from '../services/user.service';
import { ApiError } from '../errors/apiError';

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    public async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this.userService.findAll(req.query);
            ApiResponse.success(res, result.data, 'Usuarios obtenidos correctamente', result.pagination);
        } catch (error) {
            next(error);
        }
    }

    public async getRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const roles = await this.userService.getRoles();
            ApiResponse.success(res, { roles }, 'Roles obtenidos correctamente');
        } catch (error) {
            next(error);
        }
    }

    public async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = idSchema.parse(req.params);
            const user = await this.userService.findById(id);
            ApiResponse.success(res, { usuario: user }, 'Usuario obtenido correctamente');
        } catch (error) {
            next(error);
        }
    }

    public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userData = userCreateSchema.parse(req.body);
            const result = await this.userService.create(userData);
            ApiResponse.success(res, result, 'Usuario registrado exitosamente', undefined, 201);
        } catch (error) {
            if (error instanceof ApiError) {
                ApiResponse.error(res, error.message, error.statusCode);
            } else if (error instanceof z.ZodError) {
                ApiResponse.error(res, 'Datos de registro inválidos', 400, error.errors);
            }
            else {
                next(error);
            }
        }
    }

    public async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = idSchema.parse(req.params);
            const updateData = updateUserSchema.parse(req.body);
            const updatedUser = await this.userService.update(id, updateData);
            ApiResponse.success(res, { usuario: updatedUser }, 'Usuario actualizado exitosamente');
        } catch (error) {
            next(error);
        }
    }

    public async activateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = idSchema.parse(req.params);
            const adminId = (req.user as any)?.id;
            if (!adminId) throw new ApiError('Usuario no autenticado', 401);
            
            const result = await this.userService.activate(id, adminId);
            ApiResponse.success(res, result, result.message);
        } catch (error) {
            next(error);
        }
    }

    public async deactivateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = idSchema.parse(req.params);
            const adminId = (req.user as any)?.id;
            if (!adminId) throw new ApiError('Usuario no autenticado', 401);

            const result = await this.userService.deactivate(id, adminId);
            ApiResponse.success(res, result, result.message);
        } catch (error) {
            next(error);
        }
    }

    public async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = idSchema.parse(req.params);
            const adminId = (req.user as any)?.id;
            if (!adminId) throw new ApiError('Usuario no autenticado', 401);
            
            const { motivo } = req.body;
            const result = await this.userService.delete(id, adminId, motivo);
            ApiResponse.success(res, result, result.message);
        } catch (error) {
            next(error);
        }
    }

    public async searchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const searchParams = searchUserSchema.parse(req.query);
            const result = await this.userService.search(searchParams);
            ApiResponse.success(res, { total: result.pagination.total, pagina: result.pagination.page, limite: result.pagination.limit, total_paginas: result.pagination.totalPages, usuarios: result.data }, 'Búsqueda de usuarios exitosa');
        } catch (error) {
            next(error);
        }
    }

    public async checkUserByDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { tipo_documento, numero_documento } = req.params;
            const { excludeUserId } = req.query;
            
            if (!tipo_documento || !numero_documento) {
                throw new ApiError('Tipo de documento y número de documento son requeridos', 400);
            }
            
            const result = await this.userService.checkUserByDocument(tipo_documento, numero_documento, excludeUserId as string);
            
            // Siempre devolver status 200, pero con información clara sobre el estado
            ApiResponse.success(res, result, result.message || (result.userExists ? 'Usuario encontrado' : 'Usuario no encontrado'));
        } catch (error) {
            next(error);
        }
    }

    public async checkDocumentExists(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Obtener numero_documento desde params o query
            const numero_documento = req.params.numero_documento || req.query.numero_documento as string;
            const tipo_documento = req.query.tipo_documento as string;
            const { excludeUserId } = req.query;
            
            if (!numero_documento) {
                throw new ApiError('Número de documento es requerido', 400);
            }
            
            // Si se proporciona tipo_documento, usar el método extendido para trainers
            if (tipo_documento) {
                const result = await this.userService.checkUserByDocument(tipo_documento, numero_documento, excludeUserId as string);
                ApiResponse.success(res, result, result.userExists ? 'Usuario encontrado' : 'Usuario no encontrado');
            } else {
                // Método original para compatibilidad
                const result = await this.userService.checkDocumentExists(numero_documento, (excludeUserId as string) ?? '');
                ApiResponse.success(res, result , result.userExists ? 'Documento ya existe' : 'Documento disponible');
            }
        } catch (error) {
            next(error);
        }
    }

    public async checkEmailExists(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email } = req.params;
            const { excludeUserId } = req.query;
            if (!email) {
                throw new ApiError('Email es requerido', 400);
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new ApiError('Formato de email inválido', 400);
            }
            const result = await this.userService.checkEmailExists(email, excludeUserId as string | undefined);
            ApiResponse.success(res, result, result.exists ? 'Email ya existe' : 'Email disponible');
        } catch (error) {
            next(error);
        }
    }
}