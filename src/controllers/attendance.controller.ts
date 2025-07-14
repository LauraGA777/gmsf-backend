import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { z } from 'zod';
import Attendance from '../models/attendance';
import User from '../models/user';
import Contract from '../models/contract';
import Person from '../models/person.model';
import Membership from '../models/membership';
import ApiResponse from '../utils/apiResponse';
import DateTimeUtils from '../utils/datetime.utils';
import {
    listAttendanceSchema,
    searchAttendanceSchema,
    idSchema,
} from '../validators/attendance.validator';

// Esquema de validación para las estadísticas
const statsQuerySchema = z.object({
    period: z.enum(['daily', 'monthly', 'yearly']).optional().default('monthly'),
    date: z.string().optional(),
    month: z.string().optional(),
    year: z.string().optional()
});
export class AttendanceController {
    // Obtener todas las asistencias con paginación y filtros ✅
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
                        as: "persona_asistencia",
                        attributes: ["codigo", "id_usuario"],
                        include: [{
                            model: User,
                            as: "usuario",
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
                        as: "persona_asistencia",
                        include: [{
                            model: User,
                            as: "usuario",
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

    // Registrar nueva asistencia ✅
    public async create(req: Request, res: Response) {
        const startTime = Date.now();
        console.log('[Attendance] Iniciando registro de asistencia:', req.body);
        console.log('[Attendance] Información de zona horaria:', DateTimeUtils.getTimezoneInfo());

        try {
            // 1. Validar datos de entrada
            const { numero_documento } = req.body;
            const userId = (req.user as any)?.id;

            if (!numero_documento || !userId) {
                console.error('[Attendance] Datos de entrada faltantes:', { numero_documento, userId });
                return ApiResponse.error(res, "Datos de entrada inválidos", 400);
            }

            console.log('[Attendance] Paso 1 completado - Validación exitosa');

            // 2. Buscar persona con mejor manejo de errores
            const person = await Person.findOne({
                include: [{
                    model: User,
                    as: 'usuario',
                    where: { numero_documento },
                    attributes: ['numero_documento', 'id']
                }]
            });

            if (!person || !person.id_persona) {
                console.error('[Attendance] Persona no encontrada:', { numero_documento });
                return ApiResponse.error(res, "Persona no encontrada", 404);
            }

            console.log('[Attendance] Paso 2 completado - Persona encontrada:', person.id_persona);

            // 3. Buscar contrato activo con fecha actual en zona horaria de Bogotá
            const now = DateTimeUtils.nowInBogota();
            const contract = await Contract.findOne({
                where: {
                    id_persona: person.id_persona,
                    estado: "Activo",
                    fecha_inicio: {
                        [Op.lte]: now
                    },
                    fecha_fin: {
                        [Op.gte]: now
                    }
                },
                include: [{
                    model: Membership,
                    as: 'membresia'
                }]
            });

            // 4. Verificar contrato
            if (!contract || !contract.id) {
                console.error('[Attendance] Contrato no encontrado:', { person_id: person.id_persona });
                return ApiResponse.error(res, "No se encontró un contrato activo", 400);
            }

            console.log('[Attendance] Paso 3-4 completado - Contrato encontrado:', contract.id);

            // 5. Verificar asistencia existente usando zona horaria de Bogotá
            const todayRange = DateTimeUtils.getTodayRange();

            const existingAttendance = await Attendance.findOne({
                where: {
                    id_persona: person.id_persona,
                    fecha_uso: {
                        [Op.gte]: todayRange.start,
                        [Op.lte]: todayRange.end
                    },
                    estado: "Activo"
                }
            });

            if (existingAttendance) {
                console.log('[Attendance] Asistencia ya existe para hoy:', existingAttendance.id);
                return ApiResponse.error(res, "Ya registró asistencia hoy", 400);
            }

            console.log('[Attendance] Paso 5 completado - No hay asistencia previa');

            // 6. Crear asistencia con try-catch específico
            let newAttendance;
            try {
                const attendanceData = {
                    id_persona: person.id_persona,
                    id_contrato: contract.id,
                    fecha_uso: DateTimeUtils.todayInBogota(),
                    hora_registro: DateTimeUtils.currentTimeInBogota(),
                    estado: "Activo" as "Activo",
                    usuario_registro: userId,
                    fecha_registro: DateTimeUtils.nowInBogota(),
                    fecha_actualizacion: DateTimeUtils.nowInBogota()
                };

                console.log('[Attendance] Creando asistencia con datos:', attendanceData);
                newAttendance = await Attendance.create(attendanceData);
                console.log('[Attendance] Paso 6 completado - Asistencia creada:', newAttendance.id);
            } catch (createError) {
                console.error('[Attendance] Error al crear asistencia:', createError);
                return ApiResponse.error(res, "Error al crear la asistencia", 500);
            }

            // 7. Incrementar contador de asistencias
            try {
                if (person.id_usuario) {
                    await User.increment('asistencias_totales', {
                        by: 1,
                        where: { id: person.id_usuario }
                    });
                    console.log('[Attendance] Paso 7 completado - Contador incrementado');
                }
            } catch (incrementError) {
                console.error('[Attendance] Error al incrementar contador:', incrementError);
                // No retornamos error aquí para no afectar el registro principal
            }

            // 8. Obtener los detalles completos con mejor manejo de errores
            let createdAttendance;
            try {
                createdAttendance = await Attendance.findByPk(newAttendance.id, {
                    include: [
                        {
                            model: Person,
                            as: "persona_asistencia",
                            attributes: ['id_persona', 'codigo', 'id_usuario', 'estado'],
                            include: [{
                                model: User,
                                as: "usuario",
                                attributes: ['nombre', 'apellido', 'numero_documento']
                            }]
                        },
                        {
                            model: Contract,
                            as: "contrato",
                            attributes: ['id', 'codigo', 'estado', 'fecha_inicio', 'fecha_fin'],
                            include: [{
                                model: Membership,
                                as: "membresia",
                                attributes: ['id', 'nombre', 'descripcion', 'precio']
                            }]
                        }
                    ]
                });
            } catch (includeError) {
                console.error('[Attendance] Error al obtener detalles con includes:', includeError);

                // Intentar obtener solo la asistencia sin includes como fallback
                try {
                    createdAttendance = await Attendance.findByPk(newAttendance.id);
                } catch (fallbackError) {
                    console.error('[Attendance] Error en fallback:', fallbackError);
                    // Si todo falla, devolver la asistencia básica creada
                    createdAttendance = newAttendance;
                }
            }

            if (!createdAttendance) {
                console.error('[Attendance] No se pudo obtener la asistencia creada');
                // Aunque no se puedan obtener los detalles, la asistencia se creó exitosamente
                return ApiResponse.success(
                    res,
                    {
                        id: newAttendance.id,
                        message: "Asistencia registrada exitosamente, pero no se pudieron obtener todos los detalles"
                    },
                    "Asistencia registrada exitosamente",
                    undefined,
                    201
                );
            }

            // 9. Retornar respuesta exitosa
            return ApiResponse.success(
                res,
                createdAttendance,
                "Asistencia registrada exitosamente",
                undefined,
                201
            );

        } catch (error) {
            console.error('[Attendance] Error general no manejado:', error);

            // Si llegamos aquí y no es un error conocido, es un error inesperado
            if (error instanceof Error) {
                console.error('[Attendance] Stack trace:', error.stack);
            }

            return ApiResponse.error(
                res,
                "Error interno al registrar asistencia",
                500
            );
        }
    }

    // Obtener detalles de una asistencia✅
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
                        as: "persona_asistencia",
                        include: [{
                            model: User,
                            as: "usuario",
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

    /* // Actualizar asistencia
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
    } */

    // Eliminar asistencia (borrado lógico)✅
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

    // Obtener estadísticas de asistencia✅
    public async getStats(req: Request, res: Response) {
        try {
            const { period, date, month, year } = statsQuerySchema.parse(req.query);

            let startDate: Date;
            let endDate: Date;

            // Configurar fechas según el período
            if (period === 'daily') {
                const targetDate = date ? new Date(date) : new Date();
                startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
                endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
            } else if (period === 'monthly') {
                const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();
                const targetYear = year ? parseInt(year) : new Date().getFullYear();
                startDate = new Date(targetYear, targetMonth, 1);
                endDate = new Date(targetYear, targetMonth + 1, 0);
            } else { // yearly
                const targetYear = year ? parseInt(year) : new Date().getFullYear();
                startDate = new Date(targetYear, 0, 1);
                endDate = new Date(targetYear, 11, 31);
            }

            // Obtener estadísticas
            const [total, activos, eliminados, attendanceHistory] = await Promise.all([
                Attendance.count({
                    where: {
                        fecha_uso: {
                            [Op.between]: [startDate, endDate]
                        }
                    }
                }),
                Attendance.count({
                    where: {
                        fecha_uso: {
                            [Op.between]: [startDate, endDate]
                        },
                        estado: "Activo"
                    }
                }),
                Attendance.count({
                    where: {
                        fecha_uso: {
                            [Op.between]: [startDate, endDate]
                        },
                        estado: "Eliminado"
                    }
                }),
                // Historial de asistencias para gráfico
                Attendance.findAll({
                    attributes: [
                        [Attendance.sequelize!.fn('DATE', Attendance.sequelize!.col('fecha_uso')), 'date'],
                        [Attendance.sequelize!.fn('COUNT', Attendance.sequelize!.col('id')), 'count']
                    ],
                    where: {
                        fecha_uso: {
                            [Op.between]: [startDate, endDate]
                        },
                        estado: "Activo"
                    },
                    group: [Attendance.sequelize!.fn('DATE', Attendance.sequelize!.col('fecha_uso'))],
                    order: [[Attendance.sequelize!.fn('DATE', Attendance.sequelize!.col('fecha_uso')), 'ASC']],
                    raw: true
                })
            ]);

            return ApiResponse.success(
                res,
                {
                    total,
                    activos,
                    eliminados,
                    attendanceHistory,
                    period: {
                        type: period,
                        startDate,
                        endDate
                    }
                },
                "Estadísticas de asistencia obtenidas exitosamente"
            );

        } catch (error) {
            console.error("Error al obtener estadísticas de asistencia:", error);
            if (error instanceof z.ZodError) {
                return ApiResponse.error(
                    res,
                    "Parámetros de consulta inválidos",
                    400,
                    error.errors.map(err => ({
                        campo: err.path.join('.'),
                        mensaje: err.message
                    }))
                );
            }
            return ApiResponse.error(res, "Error al obtener las estadísticas de asistencia");
        }
    }

    public async getClientAttendanceHistory(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = (page - 1) * limit;

            // Obtener la persona asociada al usuario directamente
            const person = await Person.findOne({
                where: {
                    id_usuario: id,
                    estado: true
                },
                attributes: ['id_persona']
            });

            if (!person) {
                return ApiResponse.error(
                    res,
                    "Cliente no encontrado",
                    404
                );
            }

            const { count, rows: attendances } = await Attendance.findAndCountAll({
                where: {
                    id_persona: person.id_persona,
                    estado: "Activo"
                },
                include: [{
                    model: Contract,
                    as: "contrato",
                    attributes: ['codigo'],
                    include: [{
                        model: Membership,
                        as: "membresia",
                        attributes: ['nombre']
                    }]
                }],
                order: [['fecha_uso', 'DESC']],
                limit,
                offset,
                attributes: [
                    'id', 'fecha_uso', 'hora_registro', 'estado', 'fecha_registro'
                ]
            });

            return ApiResponse.success(
                res,
                attendances,
                "Historial de asistencias obtenido exitosamente",
                {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit)
                }
            );

        } catch (error) {
            console.error("Error al obtener historial de asistencias:", error);
            return ApiResponse.error(res, "Error al obtener el historial de asistencias");
        }
    }

    // Método auxiliar para obtener estadísticas de asistencia
    public async getClientAttendanceStats(personId: number | undefined, startDate: Date, endDate: Date) {
        if (!personId) {
            return {
                totalAttendances: 0,
                currentMonth: 0,
                currentWeek: 0,
                averagePerWeek: 0,
                lastAttendance: null
            };
        }

        const [total, currentPeriod, lastAttendance] = await Promise.all([
            Attendance.count({
                where: {
                    id_persona: personId,
                    estado: "Activo"
                }
            }),
            Attendance.count({
                where: {
                    id_persona: personId,
                    fecha_uso: {
                        [Op.between]: [startDate, endDate]
                    },
                    estado: "Activo"
                }
            }),
            Attendance.findOne({
                where: {
                    id_persona: personId,
                    estado: "Activo"
                },
                order: [['fecha_uso', 'DESC']],
                attributes: ['fecha_uso', 'hora_registro']
            })
        ]);

        // Calcular promedio semanal
        const weeksDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        const averagePerWeek = weeksDiff > 0 ? currentPeriod / weeksDiff : 0;

        return {
            totalAttendances: total,
            currentPeriod,
            averagePerWeek: Math.round(averagePerWeek * 100) / 100,
            lastAttendance
        };
    }

    // Controlador para obtener rangos de fecha según el período
    public async getClientDateRangeByPeriod(req: Request, res: Response) {
        try {
            const { period = 'monthly' } = req.query;
            const userId = (req.user as any)?.id;

            if (!userId) {
                return ApiResponse.error(res, "Usuario no autenticado", 401);
            }

            // Obtener la persona asociada al usuario
            const person = await Person.findOne({
                where: { id_usuario: userId, estado: true },
                attributes: ['id_persona']
            });

            if (!person) {
                return ApiResponse.error(res, "Cliente no encontrado", 404);
            }

            let dateRange;
            switch (period) {
                case 'daily':
                    dateRange = DateTimeUtils.getTodayRange();
                    break;
                case 'weekly':
                    dateRange = DateTimeUtils.getCurrentWeekRange();
                    break;
                case 'monthly':
                    dateRange = DateTimeUtils.getCurrentMonthRange();
                    break;
                case 'yearly':
                    dateRange = DateTimeUtils.getCurrentYearRange();
                    break;
                default:
                    dateRange = DateTimeUtils.getCurrentMonthRange();
            }

            // Obtener asistencias en el rango de fechas
            const attendances = await Attendance.findAll({
                where: {
                    id_persona: person.id_persona,
                    fecha_uso: {
                        [Op.between]: [dateRange.start, dateRange.end]
                    },
                    estado: "Activo"
                },
                order: [['fecha_uso', 'ASC']],
                attributes: ['id', 'fecha_uso', 'hora_registro']
            });

            return ApiResponse.success(
                res,
                {
                    period,
                    dateRange,
                    attendances,
                    total: attendances.length
                },
                "Rango de fechas obtenido exitosamente"
            );

        } catch (error) {
            console.error("Error al obtener rango de fechas:", error);
            return ApiResponse.error(res, "Error al obtener el rango de fechas");
        }
    }

    // Controlador para obtener estadísticas del cliente
    public async getClientStatsController(req: Request, res: Response) {
        try {
            const { period = 'monthly' } = req.query;
            const userId = (req.user as any)?.id;

            if (!userId) {
                return ApiResponse.error(res, "Usuario no autenticado", 401);
            }

            // Obtener la persona asociada al usuario
            const person = await Person.findOne({
                where: { id_usuario: userId, estado: true },
                attributes: ['id_persona']
            });

            if (!person) {
                return ApiResponse.error(res, "Cliente no encontrado", 404);
            }

            let dateRange;
            switch (period) {
                case 'daily':
                    dateRange = DateTimeUtils.getTodayRange();
                    break;
                case 'weekly':
                    dateRange = DateTimeUtils.getCurrentWeekRange();
                    break;
                case 'monthly':
                    dateRange = DateTimeUtils.getCurrentMonthRange();
                    break;
                case 'yearly':
                    dateRange = DateTimeUtils.getCurrentYearRange();
                    break;
                default:
                    dateRange = DateTimeUtils.getCurrentMonthRange();
            }

            // Obtener estadísticas usando el método auxiliar
            const stats = await this.getClientAttendanceStats(
                person.id_persona,
                dateRange.start,
                dateRange.end
            );

            return ApiResponse.success(
                res,
                {
                    period,
                    dateRange,
                    stats
                },
                "Estadísticas del cliente obtenidas exitosamente"
            );

        } catch (error) {
            console.error("Error al obtener estadísticas del cliente:", error);
            return ApiResponse.error(res, "Error al obtener las estadísticas del cliente");
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
export const getStats = attendanceController.getStats.bind(attendanceController);
export const getClientAttendanceHistory = attendanceController.getClientAttendanceHistory.bind(attendanceController);
export const getClientDateRangeByPeriod = attendanceController.getClientDateRangeByPeriod.bind(attendanceController);
export const getClientAttendanceStats = attendanceController.getClientStatsController.bind(attendanceController);

// Exportar el controlador por defecto
export default attendanceController;