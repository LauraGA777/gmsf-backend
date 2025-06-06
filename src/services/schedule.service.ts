import { Op } from "sequelize";
import sequelize from "../config/db";
import { Training, User, Client, Contract } from "../models";
import { ApiError } from "../errors/apiError";

export class ScheduleService {
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
          model: Client,
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

    return {
      data: rows,
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
          model: Client,
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

    return training;
  }

  // Create a new training session
  async create(data: any) {
    const transaction = await sequelize.transaction();

    try {
      // Validate trainer exists
      const trainer = await User.findByPk(data.id_entrenador, {
        transaction,
      });
      if (!trainer) {
        await transaction.rollback();
        throw new ApiError("Entrenador no encontrado", 404);
      }

      // Validate client exists
      const client = await Client.findByPk(data.id_cliente, { transaction });
      if (!client) {
        await transaction.rollback();
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
        await transaction.rollback();
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
        await transaction.rollback();
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
      await transaction.rollback();
      throw error;
    }
  }

  // Update an existing training session
  async update(id: number, data: any) {
    const transaction = await sequelize.transaction();

    try {
      const training = await Training.findByPk(id, { transaction });

      if (!training) {
        await transaction.rollback();
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
          await transaction.rollback();
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
      await transaction.rollback();
      throw error;
    }
  }

  // Delete a training session (soft delete by changing state to 'Cancelado')
  async delete(id: number) {
    const transaction = await sequelize.transaction();

    try {
      const training = await Training.findByPk(id, { transaction });

      if (!training) {
        await transaction.rollback();
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
      await transaction.rollback();
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
          model: Client,
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
          model: Client,
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
}
