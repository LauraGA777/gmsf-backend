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
              attributes: [
                "id",
                "nombre",
                "apellido",
                "correo",
                "telefono",
                "tipo_documento",
                "numero_documento",
              ],
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
          as: "actualizador",
          attributes: ["id", "nombre", "apellido"],
        },
      ],
      limit,
      offset,
      order: [["fecha_registro", "DESC"]],
    });

    console.log(`--- [Service - findAll] Found ${rows.length} contracts ---`);

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
              attributes: [
                "id",
                "nombre",
                "apellido",
                "correo",
                "telefono",
                "numero_documento",
                "tipo_documento",
              ],
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
          as: "actualizador",
          attributes: ["id", "nombre", "apellido"],
        },
        {
          model: ContractHistory,
          as: "historial",
          include: [
            {
              model: User,
              as: "usuarioDelCambio",
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
    console.log("--- [Service] Entering create method ---", { data });
    const transaction = await sequelize.transaction();

    try {
      // Validate client exists
      const client = await Person.findByPk(data.id_persona, { transaction });
      if (!client) {
        await transaction.rollback();
        throw new ApiError("Cliente no encontrado", 404);
      }
      console.log("--- [Service] Step 1: Client found ---", { id: client.id_persona });


      // Validate membership exists
      const membership = await Membership.findByPk(data.id_membresia, {
        transaction,
      });
      if (!membership) {
        await transaction.rollback();
        throw new ApiError("Membresía no encontrada", 404);
      }
      console.log("--- [Service] Step 2: Membership found ---", { id: membership.id, precio: membership.precio });
      
      // Use string comparison for dates to avoid timezone issues.
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayString = `${year}-${month}-${day}`;

      if (data.fecha_inicio < todayString) {
        await transaction.rollback();
        throw new ApiError("La fecha de inicio no puede ser anterior a la fecha actual", 400);
      }
      console.log("--- [Service] Step 3: Start date validated ---");

      // Calculate end date based on membership vigencia_dias
      const startDate = new Date(`${data.fecha_inicio}T00:00:00`);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + membership.vigencia_dias);

      // Generate contract code
      const lastContract = await Contract.findOne({
        order: [["id", "DESC"]],
        transaction,
      });

      let nextId = 1;
      if (lastContract) {
        const lastCodeNumber = parseInt(lastContract.codigo.substring(1), 10);
        if (!isNaN(lastCodeNumber)) {
          nextId = lastCodeNumber + 1;
        } else {
          // Fallback if the last code is not a number (e.g., 'C-TEMP')
          // Use the last ID + 1 as a safe bet.
          nextId = lastContract.id + 1;
        }
      }
      const contractCode = `C${String(nextId).padStart(4, "0")}`;
      console.log("--- [Service] Step 4: Generated contract code ---", { contractCode });

      const contractToCreate = {
        codigo: contractCode,
        id_persona: data.id_persona,
        id_membresia: data.id_membresia,
        fecha_inicio: startDate,
        fecha_fin: endDate,
        membresia_precio: membership.precio, // Always use the price from the DB
        estado: "Activo" as const,
        fecha_registro: new Date(),
        fecha_actualizacion: new Date(),
        usuario_registro: data.usuario_registro,
      };
      console.log("--- [Service] Step 5: Attempting to create contract with this data ---", contractToCreate);

      // Create contract
      const contract = await Contract.create(
        contractToCreate,
        { transaction }
      );
      console.log("--- [Service] Step 6: Contract created successfully in DB ---", { contractId: contract.id });

      // Create contract history
      await ContractHistory.create(
        {
          id_contrato: contract.id,
          estado_anterior: undefined,
          estado_nuevo: "Activo",
          fecha_cambio: new Date(),
          usuario_cambio: data.usuario_registro,
          motivo: "Creación de contrato"
        },
        { transaction }
      );
      console.log("--- [Service] Step 7: Contract history created ---");

      await transaction.commit();
      console.log("--- [Service] Step 8: Transaction committed ---");

      // Return the created contract with all relations
      return this.findById(contract.id);
    } catch (error) {
      await transaction.rollback();
      console.error("--- [Service] ERROR in create method, transaction rolled back ---", error);
      throw error;
    }
  }

  // Update an existing contract
  async update(id: number, data: any) {
    console.log(`--- [Service] Entering update method for contract ID: ${id} ---`, { data });
    const transaction = await sequelize.transaction();

    try {
      const contract = await Contract.findByPk(id, { transaction });

      if (!contract) {
        await transaction.rollback();
        throw new ApiError("Contrato no encontrado", 404);
      }
      console.log("--- [Service] Update - Step 1: Found contract ---", { id: contract.id, estado: contract.estado });

      const oldState = contract.estado;
      const updates: any = {
        fecha_actualizacion: new Date(),
        usuario_actualizacion: data.usuario_actualizacion,
      };

      // Handle freezing logic
      if (data.estado === "Congelado" && oldState !== "Congelado") {
        updates.fecha_congelacion = new Date();
      }

      // Handle unfreezing logic
      if (data.estado === "Activo" && oldState === "Congelado" && contract.fecha_congelacion) {
        const frozenUntil = new Date();
        const frozenFrom = new Date(contract.fecha_congelacion);
        const frozenDuration = frozenUntil.getTime() - frozenFrom.getTime();
        
        const currentEndDate = new Date(contract.fecha_fin);
        const newEndDate = new Date(currentEndDate.getTime() + frozenDuration);
        
        updates.fecha_fin = newEndDate;
        updates.fecha_congelacion = null; // Clear the freeze date
      }

      console.log("--- [Service] Update - Received data ---", data);

      const hasMembershipChanged = data.id_membresia && data.id_membresia !== contract.id_membresia;
      const hasStartDateChanged = data.fecha_inicio && new Date(data.fecha_inicio).getTime() !== new Date(contract.fecha_inicio).getTime();

      console.log("--- [Service] Update - Change detection ---", { hasMembershipChanged, hasStartDateChanged });

      // If membership or start date changes, recalculate price and end date
      if (hasMembershipChanged || hasStartDateChanged) {
        console.log("--- [Service] Update - Membership or Start Date change detected ---");
        
        const newMembershipId = data.id_membresia || contract.id_membresia;
        const newStartDate = data.fecha_inicio ? new Date(`${data.fecha_inicio}T00:00:00`) : new Date(contract.fecha_inicio);
        
        const newMembership = await Membership.findByPk(newMembershipId, { transaction });
        if (!newMembership) {
          throw new ApiError("Nueva membresía no encontrada", 404);
        }
        console.log("--- [Service] Update - Step 2: Found new membership ---", { id: newMembership.id, precio: newMembership.precio, vigencia: newMembership.vigencia_dias });

        updates.id_membresia = newMembership.id;
        updates.membresia_precio = newMembership.precio;
        updates.fecha_inicio = newStartDate;
        
        // Recalculate end date
        const endDate = new Date(newStartDate);
        endDate.setDate(endDate.getDate() + newMembership.vigencia_dias);
        updates.fecha_fin = endDate;
        console.log("--- [Service] Update - Step 3: Recalculated dates and price ---", { newPrice: updates.membresia_precio, newEndDate: updates.fecha_fin });
      }

      // If state is being changed
      if (data.estado && data.estado !== oldState) {
        updates.estado = data.estado;
        console.log("--- [Service] Update - State change detected ---", { oldState, newState: updates.estado });
      }

      // If only reason is provided (for state changes)
      if (data.motivo) {
        console.log("--- [Service] Update - Reason provided ---", { motivo: data.motivo });
      }

      console.log("--- [Service] Update - Step 4: Applying updates to contract ---", updates);
      // Update contract data
      await contract.update(updates, { transaction });
      console.log("--- [Service] Update - Step 5: Contract updated in DB ---");

      // Create contract history if state changed
      if (updates.estado) {
        console.log("--- [Service] Update - Creating history for state change ---");
        await ContractHistory.create(
          {
            id_contrato: id,
            estado_anterior: oldState,
            estado_nuevo: updates.estado,
            usuario_cambio: data.usuario_actualizacion,
            motivo: data.motivo || "Actualización de contrato",
          },
          { transaction }
        );
        console.log("--- [Service] Update - Step 6: History created for state change ---");
      }

      await transaction.commit();
      console.log("--- [Service] Update - Step 7: Transaction committed ---");

      // Return the updated contract with all relations
      return this.findById(id);
    } catch (error) {
      await transaction.rollback();
      console.error(`--- [Service] ERROR in update method for contract ID: ${id} ---`, error);
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

  // Get contract history
  async getHistory(id: number) {
    const history = await ContractHistory.findAll({
      where: { id_contrato: id },
      include: [
        {
          model: Contract,
          as: "contrato",
        },
        {
          model: User,
          as: "usuarioDelCambio",
          attributes: ["id", "nombre", "apellido"],
        },
      ],
      order: [["fecha_cambio", "DESC"]],
    });

    return history;
  }
}
