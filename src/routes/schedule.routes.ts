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
import { verifyToken } from "../middlewares/auth.middleware";
import { 
  canViewSchedules, 
  canCreateSchedules, 
  canUpdateSchedules, 
  canDeleteSchedules,
  canViewScheduleAvailability,
  canViewDailySchedules,
  canViewWeeklySchedules
} from "../middlewares/schedule.middleware";
import { canViewTrainers } from "../middlewares/trainer.middleware";
import { canViewClients } from "../middlewares/client.middleware";

const router = Router();
const scheduleController = new ScheduleController();

// --- General and specific GET routes ---
// NOTE: Specific routes must come before parameterized routes like /:id

// Get all training sessions (with query params)
router.get("/", 
    verifyToken as unknown as RequestHandler,
    canViewSchedules as unknown as RequestHandler,
    validate(trainingQuerySchema, "query"), 
    scheduleController.getAll.bind(scheduleController) as unknown as RequestHandler
);

// Check availability
router.post("/availability", 
    verifyToken as unknown as RequestHandler,
    canViewScheduleAvailability as unknown as RequestHandler,
    validate(availabilitySchema, "body"), 
    scheduleController.checkAvailability.bind(scheduleController) as unknown as RequestHandler
);

// Get active trainers
router.get("/active-trainers", 
    verifyToken as unknown as RequestHandler,
    canViewTrainers as unknown as RequestHandler,
    scheduleController.getActiveTrainers.bind(scheduleController) as unknown as RequestHandler
);

// Get active clients
router.get("/active-clients", 
    verifyToken as unknown as RequestHandler,
    canViewClients as unknown as RequestHandler,
    scheduleController.getActiveClients.bind(scheduleController) as unknown as RequestHandler
);

// Routes for specific schedules (client, trainer, daily, weekly, monthly)
router.get("/client/:id", 
    verifyToken as unknown as RequestHandler,
    canViewSchedules as unknown as RequestHandler,
    validate(trainingIdSchema, "params"), 
    scheduleController.getClientSchedule.bind(scheduleController) as unknown as RequestHandler
);

router.get("/trainer/:id", 
    verifyToken as unknown as RequestHandler,
    canViewSchedules as unknown as RequestHandler,
    validate(trainingIdSchema, "params"), 
    scheduleController.getTrainerSchedule.bind(scheduleController) as unknown as RequestHandler
);

router.get("/daily/:date", 
    verifyToken as unknown as RequestHandler,
    canViewDailySchedules as unknown as RequestHandler,
    scheduleController.getDailySchedule.bind(scheduleController) as unknown as RequestHandler
);

router.get("/weekly", 
    verifyToken as unknown as RequestHandler,
    canViewWeeklySchedules as unknown as RequestHandler,
    scheduleController.getWeeklySchedule.bind(scheduleController) as unknown as RequestHandler
);

router.get("/monthly", 
    verifyToken as unknown as RequestHandler,
    canViewSchedules as unknown as RequestHandler,
    scheduleController.getMonthlySchedule.bind(scheduleController) as unknown as RequestHandler
);

// --- CRUD operations with /:id parameter ---
// This route must be last among the GET routes to avoid conflicts
router.get("/:id", 
    verifyToken as unknown as RequestHandler,
    canViewSchedules as unknown as RequestHandler,
    validate(trainingIdSchema, "params"), 
    scheduleController.getById.bind(scheduleController) as unknown as RequestHandler
);

// Create a new training session
router.post("/", 
    verifyToken as unknown as RequestHandler,
    canCreateSchedules as unknown as RequestHandler,
    validate(createTrainingSchema, "body"), 
    scheduleController.create.bind(scheduleController) as unknown as RequestHandler
);

// Update an existing training session
router.put("/:id", 
    verifyToken as unknown as RequestHandler,
    canUpdateSchedules as unknown as RequestHandler,
    validate(trainingIdSchema, "params"), 
    validate(updateTrainingSchema, "body"), 
    scheduleController.update.bind(scheduleController) as unknown as RequestHandler
);

// Delete a training session
router.delete("/:id", 
    verifyToken as unknown as RequestHandler,
    canDeleteSchedules as unknown as RequestHandler,
    validate(trainingIdSchema, "params"), 
    scheduleController.delete.bind(scheduleController) as unknown as RequestHandler
);

export default router;