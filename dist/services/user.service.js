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
exports.UserService = void 0;
const sequelize_1 = require("sequelize");
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = __importDefault(require("../models/user"));
const role_1 = __importDefault(require("../models/role"));
const userHistory_1 = __importDefault(require("../models/userHistory"));
const contract_1 = __importDefault(require("../models/contract"));
const permission_1 = __importDefault(require("../models/permission"));
const privilege_1 = __importDefault(require("../models/privilege"));
const db_1 = __importDefault(require("../config/db"));
const jwt_utils_1 = require("../utils/jwt.utils");
const apiError_1 = require("../errors/apiError");
const person_model_1 = __importDefault(require("../models/person.model"));
const trainer_1 = __importDefault(require("../models/trainer"));
const email_utils_1 = require("../utils/email.utils");
class UserService {
    generateUserCode() {
        return __awaiter(this, void 0, void 0, function* () {
            const lastUser = yield user_1.default.findOne({
                order: [['codigo', 'DESC']],
            });
            const lastCode = lastUser ? parseInt(lastUser.codigo.substring(1)) : 0;
            return `U${String(lastCode + 1).padStart(3, '0')}`;
        });
    }
    findAll(queryParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page = 1, limit = 10, orderBy = 'id', direction = 'ASC' } = queryParams;
            const offset = (page - 1) * limit;
            const validOrderField = 'id'; // Forcing order by id for now
            const { count, rows } = yield user_1.default.findAndCountAll({
                limit,
                offset,
                order: [[validOrderField, direction]],
                attributes: { exclude: ['contrasena_hash'] }
            });
            return {
                data: rows,
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit),
                }
            };
        });
    }
    getRoles() {
        return __awaiter(this, void 0, void 0, function* () {
            return role_1.default.findAll({ where: { estado: true } });
        });
    }
    findUserByDocumentOrEmail(numero_documento, correo, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return user_1.default.findOne({
                where: {
                    [sequelize_1.Op.or]: [{ numero_documento }, { correo }]
                },
                transaction
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_1.default.findByPk(id, {
                attributes: { exclude: ['contrasena_hash'] },
                include: [
                    {
                        model: role_1.default,
                        as: 'rol',
                        attributes: ['id', 'codigo', 'nombre', 'descripcion', 'estado'],
                        include: [
                            { model: permission_1.default, as: 'permisos', attributes: ['id', 'codigo', 'nombre'], through: { attributes: [] }, required: false },
                            { model: privilege_1.default, as: 'privilegios', attributes: ['id', 'codigo', 'nombre'], through: { attributes: [] }, required: false }
                        ],
                        required: false
                    }
                ]
            });
            if (!user) {
                throw new apiError_1.ApiError('Usuario no encontrado', 404);
            }
            return user;
        });
    }
    create(userData, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield user_1.default.findOne({
                where: {
                    [sequelize_1.Op.or]: [{ correo: userData.correo }, { numero_documento: userData.numero_documento }]
                },
                transaction
            });
            if (existingUser) {
                throw new apiError_1.ApiError('El correo electrónico o número de documento ya está registrado', 400);
            }
            if (userData.id_rol) {
                const role = yield role_1.default.findByPk(userData.id_rol, { transaction });
                if (!role) {
                    throw new apiError_1.ApiError('El rol especificado no existe', 400);
                }
                if (!role.estado) {
                    throw new apiError_1.ApiError('El rol especificado está inactivo', 400);
                }
            }
            const codigo = yield this.generateUserCode();
            // SIEMPRE usar número de documento como contraseña inicial
            const contrasena_hash = yield bcrypt_1.default.hash(userData.numero_documento, 10);
            // Crear usuario
            const user = yield user_1.default.create(Object.assign(Object.assign({}, userData), { codigo,
                contrasena_hash, estado: true, fecha_actualizacion: new Date(), asistencias_totales: 0, primer_acceso: true // Siempre es primer acceso
             }), { transaction });
            // Siempre enviar email de bienvenida
            try {
                yield (0, email_utils_1.enviarCorreoBienvenida)(userData.correo, {
                    nombre: userData.nombre,
                    apellido: userData.apellido,
                    numeroDocumento: userData.numero_documento,
                });
            }
            catch (emailError) {
                console.error('Error enviando email de bienvenida:', emailError);
                // No fallar la creación del usuario si el email falla
            }
            const accessToken = (0, jwt_utils_1.generateAccessToken)(user.id);
            const createdUser = yield user_1.default.findByPk(user.id, {
                transaction,
                attributes: { exclude: ['contrasena_hash'] },
                include: [{ model: role_1.default, as: 'rol' }]
            });
            return {
                user: createdUser,
                accessToken,
                message: 'Usuario creado exitosamente. Se ha enviado un email con las credenciales de acceso.'
            };
        });
    }
    update(id, data, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_1.default.findByPk(id, { transaction });
            if (!user) {
                throw new apiError_1.ApiError('Usuario no encontrado', 404);
            }
            yield user.update(Object.assign(Object.assign({}, data), { fecha_actualizacion: new Date() }), { transaction });
            return this.findById(id);
        });
    }
    activate(id, adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_1.default.findByPk(id);
            if (!user) {
                throw new apiError_1.ApiError('Usuario no encontrado', 404);
            }
            if (user.estado) {
                throw new apiError_1.ApiError('El usuario ya está activo', 400);
            }
            yield userHistory_1.default.create({
                id_usuario: user.id,
                estado_anterior: user.estado,
                estado_nuevo: true,
                usuario_cambio: adminId
            });
            user.estado = true;
            user.fecha_actualizacion = new Date();
            yield user.save();
            return { success: true, message: 'Usuario activado exitosamente' };
        });
    }
    deactivate(id, adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_1.default.findByPk(id);
            if (!user) {
                throw new apiError_1.ApiError('Usuario no encontrado', 404);
            }
            if (!user.estado) {
                throw new apiError_1.ApiError('El usuario ya está inactivo', 400);
            }
            // ✅ MEJORA 1: Verificar múltiples tipos de contratos activos
            const contractValidation = yield this.validateUserContractsForDeactivation(user.id);
            if (!contractValidation.canDeactivate) {
                throw new apiError_1.ApiError(contractValidation.message, 409);
            }
            const t = yield db_1.default.transaction();
            try {
                yield userHistory_1.default.create({
                    id_usuario: user.id,
                    estado_anterior: user.estado,
                    estado_nuevo: false,
                    usuario_cambio: adminId
                }, { transaction: t });
                user.estado = false;
                user.fecha_actualizacion = new Date();
                yield user.save({ transaction: t });
                // ✅ MEJORA 2: Lógica de desactivación en cascada mejorada
                yield this.deactivateAssociatedRecords(user, t);
                yield t.commit();
                return { success: true, message: 'Usuario y roles asociados desactivados exitosamente' };
            }
            catch (error) {
                yield t.rollback();
                throw error;
            }
        });
    }
    // ✅ NUEVO MÉTODO: Validación completa de contratos
    validateUserContractsForDeactivation(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Verificar contratos donde el usuario es el titular (a través de persona)
                const userAsClientContracts = yield contract_1.default.findAll({
                    include: [
                        {
                            model: person_model_1.default,
                            as: 'persona',
                            where: { id_usuario: userId },
                            attributes: ['id_persona', 'codigo']
                        }
                    ],
                    where: {
                        estado: 'Activo',
                        fecha_inicio: { [sequelize_1.Op.lte]: new Date() },
                        fecha_fin: { [sequelize_1.Op.gte]: new Date() }
                    },
                    attributes: ['id', 'codigo', 'fecha_inicio', 'fecha_fin']
                });
                // Verificar contratos que el usuario registró (como empleado/admin)
                const userRegisteredContracts = yield contract_1.default.count({
                    where: {
                        usuario_registro: userId,
                        estado: 'Activo',
                        fecha_inicio: { [sequelize_1.Op.lte]: new Date() },
                        fecha_fin: { [sequelize_1.Op.gte]: new Date() }
                    }
                });
                const totalActiveContracts = userAsClientContracts.length + userRegisteredContracts;
                if (totalActiveContracts > 0) {
                    let message = `No se puede desactivar el usuario porque tiene ${totalActiveContracts} contrato(s) activo(s)`;
                    if (userAsClientContracts.length > 0) {
                        const contractCodes = userAsClientContracts.map(c => c.codigo).join(', ');
                        message += `. Como cliente: ${contractCodes}`;
                    }
                    if (userRegisteredContracts > 0) {
                        message += `. Contratos registrados por este usuario: ${userRegisteredContracts}`;
                    }
                    message += '. Debe finalizar o cancelar los contratos antes de desactivar el usuario.';
                    return {
                        canDeactivate: false,
                        message,
                        details: {
                            userAsClient: userAsClientContracts.length,
                            userAsRegistrator: userRegisteredContracts,
                            contracts: userAsClientContracts
                        }
                    };
                }
                return { canDeactivate: true, message: 'Validación exitosa' };
            }
            catch (error) {
                console.error('Error validating contracts for user deactivation:', error);
                throw new apiError_1.ApiError('Error al validar contratos del usuario', 500);
            }
        });
    }
    // ✅ NUEVO MÉTODO: Desactivación en cascada mejorada
    deactivateAssociatedRecords(user, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const role = yield role_1.default.findByPk(user.id_rol, { transaction });
                if (!role)
                    return;
                switch (role.nombre) {
                    case 'Cliente':
                        yield this.deactivateClientRecords(user.id, transaction);
                        break;
                    case 'Entrenador':
                        yield this.deactivateTrainerRecords(user.id, transaction);
                        break;
                    case 'Administrador':
                    case 'Empleado':
                        // Los administradores/empleados no tienen registros adicionales que desactivar
                        console.log(`Usuario ${role.nombre} desactivado - sin registros adicionales`);
                        break;
                    default:
                        console.log(`Rol desconocido: ${role.nombre}`);
                }
            }
            catch (error) {
                console.error('Error en desactivación en cascada:', error);
                throw error;
            }
        });
    }
    // ✅ MÉTODO ESPECÍFICO: Desactivar registros de cliente
    deactivateClientRecords(userId, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const person = yield person_model_1.default.findOne({
                where: { id_usuario: userId },
                transaction
            });
            if (person) {
                person.estado = false;
                yield person.save({ transaction });
                console.log(`Persona ${person.codigo} desactivada`);
            }
        });
    }
    // ✅ MÉTODO ESPECÍFICO: Desactivar registros de entrenador
    deactivateTrainerRecords(userId, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const trainer = yield trainer_1.default.findOne({
                where: { id_usuario: userId },
                transaction
            });
            if (trainer) {
                // Verificar si tiene entrenamientos activos pendientes
                // const activeTrainings = await Training.count({
                //     where: {
                //         id_entrenador: trainer.id,
                //         estado: 'Programado',
                //         fecha_inicio: { [Op.gte]: new Date() }
                //     },
                //     transaction
                // });
                // if (activeTrainings > 0) {
                //     throw new ApiError(`El entrenador tiene ${activeTrainings} entrenamientos programados pendientes`, 409);
                // }
                trainer.estado = false;
                yield trainer.save({ transaction });
                console.log(`Entrenador ${trainer.codigo} desactivado`);
            }
        });
    }
    delete(id, adminId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_1.default.findByPk(id);
            if (!user) {
                throw new apiError_1.ApiError('Usuario no encontrado', 404);
            }
            if (user.estado) {
                throw new apiError_1.ApiError('No se puede eliminar un usuario activo', 400);
            }
            const contracts = yield contract_1.default.count({ where: { usuario_registro: user.id } });
            if (contracts > 0) {
                throw new apiError_1.ApiError('No se puede eliminar el usuario porque tiene contratos asociados', 400);
            }
            const twelveMonthsAgo = new Date();
            twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
            if (user.fecha_actualizacion > twelveMonthsAgo) {
                throw new apiError_1.ApiError('El usuario debe estar inactivo por al menos 12 meses para ser eliminado', 400);
            }
            const t = yield db_1.default.transaction();
            try {
                const historyData = {
                    id_usuario: user.id,
                    estado_anterior: user.estado,
                    estado_nuevo: false,
                    motivo: reason || 'Eliminación de usuario'
                };
                if (adminId !== null) {
                    historyData.usuario_cambio = adminId;
                }
                yield userHistory_1.default.create(historyData, { transaction: t });
                // Eliminar el usuario (y el entrenador en cascada)
                yield user.destroy({ transaction: t });
                yield t.commit();
                return { success: true, message: 'Usuario eliminado permanentemente' };
            }
            catch (error) {
                yield t.rollback();
                throw error;
            }
        });
    }
    search(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { q, pagina, limite, orden, direccion } = params;
            const offset = (pagina - 1) * limite;
            let where = {};
            if (q) {
                where = {
                    [sequelize_1.Op.or]: [
                        { nombre: { [sequelize_1.Op.iLike]: `%${q}%` } },
                        { apellido: { [sequelize_1.Op.iLike]: `%${q}%` } },
                        { correo: { [sequelize_1.Op.iLike]: `%${q}%` } },
                        { numero_documento: { [sequelize_1.Op.like]: `%${q}%` } },
                        { codigo: { [sequelize_1.Op.like]: `%${q}%` } }
                    ]
                };
            }
            const { count, rows } = yield user_1.default.findAndCountAll({
                where,
                limit: limite,
                offset: offset,
                order: [[orden, direccion]],
                attributes: { exclude: ['contrasena_hash'] }
            });
            return {
                data: rows,
                pagination: {
                    total: count,
                    page: pagina,
                    limit: limite,
                    totalPages: Math.ceil(count / limite)
                }
            };
        });
    }
    checkDocumentExists(numero_documento, excludeUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereConditions = { numero_documento };
            if (excludeUserId) {
                whereConditions.id = { [sequelize_1.Op.ne]: excludeUserId };
            }
            const user = yield user_1.default.findOne({ where: whereConditions });
            return { userExists: !!user };
        });
    }
    checkUserByDocument(tipo_documento, numero_documento, excludeUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereConditions = {
                tipo_documento,
                numero_documento: { [sequelize_1.Op.iLike]: numero_documento } // Búsqueda insensible a mayúsculas/minúsculas
            };
            if (excludeUserId) {
                whereConditions.id = { [sequelize_1.Op.ne]: excludeUserId };
            }
            const user = yield user_1.default.findOne({
                where: whereConditions,
                attributes: { exclude: ["contrasena_hash", "contrasena"] },
                include: [
                    {
                        model: role_1.default,
                        as: 'rol',
                        attributes: ['id', 'nombre']
                    }
                ]
            });
            if (!user) {
                // No se encontró el usuario - debe completar todos los campos
                return {
                    userExists: false,
                    isTrainer: false,
                    userData: null,
                    message: "Usuario no encontrado. Complete todos los campos para registrar un nuevo usuario y entrenador."
                };
            }
            // Verificar si el usuario ya es entrenador
            const trainer = yield trainer_1.default.findOne({
                where: { id_usuario: user.id }
            });
            if (trainer) {
                // El usuario ya es entrenador - no se puede registrar nuevamente
                return {
                    userExists: true,
                    isTrainer: true,
                    userData: null,
                    message: "Este usuario ya está registrado como entrenador."
                };
            }
            // El usuario existe pero no es entrenador - puede convertirse en entrenador
            return {
                userExists: true,
                isTrainer: false,
                userData: {
                    id: user.id,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    correo: user.correo,
                    telefono: user.telefono,
                    direccion: user.direccion,
                    genero: user.genero,
                    tipo_documento: user.tipo_documento,
                    numero_documento: user.numero_documento,
                    fecha_nacimiento: user.fecha_nacimiento,
                    rol: user.rol
                },
                message: "Usuario encontrado. Los datos se han autocompletado. Solo complete la especialidad para registrarlo como entrenador."
            };
        });
    }
    checkEmailExists(email, excludeUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereConditions = { correo: email.toLowerCase() };
            if (excludeUserId) {
                whereConditions.id = { [sequelize_1.Op.ne]: excludeUserId };
            }
            const user = yield user_1.default.findOne({ where: whereConditions });
            return { exists: !!user };
        });
    }
}
exports.UserService = UserService;
