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
    userId?: number; // Para filtrar por usuario autenticado
    userRole?: number; // Para aplicar filtros específicos por rol
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
      userId,
      userRole
    } = options;
    const offset = (page - 1) * limit;

    const whereClause: any = {};

    // Si es un cliente (roles 3 o 4), filtrar solo sus entrenamientos
    if (userRole && (userRole === 3 || userRole === 4) && userId) {
      // Obtener el id_persona del usuario cliente
      const clientPerson = await Person.findOne({
        where: { id_usuario: userId }
      });
      
      if (clientPerson) {
        whereClause.id_cliente = clientPerson.id_persona;
      } else {
        // Si no se encuentra la persona, retornar vacío
        return {
          trainings: [],
          totalRecords: 0,
          totalPages: 0,
          currentPage: page,
          hasNextPage: false,
          hasPreviousPage: false
        };
      }
    } else if (id_cliente) {
      // Para admin/entrenador que consulta por cliente específico
      whereClause.id_cliente = id_cliente;
    }

    if (estado) {
      whereClause.estado = estado;
    }

    if (id_entrenador) {
      whereClause.id_entrenador = id_entrenador;
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
          attributes: ["id", "codigo", "especialidad", "estado"],
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
          attributes: ["id", "codigo", "especialidad", "estado"],
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
      console.log("SERVICIO: Validando fechas.");
      const fechaInicio = new Date(data.fecha_inicio);
      const fechaFin = new Date(data.fecha_fin);
      const ahora = new Date();
      
      if (fechaInicio < ahora) {
        throw new ApiError("No se puede agendar un entrenamiento en una fecha pasada.", 400);
      }
      
      if (fechaFin <= fechaInicio) {
        throw new ApiError("La fecha de fin debe ser posterior a la fecha de inicio.", 400);
      }
      
      // Validar que la duración no sea excesiva (máximo 2 horas)
      const duracionHoras = (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60);
      if (duracionHoras > 2) {
        throw new ApiError("La duración del entrenamiento no puede exceder 2 horas.", 400);
      }

      console.log("SERVICIO: Validando entrenador ID:", data.id_entrenador);
      // Buscar el entrenador directamente por su ID (tabla Trainer, no tabla User)
      const trainerDetails = await Trainer.findByPk(data.id_entrenador, { 
        include: [
          {
            model: User,
            as: "usuario",
            attributes: ["id", "nombre", "apellido", "correo", "estado"]
          }
        ],
        transaction 
      });

      if (!trainerDetails || !trainerDetails.estado) {
        throw new ApiError("El entrenador no está activo o no se encontró su perfil.", 404);
      }

      if (!trainerDetails.usuario || !trainerDetails.usuario.estado) {
        throw new ApiError("El usuario del entrenador no existe o se encuentra inactivo.", 404);
      }
      
      const trainerUser = trainerDetails.usuario;
      

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
              id_entrenador: data.id_entrenador,
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
        id_entrenador: data.id_entrenador, // ID del entrenador (tabla Trainer)
        id_cliente: data.id_cliente, // ID del cliente (tabla Person)
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

      // Validar fechas si se están actualizando
      if (data.fecha_inicio || data.fecha_fin) {
        const fechaInicio = data.fecha_inicio ? new Date(data.fecha_inicio) : training.fecha_inicio;
        const fechaFin = data.fecha_fin ? new Date(data.fecha_fin) : training.fecha_fin;
        const ahora = new Date();
        
        if (fechaInicio < ahora) {
          throw new ApiError("No se puede reagendar un entrenamiento a una fecha pasada.", 400);
        }
        
        if (fechaFin <= fechaInicio) {
          throw new ApiError("La fecha de fin debe ser posterior a la fecha de inicio.", 400);
        }
        
        // Validar que la duración no sea excesiva (máximo 2 horas)
        const duracionHoras = (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60);
        if (duracionHoras > 2) {
          throw new ApiError("La duración del entrenamiento no puede exceder 2 horas.", 400);
        }
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
      if (data.id_entrenador) updateData.id_entrenador = data.id_entrenador; // ID del entrenador (tabla Trainer)
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
            required: true, // Solo incluir entrenadores que tienen usuario
            attributes: ["id", "nombre", "apellido", "correo", "telefono", "estado"],
          },
        ],
        attributes: ["id", "codigo", "especialidad", "estado"],
        order: [["codigo", "ASC"]],
      });
      
      console.log(`SERVICIO: Query ejecutado. Entrenadores encontrados: ${trainers.length}`);
      
      // Debug: Mostrar información detallada de los entrenadores
      trainers.forEach((trainer, index) => {
        console.log(`SERVICIO: Entrenador ${index + 1}:`, {
          id: trainer.id,
          codigo: trainer.codigo,
          estado: trainer.estado,
          usuario: trainer.usuario ? {
            id: trainer.usuario.id,
            nombre: trainer.usuario.nombre,
            apellido: trainer.usuario.apellido,
            estado: trainer.usuario.estado
          } : null
        });
      });
      
      // Filtrar por usuarios activos después del query
      const activeTrainers = trainers.filter(trainer => 
        trainer.usuario && trainer.usuario.estado === true
      );
      
      console.log(`SERVICIO: Entrenadores con usuarios activos: ${activeTrainers.length}`);
      
      const mappedTrainers = activeTrainers.map((trainer) => ({
        id: trainer.id, // ID del entrenador (tabla Trainer)
        codigo: trainer.codigo,
        especialidad: trainer.especialidad,
        estado: trainer.estado,
        usuario: {
          id: trainer.usuario!.id,
          nombre: trainer.usuario!.nombre,
          apellido: trainer.usuario!.apellido,
          correo: trainer.usuario!.correo,
          telefono: trainer.usuario!.telefono || null
        }
      }));
      
      console.log(`SERVICIO: Se encontraron ${mappedTrainers.length} entrenadores activos después del mapeo.`);
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
      throw new ApiError(`Error al obtener entrenadores activos: ${error.message}`, 500);
    }
  }

  // Get active clients with active contracts
  async getActiveClientsWithContracts() {
    console.log("SERVICIO: Iniciando la búsqueda de clientes con contratos activos o por vencer.");
    try {
      const activeContracts = await Contract.findAll({
        where: { 
          estado: { [Op.in]: ["Activo", "Por Vencer"] } 
        },
        include: [
          {
            model: Person,
            as: "persona",
            required: true,
            where: { estado: true },
            attributes: ["id_persona", "codigo", "estado"],
            include: [
              {
                model: User,
                as: "usuario",
                required: true,
                where: { estado: true },
                attributes: ["id", "nombre", "apellido", "correo", "telefono"],
              },
            ],
          },
        ],
        attributes: ["id", "estado"],
        order: [["persona", "codigo", "ASC"]],
      });
      
      console.log(`SERVICIO: Contratos activos encontrados: ${activeContracts.length}`);
      
      // Mapear y filtrar clientes únicos
      const clientsMap = new Map();
      
      activeContracts.forEach(contract => {
        if (contract.persona && contract.persona.usuario) {
          const personId = contract.persona.id_persona;
          if (!clientsMap.has(personId)) {
            clientsMap.set(personId, {
              id: personId, // ID del cliente (tabla Person)
              codigo: contract.persona.codigo,
              estado: contract.persona.estado,
              usuario: {
                id: contract.persona.usuario.id,
                nombre: contract.persona.usuario.nombre,
                apellido: contract.persona.usuario.apellido,
                correo: contract.persona.usuario.correo,
                telefono: contract.persona.usuario.telefono || null
              }
            });
          }
        }
      });

      const clients = Array.from(clientsMap.values());
      console.log(`SERVICIO: Se encontraron ${clients.length} clientes únicos con contratos activos o por vencer.`);
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
      throw new ApiError(`Error al obtener clientes activos: ${error.message}`, 500);
    }
  }

  // === MÉTODOS ESPECÍFICOS PARA CLIENTES ===

  // Obtener horarios disponibles para que los clientes puedan agendar
  async getAvailableTimeSlots(data: {
    fecha: string;
    id_entrenador?: number;
  }) {
    console.log("SERVICIO: Obteniendo horarios disponibles para clientes", data);
    const { fecha, id_entrenador } = data;

    try {
      // Definir horarios estándar del gimnasio (6:00 AM - 9:00 PM, solo en punto)
      const horariosEstandar = [];
      for (let hora = 6; hora <= 20; hora++) { // Hasta las 8 PM para empezar (termina a las 9 PM)
        const horaFormateada = `${hora.toString().padStart(2, '0')}:00`;
        horariosEstandar.push(horaFormateada);
      }

      const fechaSeleccionada = new Date(fecha);
      const inicioDelDia = new Date(fechaSeleccionada);
      inicioDelDia.setHours(6, 0, 0, 0);
      
      const finDelDia = new Date(fechaSeleccionada);
      finDelDia.setHours(20, 59, 59, 999); // Hasta las 8:59 PM para entrenamientos que empiezan

      // Obtener entrenamientos ya agendados para la fecha
      const whereClause: any = {
        fecha_inicio: {
          [Op.between]: [inicioDelDia, finDelDia],
        },
        estado: { [Op.ne]: "Cancelado" },
      };

      if (id_entrenador) {
        whereClause.id_entrenador = id_entrenador;
      }

      const entrenamientosOcupados = await Training.findAll({
        where: whereClause,
        attributes: ["fecha_inicio", "fecha_fin", "id_entrenador"],
        include: [
          {
            model: Trainer,
            as: "entrenador",
            attributes: ["id", "codigo"],
            include: [
              {
                model: User,
                as: "usuario",
                attributes: ["nombre", "apellido"],
              },
            ],
          },
        ],
      });

      // Obtener entrenadores activos si no se especifica uno
      let entrenadoresDisponibles: any[] = [];
      if (!id_entrenador) {
        entrenadoresDisponibles = await this.getActiveTrainers();
      } else {
        const entrenador = await Trainer.findOne({
          where: { 
            id: id_entrenador,
            estado: true 
          },
          include: [
            {
              model: User,
              as: "usuario",
              attributes: ["id", "nombre", "apellido", "correo", "telefono"],
            },
          ],
        });
        
        if (entrenador && entrenador.usuario?.estado) {
          entrenadoresDisponibles = [{
            id: entrenador.id,
            codigo: entrenador.codigo,
            especialidad: entrenador.especialidad,
            estado: entrenador.estado,
            usuario: entrenador.usuario
          }];
        }
      }

      // Calcular disponibilidad por horario y entrenador
      const horariosDisponibles = horariosEstandar.map(hora => {
        const [horaNum, minuto] = hora.split(':').map(Number);
        const inicioSlot = new Date(fechaSeleccionada);
        inicioSlot.setHours(horaNum, minuto, 0, 0);
        
        const finSlot = new Date(inicioSlot);
        finSlot.setHours(horaNum + 1, minuto, 0, 0); // Sesiones de 1 hora

        // Verificar si el horario ya pasó
        const ahora = new Date();
        if (inicioSlot <= ahora) {
          return {
            hora,
            disponible: false,
            razon: "Horario ya pasado",
            entrenadores: []
          };
        }

        // Filtrar entrenadores disponibles para este horario
        const entrenadoresLibres = entrenadoresDisponibles.filter(entrenador => {
          return !entrenamientosOcupados.some(entrenamiento => {
            const inicioExistente = new Date(entrenamiento.fecha_inicio);
            const finExistente = new Date(entrenamiento.fecha_fin);
            
            return entrenamiento.id_entrenador === entrenador.id &&
                   ((inicioSlot >= inicioExistente && inicioSlot < finExistente) ||
                    (finSlot > inicioExistente && finSlot <= finExistente) ||
                    (inicioSlot <= inicioExistente && finSlot >= finExistente));
          });
        });

        return {
          hora,
          disponible: entrenadoresLibres.length > 0,
          razon: entrenadoresLibres.length === 0 ? "No hay entrenadores disponibles" : null,
          entrenadores: entrenadoresLibres
        };
      }).filter(slot => slot.disponible); // Solo retornar horarios disponibles

      return horariosDisponibles;
    } catch (error: any) {
      console.error("Error al obtener horarios disponibles:", error);
      throw new ApiError(`Error al obtener horarios disponibles: ${error.message}`, 500);
    }
  }

  // Crear entrenamiento para cliente con validaciones específicas
  async createTrainingForClient(data: any, userId: number) {
    console.log("SERVICIO: Creando entrenamiento para cliente", { data, userId });
    const transaction = await sequelize.transaction();

    try {
      // Obtener el id_persona del usuario cliente
      const clientPerson = await Person.findOne({
        where: { id_usuario: userId },
        transaction
      });

      if (!clientPerson) {
        throw new ApiError("No se pudo identificar el perfil del cliente.", 400);
      }

      const clientId = clientPerson.id_persona;

      // Validar que el cliente solo pueda agendar para sí mismo (si se especifica)
      if (data.id_cliente && data.id_cliente !== clientId) {
        throw new ApiError("Solo puedes agendar entrenamientos para ti mismo.", 403);
      }

      // Asignar el id_cliente correcto
      data.id_cliente = clientId;

      // Validaciones adicionales para clientes
      const fechaInicio = new Date(data.fecha_inicio);
      const fechaFin = new Date(data.fecha_fin);
      const ahora = new Date();

      // No permitir agendar en el pasado
      if (fechaInicio <= ahora) {
        throw new ApiError("No puedes agendar entrenamientos en fechas pasadas.", 400);
      }

      // Validar que sea con al menos 2 horas de anticipación
      const dosHorasAdelante = new Date(ahora.getTime() + (2 * 60 * 60 * 1000));
      if (fechaInicio < dosHorasAdelante) {
        throw new ApiError("Debes agendar con al menos 2 horas de anticipación.", 400);
      }

      // Validar que no sea más de 30 días en el futuro
      const treintaDiasAdelante = new Date(ahora.getTime() + (30 * 24 * 60 * 60 * 1000));
      if (fechaInicio > treintaDiasAdelante) {
        throw new ApiError("No puedes agendar entrenamientos con más de 30 días de anticipación.", 400);
      }

      // Validar duración estándar (1 hora)
      const duracionHoras = (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60);
      if (duracionHoras !== 1) {
        throw new ApiError("Las sesiones de entrenamiento deben durar exactamente 1 hora.", 400);
      }

      // Validar horarios permitidos (6:00 AM - 9:00 PM)
      const hora = fechaInicio.getHours();
      if (hora < 6 || hora > 20) {
        throw new ApiError("Los entrenamientos solo pueden agendarse entre 6:00 AM y 8:00 PM (para terminar a las 9:00 PM).", 400);
      }

      // Validar que sea en horarios exactos (solo en punto)
      const minutos = fechaInicio.getMinutes();
      if (minutos !== 0) {
        throw new ApiError("Los entrenamientos solo pueden iniciarse en punto (ej: 8:00, 9:00, etc.).", 400);
      }

      // Verificar que el cliente tenga contrato activo
      const activeContract = await Contract.findOne({
        where: {
          id_persona: clientId,
          estado: { [Op.in]: ["Activo", "Por Vencer"] }
        },
        transaction
      });

      if (!activeContract) {
        throw new ApiError("No tienes un contrato activo para agendar entrenamientos.", 400);
      }

      // Verificar disponibilidad del entrenador
      const availabilityResult = await this.checkAvailability({
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        id_entrenador: data.id_entrenador
      });

      if (!availabilityResult.available) {
        throw new ApiError("El horario seleccionado no está disponible.", 409);
      }

      // Usar el método create existente pero con validaciones adicionales aplicadas
      const trainingData = {
        ...data,
        estado: "Programado", // Los clientes siempre crean como "Programado"
        titulo: data.titulo || "Sesión de Entrenamiento Personal"
      };

      const training = await this.create(trainingData);
      
      await transaction.commit();
      return training;
    } catch (error) {
      await transaction.rollback();
      console.error("Error al crear entrenamiento para cliente:", error);
      throw error;
    }
  }

  // Intentar actualizar/cancelar entrenamiento (denegado para clientes)
  async clientAttemptUpdate(userId: number, trainingId: number) {
    console.log("SERVICIO: Cliente intenta modificar entrenamiento", { userId, trainingId });
    
    // Obtener el id_persona del usuario cliente
    const clientPerson = await Person.findOne({
      where: { id_usuario: userId }
    });

    if (!clientPerson) {
      throw new ApiError("No se pudo identificar el perfil del cliente.", 400);
    }
    
    // Verificar que el entrenamiento pertenece al cliente
    const training = await Training.findOne({
      where: {
        id: trainingId,
        id_cliente: clientPerson.id_persona
      }
    });

    if (!training) {
      throw new ApiError("Entrenamiento no encontrado o no tienes acceso a él.", 404);
    }

    // Siempre denegar la modificación con mensaje específico
    throw new ApiError("Para modificar o cancelar su entrenamiento, por favor contacte con administración.", 403);
  }

  // Intentar eliminar entrenamiento (denegado para clientes)
  async clientAttemptDelete(userId: number, trainingId: number) {
    console.log("SERVICIO: Cliente intenta eliminar entrenamiento", { userId, trainingId });
    
    // Obtener el id_persona del usuario cliente
    const clientPerson = await Person.findOne({
      where: { id_usuario: userId }
    });

    if (!clientPerson) {
      throw new ApiError("No se pudo identificar el perfil del cliente.", 400);
    }
    
    // Verificar que el entrenamiento pertenece al cliente
    const training = await Training.findOne({
      where: {
        id: trainingId,
        id_cliente: clientPerson.id_persona
      }
    });

    if (!training) {
      throw new ApiError("Entrenamiento no encontrado o no tienes acceso a él.", 404);
    }

    // Siempre denegar la eliminación con mensaje específico
    throw new ApiError("Para modificar o cancelar su entrenamiento, por favor contacte con administración.", 403);
  }
}
