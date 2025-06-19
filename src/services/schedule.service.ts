import { Op } from "sequelize";
import sequelize from "../config/db";
import { Training, User, Person, Contract, Trainer } from "../models";
import { ApiError } from "../errors/apiError";
import { enviarNotificacionEntrenamiento } from "../utils/email.utils";

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
          model: Trainer,
          as: "entrenador",
          attributes: ["id", "codigo", "especialidad"],
          include: [
            {
              model: User,
              as: "usuario",
              attributes: ["id", "nombre", "apellido", "correo"],
            },
          ],
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
          model: Trainer,
          as: "entrenador",
          attributes: ["id", "codigo", "especialidad"],
          include: [
            {
              model: User,
              as: "usuario",
              attributes: ["id", "nombre", "apellido", "correo", "telefono"],
            },
          ],
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
    console.log("SERVICIO: Iniciando la creación del entrenamiento con los datos:", data);
    const transaction = await sequelize.transaction();

    try {
      console.log("SERVICIO: Validando fecha de inicio.");
      if (new Date(data.fecha_inicio) < new Date()) {
        throw new ApiError("No se puede agendar un entrenamiento en una fecha pasada.", 400);
      }

      console.log("SERVICIO: Validando entrenador (usuario) ID:", data.id_entrenador);
      const trainerUser = await User.findByPk(data.id_entrenador, { transaction });
      if (!trainerUser || !trainerUser.estado) {
        throw new ApiError("El usuario del entrenador no existe o se encuentra inactivo.", 404);
      }
      
      const trainerDetails = await Trainer.findOne({ 
        where: { id_usuario: data.id_entrenador },
        transaction 
      });

      if (!trainerDetails || !trainerDetails.estado) {
        throw new ApiError("El entrenador no está activo o no se encontró su perfil.", 404);
      }
      

      console.log("SERVICIO: Validando cliente ID:", data.id_cliente);
      const client = await Person.findByPk(data.id_cliente, {
        include: [{ model: User, as: "usuario" }],
        transaction,
      });
      if (!client || !client.usuario) {
        throw new ApiError("Cliente no encontrado o sin usuario asociado.", 404);
      }

      console.log("SERVICIO: Verificando contrato activo o por vencer para el cliente ID:", data.id_cliente);
      const activeContract = await Contract.findOne({
          where: {
              id_persona: data.id_cliente,
              estado: { [Op.in]: ["Activo", "Por Vencer"] }
          },
          transaction
      });

      if (!activeContract) {
          throw new ApiError("El cliente no tiene un contrato activo o por vencer para agendar entrenamientos.", 400);
      }
      console.log(`SERVICIO: El cliente ID ${data.id_cliente} tiene un contrato válido (Contrato ID: ${activeContract.id}, Estado: ${activeContract.estado}).`);


      console.log("SERVICIO: Verificando conflictos de horario para entrenador y cliente.");
      const conflicts = await Training.findAll({
        where: {
          [Op.or]: [
            {
              id_entrenador: trainerDetails.id,
              fecha_inicio: { [Op.lt]: new Date(data.fecha_fin) },
              fecha_fin: { [Op.gt]: new Date(data.fecha_inicio) },
              estado: { [Op.ne]: "Cancelado" },
            },
            {
              id_cliente: data.id_cliente,
              fecha_inicio: { [Op.lt]: new Date(data.fecha_fin) },
              fecha_fin: { [Op.gt]: new Date(data.fecha_inicio) },
              estado: { [Op.ne]: "Cancelado" },
            },
          ],
        },
        transaction,
      });

      if (conflicts.length > 0) {
        console.warn("SERVICIO: Conflicto de horario detectado.", { conflicts });
        throw new ApiError("Conflicto de horario: El entrenador o el cliente ya tienen una sesión en ese rango de tiempo.", 409);
      }

      console.log("SERVICIO: No hay conflictos. Creando el entrenamiento en la base de datos.");
      const trainingDataToCreate = {
        titulo: data.titulo,
        descripcion: data.descripcion,
        fecha_inicio: new Date(data.fecha_inicio),
        fecha_fin: new Date(data.fecha_fin),
        id_entrenador: trainerDetails.id,
        id_cliente: data.id_cliente,
        estado: data.estado || "Programado",
        notas: data.notas,
      };
      console.log("SERVICIO: Datos finales para la inserción:", trainingDataToCreate);
      const training = await Training.create(trainingDataToCreate, { transaction });

      console.log("SERVICIO: Entrenamiento creado con ID:", training.id, ". Realizando commit de la transacción.");
      await transaction.commit();
      console.log("SERVICIO: Transacción completada (commit).");

      // Enviar correo de notificación
      try {
        const nombreEntrenador = `${trainerUser.nombre} ${trainerUser.apellido}`;
        const nombreCliente = `${client.usuario.nombre} ${client.usuario.apellido}`;
        
        enviarNotificacionEntrenamiento(client.usuario.correo, nombreCliente, {
          titulo: training.titulo,
          descripcion: training.descripcion,
          fecha_inicio: training.fecha_inicio,
          fecha_fin: training.fecha_fin,
          nombreEntrenador,
        });
      } catch (emailError) {
        // El error ya se loguea en la función de email.
        // No se relanza para no afectar la respuesta al cliente.
        console.error("SERVICIO: Falló el envío de correo de notificación, pero el entrenamiento fue creado.")
      }

      // Return the plain created training object to avoid eager loading issues
      return training.get({ plain: true });
    } catch (error) {
      console.error("SERVICIO: Error durante la creación del entrenamiento. Revirtiendo transacción.", error);
      await transaction.rollback();
      console.log("SERVICIO: Transacción revertida (rollback).");
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Error al crear el entrenamiento: ${(error as Error).message}`, 500);
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

      if (data.fecha_inicio && new Date(data.fecha_inicio) < new Date()) {
        throw new ApiError("No se puede reagendar un entrenamiento a una fecha pasada.", 400);
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

      // Prepare data for update, converting dates
      const updateData: { [key: string]: any } = {};
      if (data.titulo) updateData.titulo = data.titulo;
      if (data.descripcion) updateData.descripcion = data.descripcion;
      if (data.fecha_inicio) updateData.fecha_inicio = new Date(data.fecha_inicio);
      if (data.fecha_fin) updateData.fecha_fin = new Date(data.fecha_fin);
      if (data.id_cliente) updateData.id_cliente = data.id_cliente;
      if (data.estado) updateData.estado = data.estado;
      if (data.notas) updateData.notas = data.notas;

      // Update training session data
      await training.update(updateData, { transaction });

      await transaction.commit();

      // Return the plain updated training object
      return training.get({ plain: true });
    } catch (error) {
      await transaction.rollback();
      console.error(`Error en update de entrenamiento: ${(error as Error).message}`);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Error al actualizar el entrenamiento: ${(error as Error).message}`, 500);
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
          model: Trainer,
          as: "entrenador",
          attributes: ["id", "codigo", "especialidad"],
          include: [
            {
              model: User,
              as: "usuario",
              attributes: ["id", "nombre", "apellido"],
            },
          ],
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
          model: Trainer,
          as: "entrenador",
          attributes: ["id", "codigo", "especialidad"],
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
          model: Trainer,
          as: "entrenador",
          attributes: ["id", "codigo", "especialidad"],
          include: [
            {
              model: User,
              as: "usuario",
              attributes: ["id", "nombre", "apellido", "correo", "telefono"],
            },
          ],
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
          model: Trainer,
          as: "entrenador",
          attributes: ["id", "codigo", "especialidad"],
          include: [
            {
              model: User,
              as: "usuario",
              attributes: ["id", "nombre", "apellido", "correo", "telefono"],
            },
          ],
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
          model: Trainer,
          as: "entrenador",
          attributes: ["id", "codigo", "especialidad"],
          include: [
            {
              model: User,
              as: "usuario",
              attributes: ["id", "nombre", "apellido", "correo", "telefono"],
            },
          ],
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
    console.log("SERVICIO: Iniciando la búsqueda de entrenadores activos.");
    try {
      const trainers = await Trainer.findAll({
        where: { estado: true },
        include: [
          {
            model: User,
            as: "usuario",
            required: true,
            where: { estado: true },
            attributes: ["id", "nombre", "apellido", "correo"],
          },
        ],
      });
      const mappedTrainers = trainers.map((trainer) => {
        if (!trainer.usuario) return null;
        return {
          id: trainer.usuario.id,
          trainerId: trainer.id,
          name: `${trainer.usuario.nombre} ${trainer.usuario.apellido}`
        };
      }).filter(Boolean);
      console.log(`SERVICIO: Se encontraron ${mappedTrainers.length} entrenadores activos.`);
      return mappedTrainers;
    } catch (error: any) {
      console.error("----------------- ERROR DETALLADO (ENTRENADORES) -----------------");
      console.error("MENSAJE:", error.message);
      console.error("NOMBRE:", error.name);
      if (error.parent) {
        console.error("ERROR PADRE (SEQUELIZE):", error.parent);
      }
      console.error("STACK:", error.stack);
      console.error("-----------------------------------------------------------------");
      throw error;
    }
  }

  // Get active clients with active contracts
  async getActiveClientsWithContracts() {
    console.log("SERVICIO: Iniciando la búsqueda de clientes con contratos activos o por vencer.");
    try {
      const activeContracts = await Contract.findAll({
        where: { estado: { [Op.in]: ["Activo", "Por Vencer"] } },
        include: [
          {
            model: Person,
            as: "persona",
            required: true,
            include: [
              {
                model: User,
                as: "usuario",
                required: true,
                where: { estado: true },
                attributes: ["id", "nombre", "apellido", "correo"],
              },
            ],
          },
        ],
      });
      
      const clients = activeContracts
        .map(contract => {
            if (contract.persona && contract.persona.usuario) {
                return {
                    id: contract.persona.id_persona,
                    nombre: contract.persona.usuario.nombre,
                    apellido: contract.persona.usuario.apellido,
                    codigo: contract.persona.codigo,
                };
            }
            return null;
        })
        .filter((person): person is { id: number; nombre: string; apellido: string; codigo: string; } => person != null)
        .filter((person, index, self) => 
          index === self.findIndex((p) => p.id === person.id)
        );

      console.log(`SERVICIO: La consulta a la base de datos encontró ${clients.length} clientes únicos con contratos activos o por vencer.`);
      return clients;
    } catch (error: any) {
      console.error("----------------- ERROR DETALLADO (CLIENTES) -----------------");
      console.error("MENSAJE:", error.message);
      console.error("NOMBRE:", error.name);
      if (error.parent) {
        console.error("ERROR PADRE (SEQUELIZE):", error.parent);
      }
      console.error("STACK:", error.stack);
      console.error("--------------------------------------------------------------");
      throw error;
    }
  }
}
