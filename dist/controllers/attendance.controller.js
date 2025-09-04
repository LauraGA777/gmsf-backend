"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyAttendanceStats = exports.getMyAttendanceHistory = exports.getClientAttendanceStats = exports.getClientDateRangeByPeriod = exports.getClientAttendanceHistory = exports.getStats = exports.deleteAttendances = exports.getAttendanceDetails = exports.searchAttendances = exports.getAttendances = exports.registerAttendance = exports.AttendanceController = void 0;
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const attendance_1 = __importDefault(require("../models/attendance"));
const user_1 = __importDefault(require("../models/user"));
const contract_1 = __importDefault(require("../models/contract"));
const person_model_1 = __importDefault(require("../models/person.model"));
const membership_1 = __importDefault(require("../models/membership"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const datetime_utils_1 = __importDefault(require("../utils/datetime.utils"));
const attendance_validator_1 = require("../validators/attendance.validator");
// Esquema de validación para las estadísticas
const statsQuerySchema = zod_1.z.object({
    period: zod_1.z.enum(['daily', 'monthly', 'yearly']).optional().default('monthly'),
    date: zod_1.z.string().optional(),
    month: zod_1.z.string().optional(),
    year: zod_1.z.string().optional()
});
class AttendanceController {
    // Obtener todas las asistencias con paginación y filtros ✅
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validatedParams = attendance_validator_1.listAttendanceSchema.parse(req.query);
                const { page = '1', limit = '10', orderBy = 'fecha_uso', direction = 'DESC', fecha_inicio, fecha_fin } = validatedParams;
                const pageNum = parseInt(page);
                const limitNum = parseInt(limit);
                const offset = (pageNum - 1) * limitNum;
                const whereClause = { estado: "Activo" };
                if (fecha_inicio && fecha_fin) {
                    whereClause.fecha_uso = {
                        [sequelize_1.Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
                    };
                }
                const { count, rows: attendances } = yield attendance_1.default.findAndCountAll({
                    where: whereClause,
                    include: [
                        {
                            model: person_model_1.default,
                            as: "persona_asistencia",
                            attributes: ["codigo", "id_usuario"],
                            include: [{
                                    model: user_1.default,
                                    as: "usuario",
                                    attributes: ["nombre", "apellido", "numero_documento"]
                                }]
                        },
                        {
                            model: contract_1.default,
                            as: "contrato",
                            attributes: ["codigo", "estado"]
                        }
                    ],
                    order: [[orderBy, direction]],
                    limit: limitNum,
                    offset
                });
                return apiResponse_1.default.success(res, attendances, "Asistencias obtenidas exitosamente", {
                    total: count,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(count / limitNum)
                });
            }
            catch (error) {
                console.error("Error al obtener asistencias:", error);
                if (error instanceof zod_1.z.ZodError) {
                    return apiResponse_1.default.error(res, "Parámetros de consulta inválidos", 400, error.errors);
                }
                return apiResponse_1.default.error(res, "Error al obtener las asistencias");
            }
        });
    }
    // Buscar asistencias
    search(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validatedParams = attendance_validator_1.searchAttendanceSchema.parse(req.query);
                const { codigo_usuario, nombre_usuario, estado, fecha_inicio, fecha_fin, page = '1', limit = '10', orderBy = 'fecha_uso', direction = 'DESC' } = validatedParams;
                const pageNum = parseInt(page);
                const limitNum = parseInt(limit);
                const offset = (pageNum - 1) * limitNum;
                const whereClause = {};
                if (estado)
                    whereClause.estado = estado;
                if (fecha_inicio && fecha_fin) {
                    whereClause.fecha_uso = {
                        [sequelize_1.Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
                    };
                }
                const { count, rows: attendances } = yield attendance_1.default.findAndCountAll({
                    where: whereClause,
                    include: [
                        {
                            model: person_model_1.default,
                            as: "persona_asistencia",
                            include: [{
                                    model: user_1.default,
                                    as: "usuario",
                                    where: Object.assign(Object.assign({}, (codigo_usuario && { codigo: codigo_usuario })), (nombre_usuario && {
                                        [sequelize_1.Op.or]: [
                                            { nombre: { [sequelize_1.Op.iLike]: `%${nombre_usuario}%` } },
                                            { apellido: { [sequelize_1.Op.iLike]: `%${nombre_usuario}%` } }
                                        ]
                                    })),
                                    attributes: ["nombre", "apellido", "numero_documento", "codigo"]
                                }]
                        },
                        {
                            model: contract_1.default,
                            as: "contrato",
                            include: [{
                                    model: membership_1.default,
                                    as: "membresia"
                                }]
                        }
                    ],
                    order: [[orderBy, direction]],
                    limit: limitNum,
                    offset
                });
                return apiResponse_1.default.success(res, attendances, "Búsqueda realizada exitosamente", {
                    total: count,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(count / limitNum)
                });
            }
            catch (error) {
                console.error("Error en la búsqueda:", error);
                if (error instanceof zod_1.z.ZodError) {
                    return apiResponse_1.default.error(res, "Parámetros de búsqueda inválidos", 400, error.errors);
                }
                return apiResponse_1.default.error(res, "Error al realizar la búsqueda");
            }
        });
    }
    // Registrar nueva asistencia ✅
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const startTime = Date.now();
            console.log('[Attendance] Iniciando registro de asistencia:', req.body);
            console.log('[Attendance] Información de zona horaria:', datetime_utils_1.default.getTimezoneInfo());
            try {
                // 1. Validar datos de entrada
                const { numero_documento } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!numero_documento || !userId) {
                    console.error('[Attendance] Datos de entrada faltantes:', { numero_documento, userId });
                    return apiResponse_1.default.error(res, "Datos de entrada inválidos", 400);
                }
                console.log('[Attendance] Paso 1 completado - Validación exitosa');
                // 2. Buscar persona con mejor manejo de errores
                const person = yield person_model_1.default.findOne({
                    include: [{
                            model: user_1.default,
                            as: 'usuario',
                            where: { numero_documento },
                            attributes: ['numero_documento', 'id']
                        }]
                });
                if (!person || !person.id_persona) {
                    console.error('[Attendance] Persona no encontrada:', { numero_documento });
                    return apiResponse_1.default.error(res, "Persona no encontrada", 404);
                }
                console.log('[Attendance] Paso 2 completado - Persona encontrada:', person.id_persona);
                // 3. Buscar contrato activo con fecha actual en zona horaria de Bogotá
                const now = datetime_utils_1.default.nowInBogota();
                const contract = yield contract_1.default.findOne({
                    where: {
                        id_persona: person.id_persona,
                        estado: "Activo",
                        fecha_inicio: {
                            [sequelize_1.Op.lte]: now
                        },
                        fecha_fin: {
                            [sequelize_1.Op.gte]: now
                        }
                    },
                    include: [{
                            model: membership_1.default,
                            as: 'membresia'
                        }]
                });
                // 4. Verificar contrato
                if (!contract || !contract.id) {
                    console.error('[Attendance] Contrato no encontrado:', { person_id: person.id_persona });
                    return apiResponse_1.default.error(res, "No se encontró un contrato activo", 400);
                }
                console.log('[Attendance] Paso 3-4 completado - Contrato encontrado:', contract.id);
                // 5. Verificar asistencia existente usando zona horaria de Bogotá
                const todayRange = datetime_utils_1.default.getTodayRange();
                const existingAttendance = yield attendance_1.default.findOne({
                    where: {
                        id_persona: person.id_persona,
                        fecha_uso: {
                            [sequelize_1.Op.gte]: todayRange.start,
                            [sequelize_1.Op.lte]: todayRange.end
                        },
                        estado: "Activo"
                    }
                });
                if (existingAttendance) {
                    console.log('[Attendance] Asistencia ya existe para hoy:', existingAttendance.id);
                    return apiResponse_1.default.error(res, "Ya registró asistencia hoy", 400);
                }
                console.log('[Attendance] Paso 5 completado - No hay asistencia previa');
                // 6. Crear asistencia con try-catch específico
                let newAttendance;
                const bogotaTime = datetime_utils_1.default.nowInBogota();
                const horaString = `${bogotaTime.getHours().toString().padStart(2, '0')}:${bogotaTime.getMinutes().toString().padStart(2, '0')}:${bogotaTime.getSeconds().toString().padStart(2, '0')}`;
                try {
                    const attendanceData = {
                        id_persona: person.id_persona,
                        id_contrato: contract.id,
                        fecha_uso: datetime_utils_1.default.todayInBogota(),
                        hora_registro: horaString,
                        estado: "Activo",
                        usuario_registro: userId,
                        fecha_registro: datetime_utils_1.default.nowInBogota(),
                        fecha_actualizacion: datetime_utils_1.default.nowInBogota()
                    };
                    console.log('[Attendance] Creando asistencia con datos:', attendanceData);
                    newAttendance = yield attendance_1.default.create(attendanceData);
                    console.log('[Attendance] Paso 6 completado - Asistencia creada:', newAttendance.id);
                }
                catch (createError) {
                    console.error('[Attendance] Error al crear asistencia:', createError);
                    return apiResponse_1.default.error(res, "Error al crear la asistencia", 500);
                }
                // 7. Incrementar contador de asistencias
                try {
                    if (person.id_usuario) {
                        yield user_1.default.increment('asistencias_totales', {
                            by: 1,
                            where: { id: person.id_usuario }
                        });
                        console.log('[Attendance] Paso 7 completado - Contador incrementado');
                    }
                }
                catch (incrementError) {
                    console.error('[Attendance] Error al incrementar contador:', incrementError);
                    // No retornamos error aquí para no afectar el registro principal
                }
                // 8. Obtener los detalles completos con mejor manejo de errores
                let createdAttendance;
                try {
                    createdAttendance = yield attendance_1.default.findByPk(newAttendance.id, {
                        include: [
                            {
                                model: person_model_1.default,
                                as: "persona_asistencia",
                                attributes: ['id_persona', 'codigo', 'id_usuario', 'estado'],
                                include: [{
                                        model: user_1.default,
                                        as: "usuario",
                                        attributes: ['nombre', 'apellido', 'numero_documento']
                                    }]
                            },
                            {
                                model: contract_1.default,
                                as: "contrato",
                                attributes: ['id', 'codigo', 'estado', 'fecha_inicio', 'fecha_fin'],
                                include: [{
                                        model: membership_1.default,
                                        as: "membresia",
                                        attributes: ['id', 'nombre', 'descripcion', 'precio']
                                    }]
                            }
                        ]
                    });
                }
                catch (includeError) {
                    console.error('[Attendance] Error al obtener detalles con includes:', includeError);
                    // Intentar obtener solo la asistencia sin includes como fallback
                    try {
                        createdAttendance = yield attendance_1.default.findByPk(newAttendance.id);
                    }
                    catch (fallbackError) {
                        console.error('[Attendance] Error en fallback:', fallbackError);
                        // Si todo falla, devolver la asistencia básica creada
                        createdAttendance = newAttendance;
                    }
                }
                if (!createdAttendance) {
                    console.error('[Attendance] No se pudo obtener la asistencia creada');
                    // Aunque no se puedan obtener los detalles, la asistencia se creó exitosamente
                    return apiResponse_1.default.success(res, {
                        id: newAttendance.id,
                        message: "Asistencia registrada exitosamente, pero no se pudieron obtener todos los detalles"
                    }, "Asistencia registrada exitosamente", undefined, 201);
                }
                // 9. Retornar respuesta exitosa
                return apiResponse_1.default.success(res, createdAttendance, "Asistencia registrada exitosamente", undefined, 201);
            }
            catch (error) {
                console.error('[Attendance] Error general no manejado:', error);
                // Si llegamos aquí y no es un error conocido, es un error inesperado
                if (error instanceof Error) {
                    console.error('[Attendance] Stack trace:', error.stack);
                }
                return apiResponse_1.default.error(res, "Error interno al registrar asistencia", 500);
            }
        });
    }
    // Obtener detalles de una asistencia✅
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = attendance_validator_1.idSchema.parse(req.params);
                const attendance = yield attendance_1.default.findOne({
                    where: {
                        id,
                        estado: "Activo"
                    },
                    include: [
                        {
                            model: person_model_1.default,
                            as: "persona_asistencia",
                            include: [{
                                    model: user_1.default,
                                    as: "usuario",
                                    attributes: ["nombre", "apellido", "numero_documento"]
                                }]
                        },
                        {
                            model: contract_1.default,
                            as: "contrato",
                            include: [{
                                    model: membership_1.default,
                                    as: "membresia"
                                }]
                        }
                    ]
                });
                if (!attendance) {
                    return apiResponse_1.default.error(res, "Asistencia no encontrada", 404);
                }
                return apiResponse_1.default.success(res, attendance, "Detalles de asistencia obtenidos exitosamente");
            }
            catch (error) {
                console.error("Error al obtener asistencia:", error);
                if (error instanceof zod_1.z.ZodError) {
                    return apiResponse_1.default.error(res, "ID de asistencia inválido", 400, error.errors);
                }
                return apiResponse_1.default.error(res, "Error al obtener los detalles de la asistencia");
            }
        });
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
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = attendance_validator_1.idSchema.parse(req.params);
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const attendance = yield attendance_1.default.findByPk(id);
                if (!attendance) {
                    return apiResponse_1.default.error(res, "Asistencia no encontrada", 404);
                }
                // Actualizar estado a "Eliminado"
                yield attendance.update({
                    estado: "Eliminado",
                    usuario_actualizacion: userId,
                    fecha_actualizacion: new Date()
                });
                // Decrementar contador de asistencias
                const person = yield person_model_1.default.findByPk(attendance.id_persona);
                if (person === null || person === void 0 ? void 0 : person.id_usuario) {
                    yield user_1.default.decrement('asistencias_totales', {
                        by: 1,
                        where: { id: person.id_usuario }
                    });
                }
                return apiResponse_1.default.success(res, null, "Asistencia eliminada correctamente");
            }
            catch (error) {
                console.error("Error al eliminar asistencia:", error);
                if (error instanceof zod_1.z.ZodError) {
                    return apiResponse_1.default.error(res, "ID de asistencia inválido", 400, error.errors);
                }
                return apiResponse_1.default.error(res, "Error al eliminar la asistencia");
            }
        });
    }
    // Obtener estadísticas de asistencia✅
    getStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { period, date, month, year } = statsQuerySchema.parse(req.query);
                let startDate;
                let endDate;
                // Configurar fechas según el período
                if (period === 'daily') {
                    const targetDate = date ? new Date(date) : new Date();
                    startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
                    endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
                }
                else if (period === 'monthly') {
                    const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();
                    const targetYear = year ? parseInt(year) : new Date().getFullYear();
                    startDate = new Date(targetYear, targetMonth, 1);
                    endDate = new Date(targetYear, targetMonth + 1, 0);
                }
                else { // yearly
                    const targetYear = year ? parseInt(year) : new Date().getFullYear();
                    startDate = new Date(targetYear, 0, 1);
                    endDate = new Date(targetYear, 11, 31);
                }
                // Obtener estadísticas
                const [total, activos, eliminados, attendanceHistory] = yield Promise.all([
                    attendance_1.default.count({
                        where: {
                            fecha_uso: {
                                [sequelize_1.Op.between]: [startDate, endDate]
                            }
                        }
                    }),
                    attendance_1.default.count({
                        where: {
                            fecha_uso: {
                                [sequelize_1.Op.between]: [startDate, endDate]
                            },
                            estado: "Activo"
                        }
                    }),
                    attendance_1.default.count({
                        where: {
                            fecha_uso: {
                                [sequelize_1.Op.between]: [startDate, endDate]
                            },
                            estado: "Eliminado"
                        }
                    }),
                    // Historial de asistencias para gráfico
                    attendance_1.default.findAll({
                        attributes: [
                            [attendance_1.default.sequelize.fn('DATE', attendance_1.default.sequelize.col('fecha_uso')), 'date'],
                            [attendance_1.default.sequelize.fn('COUNT', attendance_1.default.sequelize.col('id')), 'count']
                        ],
                        where: {
                            fecha_uso: {
                                [sequelize_1.Op.between]: [startDate, endDate]
                            },
                            estado: "Activo"
                        },
                        group: [attendance_1.default.sequelize.fn('DATE', attendance_1.default.sequelize.col('fecha_uso'))],
                        order: [[attendance_1.default.sequelize.fn('DATE', attendance_1.default.sequelize.col('fecha_uso')), 'ASC']],
                        raw: true
                    })
                ]);
                return apiResponse_1.default.success(res, {
                    total,
                    activos,
                    eliminados,
                    attendanceHistory,
                    period: {
                        type: period,
                        startDate,
                        endDate
                    }
                }, "Estadísticas de asistencia obtenidas exitosamente");
            }
            catch (error) {
                console.error("Error al obtener estadísticas de asistencia:", error);
                if (error instanceof zod_1.z.ZodError) {
                    return apiResponse_1.default.error(res, "Parámetros de consulta inválidos", 400, error.errors.map(err => ({
                        campo: err.path.join('.'),
                        mensaje: err.message
                    })));
                }
                return apiResponse_1.default.error(res, "Error al obtener las estadísticas de asistencia");
            }
        });
    }
    getClientAttendanceHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const offset = (page - 1) * limit;
                // Obtener la persona asociada al usuario directamente
                const person = yield person_model_1.default.findOne({
                    where: {
                        id_usuario: id,
                        estado: true
                    },
                    attributes: ['id_persona']
                });
                if (!person) {
                    return apiResponse_1.default.error(res, "Cliente no encontrado", 404);
                }
                const { count, rows: attendances } = yield attendance_1.default.findAndCountAll({
                    where: {
                        id_persona: person.id_persona,
                        estado: "Activo"
                    },
                    include: [{
                            model: contract_1.default,
                            as: "contrato",
                            attributes: ['codigo'],
                            include: [{
                                    model: membership_1.default,
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
                return apiResponse_1.default.success(res, attendances, "Historial de asistencias obtenido exitosamente", {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit)
                });
            }
            catch (error) {
                console.error("Error al obtener historial de asistencias:", error);
                return apiResponse_1.default.error(res, "Error al obtener el historial de asistencias");
            }
        });
    }
    // Método auxiliar para obtener estadísticas de asistencia
    getClientAttendanceStats(personId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!personId) {
                return {
                    totalAttendances: 0,
                    currentMonth: 0,
                    currentWeek: 0,
                    averagePerWeek: 0,
                    lastAttendance: null
                };
            }
            const [total, currentPeriod, lastAttendance] = yield Promise.all([
                attendance_1.default.count({
                    where: {
                        id_persona: personId,
                        estado: "Activo"
                    }
                }),
                attendance_1.default.count({
                    where: {
                        id_persona: personId,
                        fecha_uso: {
                            [sequelize_1.Op.between]: [startDate, endDate]
                        },
                        estado: "Activo"
                    }
                }),
                attendance_1.default.findOne({
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
        });
    }
    // Controlador para obtener rangos de fecha según el período
    getClientDateRangeByPeriod(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { period = 'monthly' } = req.query;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return apiResponse_1.default.error(res, "Usuario no autenticado", 401);
                }
                // Obtener la persona asociada al usuario
                const person = yield person_model_1.default.findOne({
                    where: { id_usuario: userId, estado: true },
                    attributes: ['id_persona']
                });
                if (!person) {
                    return apiResponse_1.default.error(res, "Cliente no encontrado", 404);
                }
                let dateRange;
                switch (period) {
                    case 'daily':
                        dateRange = datetime_utils_1.default.getTodayRange();
                        break;
                    case 'weekly':
                        dateRange = datetime_utils_1.default.getCurrentWeekRange();
                        break;
                    case 'monthly':
                        dateRange = datetime_utils_1.default.getCurrentMonthRange();
                        break;
                    case 'yearly':
                        dateRange = datetime_utils_1.default.getCurrentYearRange();
                        break;
                    default:
                        dateRange = datetime_utils_1.default.getCurrentMonthRange();
                }
                // Obtener asistencias en el rango de fechas
                const attendances = yield attendance_1.default.findAll({
                    where: {
                        id_persona: person.id_persona,
                        fecha_uso: {
                            [sequelize_1.Op.between]: [dateRange.start, dateRange.end]
                        },
                        estado: "Activo"
                    },
                    order: [['fecha_uso', 'ASC']],
                    attributes: ['id', 'fecha_uso', 'hora_registro']
                });
                return apiResponse_1.default.success(res, {
                    period,
                    dateRange,
                    attendances,
                    total: attendances.length
                }, "Rango de fechas obtenido exitosamente");
            }
            catch (error) {
                console.error("Error al obtener rango de fechas:", error);
                return apiResponse_1.default.error(res, "Error al obtener el rango de fechas");
            }
        });
    }
    // Controlador para obtener estadísticas del cliente
    getClientStatsController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { period = 'monthly' } = req.query;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return apiResponse_1.default.error(res, "Usuario no autenticado", 401);
                }
                // Obtener la persona asociada al usuario
                const person = yield person_model_1.default.findOne({
                    where: { id_usuario: userId, estado: true },
                    attributes: ['id_persona']
                });
                if (!person) {
                    return apiResponse_1.default.error(res, "Cliente no encontrado", 404);
                }
                let dateRange;
                switch (period) {
                    case 'daily':
                        dateRange = datetime_utils_1.default.getTodayRange();
                        break;
                    case 'weekly':
                        dateRange = datetime_utils_1.default.getCurrentWeekRange();
                        break;
                    case 'monthly':
                        dateRange = datetime_utils_1.default.getCurrentMonthRange();
                        break;
                    case 'yearly':
                        dateRange = datetime_utils_1.default.getCurrentYearRange();
                        break;
                    default:
                        dateRange = datetime_utils_1.default.getCurrentMonthRange();
                }
                // Obtener estadísticas usando el método auxiliar
                const stats = yield this.getClientAttendanceStats(person.id_persona, dateRange.start, dateRange.end);
                return apiResponse_1.default.success(res, {
                    period,
                    dateRange,
                    stats
                }, "Estadísticas del cliente obtenidas exitosamente");
            }
            catch (error) {
                console.error("Error al obtener estadísticas del cliente:", error);
                return apiResponse_1.default.error(res, "Error al obtener las estadísticas del cliente");
            }
        });
    }
    // Nuevo método para obtener historial de asistencias del cliente autenticado
    getMyAttendanceHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Obtiene el usuario del token
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                if (!userId) {
                    return apiResponse_1.default.error(res, "Usuario no autenticado", 401);
                }
                // Buscar la persona asociada al usuario autenticado
                const person = yield person_model_1.default.findOne({
                    where: { id_usuario: userId, estado: true },
                    attributes: ['id_persona']
                });
                if (!person) {
                    return apiResponse_1.default.error(res, "Cliente no encontrado", 404);
                }
                // Obtener solo las asistencias del cliente autenticado
                const { count, rows: attendances } = yield attendance_1.default.findAndCountAll({
                    where: {
                        id_persona: person.id_persona,
                        estado: "Activo"
                    },
                    include: [{
                            model: contract_1.default,
                            as: "contrato",
                            attributes: ['codigo'],
                            include: [{
                                    model: membership_1.default,
                                    as: "membresia",
                                    attributes: ['nombre']
                                }]
                        }],
                    order: [['fecha_uso', 'DESC']],
                    limit,
                    offset: (page - 1) * limit,
                    attributes: [
                        'id', 'fecha_uso', 'hora_registro', 'estado', 'fecha_registro'
                    ]
                });
                return apiResponse_1.default.success(res, attendances, "Historial obtenido exitosamente", {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit)
                });
            }
            catch (error) {
                console.error("Error al obtener historial:", error);
                return apiResponse_1.default.error(res, "Error al obtener historial");
            }
        });
    }
    // Nuevo método para obtener estadísticas del cliente autenticado
    getMyAttendanceStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { period = 'monthly' } = req.query;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return apiResponse_1.default.error(res, "Usuario no autenticado", 401);
                }
                // Obtener la persona asociada al usuario
                const person = yield person_model_1.default.findOne({
                    where: { id_usuario: userId, estado: true },
                    attributes: ['id_persona']
                });
                if (!person) {
                    return apiResponse_1.default.error(res, "Cliente no encontrado", 404);
                }
                let dateRange;
                switch (period) {
                    case 'daily':
                        dateRange = datetime_utils_1.default.getTodayRange();
                        break;
                    case 'weekly':
                        dateRange = datetime_utils_1.default.getCurrentWeekRange();
                        break;
                    case 'monthly':
                        dateRange = datetime_utils_1.default.getCurrentMonthRange();
                        break;
                    case 'yearly':
                        dateRange = datetime_utils_1.default.getCurrentYearRange();
                        break;
                    default:
                        dateRange = datetime_utils_1.default.getCurrentMonthRange();
                }
                // Obtener estadísticas usando el método auxiliar
                const stats = yield this.getClientAttendanceStats(person.id_persona, dateRange.start, dateRange.end);
                return apiResponse_1.default.success(res, {
                    period,
                    dateRange,
                    stats
                }, "Estadísticas obtenidas exitosamente");
            }
            catch (error) {
                console.error("Error al obtener estadísticas:", error);
                return apiResponse_1.default.error(res, "Error al obtener las estadísticas");
            }
        });
    }
}
exports.AttendanceController = AttendanceController;
// Crear una instancia del controlador
const attendanceController = new AttendanceController();
// Exportar las funciones del controlador
exports.registerAttendance = attendanceController.create.bind(attendanceController);
exports.getAttendances = attendanceController.getAll.bind(attendanceController);
exports.searchAttendances = attendanceController.search.bind(attendanceController);
exports.getAttendanceDetails = attendanceController.getById.bind(attendanceController);
exports.deleteAttendances = attendanceController.delete.bind(attendanceController);
exports.getStats = attendanceController.getStats.bind(attendanceController);
exports.getClientAttendanceHistory = attendanceController.getClientAttendanceHistory.bind(attendanceController);
exports.getClientDateRangeByPeriod = attendanceController.getClientDateRangeByPeriod.bind(attendanceController);
exports.getClientAttendanceStats = attendanceController.getClientStatsController.bind(attendanceController);
exports.getMyAttendanceHistory = attendanceController.getMyAttendanceHistory.bind(attendanceController);
exports.getMyAttendanceStats = attendanceController.getMyAttendanceStats.bind(attendanceController);
// Exportar el controlador por defecto
exports.default = attendanceController;
