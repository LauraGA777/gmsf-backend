import type { Request, Response, NextFunction } from "express";
import { ScheduleService } from "../services/schedule.service";
import {
  createTrainingSchema,
  updateTrainingSchema,
  trainingQuerySchema,
  trainingIdSchema,
  availabilitySchema,
} from "../validators/schedule.validator";
import ApiResponse  from "../utils/apiResponse";

const scheduleService = new ScheduleService();

export class ScheduleController {
  // Get all training sessions
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = trainingQuerySchema.parse(req.query);
      const result = await scheduleService.findAll(query);

      return ApiResponse.success(
        res,
        result.data,
        "Sesiones de entrenamiento obtenidas correctamente",
        result.pagination
      );
    } catch (error) {
      next(error);
    }
  }

  // Get training session by ID
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = trainingIdSchema.parse(req.params);
      const training = await scheduleService.findById(id);

      return ApiResponse.success(
        res,
        training,
        "Sesión de entrenamiento obtenida correctamente"
      );
    } catch (error) {
      next(error);
    }
  }

  // Create a new training session
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createTrainingSchema.parse(req.body);
      const training = await scheduleService.create(data);

      return ApiResponse.success(
        res,
        training,
        "Sesión de entrenamiento creada correctamente",
        undefined,
        201
      );
    } catch (error) {
      next(error);
    }
  }

  // Update an existing training session
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = trainingIdSchema.parse(req.params);
      const data = updateTrainingSchema.parse(req.body);
      const training = await scheduleService.update(id, data);

      return ApiResponse.success(
        res,
        training,
        "Sesión de entrenamiento actualizada correctamente"
      );
    } catch (error) {
      next(error);
    }
  }

  // Delete a training session
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = trainingIdSchema.parse(req.params);
      const result = await scheduleService.delete(id);

      return ApiResponse.success(
        res,
        result,
        "Sesión de entrenamiento cancelada correctamente"
      );
    } catch (error) {
      next(error);
    }
  }

  // Check availability for a given time period
  async checkAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const data = availabilitySchema.parse(req.body);
      const result = await scheduleService.checkAvailability(data);

      return ApiResponse.success(
        res,
        result,
        "Disponibilidad verificada correctamente"
      );
    } catch (error) {
      next(error);
    }
  }

  // Get schedule for a specific client
  async getClientSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = trainingIdSchema.parse(req.params);
      const schedule = await scheduleService.getClientSchedule(id);

      return ApiResponse.success(
        res,
        schedule,
        "Agenda del cliente obtenida correctamente"
      );
    } catch (error) {
      next(error);
    }
  }

  // Get schedule for a specific trainer
  async getTrainerSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = trainingIdSchema.parse(req.params);
      const schedule = await scheduleService.getTrainerSchedule(id);

      return ApiResponse.success(
        res,
        schedule,
        "Agenda del entrenador obtenida correctamente"
      );
    } catch (error) {
      next(error);
    }
  }
}
