import { Op } from "sequelize";
import sequelize from "../config/db";
import { Person, User, EmergencyContact } from "../models";
import { ApiError } from "../errors/apiError";

export class ClientService {
  // Get all clients with pagination and filters
  async findAll(options: any) {
    const { page = 1, limit = 10, search, estado, id_titular } = options;
    const offset = (page - 1) * limit;

    const whereClause: any = {};

    if (estado !== undefined) {
      whereClause.estado = estado;
    }

    if (id_titular !== undefined) {
      whereClause.id_titular = id_titular;
    }

    const { count, rows } = await Person.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "usuario",
          where: search
            ? {
                [Op.or]: [
                  { nombre: { [Op.iLike]: `%${search}%` } },
                  { apellido: { [Op.iLike]: `%${search}%` } },
                  { correo: { [Op.iLike]: `%${search}%` } },
                  { numero_documento: { [Op.iLike]: `%${search}%` } },
                ],
              }
            : undefined,
          attributes: { exclude: ["contrasena_hash"] },
        },
        {
          model: EmergencyContact,
          as: "contactos_emergencia",
          required: false,
        },
        {
          model: Person,
          as: "titular",
          required: false,
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
          as: "beneficiarios",
          required: false,
          include: [
            {
              model: User,
              as: "usuario",
              attributes: ["id", "nombre", "apellido"],
            },
          ],
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

  // Get client by ID
  async findById(id: number) {
    const client = await Person.findByPk(id, {
      include: [
        {
          model: User,
          as: "usuario",
          attributes: { exclude: ["contrasena_hash"] },
        },
        {
          model: EmergencyContact,
          as: "contactos_emergencia",
        },
        {
          model: Person,
          as: "titular",
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
          as: "beneficiarios",
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

    if (!client) {
      throw new ApiError("Cliente no encontrado", 404);
    }

    return client;
  }

  private async generateUserCode(transaction: any): Promise<string> {
    const lastUser = await User.findOne({
      order: [["id", "DESC"]],
      transaction,
    });

    return lastUser
      ? `U${String(Number(lastUser.codigo.substring(1)) + 1).padStart(3, "0")}`
      : "U001";
  }

  // Create a new client
  async create(data: any) {
    const transaction = await sequelize.transaction();

    try {
      let userId;

      // If user data is provided, create a new user or find existing one
      if (data.usuario) {
        // Check if user already exists by documento
        const existingUser = await User.findOne({
          where: { numero_documento: data.usuario.numero_documento },
          transaction,
        });

        if (existingUser) {
          userId = existingUser.id;
        } else {
          // Generate user code
          const userCode = await this.generateUserCode(transaction);

          // Create new user
          const user = await User.create(
            {
              codigo: userCode,
              nombre: data.usuario.nombre,
              apellido: data.usuario.apellido,
              correo: data.usuario.correo,
              contrasena_hash: data.usuario.contrasena,
              telefono: data.usuario.telefono,
              direccion: data.usuario.direccion,
              genero: data.usuario.genero,
              tipo_documento: data.usuario.tipo_documento,
              numero_documento: data.usuario.numero_documento,
              fecha_nacimiento: new Date(data.usuario.fecha_nacimiento),
              id_rol: 2, // Rol de cliente
            },
            { transaction }
          );

          userId = user.id;
        }
      }

      // Create client
      const client = await Person.create(
        {
          id_usuario: userId,
          id_titular: data.id_titular,
          relacion: data.relacion,
          fecha_registro: new Date(),
          estado: data.estado ?? true,
          codigo: await this.generateUserCode(transaction)
        },
        { transaction }
      );

      // Create emergency contacts if provided
      if (data.contactos_emergencia && data.contactos_emergencia.length > 0) {
        const contactsData = data.contactos_emergencia.map((contact: any) => ({
          ...contact,
          id_persona: client.id_persona,
          fecha_registro: new Date(),
        }));

        await EmergencyContact.bulkCreate(contactsData, { transaction });
      }

      await transaction.commit();
      return this.findById(client.id_persona);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Update an existing client
  async update(id: number, data: any) {
    const transaction = await sequelize.transaction();

    try {
      const client = await Person.findByPk(id, { transaction });

      if (!client) {
        await transaction.rollback();
        throw new ApiError("Cliente no encontrado", 404);
      }

      // Update client data
      await client.update(
        {
          id_titular: data.id_titular,
          relacion: data.relacion,
          estado: data.estado,
          fecha_actualizacion: new Date(),
        },
        { transaction }
      );

      // Update user data if provided
      if (data.usuario && client.id_usuario) {
        const user = await User.findByPk(client.id_usuario, { transaction });

        if (user) {
          await user.update(
            {
              nombre: data.usuario.nombre,
              apellido: data.usuario.apellido,
              correo: data.usuario.correo,
              telefono: data.usuario.telefono,
              direccion: data.usuario.direccion,
              genero: data.usuario.genero,
              tipo_documento: data.usuario.tipo_documento,
              numero_documento: data.usuario.numero_documento,
              fecha_nacimiento: data.usuario.fecha_nacimiento
                ? new Date(data.usuario.fecha_nacimiento)
                : undefined,
              fecha_actualizacion: new Date(),
            },
            { transaction }
          );
        }
      }

      // Update emergency contacts if provided
      if (data.contactos_emergencia && data.contactos_emergencia.length > 0) {
        await EmergencyContact.destroy({
          where: { id_persona: id },
          transaction,
        });

        const contactsData = data.contactos_emergencia.map((contact: any) => ({
          ...contact,
          id_persona: id,
          fecha_registro: new Date(),
          fecha_actualizacion: new Date(),
        }));

        await EmergencyContact.bulkCreate(contactsData, { transaction });
      }

      await transaction.commit();
      return this.findById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Delete a client
  async delete(id: number) {
    const transaction = await sequelize.transaction();

    try {
      const client = await Person.findByPk(id, { transaction });

      if (!client) {
        await transaction.rollback();
        throw new ApiError("Cliente no encontrado", 404);
      }

      await client.update({ estado: false }, { transaction });

      await transaction.commit();
      return { success: true, message: "Cliente eliminado correctamente" };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Get client beneficiaries
  async getBeneficiaries(id: number) {
    const beneficiaries = await Person.findAll({
      where: { id_titular: id, estado: true },
      include: [
        {
          model: User,
          as: "usuario",
          attributes: { exclude: ["contrasena_hash"] },
        },
      ],
    });

    return beneficiaries;
  }
}
