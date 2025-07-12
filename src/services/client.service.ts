import { Op, Transaction } from "sequelize";
import sequelize from "../config/db";
import { Person, User, EmergencyContact, Beneficiary, Role } from "../models";
import { ApiError } from "../errors/apiError";
import { UserService } from "./user.service"; // Importar UserService
import { UserCreateType, UpdateUserType } from "../validators/user.validator";

export class ClientService {
  private userService: UserService; // Instancia de UserService

  constructor() {
    this.userService = new UserService();
  }

  // Get all clients with pagination and filters
  async findAll(options: any) {
    const { page = 1, limit = 10, search, estado } = options;
    const offset = (page - 1) * limit;

    const whereClause: any = {};
    if (estado !== undefined) {
      whereClause.estado = estado;
    }

    const { count, rows } = await Person.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "usuario",
          required: true,
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
          model: Beneficiary,
          as: "beneficiarios",
          required: false,
          include: [
            {
              model: Person,
              as: "persona_beneficiaria",
              include: [{
                model: User,
                as: 'usuario',
                attributes: { exclude: ["contrasena_hash"] }
              }]
            },
          ],
        },
      ],
      limit,
      offset,
      order: [["fecha_registro", "DESC"]],
      distinct: true,
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
          required: true,
          attributes: { exclude: ["contrasena_hash"] },
        },
        {
          model: EmergencyContact,
          as: "contactos_emergencia",
        },
        {
          model: Beneficiary,
          as: "beneficiarios",
          required: false,
          include: [
            {
              model: Person,
              as: "persona_beneficiaria",
              include: [{
                model: User,
                as: 'usuario',
                attributes: { exclude: ["contrasena_hash"] }
              }]
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

  // Get user by document
  async findByDocument(tipo_documento: string, numero_documento: string) {
    const user = await User.findOne({
      where: { 
        tipo_documento, 
        numero_documento: { [Op.iLike]: numero_documento } // Búsqueda insensible a mayúsculas/minúsculas
      },
      attributes: { exclude: ["contrasena_hash", "contrasena"] },
    });

    if (!user) {
      throw new ApiError("Usuario no encontrado", 404);
    }
    
    // Comprobar si este usuario ya tiene un registro de Persona (es decir, es un cliente)
    const person = await Person.findOne({ where: { id_usuario: user.id } });

    return {
      ...user.toJSON(), // Devuelve todos los datos del usuario
      isAlreadyClient: person !== null, // Un booleano claro para el frontend
    };
  }

  private async generatePersonCode(transaction: any): Promise<string> {
    const lastPerson = await Person.findOne({
      order: [["id_persona", "DESC"]],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (lastPerson && lastPerson.codigo) {
      const lastCodeNumber = parseInt(lastPerson.codigo.substring(1), 10);
      return `P${String(lastCodeNumber + 1).padStart(3, "0")}`;
    }
    
    return "P001";
  }

  // Reutiliza UserService para crear o actualizar un usuario.
  private async _createOrUpdateUser(userData: any, transaction: Transaction): Promise<User> {
    // Si se proporciona un ID, actualizamos el usuario.
    if (userData.id) {
      const updatedUser = await this.userService.update(userData.id, userData as UpdateUserType);
      // findById de userService ya devuelve el usuario, así que lo podemos castear
      return updatedUser as User;
    }

    // Buscamos si el usuario ya existe por número de documento
    const existingUser = await User.findOne({
      where: { numero_documento: userData.numero_documento },
      transaction,
    });

    // Si existe, lo actualizamos
    if (existingUser) {
        await this.userService.update(existingUser.id, userData as UpdateUserType);
        return await this.userService.findById(existingUser.id) as User;
    }
    
    // Si no existe, creamos un nuevo usuario
    // Aseguramos que la contraseña por defecto sea el número de documento si no se provee.
    if (!userData.contrasena) {
      userData.contrasena = userData.numero_documento;
    }
    
    // Asignar rol de cliente por defecto si no se especifica
    if (!userData.id_rol) {
      const clientRole = await Role.findOne({ where: { nombre: 'Cliente' }, transaction });
      if (!clientRole) {
        // Si el rol 'Cliente' no existe, lanzamos un error claro.
        throw new ApiError("El rol 'Cliente' no se encuentra en la base de datos. Por favor, asegúrese de que exista.", 500);
      }
      userData.id_rol = clientRole.id;
    }

    const { user: newUser } = await this.userService.create(userData as UserCreateType);
    return newUser as User;
  }

  private async _createPerson(personData: any, transaction: Transaction): Promise<Person> {
    const personCode = await this.generatePersonCode(transaction);
    const newPerson = await Person.create(
      {
        id_usuario: personData.id_usuario,
        estado: personData.estado,
        codigo: personCode,
      },
      { transaction }
    );
    return newPerson;
  }

  private async _createEmergencyContacts(personId: number, contacts: any[], transaction: Transaction): Promise<void> {
    if (contacts && contacts.length > 0) {
      const contactsData = contacts.map((contact: any) => ({
        ...contact,
        id_persona: personId,
      }));
      await EmergencyContact.bulkCreate(contactsData, { transaction });
    }
  }

  async create(data: any) {
    const transaction = await sequelize.transaction();
    try {
      // 1. Buscar si el usuario ya existe
      let titularUser = await User.findOne({
        where: { numero_documento: data.usuario.numero_documento },
        transaction,
      });

      if (titularUser) {
        // Si el usuario existe, verificar si ya es una "Persona" (cliente o beneficiario)
        const existingPerson = await Person.findOne({ where: { id_usuario: titularUser.id }, transaction });
        if (existingPerson) {
          throw new ApiError("Este usuario ya está registrado como cliente o beneficiario.", 409);
        }
        // Si es un usuario existente (ej. Admin, Entrenador) pero no un cliente, 
        // simplemente usamos su registro de usuario sin modificarlo.
      } else {
        // Si el usuario no existe, lo creamos con el rol de "Cliente"
        titularUser = await this._createOrUpdateUser(data.usuario, transaction);
      }

      // 2. Crear la entidad "Persona" que representa al cliente
      const titularPerson = await this._createPerson(
        { id_usuario: titularUser.id, estado: data.estado ?? true },
        transaction
      );

      // 3. Crear contactos de emergencia
      await this._createEmergencyContacts(titularPerson.id_persona, data.contactos_emergencia, transaction);
  
      // 4. Procesar beneficiarios (si los hay)
      if (data.beneficiarios && data.beneficiarios.length > 0) {
        for (const bene of data.beneficiarios) {
          const beneficiaryUser = await this._createOrUpdateUser(bene.usuario, transaction);
          const beneficiaryPerson = await this._createPerson(
            { id_usuario: beneficiaryUser.id, estado: bene.estado ?? true },
            transaction
          );
          
          const lastBeneficiary = await Beneficiary.findOne({ order: [['id', 'DESC']], lock: transaction.LOCK.UPDATE, transaction });
          const newCode = lastBeneficiary ? `B${String(parseInt(lastBeneficiary.codigo.substring(1), 10) + 1).padStart(3, '0')}` : 'B001';

          await Beneficiary.create({
            codigo: newCode,
            id_persona: beneficiaryPerson.id_persona,
            id_cliente: titularPerson.id_persona,
            relacion: bene.relacion,
            estado: true,
          }, { transaction });
        }
      }

      await transaction.commit();

      // Devolver el cliente recién creado con todos sus datos
      return this.findById(titularPerson.id_persona);

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async update(id: number, data: any) {
    const transaction = await sequelize.transaction();
    try {
      const person = await Person.findByPk(id, { transaction, include: ['usuario'] });
      if (!person) {
        throw new ApiError("Cliente (persona) no encontrado", 404);
      }
  
      // 1. Actualizar Persona (estado)
      if(data.estado !== undefined) {
        await person.update({ estado: data.estado }, { transaction });
      }
  
      // 2. Actualizar Usuario
      if (data.usuario && person.usuario) {
        await this.userService.update(person.usuario.id, data.usuario);
      }
  
      // 3. Actualizar contactos de emergencia (borrar y recrear)
      if (data.contactos_emergencia) {
        await EmergencyContact.destroy({ where: { id_persona: id }, transaction });
        await this._createEmergencyContacts(id, data.contactos_emergencia, transaction);
      }
  
      // 4. Actualizar beneficiarios (lógica compleja, por ahora simplificada: borrar y recrear)
      if (data.beneficiarios) {
        await Beneficiary.destroy({ where: { id_cliente: id }, transaction });
        // Lógica similar a la de 'create' para añadir beneficiarios
         for (const bene of data.beneficiarios) {
          const beneficiaryUser = await this._createOrUpdateUser(bene.usuario, transaction);
          
          let beneficiaryPerson = await Person.findOne({ where: { id_usuario: beneficiaryUser.id }, transaction });
          if(!beneficiaryPerson) {
             beneficiaryPerson = await this._createPerson(
                { id_usuario: beneficiaryUser.id, estado: true },
                transaction
              );
          }
          
          const lastBeneficiary = await Beneficiary.findOne({ order: [['id', 'DESC']], lock: transaction.LOCK.UPDATE, transaction });
          const newCode = lastBeneficiary ? `B${String(parseInt(lastBeneficiary.codigo.substring(1), 10) + 1).padStart(3, '0')}` : 'B001';

          await Beneficiary.create({
            codigo: newCode,
            id_persona: beneficiaryPerson.id_persona,
            id_cliente: person.id_persona,
            relacion: bene.relacion,
            estado: true
          }, { transaction });
        }
      }
  
      await transaction.commit();
      return this.findById(id);
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Error al actualizar el cliente: ${(error as Error).message}`, 500);
    }
  }

  // Delete a client (soft delete)
  async delete(id: number) {
      const client = await Person.findByPk(id);
      if (!client) {
        throw new ApiError("Cliente no encontrado", 404);
      }

      // Solo desactivamos la persona, el usuario puede seguir activo
      await client.update({ estado: false });
      
      return { success: true, message: "Cliente desactivado correctamente" };
  }

  // Get client beneficiaries
  async getBeneficiaries(id: number) {
    const beneficiaries = await Beneficiary.findAll({
      where: { id_cliente: id },
      include: [
        {
          model: Person,
          as: "persona_beneficiaria",
          where: { estado: true },
          include: [
            {
              model: User,
              as: "usuario",
              attributes: { exclude: ["contrasena_hash"] },
            },
          ]
        },
      ],
    });

    return beneficiaries;
  }
}
