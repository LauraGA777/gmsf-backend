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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainerService = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const models_1 = require("../models");
const apiError_1 = require("../errors/apiError");
const user_service_1 = require("./user.service");
class TrainerService {
    constructor() {
        this.userService = new user_service_1.UserService();
    }
    generateTrainerCode(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const lastTrainer = yield models_1.Trainer.findOne({
                order: [['codigo', 'DESC']],
                lock: transaction.LOCK.UPDATE,
                transaction,
            });
            if (lastTrainer) {
                const lastCodeNumber = parseInt(lastTrainer.codigo.substring(1), 10);
                return `E${String(lastCodeNumber + 1).padStart(3, '0')}`;
            }
            return 'E001';
        });
    }
    getTrainerRole(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const trainerRole = yield models_1.Role.findOne({ where: { nombre: 'Entrenador' }, transaction });
            if (!trainerRole) {
                throw new apiError_1.ApiError("El rol 'Entrenador' no existe. Por favor, créelo antes de registrar un entrenador.", 500);
            }
            return trainerRole;
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield db_1.default.transaction();
            try {
                const { usuario: userData, especialidad, estado } = data;
                const trainerRole = yield this.getTrainerRole(transaction);
                // Verificar si el usuario ya existe por documento o correo
                let user = yield this.userService.findUserByDocumentOrEmail(userData.numero_documento, userData.correo, transaction);
                if (user) {
                    // Si el usuario existe, verificar si ya es un entrenador
                    const existingTrainer = yield models_1.Trainer.findOne({ where: { id_usuario: user.id }, transaction });
                    if (existingTrainer) {
                        throw new apiError_1.ApiError('Este usuario ya está registrado como entrenador.', 409);
                    }
                    // Si no es entrenador, se le asigna el rol y se actualizan sus datos
                    const { contrasena } = userData, userDataWithoutPassword = __rest(userData, ["contrasena"]);
                    yield this.userService.update(user.id, Object.assign(Object.assign({}, userDataWithoutPassword), { id_rol: trainerRole.id }));
                }
                else {
                    // Si el usuario no existe, lo creamos
                    if (!userData.contrasena) {
                        throw new apiError_1.ApiError('La contraseña es requerida para crear un nuevo usuario.', 400);
                    }
                    const { user: newUser } = yield this.userService.create(Object.assign(Object.assign({}, userData), { id_rol: trainerRole.id }), transaction);
                    user = newUser;
                }
                if (!user) {
                    throw new apiError_1.ApiError('No se pudo crear o encontrar el usuario.', 500);
                }
                // Crear el entrenador
                const codigo = yield this.generateTrainerCode(transaction);
                const newTrainer = yield models_1.Trainer.create({
                    id_usuario: user.id,
                    codigo,
                    especialidad,
                    estado,
                }, { transaction });
                yield transaction.commit();
                return this.findById(newTrainer.id); // Devolvemos el entrenador con todos los datos
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
                const trainer = yield models_1.Trainer.findByPk(id, { transaction });
                if (!trainer) {
                    throw new apiError_1.ApiError('Entrenador no encontrado', 404);
                }
                const { usuario: userData, especialidad, estado } = data;
                // Actualizar datos del usuario si se proporcionan
                if (userData) {
                    yield this.userService.update(trainer.id_usuario, userData, transaction);
                }
                // Actualizar datos del entrenador
                yield trainer.update({ especialidad, estado }, { transaction });
                yield transaction.commit();
                return this.findById(id);
            }
            catch (error) {
                yield transaction.rollback();
                throw error;
            }
        });
    }
    findAll(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { pagina = 1, limite = 10, q, orden = 'nombre', direccion = 'ASC', estado } = options;
            const offset = (pagina - 1) * limite;
            const whereClause = {};
            if (estado !== undefined) {
                whereClause.estado = estado;
            }
            const userWhereClause = q ? {
                [sequelize_1.Op.or]: [
                    { nombre: { [sequelize_1.Op.iLike]: `%${q}%` } },
                    { apellido: { [sequelize_1.Op.iLike]: `%${q}%` } },
                    { correo: { [sequelize_1.Op.iLike]: `%${q}%` } },
                    { numero_documento: { [sequelize_1.Op.iLike]: `%${q}%` } },
                ],
            } : {};
            const { count, rows } = yield models_1.Trainer.findAndCountAll({
                where: whereClause,
                include: [{
                        model: models_1.User,
                        as: 'usuario',
                        attributes: { exclude: ['contrasena_hash'] },
                        where: userWhereClause,
                    }],
                limit: limite,
                offset,
                order: orden === 'codigo'
                    ? [['codigo', direccion], [{ model: models_1.User, as: 'usuario' }, 'nombre', 'ASC']]
                    : [[{ model: models_1.User, as: 'usuario' }, orden, direccion], ['codigo', 'ASC']],
                distinct: true,
            });
            return {
                data: rows,
                pagination: {
                    total: count,
                    page: pagina,
                    limit: limite,
                    totalPages: Math.ceil(count / limite),
                },
            };
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const trainer = yield models_1.Trainer.findByPk(id, {
                include: [{
                        model: models_1.User,
                        as: 'usuario',
                        attributes: { exclude: ['contrasena_hash'] },
                        include: [{ model: models_1.Role, as: 'rol' }]
                    }],
            });
            if (!trainer) {
                throw new apiError_1.ApiError('Entrenador no encontrado', 404);
            }
            return trainer;
        });
    }
    activate(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const trainer = yield this.findById(id);
            yield trainer.update({ estado: true });
            // También activamos el usuario asociado
            yield models_1.User.update({ estado: true }, { where: { id: trainer.id_usuario } });
            return { message: 'Entrenador activado exitosamente.' };
        });
    }
    deactivate(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const trainer = yield this.findById(id);
            yield trainer.update({ estado: false });
            // La lógica de desactivar el usuario si es solo entrenador se manejará en el servicio de usuario
            return { message: 'Entrenador desactivado exitosamente.' };
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const trainer = yield models_1.Trainer.findByPk(id);
            if (!trainer) {
                throw new apiError_1.ApiError('Entrenador no encontrado', 404);
            }
            // La asociación con onDelete: 'CASCADE' se encargará de eliminar el entrenador si se elimina el usuario.
            // Aquí solo eliminamos el usuario, y el entrenador se borrará en cascada.
            yield this.userService.delete(trainer.id_usuario, null, 'Eliminación de registro de entrenador.');
            return { message: 'Entrenador y usuario asociado eliminados permanentemente.' };
        });
    }
}
exports.TrainerService = TrainerService;
