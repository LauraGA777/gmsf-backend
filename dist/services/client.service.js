"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientService = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const models_1 = require("../models");
const apiError_1 = require("../errors/apiError");
const user_service_1 = require("./user.service"); // Importar UserService
class ClientService {
    constructor() {
        this.userService = new user_service_1.UserService();
    }
    // Get all clients with pagination and filters
    findAll(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page = 1, limit = 10, search, estado } = options;
            const offset = (page - 1) * limit;
            const whereClause = {};
            if (estado !== undefined) {
                whereClause.estado = estado;
            }
            const { count, rows } = yield models_1.Person.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: models_1.User,
                        as: "usuario",
                        required: true,
                        where: search
                            ? {
                                [sequelize_1.Op.or]: [
                                    { nombre: { [sequelize_1.Op.iLike]: `%${search}%` } },
                                    { apellido: { [sequelize_1.Op.iLike]: `%${search}%` } },
                                    { correo: { [sequelize_1.Op.iLike]: `%${search}%` } },
                                    { numero_documento: { [sequelize_1.Op.iLike]: `%${search}%` } },
                                ],
                            }
                            : undefined,
                        attributes: { exclude: ["contrasena_hash"] },
                    },
                    {
                        model: models_1.EmergencyContact,
                        as: "contactos_emergencia",
                        required: false,
                    },
                    {
                        model: models_1.Beneficiary,
                        as: "beneficiarios",
                        required: false,
                        include: [
                            {
                                model: models_1.Person,
                                as: "persona_beneficiaria",
                                include: [{
                                        model: models_1.User,
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
        });
    }
    // Get client by ID
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield models_1.Person.findByPk(id, {
                include: [
                    {
                        model: models_1.User,
                        as: "usuario",
                        required: true,
                        attributes: { exclude: ["contrasena_hash"] },
                    },
                    {
                        model: models_1.EmergencyContact,
                        as: "contactos_emergencia",
                    },
                    {
                        model: models_1.Beneficiary,
                        as: "beneficiarios",
                        required: false,
                        include: [
                            {
                                model: models_1.Person,
                                as: "persona_beneficiaria",
                                include: [{
                                        model: models_1.User,
                                        as: 'usuario',
                                        attributes: { exclude: ["contrasena_hash"] }
                                    }]
                            },
                        ],
                    },
                ],
            });
            if (!client) {
                throw new apiError_1.ApiError("Cliente no encontrado", 404);
            }
            return client;
        });
    }
    // Get user by document
    findByDocument(tipo_documento, numero_documento) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield models_1.User.findOne({
                where: {
                    tipo_documento,
                    numero_documento: { [sequelize_1.Op.iLike]: numero_documento } // Búsqueda insensible a mayúsculas/minúsculas
                },
                attributes: { exclude: ["contrasena_hash", "contrasena"] },
            });
            if (!user) {
                throw new apiError_1.ApiError("Usuario no encontrado", 404);
            }
            // Comprobar si este usuario ya tiene un registro de Persona (es decir, es un cliente)
            const person = yield models_1.Person.findOne({ where: { id_usuario: user.id } });
            return Object.assign(Object.assign({}, user.toJSON()), { isAlreadyClient: person !== null });
        });
    }
    generatePersonCode(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const lastPerson = yield models_1.Person.findOne({
                order: [["id_persona", "DESC"]],
                transaction,
                lock: transaction.LOCK.UPDATE,
            });
            if (lastPerson && lastPerson.codigo) {
                const lastCodeNumber = parseInt(lastPerson.codigo.substring(1), 10);
                return `P${String(lastCodeNumber + 1).padStart(3, "0")}`;
            }
            return "P001";
        });
    }
    // Reutiliza UserService para crear o actualizar un usuario.
    _createOrUpdateUser(userData, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            // Si se proporciona un ID, actualizamos el usuario.
            if (userData.id) {
                const updatedUser = yield this.userService.update(userData.id, userData);
                // findById de userService ya devuelve el usuario, así que lo podemos castear
                return updatedUser;
            }
            // Buscamos si el usuario ya existe por número de documento
            const existingUser = yield models_1.User.findOne({
                where: { numero_documento: userData.numero_documento },
                transaction,
            });
            // Si existe, lo actualizamos
            if (existingUser) {
                yield this.userService.update(existingUser.id, userData);
                return yield this.userService.findById(existingUser.id);
            }
            // Si no existe, creamos un nuevo usuario
            // Aseguramos que la contraseña por defecto sea el número de documento si no se provee.
            if (!userData.contrasena) {
                userData.contrasena = userData.numero_documento;
            }
            // Asignar rol de cliente por defecto si no se especifica
            if (!userData.id_rol) {
                const clientRole = yield models_1.Role.findOne({ where: { nombre: 'Cliente' }, transaction });
                if (!clientRole) {
                    // Si el rol 'Cliente' no existe, lanzamos un error claro.
                    throw new apiError_1.ApiError("El rol 'Cliente' no se encuentra en la base de datos. Por favor, asegúrese de que exista.", 500);
                }
                userData.id_rol = clientRole.id;
            }
            const { user: newUser } = yield this.userService.create(userData);
            return newUser;
        });
    }
    _createPerson(personData, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const personCode = yield this.generatePersonCode(transaction);
            const newPerson = yield models_1.Person.create({
                id_usuario: personData.id_usuario,
                estado: personData.estado,
                codigo: personCode,
            }, { transaction });
            return newPerson;
        });
    }
    _createEmergencyContacts(personId, contacts, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (contacts && contacts.length > 0) {
                const contactsData = contacts.map((contact) => (Object.assign(Object.assign({}, contact), { id_persona: personId })));
                yield models_1.EmergencyContact.bulkCreate(contactsData, { transaction });
            }
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const transaction = yield db_1.default.transaction();
            try {
                // 1. Buscar si el usuario ya existe
                let titularUser = yield models_1.User.findOne({
                    where: { numero_documento: data.usuario.numero_documento },
                    transaction,
                });
                if (titularUser) {
                    // Si el usuario existe, verificar si ya es una "Persona" (cliente o beneficiario)
                    const existingPerson = yield models_1.Person.findOne({ where: { id_usuario: titularUser.id }, transaction });
                    if (existingPerson) {
                        throw new apiError_1.ApiError("Este usuario ya está registrado como cliente o beneficiario.", 409);
                    }
                    // Si es un usuario existente (ej. Admin, Entrenador) pero no un cliente, 
                    // simplemente usamos su registro de usuario sin modificarlo.
                }
                else {
                    // Si el usuario no existe, lo creamos con el rol de "Cliente"
                    titularUser = yield this._createOrUpdateUser(data.usuario, transaction);
                }
                // 2. Crear la entidad "Persona" que representa al cliente
                const titularPerson = yield this._createPerson({ id_usuario: titularUser.id, estado: (_a = data.estado) !== null && _a !== void 0 ? _a : true }, transaction);
                // 3. Crear contactos de emergencia
                yield this._createEmergencyContacts(titularPerson.id_persona, data.contactos_emergencia, transaction);
                // 4. Procesar beneficiarios (si los hay)
                if (data.beneficiarios && data.beneficiarios.length > 0) {
                    for (const bene of data.beneficiarios) {
                        const beneficiaryUser = yield this._createOrUpdateUser(bene.usuario, transaction);
                        const beneficiaryPerson = yield this._createPerson({ id_usuario: beneficiaryUser.id, estado: (_b = bene.estado) !== null && _b !== void 0 ? _b : true }, transaction);
                        const lastBeneficiary = yield models_1.Beneficiary.findOne({ order: [['id', 'DESC']], lock: transaction.LOCK.UPDATE, transaction });
                        const newCode = lastBeneficiary ? `B${String(parseInt(lastBeneficiary.codigo.substring(1), 10) + 1).padStart(3, '0')}` : 'B001';
                        yield models_1.Beneficiary.create({
                            codigo: newCode,
                            id_persona: beneficiaryPerson.id_persona,
                            id_cliente: titularPerson.id_persona,
                            relacion: bene.relacion,
                            estado: true,
                        }, { transaction });
                    }
                }
                yield transaction.commit();
                // Devolver el cliente recién creado con todos sus datos
                return this.findById(titularPerson.id_persona);
            }
            catch (error) {
                yield transaction.rollback();
                throw error;
            }
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield db_1.default.transaction();
            try {
                const person = yield models_1.Person.findByPk(id, { transaction, include: ['usuario'] });
                if (!person) {
                    throw new apiError_1.ApiError("Cliente (persona) no encontrado", 404);
                }
                // 1. Actualizar Persona (estado)
                if (data.estado !== undefined) {
                    yield person.update({ estado: data.estado }, { transaction });
                }
                // 2. Actualizar Usuario
                if (data.usuario && person.usuario) {
                    yield this.userService.update(person.usuario.id, data.usuario);
                }
                // 3. Actualizar contactos de emergencia (borrar y recrear)
                if (data.contactos_emergencia) {
                    yield models_1.EmergencyContact.destroy({ where: { id_persona: id }, transaction });
                    yield this._createEmergencyContacts(id, data.contactos_emergencia, transaction);
                }
                // 4. Actualizar beneficiarios (lógica compleja, por ahora simplificada: borrar y recrear)
                if (data.beneficiarios) {
                    yield models_1.Beneficiary.destroy({ where: { id_cliente: id }, transaction });
                    // Lógica similar a la de 'create' para añadir beneficiarios
                    for (const bene of data.beneficiarios) {
                        const beneficiaryUser = yield this._createOrUpdateUser(bene.usuario, transaction);
                        let beneficiaryPerson = yield models_1.Person.findOne({ where: { id_usuario: beneficiaryUser.id }, transaction });
                        if (!beneficiaryPerson) {
                            beneficiaryPerson = yield this._createPerson({ id_usuario: beneficiaryUser.id, estado: true }, transaction);
                        }
                        const lastBeneficiary = yield models_1.Beneficiary.findOne({ order: [['id', 'DESC']], lock: transaction.LOCK.UPDATE, transaction });
                        const newCode = lastBeneficiary ? `B${String(parseInt(lastBeneficiary.codigo.substring(1), 10) + 1).padStart(3, '0')}` : 'B001';
                        yield models_1.Beneficiary.create({
                            codigo: newCode,
                            id_persona: beneficiaryPerson.id_persona,
                            id_cliente: person.id_persona,
                            relacion: bene.relacion,
                            estado: true
                        }, { transaction });
                    }
                }
                yield transaction.commit();
                return this.findById(id);
            }
            catch (error) {
                yield transaction.rollback();
                if (error instanceof apiError_1.ApiError)
                    throw error;
                throw new apiError_1.ApiError(`Error al actualizar el cliente: ${error.message}`, 500);
            }
        });
    }
    // Delete a client (soft delete)
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield models_1.Person.findByPk(id);
            if (!client) {
                throw new apiError_1.ApiError("Cliente no encontrado", 404);
            }
            // Solo desactivamos la persona, el usuario puede seguir activo
            yield client.update({ estado: false });
            return { success: true, message: "Cliente desactivado correctamente" };
        });
    }
    // Get client beneficiaries
    getBeneficiaries(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const beneficiaries = yield models_1.Beneficiary.findAll({
                where: { id_cliente: id },
                include: [
                    {
                        model: models_1.Person,
                        as: "persona_beneficiaria",
                        where: { estado: true },
                        include: [
                            {
                                model: models_1.User,
                                as: "usuario",
                                attributes: { exclude: ["contrasena_hash"] },
                            },
                        ]
                    },
                ],
            });
            return beneficiaries;
        });
    }
    /**
   * Buscar cliente por ID de usuario (para rutas /me)
   */
    findByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("--- [Service] Finding client by userId:", userId);
                // Primero buscar el usuario
                const user = yield models_1.User.findByPk(userId, {
                    include: [
                        {
                            model: models_1.Role,
                            as: 'rol',
                            attributes: ['id', 'codigo', 'nombre']
                        }
                    ],
                    attributes: { exclude: ['contrasena_hash'] }
                });
                if (!user) {
                    throw new apiError_1.ApiError('Usuario no encontrado', 404);
                }
                console.log("--- [Service] User found:", user.toJSON());
                // Si es un cliente, buscar la información completa de persona
                const persona = yield models_1.Person.findOne({
                    where: { id_usuario: userId },
                    include: [
                        {
                            model: models_1.User,
                            as: 'usuario',
                            attributes: { exclude: ['contrasena_hash'] },
                            include: [
                                {
                                    model: models_1.Role,
                                    as: 'rol',
                                    attributes: ['id', 'codigo', 'nombre']
                                }
                            ]
                        },
                        {
                            model: models_1.EmergencyContact,
                            as: 'contactos_emergencia'
                        },
                        {
                            model: models_1.Beneficiary,
                            as: 'beneficiarios',
                            include: [
                                {
                                    model: models_1.Person,
                                    as: 'persona_beneficiaria',
                                    include: [
                                        {
                                            model: models_1.User,
                                            as: 'usuario',
                                            attributes: { exclude: ['contrasena_hash'] }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                });
                if (persona) {
                    console.log("--- [Service] Persona found:", persona.toJSON());
                    return persona;
                }
                else {
                    // Si no tiene persona, devolver solo el usuario
                    console.log("--- [Service] No persona found, returning user only");
                    return user;
                }
            }
            catch (error) {
                console.error('--- [Service] Error in findByUserId:', error);
                throw error;
            }
        });
    }
    /**
     * Obtener beneficiarios por ID de usuario
     */
    getBeneficiariesByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("--- [Service] Getting beneficiaries by userId:", userId);
                // Buscar la persona del usuario
                const persona = yield models_1.Person.findOne({
                    where: { id_usuario: userId }
                });
                if (!persona) {
                    console.log("--- [Service] No persona found for userId:", userId);
                    return [];
                }
                // Buscar beneficiarios
                const beneficiaries = yield models_1.Beneficiary.findAll({
                    where: {
                        id_cliente: persona.id_persona,
                        estado: true
                    },
                    include: [
                        {
                            model: models_1.Person,
                            as: 'persona_beneficiaria',
                            include: [
                                {
                                    model: models_1.User,
                                    as: 'usuario',
                                    attributes: { exclude: ['contrasena_hash'] }
                                }
                            ]
                        }
                    ]
                });
                console.log("--- [Service] Beneficiaries found:", beneficiaries.length);
                return beneficiaries;
            }
            catch (error) {
                console.error('--- [Service] Error in getBeneficiariesByUserId:', error);
                throw error;
            }
        });
    }
}
exports.ClientService = ClientService;
