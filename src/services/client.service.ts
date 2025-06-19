import { Op, Transaction } from "sequelize";
import sequelize from "../config/db";
import { Person, User, EmergencyContact, Beneficiary } from "../models";
import { ApiError } from "../errors/apiError";

export class ClientService {
  // Get all clients with pagination and filters
  async findAll(options: any) {
    const { page = 1, limit = 10, search, estado } = options;
    const offset = (page - 1) * limit;

    const whereClause: any = {
      // Solo traer personas que NO son beneficiarias de nadie.
      // Esto se infiere si no tienen una entrada en la tabla de beneficiarios donde ellos son `id_persona`.
      // Esta lógica puede ser compleja para Sequelize, una mejor aproximación es filtrar post-consulta o ajustar el modelo.
      // Por ahora, traemos a todos los que no son explícitamente beneficiarios en la tabla `personas`.
      // Con el cambio, todos los titulares no tendrán `id_titular`.
    };

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
      distinct: true, // Needed because of hasMany associations
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
    console.log("--- [Service] FindByDocument: Received params ---", { tipo_documento, numero_documento });
    const user = await User.findOne({
      where: { tipo_documento, numero_documento },
      attributes: { exclude: ["contrasena_hash"] },
    });
    console.log("--- [Service] FindByDocument: User query result ---", user ? user.toJSON() : null);

    if (!user) {
      throw new ApiError("Usuario no encontrado", 404);
    }

    console.log("--- [Service] FindByDocument: Checking for existing person record ---");
    const person = await Person.findOne({ where: { id_usuario: user.id } });
    console.log("--- [Service] FindByDocument: Person query result ---", person ? person.toJSON() : null);

    const userData = user.toJSON() as any;
    userData.isAlreadyClient = person !== null;

    console.log("--- [Service] FindByDocument: Final data to return ---", userData);
    return userData;
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

  private async generateUserCode(transaction: any): Promise<string> {
    const lastUser = await User.findOne({
      order: [["id", "DESC"]],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    return lastUser
      ? `U${String(Number(lastUser.codigo.substring(1)) + 1).padStart(3, "0")}`
      : "U001";
  }

  // Create or update a user
  private async _createOrUpdateUser(userData: any, transaction: Transaction): Promise<User> {
    console.log("--- [Service] _createOrUpdateUser: Starting with data ---", userData);
    if (userData.id) {
      console.log(`--- [Service] _createOrUpdateUser: Updating user by ID: ${userData.id} ---`);
      const user = await User.findByPk(userData.id, { transaction });
      if (!user) throw new ApiError("Usuario no encontrado para actualizar", 404);
      
      // No actualizar contraseña si viene vacía
      if (userData.contrasena === '') {
        delete userData.contrasena;
      }

      await user.update(userData, { transaction });
      console.log(`--- [Service] _createOrUpdateUser: User ${user.id} updated ---`);
      return user;
    }
  
    console.log(`--- [Service] _createOrUpdateUser: Finding user by document: ${userData.numero_documento} ---`);
    let user = await User.findOne({
      where: { numero_documento: userData.numero_documento },
      transaction,
    });
  
    if (user) {
      console.log(`--- [Service] _createOrUpdateUser: Found existing user by document, ID: ${user.id}. Updating... ---`);
      
      // No actualizar contraseña si viene vacía
      if (userData.contrasena === '') {
        delete userData.contrasena;
      }
      
      await user.update(userData, { transaction });
      console.log(`--- [Service] _createOrUpdateUser: User ${user.id} updated ---`);
    } else {
      console.log(`--- [Service] _createOrUpdateUser: No user found by document. Creating new user... ---`);
      
      // Si no se proporciona contraseña para un nuevo usuario, usar el documento.
      if (!userData.contrasena) {
        console.log("--- [Service] _createOrUpdateUser: No password provided for new user, using document number as default. ---");
        userData.contrasena = userData.numero_documento;
      }
      
      const userCode = await this.generateUserCode(transaction);
      console.log(`--- [Service] _createOrUpdateUser: Generated user code: ${userCode} ---`);
      user = await User.create(
        {
          ...userData,
          codigo: userCode,
          contrasena_hash: userData.contrasena,
          id_rol: userData.id_rol || 2, // Default to client role
        },
        { transaction }
      );
      console.log(`--- [Service] _createOrUpdateUser: New user created with ID: ${user.id} ---`);
    }
    return user;
  }
  

  // Create a person record and associated emergency contacts
  private async _createPerson(personData: any, transaction: Transaction): Promise<Person> {
    console.log("--- [Service] _createPerson: Starting with data ---", personData);
    const personCode = await this.generatePersonCode(transaction);
    console.log(`--- [Service] _createPerson: Generated person code: ${personCode} ---`);
    const newPerson = await Person.create(
      {
        // No pasar id_titular o relacion aquí
        id_usuario: personData.id_usuario,
        estado: personData.estado,
        codigo: personCode,
      },
      { transaction }
    );
    console.log(`--- [Service] _createPerson: New person created with ID: ${newPerson.id_persona} ---`);
    return newPerson;
  }

  // Create emergency contacts for a person
  private async _createEmergencyContacts(personId: number, contacts: any[], transaction: Transaction): Promise<void> {
    if (contacts && contacts.length > 0) {
      console.log(`--- [Service] _createEmergencyContacts: Creating ${contacts.length} emergency contacts for person ${personId}... ---`);
      const contactsData = contacts.map((contact: any) => ({
        ...contact,
        id_persona: personId,
      }));
      await EmergencyContact.bulkCreate(contactsData, { transaction });
      console.log(`--- [Service] _createEmergencyContacts: Emergency contacts created. ---`);
    }
  }

  // Create a new client (titular) and potentially beneficiaries
  async create(data: any) {
    console.log("--- [Service] Create Client: Starting transaction with data ---", JSON.stringify(data, null, 2));
    const transaction = await sequelize.transaction();
    try {
      // 1. Create/update the main user (titular)
      console.log("--- [Service] Create Client: Creating/updating titular user... ---");
      const titularUser = await this._createOrUpdateUser(data.usuario, transaction);
      console.log(`--- [Service] Create Client: Titular user processed. ID: ${titularUser.id} ---`);
  
      // Check if this user is already a client (Person)
      console.log(`--- [Service] Create Client: Checking if person exists for user ID: ${titularUser.id} ---`);
      const existingPerson = await Person.findOne({ where: { id_usuario: titularUser.id }, transaction });
      if (existingPerson) {
        console.error(`--- [Service] Create Client: User ${titularUser.id} is already registered as a person (ID: ${existingPerson.id_persona}) ---`);
        throw new ApiError("Este usuario ya está registrado como cliente o beneficiario.", 409);
      }
      console.log(`--- [Service] Create Client: No existing person found for user ID: ${titularUser.id}. Proceeding... ---`);

      // 2. Create the main person (titular)
      console.log("--- [Service] Create Client: Creating titular person record... ---");
      const titularPerson = await this._createPerson(
        {
          id_usuario: titularUser.id,
          estado: data.estado,
        },
        transaction
      );
      console.log(`--- [Service] Create Client: Titular person created with ID: ${titularPerson.id_persona} ---`);

      // 3. Create emergency contacts for titular
      await this._createEmergencyContacts(titularPerson.id_persona, data.contactos_emergencia, transaction);
  
      // 4. Create beneficiaries if they exist
      if (data.beneficiarios && data.beneficiarios.length > 0) {
        console.log(`--- [Service] Create Client: Processing ${data.beneficiarios.length} beneficiaries... ---`);
        for (const [index, bene] of data.beneficiarios.entries()) {
          console.log(`--- [Service] Create Client: Processing beneficiary #${index + 1} ---`, bene);
          
          // 4a. Create user and person for beneficiary
          const beneficiaryUser = await this._createOrUpdateUser(bene.usuario, transaction);
          console.log(`--- [Service] Create Client: Beneficiary user processed. ID: ${beneficiaryUser.id} ---`);
          
          const beneficiaryPerson = await this._createPerson(
            {
              id_usuario: beneficiaryUser.id,
              estado: bene.estado,
            },
            transaction
          );
          console.log(`--- [Service] Create Client: Beneficiary person created with ID: ${beneficiaryPerson.id_persona} ---`);

          // 4b. Create the link in the beneficiaries table
          const lastBeneficiary = await Beneficiary.findOne({ order: [['id', 'DESC']], lock: transaction.LOCK.UPDATE, transaction });
          const newCode = lastBeneficiary ? `B${String(parseInt(lastBeneficiary.codigo.substring(1), 10) + 1).padStart(3, '0')}` : 'B001';

          await Beneficiary.create({
            codigo: newCode,
            id_persona: beneficiaryPerson.id_persona, // The beneficiary's person ID
            id_cliente: titularPerson.id_persona, // The titular's person ID
            relacion: bene.relacion,
            estado: true
          }, { transaction });

          console.log(`--- [Service] Create Client: Beneficiary link #${index + 1} created. ---`);

          // 4c. Create emergency contacts for beneficiary
          await this._createEmergencyContacts(beneficiaryPerson.id_persona, bene.contactos_emergencia, transaction);
        }
        console.log(`--- [Service] Create Client: All beneficiaries processed. ---`);
      }
  
      await transaction.commit();
      console.log("--- [Service] Create Client: Transaction committed successfully. ---");
      
      const newClientId = titularPerson.id_persona;
      return this.findById(newClientId);
    } catch (error) {
      console.error("--- [Service] Create Client: An error occurred. Rolling back transaction. ---", error);
      await transaction.rollback();
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Error al crear el cliente: ${(error as Error).message}`, 500);
    }
  }

  // Update an existing client
  async update(id: number, data: any) {
    console.log("--- [Service] Update Client: ID ---", id);
    console.log("--- [Service] Update Client: Data ---", JSON.stringify(data, null, 2));
    const transaction = await sequelize.transaction();
    try {
      const person = await Person.findByPk(id, { transaction, include: ['usuario'] });
      console.log("--- [Service] Update Client: Found person ---", person ? person.toJSON() : null);
      if (!person) {
        throw new ApiError("Cliente (persona) no encontrado", 404);
      }
  
      // 1. Update person details (titular)
      await person.update(
        {
          estado: data.estado,
        },
        { transaction }
      );
  
      // 2. Update user details (titular)
      if (data.usuario && person.usuario) {
        await person.usuario.update(data.usuario, { transaction });
      }
  
      // 3. Update emergency contacts (Destroy and recreate)
      if (data.contactos_emergencia) {
        await EmergencyContact.destroy({ where: { id_persona: id }, transaction });
        if (data.contactos_emergencia.length > 0) {
            const contactsData = data.contactos_emergencia.map((contact: any) => ({
            ...contact,
            id_persona: id,
            }));
            await EmergencyContact.bulkCreate(contactsData, { transaction });
        }
      }
  
      // 4. Update beneficiaries (Destroy links and recreate)
      if (data.beneficiarios) {
        // First, delete old beneficiary links
        await Beneficiary.destroy({ where: { id_cliente: id }, transaction });

        // Then, create the new ones
        for (const [index, bene] of data.beneficiarios.entries()) {
          // Re-using the same logic as in `create` method
          const beneficiaryUser = await this._createOrUpdateUser(bene.usuario, transaction);
          
          // For beneficiaries, we always create a new Person record if one doesn't exist for this user.
          // Note: A user can be a person multiple times if they are a beneficiary of multiple clients.
          // This is a complex domain decision, for now, we find or create person record.
          
          let beneficiaryPerson = await Person.findOne({ where: { id_usuario: beneficiaryUser.id }, transaction });
          if(!beneficiaryPerson) {
             beneficiaryPerson = await this._createPerson(
                {
                  id_usuario: beneficiaryUser.id,
                  estado: true,
                  // Beneficiaries' emergency contacts are associated with their own person record
                  contactos_emergencia: bene.contactos_emergencia, 
                },
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
      console.log("--- [Service] Update Client: Transaction committed ---");
      return this.findById(id);
    } catch (error) {
      console.error("--- [Service] Update Client: Error, rolling back ---", error);
      await transaction.rollback();
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Error al actualizar el cliente: ${(error as Error).message}`, 500);
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
      console.error(`Error en delete cliente: ${(error as Error).message}`);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Error al eliminar el cliente: ${(error as Error).message}`, 500);
    }
  }

  // Get client beneficiaries
  async getBeneficiaries(id: number) {
    const beneficiaries = await Beneficiary.findAll({
      where: { id_cliente: id }, // Find in beneficiary table by titular/client id
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
