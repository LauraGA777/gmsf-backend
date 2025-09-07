import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { QueryTypes, Transaction } from 'sequelize';
import { idSchema, updateUserSchema, searchUserSchema, userCreateSchema } from '../validators/user.validator';
import ApiResponse from '../utils/apiResponse';
import { UserService } from '../services/user.service';
import { ApiError } from '../errors/apiError';
import User from '../models/user';
import { Trainer } from '../models';
import Person from '../models/person.model';
import Role from '../models/role';
import sequelize from '../config/db';
import UserHistory from '../models/userHistory';
import Contract from '../models/contract';

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
            // Procesar fecha_nacimiento antes de la validación
            if (req.body.fecha_nacimiento) {
                req.body.fecha_nacimiento = this.normalizeBirthDate(req.body.fecha_nacimiento);
            }
            
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
            
            // Procesar fecha_nacimiento antes de la validación
            if (req.body.fecha_nacimiento) {
                req.body.fecha_nacimiento = this.normalizeBirthDate(req.body.fecha_nacimiento);
            }
            
            const updateData = updateUserSchema.parse(req.body);
            const updatedUser = await this.userService.update(id, updateData);
            ApiResponse.success(res, { usuario: updatedUser }, 'Usuario actualizado exitosamente');
        } catch (error) {
            next(error);
        }
    }

    // Método auxiliar para normalizar fechas de nacimiento
    private normalizeBirthDate(dateInput: string | Date): string {
        try {
            let date: Date;
            
            if (typeof dateInput === 'string') {
                // Si viene como string (ej: "2002-02-01" o "01/02/2002")
                if (dateInput.includes('/')) {
                    // Formato DD/MM/YYYY
                    const [day, month, year] = dateInput.split('/');
                    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                } else {
                    // Formato YYYY-MM-DD - crear fecha local sin zona horaria
                    const [year, month, day] = dateInput.split('-');
                    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                }
            } else {
                date = new Date(dateInput);
            }
            
            // Asegurar que sea mediodía en hora local para evitar problemas de zona horaria
            date.setHours(12, 0, 0, 0);
            
            // Devolver como string en formato ISO pero solo la fecha (YYYY-MM-DD)
            const normalizedDateString = date.toISOString().split('T')[0];
            
            console.log(`📅 Fecha original: ${dateInput}, Fecha normalizada: ${normalizedDateString}, Verificación: ${new Date(normalizedDateString).toLocaleDateString()}`);
            
            return normalizedDateString;
        } catch (error) {
            console.error('❌ Error normalizando fecha de nacimiento:', error);
            throw new ApiError('Formato de fecha de nacimiento inválido. Use formato YYYY-MM-DD o DD/MM/YYYY', 400);
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

            // ✅ FLEXIBLE: Aceptar motivo desde query params O body
            let motivo: string;

            if (req.query.motivo) {
                motivo = req.query.motivo as string;
            } else if (req.body.motivo) {
                motivo = req.body.motivo;
            } else {
                throw new ApiError('El motivo es requerido (como query parameter o en el body)', 400);
            }

            console.log(`🗑️ Eliminando usuario ${id} por motivo: ${motivo}`);

            const result = await this.deleteUserPermanently(id, adminId, motivo);
            ApiResponse.success(res, result, result.message);
        } catch (error) {
            next(error);
        }
    }

    // ✅ RENOMBRAR: El método original para lógica interna
    private async deleteUserPermanently(id: number, adminId: number, motivo: string) {
        const user = await User.findByPk(id);
        if (!user) {
            throw new ApiError('Usuario no encontrado', 404);
        }

        // ✅ NUEVA VALIDACIÓN: Verificar contratos activos antes de eliminar
        const contractValidation = await this.validateUserContractsForDeactivation(user.id);
        if (!contractValidation.canDeactivate) {
            throw new ApiError(contractValidation.message, 409);
        }

        const t = await sequelize.transaction();
        try {
            // ✅ PASO 1: Crear registro final en historial antes de eliminar
            await UserHistory.create({
                id_usuario: user.id,
                estado_anterior: user.estado,
                estado_nuevo: false, // Marcamos como eliminado
                usuario_cambio: adminId,
                motivo: `ELIMINACIÓN PERMANENTE: ${motivo}`
            }, { transaction: t });

            // ✅ PASO 2: Eliminar todos los registros del historial del usuario
            await UserHistory.destroy({
                where: { id_usuario: user.id },
                transaction: t
            });

            // ✅ PASO 3: Eliminar registros relacionados en cascada
            await this.deleteAssociatedRecords(user, t);

            // ✅ PASO 4: Finalmente eliminar el usuario
            await user.destroy({ transaction: t });

            await t.commit();
            return {
                success: true,
                message: `Usuario ${user.nombre} ${user.apellido} eliminado permanentemente. Motivo: ${motivo}`
            };

        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    // ✅ NUEVO MÉTODO: Eliminar registros asociados
    private async deleteAssociatedRecords(user: any, transaction: Transaction): Promise<void> {
        try {
            const role = await Role.findByPk(user.id_rol, { transaction });
            if (!role) return;

            switch (role.nombre) {
                case 'Cliente':
                    await this.deleteClientRecords(user.id, transaction);
                    break;
                case 'Entrenador':
                    await this.deleteTrainerRecords(user.id, transaction);
                    break;
                case 'Administrador':
                case 'Empleado':
                    console.log(`Usuario ${role.nombre} - sin registros adicionales que eliminar`);
                    break;
            }
        } catch (error) {
            console.error('Error eliminando registros asociados:', error);
            throw error;
        }
    }

    // ✅ MÉTODO ESPECÍFICO: Eliminar registros de cliente
    private async deleteClientRecords(userId: number, transaction: Transaction): Promise<void> {
        const person = await Person.findOne({
            where: { id_usuario: userId },
            transaction
        });

        if (person) {
            await person.destroy({ transaction });
            console.log(`Persona ${person.codigo} eliminada`);
        }
    }

    // ✅ MÉTODO ESPECÍFICO: Eliminar registros de entrenador
    private async deleteTrainerRecords(userId: number, transaction: Transaction): Promise<void> {
        const trainer = await Trainer.findOne({
            where: { id_usuario: userId },
            transaction
        });

        if (trainer) {
            await trainer.destroy({ transaction });
            console.log(`Entrenador ${trainer.codigo} eliminado`);
        }
    }

    // ✅ MÉTODO DE VALIDACIÓN: Verificar contratos activos antes de desactivar
    private async validateUserContractsForDeactivation(userId: number): Promise<{ canDeactivate: boolean; message: string }> {
        try {
            // 1. Verificar contratos donde el usuario es el titular (a través de persona)
            const userAsClientContracts = await sequelize.query(`
            SELECT c.id, c.codigo, c.fecha_inicio, c.fecha_fin, c.estado,
                    p.codigo as persona_codigo
            FROM contratos c 
            INNER JOIN personas p ON c.id_persona = p.id_persona 
            WHERE p.id_usuario = :userId 
            AND c.estado = 'Activo' 
            AND c.fecha_inicio <= NOW() 
            AND c.fecha_fin >= NOW()
        `, {
                replacements: { userId },
                type: QueryTypes.SELECT
            });

            // 2. Verificar contratos que el usuario registró (como empleado/admin)
            const userRegisteredContracts = await sequelize.query(`
            SELECT COUNT(*) as total
            FROM contratos 
            WHERE usuario_registro = :userId 
            AND estado = 'Activo' 
            AND fecha_inicio <= NOW() 
            AND fecha_fin >= NOW()
        `, {
                replacements: { userId },
                type: QueryTypes.SELECT
            });

            const clientContracts = userAsClientContracts as any[];
            const registeredCount = (userRegisteredContracts[0] as any).total;
            const totalActiveContracts = clientContracts.length + parseInt(registeredCount);

            // 3. Si tiene contratos activos, no se puede eliminar
            if (totalActiveContracts > 0) {
                let message = `No se puede eliminar el usuario porque tiene ${totalActiveContracts} contrato(s) activo(s)`;

                if (clientContracts.length > 0) {
                    const contractDetails = clientContracts.map((c: any) =>
                        `${c.codigo} (vence: ${new Date(c.fecha_fin).toLocaleDateString()})`
                    ).join(', ');
                    message += `. Como titular: ${contractDetails}`;
                }

                if (registeredCount > 0) {
                    message += `. Contratos registrados por este usuario: ${registeredCount}`;
                }

                message += '. Debe finalizar o cancelar los contratos antes de eliminar el usuario.';

                return {
                    canDeactivate: false,
                    message
                };
            }

            return {
                canDeactivate: true,
                message: 'Usuario puede ser eliminado - no tiene contratos activos'
            };

        } catch (error) {
            console.error('Error al validar contratos del usuario:', error);
            return {
                canDeactivate: false,
                message: 'Error al validar contratos del usuario. Por seguridad, no se permite la eliminación.'
            };
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
                ApiResponse.success(res, result, result.userExists ? 'Documento ya existe' : 'Documento disponible');
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