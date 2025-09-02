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
    console.log("CONTROLADOR: Petición GET a /schedules recibida", { query: req.query });
    try {
      const query = trainingQuerySchema.parse(req.query);
      console.log("CONTROLADOR: Query validado:", query);
      
      // Pasar información del usuario autenticado
      const userId = (req.user as any)?.id;
      const userRole = (req.user as any)?.id_rol;
      
      const queryWithUser = {
        ...query,
        userId,
        userRole
      };
      
      const result = await scheduleService.findAll(queryWithUser);
      console.log("CONTROLADOR: Sesiones de entrenamiento obtenidas del servicio.");

      return ApiResponse.success(
        res,
        result.data,
        "Sesiones de entrenamiento obtenidas correctamente",
        result.pagination
      );
    } catch (error) {
      console.error("CONTROLADOR: Error en getAll:", error);
      next(error);
    }
  }

  // Get training session by ID
  async getById(req: Request, res: Response, next: NextFunction) {
    console.log("CONTROLADOR: Petición GET a /schedules/:id recibida", { params: req.params });
    try {
      const { id } = trainingIdSchema.parse(req.params);
      console.log("CONTROLADOR: ID parseado:", id);
      const training = await scheduleService.findById(id);
      console.log("CONTROLADOR: Sesión de entrenamiento obtenida por ID.");

      return ApiResponse.success(
        res,
        training,
        "Sesión de entrenamiento obtenida correctamente"
      );
    } catch (error) {
      console.error("CONTROLADOR: Error en getById:", error);
      next(error);
    }
  }

  // Create a new training session
  async create(req: Request, res: Response, next: NextFunction) {
    console.log("CONTROLADOR: Petición POST a /schedules recibida", { body: req.body });
    try {
      const data = createTrainingSchema.parse(req.body);
      console.log("CONTROLADOR: Datos validados y parseados:", data);
      const training = await scheduleService.create(data);
      console.log("CONTROLADOR: Sesión de entrenamiento creada exitosamente.");

      return ApiResponse.success(
        res,
        training,
        "Sesión de entrenamiento creada correctamente",
        undefined,
        201
      );
    } catch (error) {
      console.error("CONTROLADOR: Error al crear el entrenamiento:", error);
      next(error);
    }
  }

  // Update an existing training session
  async update(req: Request, res: Response, next: NextFunction) {
    console.log("CONTROLADOR: Petición PUT a /schedules/:id recibida", { params: req.params, body: req.body });
    try {
      const { id } = trainingIdSchema.parse(req.params);
      console.log("CONTROLADOR: ID parseado para actualizar:", id);
      const data = updateTrainingSchema.parse(req.body);
      console.log("CONTROLADOR: Datos validados para actualizar:", data);
      const training = await scheduleService.update(id, data);
      console.log("CONTROLADOR: Sesión de entrenamiento actualizada.");

      return ApiResponse.success(
        res,
        training,
        "Sesión de entrenamiento actualizada correctamente"
      );
    } catch (error) {
      console.error("CONTROLADOR: Error en update:", error);
      next(error);
    }
  }

  // Delete a training session
  async delete(req: Request, res: Response, next: NextFunction) {
    console.log("CONTROLADOR: Petición DELETE a /schedules/:id recibida", { params: req.params });
    try {
      const { id } = trainingIdSchema.parse(req.params);
      console.log("CONTROLADOR: ID parseado para eliminar:", id);
      const result = await scheduleService.delete(id);
      console.log("CONTROLADOR: Sesión de entrenamiento eliminada (cancelada).");

      return ApiResponse.success(
        res,
        result,
        "Sesión de entrenamiento cancelada correctamente"
      );
    } catch (error) {
      console.error("CONTROLADOR: Error en delete:", error);
      next(error);
    }
  }

  // Check availability for a given time period
  async checkAvailability(req: Request, res: Response, next: NextFunction) {
    console.log("CONTROLADOR: Petición GET a /schedules/availability recibida", { body: req.body });
    try {
      const data = availabilitySchema.parse(req.body);
      console.log("CONTROLADOR: Datos de disponibilidad validados:", data);
      const result = await scheduleService.checkAvailability(data);
      console.log("CONTROLADOR: Verificación de disponibilidad completada.");

      return ApiResponse.success(
        res,
        result,
        "Disponibilidad verificada correctamente"
      );
    } catch (error) {
      console.error("CONTROLADOR: Error en checkAvailability:", error);
      next(error);
    }
  }

  // Get schedule for a specific client
  async getClientSchedule(req: Request, res: Response, next: NextFunction) {
    console.log("CONTROLADOR: Petición GET a /schedules/client/:id recibida", { params: req.params });
    try {
      // Permitir ":id" explícito (id_persona) o derivar desde el usuario autenticado
      let clientPersonId: number | null = null;
      if (req.params.id && !isNaN(Number(req.params.id))) {
        clientPersonId = Number(req.params.id);
      } else if ((req.user as any)?.id) {
        const person = await (await import('../models/person.model')).default.findOne({ where: { id_usuario: (req.user as any).id } });
        clientPersonId = person ? person.id_persona : null;
      }

      if (!clientPersonId) {
        return ApiResponse.error(res, 'No se pudo identificar el cliente', 400);
      }

      console.log("CONTROLADOR: ID de cliente para agenda:", clientPersonId);
      const schedule = await scheduleService.getClientSchedule(clientPersonId);
      console.log("CONTROLADOR: Agenda del cliente obtenida.");

      return ApiResponse.success(
        res,
        schedule,
        "Agenda del cliente obtenida correctamente"
      );
    } catch (error) {
      console.error("CONTROLADOR: Error en getClientSchedule:", error);
      next(error);
    }
  }

  // Get schedule for a specific trainer
  async getTrainerSchedule(req: Request, res: Response, next: NextFunction) {
    console.log("CONTROLADOR: Petición GET a /schedules/trainer/:id recibida", { params: req.params });
    try {
      const { id } = trainingIdSchema.parse(req.params);
      console.log("CONTROLADOR: ID de entrenador parseado:", id);
      const schedule = await scheduleService.getTrainerSchedule(id);
      console.log("CONTROLADOR: Agenda del entrenador obtenida.");

      return ApiResponse.success(
        res,
        schedule,
        "Agenda del entrenador obtenida correctamente"
      );
    } catch (error) {
      console.error("CONTROLADOR: Error en getTrainerSchedule:", error);
      next(error);
    }
  }

  // Get daily schedule
  async getDailySchedule(req: Request, res: Response, next: NextFunction) {
    console.log("CONTROLADOR: Petición GET a /schedules/daily/:date recibida", { params: req.params });
    try {
      const { date } = req.params;
      console.log("CONTROLADOR: Fecha para agenda diaria:", date);
      const schedule = await scheduleService.getDailySchedule(date);
      console.log("CONTROLADOR: Agenda diaria obtenida.");

      return ApiResponse.success(
        res,
        schedule,
        "Agenda diaria obtenida correctamente"
      );
    } catch (error) {
      console.error("CONTROLADOR: Error en getDailySchedule:", error);
      next(error);
    }
  }

  // Get weekly schedule
  async getWeeklySchedule(req: Request, res: Response, next: NextFunction) {
    console.log("CONTROLADOR: Petición GET a /schedules/weekly recibida", { query: req.query });
    try {
      const { startDate, endDate } = req.query as { startDate: string; endDate: string };
      console.log("CONTROLADOR: Rango de fechas para agenda semanal:", { startDate, endDate });
      const schedule = await scheduleService.getWeeklySchedule(startDate, endDate);
      console.log("CONTROLADOR: Agenda semanal obtenida.");

      return ApiResponse.success(
        res,
        schedule,
        "Agenda semanal obtenida correctamente"
      );
    } catch (error) {
      console.error("CONTROLADOR: Error en getWeeklySchedule:", error);
      next(error);
    }
  }

  // Get monthly schedule
  async getMonthlySchedule(req: Request, res: Response, next: NextFunction) {
    console.log("CONTROLADOR: Petición GET a /schedules/monthly recibida", { query: req.query });
    try {
      const { year, month } = req.query as { year: string; month: string };
      console.log("CONTROLADOR: Mes y año para agenda mensual:", { year, month });
      const schedule = await scheduleService.getMonthlySchedule(parseInt(year), parseInt(month));
      console.log("CONTROLADOR: Agenda mensual obtenida.");

      return ApiResponse.success(
        res,
        schedule,
        "Agenda mensual obtenida correctamente"
      );
    } catch (error) {
      console.error("CONTROLADOR: Error en getMonthlySchedule:", error);
      next(error);
    }
  }

  // Get active trainers
  async getActiveTrainers(req: Request, res: Response, next: NextFunction) {
    console.log("CONTROLADOR: Petición GET a /schedules/active-trainers recibida");
    try {
      const trainers = await scheduleService.getActiveTrainers();
      console.log("CONTROLADOR: Entrenadores activos obtenidos.");
      return ApiResponse.success(
        res,
        trainers,
        "Entrenadores activos obtenidos correctamente"
      );
    } catch (error) {
      console.error("CONTROLADOR: Error en getActiveTrainers:", error);
      next(error);
    }
  }

  // Get active clients with contracts
  async getActiveClients(req: Request, res: Response, next: NextFunction) {
    console.log("CONTROLADOR: Petición GET a /schedules/active-clients recibida");
    try {
      const clients = await scheduleService.getActiveClientsWithContracts();
      console.log("CONTROLADOR: Clientes activos con contratos obtenidos.");
      return ApiResponse.success(
        res,
        clients,
        "Clientes activos obtenidos correctamente"
      );
    } catch (error) {
      console.error("CONTROLADOR: Error en getActiveClients:", error);
      next(error);
    }
  }

  // === MÉTODOS ESPECÍFICOS PARA CLIENTES ===

  // Obtener horarios disponibles para clientes
  async getAvailableTimeSlots(req: Request, res: Response, next: NextFunction) {
    console.log("CONTROLADOR: Petición GET a /schedules/client/available-slots recibida", { query: req.query });
    try {
      const { fecha, id_entrenador } = req.query as { fecha: string; id_entrenador?: string };
      
      if (!fecha) {
        return ApiResponse.error(res, "La fecha es requerida", 400);
      }

      const data = {
        fecha,
        id_entrenador: id_entrenador ? parseInt(id_entrenador, 10) : undefined
      };

      console.log("CONTROLADOR: Datos para obtener horarios disponibles:", data);
      const availableSlots = await scheduleService.getAvailableTimeSlots(data);
      console.log("CONTROLADOR: Horarios disponibles obtenidos.");

      return ApiResponse.success(
        res,
        availableSlots,
        "Horarios disponibles obtenidos correctamente"
      );
    } catch (error) {
      console.error("CONTROLADOR: Error en getAvailableTimeSlots:", error);
      next(error);
    }
  }

  // Crear entrenamiento específico para clientes
  async createTrainingForClient(req: Request, res: Response, next: NextFunction) {
    console.log("CONTROLADOR: Petición POST a /schedules/client/book recibida", { body: req.body });
    try {
      const user = (req.user as any);
      
      if (!user?.id) {
        return ApiResponse.error(res, "Usuario no autenticado", 401);
      }

      const userId = user.id;
      console.log("CONTROLADOR: Usuario identificado:", userId);

      console.log("CONTROLADOR: Datos para crear entrenamiento (cliente):", req.body);
      const training = await scheduleService.createTrainingForClient(req.body, userId);
      console.log("CONTROLADOR: Entrenamiento creado exitosamente para cliente.");

      return ApiResponse.success(
        res,
        training,
        "Entrenamiento agendado correctamente",
        undefined,
        201
      );
    } catch (error) {
      console.error("CONTROLADOR: Error al crear entrenamiento para cliente:", error);
      next(error);
    }
  }

  // Manejar intento de actualización por parte de cliente (denegado)
  async clientAttemptUpdate(req: Request, res: Response, next: NextFunction) {
    console.log("CONTROLADOR: Cliente intenta actualizar entrenamiento", { params: req.params });
    try {
      const user = (req.user as any);
      const trainingId = parseInt(req.params.id, 10);
      
      if (!user?.id) {
        return ApiResponse.error(res, "Usuario no autenticado", 401);
      }

      const userId = user.id;
      await scheduleService.clientAttemptUpdate(userId, trainingId);
      
      // Esta línea nunca se ejecutará debido a la excepción en el servicio
      return ApiResponse.error(res, "Operación no permitida", 403);
    } catch (error) {
      console.error("CONTROLADOR: Error en clientAttemptUpdate:", error);
      next(error);
    }
  }

  // Manejar intento de eliminación por parte de cliente (denegado)
  async clientAttemptDelete(req: Request, res: Response, next: NextFunction) {
    console.log("CONTROLADOR: Cliente intenta eliminar entrenamiento", { params: req.params });
    try {
      const user = (req.user as any);
      const trainingId = parseInt(req.params.id, 10);
      
      if (!user?.id) {
        return ApiResponse.error(res, "Usuario no autenticado", 401);
      }

      const userId = user.id;
      await scheduleService.clientAttemptDelete(userId, trainingId);
      
      // Esta línea nunca se ejecutará debido a la excepción en el servicio
      return ApiResponse.error(res, "Operación no permitida", 403);
    } catch (error) {
      console.error("CONTROLADOR: Error en clientAttemptDelete:", error);
      next(error);
    }
  }
}
