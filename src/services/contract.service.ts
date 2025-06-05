import { Op } from "sequelize";
import sequelize from "../config/db";
import {
  Contract,
  ContractHistory,
  Person,
  Membership,
  User,
} from "../models";
import { ApiError } from "../errors/apiError";

export class ContractService {
  // Get all contracts with pagination and filters
  async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    estado?: string;
    id_persona?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
  }) {
    const {
      page = 1,
      limit = 10,
      search = "",
      estado,
      id_persona,
      fecha_inicio,
      fecha_fin,
    } = options;
    const offset = (page - 1) * limit;

    const whereClause: any = {};

    if (estado) {
      whereClause.estado = estado;
    }

    if (id_persona) {
      whereClause.id_persona = id_persona;
    }

    if (fecha_inicio) {
      whereClause.fecha_inicio = { [Op.gte]: new Date(fecha_inicio) };
    }

    if (fecha_fin) {
      whereClause.fecha_fin = { [Op.lte]: new Date(fecha_fin) };
    }

    if (search) {
      whereClause.codigo = { [Op.iLike]: `%${search}%` };
    }

    const { count, rows } = await Contract.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Person,
          as: "persona",
          include: [
            {
              model: User,
              as: "usuario",
              attributes: ["id", "nombre", "apellido", "correo"],
            },
          ],
        },
        {
          model: Membership,
          as: "membresia",
        },
        {
          model: User,
          as: "registrador",
          attributes: ["id", "nombre", "apellido"],
        },
        {
          model: User,
          as: "actualizacion",
          attributes: ["id", "nombre", "apellido"],
        },
      ],
      limit,
      offset,
      order: [["fecha_registro", "DESC"]],
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

  // Get contract by ID
  async findById(id: number) {
    const contract = await Contract.findByPk(id, {
      include: [
        {
          model: Person,
          as: "persona",
          include: [
            {
              model: User,
              as: "usuario",
              attributes: ["id", "nombre", "apellido", "correo", "telefono"],
            },
          ],
        },
        {
          model: Membership,
          as: "membresia",
        },
        {
          model: User,
          as: "registrador",
          attributes: ["id", "nombre", "apellido"],
        },
        {
          model: User,
          as: "actualizacion",
          attributes: ["id", "nombre", "apellido"],
        },
        {
          model: ContractHistory,
          as: "historial",
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

    if (!contract) {
      throw new ApiError("Contrato no encontrado", 404);
    }

    return contract;
  }

  // Create a new contract
  async create(data: any) {
    const transaction = await sequelize.transaction();

    try {
      // Validate client exists
      const client = await Person.findByPk(data.id_persona, { transaction });
      if (!client) {
        await transaction.rollback();
        throw new ApiError("Cliente no encontrado", 404);
      }

      // Validate membership exists
      const membership = await Membership.findByPk(data.id_membresia, {
        transaction,
      });
      if (!membership) {
        await transaction.rollback();
        throw new ApiError("Membresía no encontrada", 404);
      }

      // Generate contract code
      const lastContract = await Contract.findOne({
        order: [["id", "DESC"]],
        transaction,
      });

      const contractCode = lastContract
        ? `C${String(Number(lastContract.codigo.substring(1)) + 1).padStart(
            4,
            "0"
          )}`
        : "C0001";

      // Create contract
      const contract = await Contract.create(
        {
          codigo: contractCode,
          id_persona: data.id_persona,
          id_membresia: data.id_membresia,
          fecha_inicio: new Date(data.fecha_inicio),
          fecha_fin: new Date(data.fecha_fin),
          membresia_precio: data.membresia_precio,
          estado: data.estado,
          usuario_registro: data.usuario_registro,
        },
        { transaction }
      );      // Create contract history
      await ContractHistory.create(
        {
          id_contrato: contract.id,
          estado_anterior: undefined,
          estado_nuevo: data.estado,
          usuario_cambio: data.usuario_registro,
          motivo: "Creación de contrato",
        },
        { transaction }
      );

      await transaction.commit();

      // Return the created contract with all relations
      return this.findById(contract.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Update an existing contract
  async update(id: number, data: any) {
    const transaction = await sequelize.transaction();

    try {
      const contract = await Contract.findByPk(id, { transaction });

      if (!contract) {
        await transaction.rollback();
        throw new ApiError("Contrato no encontrado", 404);
      }

      const oldState = contract.estado;

      // Update contract data
      await contract.update(
        {
          id_membresia: data.id_membresia,
          fecha_inicio: data.fecha_inicio
            ? new Date(data.fecha_inicio)
            : undefined,
          fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : undefined,
          membresia_precio: data.membresia_precio,
          estado: data.estado,
          fecha_actualizacion: new Date(),
          usuario_actualizacion: data.usuario_actualizacion,
        },
        { transaction }
      );

      // Create contract history if state changed
      if (data.estado && oldState !== data.estado) {
        await ContractHistory.create(
          {
            id_contrato: id,
            estado_anterior: oldState,
            estado_nuevo: data.estado,
            usuario_cambio: data.usuario_actualizacion,
            motivo: data.motivo || "Actualización de contrato",
          },
          { transaction }
        );
      }

      await transaction.commit();

      // Return the updated contract with all relations
      return this.findById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Delete a contract (soft delete by changing state to 'Cancelado')
  async delete(id: number, userId: number) {
    const transaction = await sequelize.transaction();

    try {
      const contract = await Contract.findByPk(id, { transaction });

      if (!contract) {
        await transaction.rollback();
        throw new ApiError("Contrato no encontrado", 404);
      }

      const oldState = contract.estado;

      // Soft delete - change state to 'Cancelado'
      await contract.update(
        {
          estado: "Cancelado",
          fecha_actualizacion: new Date(),
          usuario_actualizacion: userId,
        },
        { transaction }
      );

      // Create contract history
      await ContractHistory.create(
        {
          id_contrato: id,
          estado_anterior: oldState,
          estado_nuevo: "Cancelado",
          usuario_cambio: userId,
          motivo: "Cancelación de contrato",
        },
        { transaction }
      );

      await transaction.commit();
      return { success: true, message: "Contrato cancelado correctamente" };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Renew a contract
  async renew(data: any) {
    const transaction = await sequelize.transaction();

    try {
      const oldContract = await Contract.findByPk(data.id_contrato, {
        transaction,
      });

      if (!oldContract) {
        await transaction.rollback();
        throw new ApiError("Contrato no encontrado", 404);
      }

      // Update old contract to 'Vencido' if it's not already
      if (oldContract.estado !== "Vencido") {
        const oldState = oldContract.estado;

        await oldContract.update(
          {
            estado: "Vencido",
            fecha_actualizacion: new Date(),
            usuario_actualizacion: data.usuario_registro,
          },
          { transaction }
        );

        // Create history for old contract
        await ContractHistory.create(
          {
            id_contrato: oldContract.id,
            estado_anterior: oldState,
            estado_nuevo: "Vencido",
            usuario_cambio: data.usuario_registro,
            motivo: "Renovación de contrato",
          },
          { transaction }
        );
      }

      // Generate new contract code
      const lastContract = await Contract.findOne({
        order: [["id", "DESC"]],
        transaction,
      });

      const contractCode = lastContract
        ? `C${String(Number(lastContract.codigo.substring(1)) + 1).padStart(
            4,
            "0"
          )}`
        : "C0001";

      // Create new contract
      const newContract = await Contract.create(
        {
          codigo: contractCode,
          id_persona: oldContract.id_persona,
          id_membresia: data.id_membresia,
          fecha_inicio: new Date(data.fecha_inicio),
          fecha_fin: new Date(data.fecha_fin),
          membresia_precio: data.membresia_precio,
          estado: "Activo",
          usuario_registro: data.usuario_registro,
        },
        { transaction }
      );

      // Create history for new contract
      await ContractHistory.create(
        {
          id_contrato: newContract.id,
          estado_anterior: undefined,
          estado_nuevo: "Activo",
          usuario_cambio: data.usuario_registro,
          motivo: "Creación por renovación",
        },
        { transaction }
      );

      await transaction.commit();

      // Return the new contract with all relations
      return this.findById(newContract.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Freeze a contract
  async freeze(contractId: number, data: any) {
    const transaction = await sequelize.transaction();

    try {
      const contract = await Contract.findByPk(contractId, { transaction });

      if (!contract) {
        await transaction.rollback();
        throw new ApiError("Contrato no encontrado", 404);
      }

      // Create history record
      await ContractHistory.create(
        {
          id_contrato: contractId,
          estado_nuevo: "Congelado",
          estado_anterior: contract.estado || undefined,
          motivo: data.motivo,
          usuario_cambio: data.usuario_id,
        },
        { transaction }
      );

      // Update contract to 'Congelado'
      await contract.update(
        {
          estado: "Congelado",
          fecha_actualizacion: new Date(),
          usuario_actualizacion: data.usuario_actualizacion,
        },
        { transaction }
      );

      await transaction.commit();

      // Return the updated contract with all relations
      return this.findById(contractId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Get contract history
  async getHistory(id: number) {
    const history = await ContractHistory.findAll({
      where: { id_contrato: id },
      include: [
        {
          model: User,
          as: "usuario",
          attributes: ["id", "nombre", "apellido"],
        },
      ],
      order: [["fecha_cambio", "DESC"]],
    });

    return history;
  }
}
