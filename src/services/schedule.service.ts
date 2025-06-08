import { Op } from "sequelize";
import sequelize from "../config/db";
import { Training, User, Person, Contract, Trainer } from "../models";
import { ApiError } from "../errors/apiError";

export class ScheduleService {
  private _getUpdatedStatus(training: {
    estado: string;
    fecha_inicio: Date;
    fecha_fin: Date;
  }): "Programado" | "En proceso" | "Completado" | "Cancelado" {
    const { estado, fecha_inicio, fecha_fin } = training;

    if (estado === "Cancelado" || estado === "Completado") {
      return estado;
    }

    const now = new Date();
    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);

    if (now >= fin) {
      return "Completado";
    }

    if (now >= inicio && now < fin) {
      return "En proceso";
    }

    return "Programado";
  }

  // Get all training sessions with pagination and filters
  async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    estado?: string;
    id_entrenador?: number;
    id_cliente?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
  }) {
    const {
      page = 1,
      limit = 10,
      search,
      estado,
      id_entrenador,
      id_cliente,
      fecha_inicio,
      fecha_fin,
    } = options;
    const offset = (page - 1) * limit;

    const whereClause: any = {};

    if (estado) {
      whereClause.estado = estado;
    }

    if (id_entrenador) {
      whereClause.id_entrenador = id_entrenador;
    }

    if (id_cliente) {
      whereClause.id_cliente = id_cliente;
    }

    if (fecha_inicio) {
      whereClause.fecha_inicio = { [Op.gte]: new Date(fecha_inicio) };
    }

    if (fecha_fin) {
      whereClause.fecha_fin = { [Op.lte]: new Date(fecha_fin) };
    }

    if (search) {
      whereClause.titulo = { [Op.iLike]: `%${search}%` };
    }

    const { count, rows } = await Training.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "entrenador",
          attributes: ["id", "nombre", "apellido", "correo"],
        },
        {
          model: Person,
          as: "cliente",
          include: [
            {
              model: User,
              as: "usuario",
              attributes: ["id", "nombre", "apellido", "correo", "telefono"],
            },
          ],
        },
      ],
      limit,
      offset,
      order: [["fecha_inicio", "ASC"]],
    });

    const updatedRows = rows.map((training) => {
      const plainTraining = training.get({ plain: true });
      plainTraining.estado = this._getUpdatedStatus(plainTraining);
      return plainTraining;
    });

    return {
      data: updatedRows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  // Get training session by ID
  async findById(id: number) {
    const training = await Training.findByPk(id, {
      include: [
        {
          model: User,
          as: "entrenador",
          attributes: ["id", "nombre", "apellido", "correo", "telefono"],
        },
        {
          model: Person,
          as: "cliente",
          include: [
            {
              model: User,
              as: "usuario",
              attributes: ["id", "nombre", "apellido", "correo", "telefono"],
            },
          ],
        },
      ],
    });

    if (!training) {
      throw new ApiError("Sesión de entrenamiento no encontrada", 404);
    }

    training.estado = this._getUpdatedStatus(training);

    return training;
  }

  // Create a new training session
  async create(data: any) {
    const transaction = await sequelize.transaction();

    try {
      // Validate trainer exists and is active
      const trainerUser = await User.findByPk(data.id_entrenador, { transaction });
      if (!trainerUser || !trainerUser.estado) {
        throw new ApiError("El entrenador no existe o se encuentra inactivo", 404);
      }

      const trainerDetails = await Trainer.findOne({
        where: { id_usuario: data.id_entrenador, estado: true },
        transaction,
      });

      if (!trainerDetails) {
        throw new ApiError("El usuario no tiene un perfil de entrenador activo", 400);
      }

      // Validate client exists
      const client = await Person.findByPk(data.id_cliente, { transaction });
      if (!client) {
        throw new ApiError("Cliente no encontrado", 404);
      }

      // Validate client has active contract
      const activeContract = await Contract.findOne({
        where: {
          id_persona: data.id_cliente,
          estado: "Activo",
          fecha_fin: { [Op.gte]: new Date() },
        },
        transaction,
      });

      if (!activeContract) {
        throw new ApiError("El cliente no tiene un contrato activo", 400);
      }

      // Check for scheduling conflicts
      const conflicts = await Training.findAll({
        where: {
          [Op.or]: [
            {
              id_entrenador: data.id_entrenador,
              [Op.and]: [
                { fecha_inicio: { [Op.lt]: new Date(data.fecha_fin) } },
                { fecha_fin: { [Op.gt]: new Date(data.fecha_inicio) } },
              ],
              estado: { [Op.ne]: "Cancelado" },
            },
            {
              id_cliente: data.id_cliente,
              [Op.and]: [
                { fecha_inicio: { [Op.lt]: new Date(data.fecha_fin) } },
                { fecha_fin: { [Op.gt]: new Date(data.fecha_inicio) } },
              ],
              estado: { [Op.ne]: "Cancelado" },
            },
          ],
        },
        transaction,
      });

      if (conflicts.length > 0) {
        throw new ApiError("Existe un conflicto de horarios", 400);
      }

      // Create training session
      const training = await Training.create(
        {
          titulo: data.titulo,
          descripcion: data.descripcion,
          fecha_inicio: new Date(data.fecha_inicio),
          fecha_fin: new Date(data.fecha_fin),
          id_entrenador: data.id_entrenador,
          id_cliente: data.id_cliente,
          estado: data.estado || "Programado",
          notas: data.notas,
          fecha_creacion: new Date(),
        },
        { transaction }
      );

      await transaction.commit();

      // Return the created training session with all relations
      return this.findById(training.id);
    } catch (error) {
      throw error;
    }
  }

  // Update an existing training session
  async update(id: number, data: any) {
    const transaction = await sequelize.transaction();

    try {
      const training = await Training.findByPk(id, { transaction });

      if (!training) {
        throw new ApiError("Sesión de entrenamiento no encontrada", 404);
      }

      // Check for scheduling conflicts if dates are being updated
      if (data.fecha_inicio && data.fecha_fin) {
        const conflicts = await Training.findAll({
          where: {
            id: { [Op.ne]: id },
            [Op.or]: [
              {
                id_entrenador: data.id_entrenador || training.id_entrenador,
                [Op.and]: [
                  { fecha_inicio: { [Op.lt]: new Date(data.fecha_fin) } },
                  { fecha_fin: { [Op.gt]: new Date(data.fecha_inicio) } },
                ],
                estado: { [Op.ne]: "Cancelado" },
              },
              {
                id_cliente: data.id_cliente || training.id_cliente,
                [Op.and]: [
                  { fecha_inicio: { [Op.lt]: new Date(data.fecha_fin) } },
                  { fecha_fin: { [Op.gt]: new Date(data.fecha_inicio) } },
                ],
                estado: { [Op.ne]: "Cancelado" },
              },
            ],
          },
          transaction,
        });

        if (conflicts.length > 0) {
          throw new ApiError("Existe un conflicto de horarios", 400);
        }
      }

      // Update training session data
      await training.update(
        {
          titulo: data.titulo,
          descripcion: data.descripcion,
          fecha_inicio: data.fecha_inicio
            ? new Date(data.fecha_inicio)
            : undefined,
          fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : undefined,
          id_entrenador: data.id_entrenador,
          id_cliente: data.id_cliente,
          estado: data.estado,
          notas: data.notas,
        },
        { transaction }
      );

      await transaction.commit();

      // Return the updated training session with all relations
      return this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // Delete a training session (soft delete by changing state to 'Cancelado')
  async delete(id: number) {
    const transaction = await sequelize.transaction();

    try {
      const training = await Training.findByPk(id, { transaction });

      if (!training) {
        throw new ApiError("Sesión de entrenamiento no encontrada", 404);
      }

      // Soft delete - change state to 'Cancelado'
      await training.update(
        {
          estado: "Cancelado",
        },
        { transaction }
      );

      await transaction.commit();
      return {
        success: true,
        message: "Sesión de entrenamiento cancelada correctamente",
      };
    } catch (error) {
      throw error;
    }
  }

  // Check availability for a given time period
  async checkAvailability(data: {
    fecha_inicio: string;
    fecha_fin: string;
    id_entrenador?: number;
  }) {
    const { fecha_inicio, fecha_fin, id_entrenador } = data;

    const whereClause: any = {
      [Op.and]: [
        { fecha_inicio: { [Op.lt]: new Date(fecha_fin) } },
        { fecha_fin: { [Op.gt]: new Date(fecha_inicio) } },
      ],
      estado: { [Op.ne]: "Cancelado" },
    };

    if (id_entrenador) {
      whereClause.id_entrenador = id_entrenador;
    }

    const conflicts = await Training.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "entrenador",
          attributes: ["id", "nombre", "apellido"],
        },
        {
          model: Person,
          as: "cliente",
          include: [
            {
              model: User,
              as: "usuario",
              attributes: ["id", "nombre", "apellido"],
            },
          ],
        },
      ],
    });

    return {
      available: conflicts.length === 0,
      conflicts,
    };
  }

  // Get schedule for a specific client
  async getClientSchedule(clientId: number) {
    const trainings = await Training.findAll({
      where: {
        id_cliente: clientId,
        estado: { [Op.ne]: "Cancelado" },
        fecha_inicio: { [Op.gte]: new Date() },
      },
      include: [
        {
          model: User,
          as: "entrenador",
          attributes: ["id", "nombre", "apellido", "correo", "telefono"],
        },
      ],
      order: [["fecha_inicio", "ASC"]],
    });

    return trainings;
  }

  // Get schedule for a specific trainer
  async getTrainerSchedule(trainerId: number) {
    const trainings = await Training.findAll({
      where: {
        id_entrenador: trainerId,
        estado: { [Op.ne]: "Cancelado" },
        fecha_inicio: { [Op.gte]: new Date() },
      },
      include: [
        {
          model: Person,
          as: "cliente",
          include: [
            {
              model: User,
              as: "usuario",
              attributes: ["id", "nombre", "apellido", "correo", "telefono"],
            },
          ],
        },
      ],
      order: [["fecha_inicio", "ASC"]],
    });

    return trainings;
  }

  // Get daily schedule
  async getDailySchedule(date: string) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const trainings = await Training.findAll({
      where: {
        fecha_inicio: {
          [Op.between]: [startOfDay, endOfDay],
        },
        estado: { [Op.ne]: "Cancelado" },
      },
      include: [
        {
          model: User,
          as: "entrenador",
          attributes: ["id", "nombre", "apellido", "correo", "telefono"],
        },
        {
          model: Person,
          as: "cliente",
          include: [
            {
              model: User,
              as: "usuario",
              attributes: ["id", "nombre", "apellido", "correo", "telefono"],
            },
          ],
        },
      ],
      order: [["fecha_inicio", "ASC"]],
    });

    return trainings;
  }

  // Get weekly schedule
  async getWeeklySchedule(startDate: string, endDate: string) {
    const trainings = await Training.findAll({
      where: {
        fecha_inicio: {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        },
        estado: { [Op.ne]: "Cancelado" },
      },
      include: [
        {
          model: User,
          as: "entrenador",
          attributes: ["id", "nombre", "apellido", "correo", "telefono"],
        },
        {
          model: Person,
          as: "cliente",
          include: [
            {
              model: User,
              as: "usuario",
              attributes: ["id", "nombre", "apellido", "correo", "telefono"],
            },
          ],
        },
      ],
      order: [["fecha_inicio", "ASC"]],
    });

    return trainings;
  }

  // Get monthly schedule
  async getMonthlySchedule(year: number, month: number) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const trainings = await Training.findAll({
      where: {
        fecha_inicio: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
        estado: { [Op.ne]: "Cancelado" },
      },
      include: [
        {
          model: User,
          as: "entrenador",
          attributes: ["id", "nombre", "apellido", "correo", "telefono"],
        },
        {
          model: Person,
          as: "cliente",
          include: [
            {
              model: User,
              as: "usuario",
              attributes: ["id", "nombre", "apellido", "correo", "telefono"],
            },
          ],
        },
      ],
      order: [["fecha_inicio", "ASC"]],
    });

    return trainings;
  }

  // Get active trainers
  async getActiveTrainers() {
    const trainers = await User.findAll({
      where: { estado: true },
      include: [
        {
          model: Trainer,
          where: { estado: true },
          required: true,
          as: "detalles_entrenador"
        },
      ],
      attributes: ["id", "nombre", "apellido", "correo"],
    });
    return trainers;
  }

  // Get active clients with active contracts
  async getActiveClientsWithContracts() {
    const clients = await Person.findAll({
      where: { estado: true },
      include: [
        {
          model: User,
          as: "usuario",
          where: { estado: true },
          required: true,
          attributes: ["id", "nombre", "apellido", "correo"],
        },
        {
          model: Contract,
          as: "contratos",
          where: { estado: "Activo" },
          required: true,
        },
      ],
    });
    return clients;
  }
}
