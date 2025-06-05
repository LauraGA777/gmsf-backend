import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { z } from 'zod';
import Attendance from '../models/attendance';
import User from '../models/user';
import Contract from '../models/contract';
import Person from '../models/person';
import Membership from '../models/membership';
import ApiResponse from '../utils/apiResponse';
import {
    listAttendanceSchema,
    searchAttendanceSchema,
    createAttendanceSchema,
    updateAttendanceSchema,
    idSchema,

} from '../validators/attendance.validator';

export class AttendanceController {
    // Obtener todas las asistencias con paginación y filtros
    public async getAll(req: Request, res: Response) {
        try {
            const validatedParams = listAttendanceSchema.parse(req.query);
        const { 
            page = '1', 
            limit = '10', 
            orderBy = 'fecha_uso', 
            direction = 'DESC',
            fecha_inicio,
            fecha_fin
            } = validatedParams;

            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;

            const whereClause: any = { estado: "Activo" };
        if (fecha_inicio && fecha_fin) {
                whereClause.fecha_uso = {
                [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
            };
        }

            const { count, rows: attendances } = await Attendance.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: Person,
                        as: "persona",
                        attributes: ["codigo", "id_usuario"],
                        include: [{
                            model: User,
                            attributes: ["nombre", "apellido", "numero_documento"]
                        }]
                    },
                    {
                        model: Contract,
                        as: "contrato",
                        attributes: ["codigo", "estado"]
                    }
                ],
                order: [[orderBy, direction]],
                limit: limitNum,
                offset
            });

            return ApiResponse.success(
                res, 
                attendances, 
                "Asistencias obtenidas exitosamente",
                {
                    total: count,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(count / limitNum)
                }
            );
        } catch (error) {
            console.error("Error al obtener asistencias:", error);
            if (error instanceof z.ZodError) {
                return ApiResponse.error(
                    res,
                    "Parámetros de consulta inválidos",
                    400,
                    error.errors
                );
            }
            return ApiResponse.error(res, "Error al obtener las asistencias");
        }
    }

// Buscar asistencias
    public async search(req: Request, res: Response) {
    try {
            const validatedParams = searchAttendanceSchema.parse(req.query);
        const { 
            codigo_usuario,
            nombre_usuario,
                estado,
            fecha_inicio,
            fecha_fin,
            page = '1',
            limit = '10',
            orderBy = 'fecha_uso',
            direction = 'DESC'
            } = validatedParams;

            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;

            const whereClause: any = {};
            if (estado) whereClause.estado = estado;
            if (fecha_inicio && fecha_fin) {
                whereClause.fecha_uso = {
                    [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
                };
            }

            const { count, rows: attendances } = await Attendance.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: Person,
                        as: "persona",
                        include: [{
                            model: User,
                            where: {
                                ...(codigo_usuario && { codigo: codigo_usuario }),
                                ...(nombre_usuario && {
                                    [Op.or]: [
                                        { nombre: { [Op.iLike]: `%${nombre_usuario}%` } },
                                        { apellido: { [Op.iLike]: `%${nombre_usuario}%` } }
                                    ]
                                })
                            },
                            attributes: ["nombre", "apellido", "numero_documento", "codigo"]
                        }]
                    },
                    {
                        model: Contract,
                        as: "contrato",
                        include: [{
                            model: Membership,
                            as: "membresia"
                        }]
                    }
                ],
                order: [[orderBy, direction]],
                limit: limitNum,
                offset
            });

            return ApiResponse.success(
                res,
                attendances,
                "Búsqueda realizada exitosamente",
                {
                    total: count,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(count / limitNum)
                }
            );
        } catch (error) {
            console.error("Error en la búsqueda:", error);
            if (error instanceof z.ZodError) {
                return ApiResponse.error(
                    res,
                    "Parámetros de búsqueda inválidos",
                    400,
                    error.errors
                );
            }
            return ApiResponse.error(res, "Error al realizar la búsqueda");
        }
    }

    // Registrar nueva asistencia
    public async create(req: Request, res: Response) {
        try {
            const { numero_documento } = req.body;
            const userId = (req.user as any)?.id;

            // Buscar persona por número de documento
            const person = await Person.findOne({
                    include: [{
                        model: User,
                    where: { 
                        numero_documento,
                        estado: true
                    }
                }]
            });

            if (!person) {
                return ApiResponse.error(
                    res, 
                    "Persona no encontrada o usuario inactivo",
                    404
                );
            }

            // Buscar contrato activo
            const contract = await Contract.findOne({
                where: {
                    id_persona: person.id_persona,
                    estado: "Activo",
                    fecha_inicio: {
                        [Op.lte]: new Date()
                    },
                    fecha_fin: {
                        [Op.gte]: new Date()
                    }
                }
            });

            if (!contract) {
                return ApiResponse.error(
                    res,
                    "No se encontró un contrato activo para esta persona",
                    400
                );
            }

            // Verificar si ya registró asistencia hoy
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const existingAttendance = await Attendance.findOne({
                where: {
                    id_persona: person.id_persona,
                    fecha_uso: today,
                    estado: "Activo"
                }
            });

            if (existingAttendance) {
                return ApiResponse.error(
                    res,
                    "Ya se registró una asistencia hoy para esta persona",
                    400
                );
            }

            // Validar datos de asistencia
            const attendanceData = createAttendanceSchema.parse({
                id_persona: person.id_persona,
                id_contrato: contract.id,
                fecha_uso: today,
                hora_registro: new Date(),
                estado: "Activo",
                usuario_registro: userId
            });

            // Registrar la asistencia
            const newAttendance = await Attendance.create({
                ...attendanceData,
                fecha_registro: new Date(),
                fecha_actualizacion: new Date()
            });

            // Incrementar contador de asistencias del usuario
            if (person.id_usuario) {
                await User.increment('asistencias_totales', {
                    by: 1,
                    where: { id: person.id_usuario }
                });
            }

            // Obtener la asistencia con datos completos
            const attendance = await Attendance.findByPk(newAttendance.id, {
                include: [
                    {
                        model: Person,
                        as: "persona",
                    include: [{
                        model: User,
                            attributes: ["nombre", "apellido", "numero_documento"]
                        }]
                    },
                    {
                        model: Contract,
                        as: "contrato",
                        include: [{
                            model: Membership,
                            as: "membresia"
                        }]
                    }
                ]
            });

            return ApiResponse.success(
                res,
                attendance,
                "Asistencia registrada exitosamente",
                undefined,
                201
            );

        } catch (error) {
            console.error("Error al registrar asistencia:", error);
            if (error instanceof z.ZodError) {
                return ApiResponse.error(
                    res,
                    "Datos de asistencia inválidos",
                    400,
                    error.errors.map(err => ({
                        campo: err.path.join('.'),
                        mensaje: err.message
                    }))
                );
            }
            return ApiResponse.error(res, "Error al registrar la asistencia");
        }
    }

