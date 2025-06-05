import { RequestHandler, Router } from "express";
import { ScheduleController } from "../controllers/schedule.controller";
import { verifyToken, isAdmin } from "../middlewares/auth.middleware";

const router = Router();
const scheduleController = new ScheduleController();

// GET /api/schedules - Get all schedules
router.get("/", 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    scheduleController.getAll.bind(scheduleController) as unknown as RequestHandler
);

// GET /api/schedules/:id - Get schedule by ID
router.get("/:id", 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    scheduleController.getById.bind(scheduleController) as unknown as RequestHandler
);

// POST /api/schedules - Create a new schedule
router.post("/", 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    scheduleController.create.bind(scheduleController) as unknown as RequestHandler
);

// PUT /api/schedules/:id - Update a schedule
router.put("/:id", 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    scheduleController.update.bind(scheduleController) as unknown as RequestHandler
);

// DELETE /api/schedules/:id - Delete a schedule
router.delete("/:id", 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    scheduleController.delete.bind(scheduleController) as unknown as RequestHandler
);

// POST /api/schedules/availability - Check schedule availability
router.post("/availability", 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    scheduleController.checkAvailability.bind(scheduleController) as unknown as RequestHandler
);

// GET /api/schedules/client/:id - Get client schedule
router.get("/client/:id", 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    scheduleController.getClientSchedule.bind(scheduleController) as unknown as RequestHandler
);

// GET /api/schedules/trainer/:id - Get trainer schedule
router.get("/trainer/:id", 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    scheduleController.getTrainerSchedule.bind(scheduleController) as unknown as RequestHandler
);

export default router;