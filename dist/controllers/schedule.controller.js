"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.ScheduleController = void 0;
const schedule_service_1 = require("../services/schedule.service");
const schedule_validator_1 = require("../validators/schedule.validator");
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const scheduleService = new schedule_service_1.ScheduleService();
class ScheduleController {
    // Get all training sessions
    getAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            console.log("CONTROLADOR: Petición GET a /schedules recibida", { query: req.query });
            try {
                const query = schedule_validator_1.trainingQuerySchema.parse(req.query);
                console.log("CONTROLADOR: Query validado:", query);
                // Pasar información del usuario autenticado
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id_rol;
                const queryWithUser = Object.assign(Object.assign({}, query), { userId,
                    userRole });
                const result = yield scheduleService.findAll(queryWithUser);
                console.log("CONTROLADOR: Sesiones de entrenamiento obtenidas del servicio.");
                return apiResponse_1.default.success(res, result.data, "Sesiones de entrenamiento obtenidas correctamente", result.pagination);
            }
            catch (error) {
                console.error("CONTROLADOR: Error en getAll:", error);
                next(error);
            }
        });
    }
    // Get training session by ID
    getById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("CONTROLADOR: Petición GET a /schedules/:id recibida", { params: req.params });
            try {
                const { id } = schedule_validator_1.trainingIdSchema.parse(req.params);
                console.log("CONTROLADOR: ID parseado:", id);
                const training = yield scheduleService.findById(id);
                console.log("CONTROLADOR: Sesión de entrenamiento obtenida por ID.");
                return apiResponse_1.default.success(res, training, "Sesión de entrenamiento obtenida correctamente");
            }
            catch (error) {
                console.error("CONTROLADOR: Error en getById:", error);
                next(error);
            }
        });
    }
    // Create a new training session
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("CONTROLADOR: Petición POST a /schedules recibida", { body: req.body });
            try {
                const data = schedule_validator_1.createTrainingSchema.parse(req.body);
                console.log("CONTROLADOR: Datos validados y parseados:", data);
                const training = yield scheduleService.create(data);
                console.log("CONTROLADOR: Sesión de entrenamiento creada exitosamente.");
                return apiResponse_1.default.success(res, training, "Sesión de entrenamiento creada correctamente", undefined, 201);
            }
            catch (error) {
                console.error("CONTROLADOR: Error al crear el entrenamiento:", error);
                next(error);
            }
        });
    }
    // Update an existing training session
    update(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("CONTROLADOR: Petición PUT a /schedules/:id recibida", { params: req.params, body: req.body });
            try {
                const { id } = schedule_validator_1.trainingIdSchema.parse(req.params);
                console.log("CONTROLADOR: ID parseado para actualizar:", id);
                const data = schedule_validator_1.updateTrainingSchema.parse(req.body);
                console.log("CONTROLADOR: Datos validados para actualizar:", data);
                const training = yield scheduleService.update(id, data);
                console.log("CONTROLADOR: Sesión de entrenamiento actualizada.");
                return apiResponse_1.default.success(res, training, "Sesión de entrenamiento actualizada correctamente");
            }
            catch (error) {
                console.error("CONTROLADOR: Error en update:", error);
                next(error);
            }
        });
    }
    // Delete a training session
    delete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("CONTROLADOR: Petición DELETE a /schedules/:id recibida", { params: req.params });
            try {
                const { id } = schedule_validator_1.trainingIdSchema.parse(req.params);
                console.log("CONTROLADOR: ID parseado para eliminar:", id);
                const result = yield scheduleService.delete(id);
                console.log("CONTROLADOR: Sesión de entrenamiento eliminada (cancelada).");
                return apiResponse_1.default.success(res, result, "Sesión de entrenamiento cancelada correctamente");
            }
            catch (error) {
                console.error("CONTROLADOR: Error en delete:", error);
                next(error);
            }
        });
    }
    // Check availability for a given time period
    checkAvailability(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("CONTROLADOR: Petición GET a /schedules/availability recibida", { body: req.body });
            try {
                const data = schedule_validator_1.availabilitySchema.parse(req.body);
                console.log("CONTROLADOR: Datos de disponibilidad validados:", data);
                const result = yield scheduleService.checkAvailability(data);
                console.log("CONTROLADOR: Verificación de disponibilidad completada.");
                return apiResponse_1.default.success(res, result, "Disponibilidad verificada correctamente");
            }
            catch (error) {
                console.error("CONTROLADOR: Error en checkAvailability:", error);
                next(error);
            }
        });
    }
    // Get schedule for a specific client
    getClientSchedule(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            console.log("CONTROLADOR: Petición GET a /schedules/client/:id recibida", { params: req.params });
            try {
                // Permitir ":id" explícito (id_persona) o derivar desde el usuario autenticado
                let clientPersonId = null;
                if (req.params.id && !isNaN(Number(req.params.id))) {
                    clientPersonId = Number(req.params.id);
                }
                else if ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) {
                    const person = yield (yield Promise.resolve().then(() => __importStar(require('../models/person.model')))).default.findOne({ where: { id_usuario: req.user.id } });
                    clientPersonId = person ? person.id_persona : null;
                }
                if (!clientPersonId) {
                    return apiResponse_1.default.error(res, 'No se pudo identificar el cliente', 400);
                }
                console.log("CONTROLADOR: ID de cliente para agenda:", clientPersonId);
                const schedule = yield scheduleService.getClientSchedule(clientPersonId);
                console.log("CONTROLADOR: Agenda del cliente obtenida.");
                return apiResponse_1.default.success(res, schedule, "Agenda del cliente obtenida correctamente");
            }
            catch (error) {
                console.error("CONTROLADOR: Error en getClientSchedule:", error);
                next(error);
            }
        });
    }
    // Get schedule for a specific trainer
    getTrainerSchedule(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("CONTROLADOR: Petición GET a /schedules/trainer/:id recibida", { params: req.params });
            try {
                const { id } = schedule_validator_1.trainingIdSchema.parse(req.params);
                console.log("CONTROLADOR: ID de entrenador parseado:", id);
                const schedule = yield scheduleService.getTrainerSchedule(id);
                console.log("CONTROLADOR: Agenda del entrenador obtenida.");
                return apiResponse_1.default.success(res, schedule, "Agenda del entrenador obtenida correctamente");
            }
            catch (error) {
                console.error("CONTROLADOR: Error en getTrainerSchedule:", error);
                next(error);
            }
        });
    }
    // Get daily schedule
    getDailySchedule(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("CONTROLADOR: Petición GET a /schedules/daily/:date recibida", { params: req.params });
            try {
                const { date } = req.params;
                console.log("CONTROLADOR: Fecha para agenda diaria:", date);
                const schedule = yield scheduleService.getDailySchedule(date);
                console.log("CONTROLADOR: Agenda diaria obtenida.");
                return apiResponse_1.default.success(res, schedule, "Agenda diaria obtenida correctamente");
            }
            catch (error) {
                console.error("CONTROLADOR: Error en getDailySchedule:", error);
                next(error);
            }
        });
    }
    // Get weekly schedule
    getWeeklySchedule(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("CONTROLADOR: Petición GET a /schedules/weekly recibida", { query: req.query });
            try {
                const { startDate, endDate } = req.query;
                console.log("CONTROLADOR: Rango de fechas para agenda semanal:", { startDate, endDate });
                const schedule = yield scheduleService.getWeeklySchedule(startDate, endDate);
                console.log("CONTROLADOR: Agenda semanal obtenida.");
                return apiResponse_1.default.success(res, schedule, "Agenda semanal obtenida correctamente");
            }
            catch (error) {
                console.error("CONTROLADOR: Error en getWeeklySchedule:", error);
                next(error);
            }
        });
    }
    // Get monthly schedule
    getMonthlySchedule(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("CONTROLADOR: Petición GET a /schedules/monthly recibida", { query: req.query });
            try {
                const { year, month } = req.query;
                console.log("CONTROLADOR: Mes y año para agenda mensual:", { year, month });
                const schedule = yield scheduleService.getMonthlySchedule(parseInt(year), parseInt(month));
                console.log("CONTROLADOR: Agenda mensual obtenida.");
                return apiResponse_1.default.success(res, schedule, "Agenda mensual obtenida correctamente");
            }
            catch (error) {
                console.error("CONTROLADOR: Error en getMonthlySchedule:", error);
                next(error);
            }
        });
    }
    // Get active trainers
    getActiveTrainers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("CONTROLADOR: Petición GET a /schedules/active-trainers recibida");
            try {
                const trainers = yield scheduleService.getActiveTrainers();
                console.log("CONTROLADOR: Entrenadores activos obtenidos.");
                return apiResponse_1.default.success(res, trainers, "Entrenadores activos obtenidos correctamente");
            }
            catch (error) {
                console.error("CONTROLADOR: Error en getActiveTrainers:", error);
                next(error);
            }
        });
    }
    // Get active clients with contracts
    getActiveClients(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("CONTROLADOR: Petición GET a /schedules/active-clients recibida");
            try {
                const clients = yield scheduleService.getActiveClientsWithContracts();
                console.log("CONTROLADOR: Clientes activos con contratos obtenidos.");
                return apiResponse_1.default.success(res, clients, "Clientes activos obtenidos correctamente");
            }
            catch (error) {
                console.error("CONTROLADOR: Error en getActiveClients:", error);
                next(error);
            }
        });
    }
    // === MÉTODOS ESPECÍFICOS PARA CLIENTES ===
    // Obtener horarios disponibles para clientes
    getAvailableTimeSlots(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("CONTROLADOR: Petición GET a /schedules/client/available-slots recibida", { query: req.query });
            try {
                const { fecha, id_entrenador } = req.query;
                if (!fecha) {
                    return apiResponse_1.default.error(res, "La fecha es requerida", 400);
                }
                const data = {
                    fecha,
                    id_entrenador: id_entrenador ? parseInt(id_entrenador, 10) : undefined
                };
                console.log("CONTROLADOR: Datos para obtener horarios disponibles:", data);
                const availableSlots = yield scheduleService.getAvailableTimeSlots(data);
                console.log("CONTROLADOR: Horarios disponibles obtenidos.");
                return apiResponse_1.default.success(res, availableSlots, "Horarios disponibles obtenidos correctamente");
            }
            catch (error) {
                console.error("CONTROLADOR: Error en getAvailableTimeSlots:", error);
                next(error);
            }
        });
    }
    // Crear entrenamiento específico para clientes
    createTrainingForClient(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("CONTROLADOR: Petición POST a /schedules/client/book recibida", { body: req.body });
            try {
                const user = req.user;
                if (!(user === null || user === void 0 ? void 0 : user.id)) {
                    return apiResponse_1.default.error(res, "Usuario no autenticado", 401);
                }
                const userId = user.id;
                console.log("CONTROLADOR: Usuario identificado:", userId);
                console.log("CONTROLADOR: Datos para crear entrenamiento (cliente):", req.body);
                const training = yield scheduleService.createTrainingForClient(req.body, userId);
                console.log("CONTROLADOR: Entrenamiento creado exitosamente para cliente.");
                return apiResponse_1.default.success(res, training, "Entrenamiento agendado correctamente", undefined, 201);
            }
            catch (error) {
                console.error("CONTROLADOR: Error al crear entrenamiento para cliente:", error);
                next(error);
            }
        });
    }
    // Manejar intento de actualización por parte de cliente (denegado)
    clientAttemptUpdate(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("CONTROLADOR: Cliente intenta actualizar entrenamiento", { params: req.params });
            try {
                const user = req.user;
                const trainingId = parseInt(req.params.id, 10);
                if (!(user === null || user === void 0 ? void 0 : user.id)) {
                    return apiResponse_1.default.error(res, "Usuario no autenticado", 401);
                }
                const userId = user.id;
                yield scheduleService.clientAttemptUpdate(userId, trainingId);
                // Esta línea nunca se ejecutará debido a la excepción en el servicio
                return apiResponse_1.default.error(res, "Operación no permitida", 403);
            }
            catch (error) {
                console.error("CONTROLADOR: Error en clientAttemptUpdate:", error);
                next(error);
            }
        });
    }
    // Manejar intento de eliminación por parte de cliente (denegado)
    clientAttemptDelete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("CONTROLADOR: Cliente intenta eliminar entrenamiento", { params: req.params });
            try {
                const user = req.user;
                const trainingId = parseInt(req.params.id, 10);
                if (!(user === null || user === void 0 ? void 0 : user.id)) {
                    return apiResponse_1.default.error(res, "Usuario no autenticado", 401);
                }
                const userId = user.id;
                yield scheduleService.clientAttemptDelete(userId, trainingId);
                // Esta línea nunca se ejecutará debido a la excepción en el servicio
                return apiResponse_1.default.error(res, "Operación no permitida", 403);
            }
            catch (error) {
                console.error("CONTROLADOR: Error en clientAttemptDelete:", error);
                next(error);
            }
        });
    }
}
exports.ScheduleController = ScheduleController;