// Obtener detalles de una asistencia
    public async getById(req: Request, res: Response) {
        try {
            const { id } = idSchema.parse(req.params);

            const attendance = await Attendance.findOne({
                where: { 
                    id,
                    estado: "Activo"
                },
                include: [
                    {
                        model: Person,
                        as: "persona",
                include: [{
                    model: User,
                            attributes: ["nombre", "apellido", "numero_documento"]
                        }]
                    },
                    {
                        model: Contract,
                        as: "contrato",
                        include: [{
                            model: Membership,
                            as: "membresia"
                        }]
                    }
                ]
        });

        if (!attendance) {
                return ApiResponse.error(
                    res,
                    "Asistencia no encontrada",
                    404
                );
            }

            return ApiResponse.success(
                res,
                attendance,
                "Detalles de asistencia obtenidos exitosamente"
            );

    } catch (error) {
            console.error("Error al obtener asistencia:", error);
        if (error instanceof z.ZodError) {
                return ApiResponse.error(
                    res,
                    "ID de asistencia inválido",
                    400,
                    error.errors
                );
            }
            return ApiResponse.error(res, "Error al obtener los detalles de la asistencia");
        }
    }

    // Actualizar asistencia
    public async update(req: Request, res: Response) {
        try {
            const { id } = idSchema.parse(req.params);
            const userId = (req.user as any)?.id;

            const updateData = updateAttendanceSchema.parse({
                ...req.body,
                usuario_actualizacion: userId
            });

            const attendance = await Attendance.findByPk(id);

            if (!attendance) {
                return ApiResponse.error(
                    res,
                    "Asistencia no encontrada",
                    404
                );
            }

            await attendance.update({
                ...updateData,
                fecha_actualizacion: new Date()
            });

            return ApiResponse.success(
                res,
                attendance,
                "Asistencia actualizada correctamente"
            );

        } catch (error) {
            console.error("Error al actualizar asistencia:", error);
            if (error instanceof z.ZodError) {
                return ApiResponse.error(
                    res,
                    "Datos de actualización inválidos",
                    400,
                    error.errors
                );
            }
            return ApiResponse.error(res, "Error al actualizar la asistencia");
        }
    }

    // Eliminar asistencia (borrado lógico)
    public async delete(req: Request, res: Response) {
        try {
            const { id } = idSchema.parse(req.params);
            const userId = (req.user as any)?.id;

            const attendance = await Attendance.findByPk(id);

            if (!attendance) {
                return ApiResponse.error(
                    res,
                    "Asistencia no encontrada",
                    404
                );
            }

            // Actualizar estado a "Eliminado"
            await attendance.update({
                estado: "Eliminado",
                usuario_actualizacion: userId,
                fecha_actualizacion: new Date()
            });

            // Decrementar contador de asistencias
            const person = await Person.findByPk(attendance.id_persona);
            if (person?.id_usuario) {
                await User.decrement('asistencias_totales', {
                    by: 1,
                    where: { id: person.id_usuario }
                });
            }

            return ApiResponse.success(
                res,
                null,
                "Asistencia eliminada correctamente"
            );

    } catch (error) {
            console.error("Error al eliminar asistencia:", error);
        if (error instanceof z.ZodError) {
                return ApiResponse.error(
                    res,
                    "ID de asistencia inválido",
                    400,
                    error.errors
                );
            }
            return ApiResponse.error(res, "Error al eliminar la asistencia");
        }
    }
}

// Crear una instancia del controlador
const attendanceController = new AttendanceController();

// Exportar las funciones del controlador
export const registerAttendance = attendanceController.create.bind(attendanceController);
export const getAttendances = attendanceController.getAll.bind(attendanceController);
export const searchAttendances = attendanceController.search.bind(attendanceController);
export const getAttendanceDetails = attendanceController.getById.bind(attendanceController);
export const deleteAttendances = attendanceController.delete.bind(attendanceController);

// Exportar el controlador por defecto
export default attendanceController; 