"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schedule_controller_1 = require("../controllers/schedule.controller");
const schedule_validator_1 = require("../validators/schedule.validator");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const schedule_middleware_1 = require("../middlewares/schedule.middleware");
const trainer_middleware_1 = require("../middlewares/trainer.middleware");
const client_middleware_1 = require("../middlewares/client.middleware");
const router = (0, express_1.Router)();
const scheduleController = new schedule_controller_1.ScheduleController();
// --- General and specific GET routes ---
// NOTE: Specific routes must come before parameterized routes like /:id
// Get all training sessions (with query params)
router.get("/", auth_middleware_1.verifyToken, schedule_middleware_1.canViewSchedules, (0, validate_middleware_1.validate)(schedule_validator_1.trainingQuerySchema, "query"), scheduleController.getAll.bind(scheduleController));
// Check availability
router.post("/availability", auth_middleware_1.verifyToken, schedule_middleware_1.canViewScheduleAvailability, (0, validate_middleware_1.validate)(schedule_validator_1.availabilitySchema, "body"), scheduleController.checkAvailability.bind(scheduleController));
// Get active trainers
router.get("/active-trainers", auth_middleware_1.verifyToken, trainer_middleware_1.canViewTrainers, scheduleController.getActiveTrainers.bind(scheduleController));
// Get active clients
router.get("/active-clients", auth_middleware_1.verifyToken, client_middleware_1.canViewClients, scheduleController.getActiveClients.bind(scheduleController));
// === RUTAS ESPECÍFICAS PARA CLIENTES ===
// Obtener horarios disponibles para agendar (solo clientes)
router.get("/client/available-slots", auth_middleware_1.verifyToken, schedule_middleware_1.isClient, schedule_middleware_1.canViewClientSchedules, (0, validate_middleware_1.validate)(schedule_validator_1.clientAvailableSlotsSchema, "query"), scheduleController.getAvailableTimeSlots.bind(scheduleController));
// Crear entrenamiento para clientes (con restricciones)
router.post("/client/book", auth_middleware_1.verifyToken, schedule_middleware_1.isClient, schedule_middleware_1.canCreateClientTraining, (0, validate_middleware_1.validate)(schedule_validator_1.clientCreateTrainingSchema, "body"), scheduleController.createTrainingForClient.bind(scheduleController));
// Intento de actualización por cliente (denegado)
router.put("/client/:id", auth_middleware_1.verifyToken, schedule_middleware_1.isClient, (0, validate_middleware_1.validate)(schedule_validator_1.trainingIdSchema, "params"), scheduleController.clientAttemptUpdate.bind(scheduleController));
// Intento de eliminación por cliente (denegado)
router.delete("/client/:id", auth_middleware_1.verifyToken, schedule_middleware_1.isClient, (0, validate_middleware_1.validate)(schedule_validator_1.trainingIdSchema, "params"), scheduleController.clientAttemptDelete.bind(scheduleController));
// Routes for specific schedules (client, trainer, daily, weekly, monthly)
router.get("/client/:id", auth_middleware_1.verifyToken, schedule_middleware_1.canViewSchedules, (0, validate_middleware_1.validate)(schedule_validator_1.trainingIdSchema, "params"), scheduleController.getClientSchedule.bind(scheduleController));
router.get("/trainer/:id", auth_middleware_1.verifyToken, schedule_middleware_1.canViewSchedules, (0, validate_middleware_1.validate)(schedule_validator_1.trainingIdSchema, "params"), scheduleController.getTrainerSchedule.bind(scheduleController));
router.get("/daily/:date", auth_middleware_1.verifyToken, schedule_middleware_1.canViewDailySchedules, scheduleController.getDailySchedule.bind(scheduleController));
router.get("/weekly", auth_middleware_1.verifyToken, schedule_middleware_1.canViewWeeklySchedules, scheduleController.getWeeklySchedule.bind(scheduleController));
router.get("/monthly", auth_middleware_1.verifyToken, schedule_middleware_1.canViewSchedules, scheduleController.getMonthlySchedule.bind(scheduleController));
// --- CRUD operations with /:id parameter ---
// This route must be last among the GET routes to avoid conflicts
router.get("/:id", auth_middleware_1.verifyToken, schedule_middleware_1.canViewSchedules, (0, validate_middleware_1.validate)(schedule_validator_1.trainingIdSchema, "params"), scheduleController.getById.bind(scheduleController));
// Create a new training session
router.post("/", auth_middleware_1.verifyToken, schedule_middleware_1.canCreateSchedules, (0, validate_middleware_1.validate)(schedule_validator_1.createTrainingSchema, "body"), scheduleController.create.bind(scheduleController));
// Update an existing training session
router.put("/:id", auth_middleware_1.verifyToken, schedule_middleware_1.denyClientModification, schedule_middleware_1.canUpdateSchedules, (0, validate_middleware_1.validate)(schedule_validator_1.trainingIdSchema, "params"), (0, validate_middleware_1.validate)(schedule_validator_1.updateTrainingSchema, "body"), scheduleController.update.bind(scheduleController));
// Delete a training session
router.delete("/:id", auth_middleware_1.verifyToken, schedule_middleware_1.denyClientModification, schedule_middleware_1.canDeleteSchedules, (0, validate_middleware_1.validate)(schedule_validator_1.trainingIdSchema, "params"), scheduleController.delete.bind(scheduleController));
exports.default = router;
