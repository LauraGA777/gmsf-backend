import { Router, type RequestHandler } from "express";
import { ScheduleController } from "../controllers/schedule.controller";
import {
  createTrainingSchema,
  updateTrainingSchema,
  trainingQuerySchema,
  trainingIdSchema,
  availabilitySchema,
} from "../validators/schedule.validator";
import ApiResponse  from "../utils/apiResponse";
import { validate } from "../middlewares/validate.middleware";

const router = Router();
const scheduleController = new ScheduleController();

// --- General and specific GET routes ---
// NOTE: Specific routes must come before parameterized routes like /:id

// Get all training sessions (with query params)
router.get("/", validate(trainingQuerySchema, "query"), scheduleController.getAll.bind(scheduleController) as unknown as RequestHandler);

// Check availability
router.post("/availability", validate(availabilitySchema, "body"), scheduleController.checkAvailability.bind(scheduleController) as unknown as RequestHandler);

// Get active trainers
router.get("/active-trainers", scheduleController.getActiveTrainers.bind(scheduleController) as unknown as RequestHandler);

// Get active clients
router.get("/active-clients", scheduleController.getActiveClients.bind(scheduleController) as unknown as RequestHandler);

// Routes for specific schedules (client, trainer, daily, weekly, monthly)
router.get("/client/:id", validate(trainingIdSchema, "params"), scheduleController.getClientSchedule.bind(scheduleController) as unknown as RequestHandler);
router.get("/trainer/:id", validate(trainingIdSchema, "params"), scheduleController.getTrainerSchedule.bind(scheduleController) as unknown as RequestHandler);
router.get("/daily/:date", scheduleController.getDailySchedule.bind(scheduleController) as unknown as RequestHandler);
router.get("/weekly", scheduleController.getWeeklySchedule.bind(scheduleController) as unknown as RequestHandler);
router.get("/monthly", scheduleController.getMonthlySchedule.bind(scheduleController) as unknown as RequestHandler);


// --- CRUD operations with /:id parameter ---
// This route must be last among the GET routes to avoid conflicts
router.get("/:id", validate(trainingIdSchema, "params"), scheduleController.getById.bind(scheduleController) as unknown as RequestHandler);

// Create a new training session
router.post("/", validate(createTrainingSchema, "body"), scheduleController.create.bind(scheduleController) as unknown as RequestHandler);

// Update an existing training session
router.put("/:id", validate(trainingIdSchema, "params"), validate(updateTrainingSchema, "body"), scheduleController.update.bind(scheduleController) as unknown as RequestHandler);

// Delete a training session
router.delete("/:id", validate(trainingIdSchema, "params"), scheduleController.delete.bind(scheduleController) as unknown as RequestHandler);


export default router;