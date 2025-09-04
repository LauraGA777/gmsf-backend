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
exports.UserController = void 0;
const zod_1 = require("zod");
const sequelize_1 = require("sequelize");
const user_validator_1 = require("../validators/user.validator");
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const user_service_1 = require("../services/user.service");
const apiError_1 = require("../errors/apiError");
const user_1 = __importDefault(require("../models/user"));
const models_1 = require("../models");
const person_model_1 = __importDefault(require("../models/person.model"));
const role_1 = __importDefault(require("../models/role"));
const db_1 = __importDefault(require("../config/db"));
const userHistory_1 = __importDefault(require("../models/userHistory"));
class UserController {
    constructor() {
        this.userService = new user_service_1.UserService();
    }
    getUsers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.userService.findAll(req.query);
                apiResponse_1.default.success(res, result.data, 'Usuarios obtenidos correctamente', result.pagination);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getRoles(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const roles = yield this.userService.getRoles();
                apiResponse_1.default.success(res, { roles }, 'Roles obtenidos correctamente');
            }
            catch (error) {
                next(error);
            }
        });
    }
    getUserById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = user_validator_1.idSchema.parse(req.params);
                const user = yield this.userService.findById(id);
                apiResponse_1.default.success(res, { usuario: user }, 'Usuario obtenido correctamente');
            }
            catch (error) {
                next(error);
            }
        });
    }
    register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userData = user_validator_1.userCreateSchema.parse(req.body);
                const result = yield this.userService.create(userData);
                apiResponse_1.default.success(res, result, 'Usuario registrado exitosamente', undefined, 201);
            }
            catch (error) {
                if (error instanceof apiError_1.ApiError) {
                    apiResponse_1.default.error(res, error.message, error.statusCode);
                }
                else if (error instanceof zod_1.z.ZodError) {
                    apiResponse_1.default.error(res, 'Datos de registro inválidos', 400, error.errors);
                }
                else {
                    next(error);
                }
            }
        });
    }
    updateUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = user_validator_1.idSchema.parse(req.params);
                const updateData = user_validator_1.updateUserSchema.parse(req.body);
                const updatedUser = yield this.userService.update(id, updateData);
                apiResponse_1.default.success(res, { usuario: updatedUser }, 'Usuario actualizado exitosamente');
            }
            catch (error) {
                next(error);
            }
        });
    }
    activateUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = user_validator_1.idSchema.parse(req.params);
                const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!adminId)
                    throw new apiError_1.ApiError('Usuario no autenticado', 401);
                const result = yield this.userService.activate(id, adminId);
                apiResponse_1.default.success(res, result, result.message);
            }
            catch (error) {
                next(error);
            }
        });
    }
    deactivateUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = user_validator_1.idSchema.parse(req.params);
                const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!adminId)
                    throw new apiError_1.ApiError('Usuario no autenticado', 401);
                const result = yield this.userService.deactivate(id, adminId);
                apiResponse_1.default.success(res, result, result.message);
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = user_validator_1.idSchema.parse(req.params);
                const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!adminId)
                    throw new apiError_1.ApiError('Usuario no autenticado', 401);
                // ✅ FLEXIBLE: Aceptar motivo desde query params O body
                let motivo;
                if (req.query.motivo) {
                    motivo = req.query.motivo;
                }
                else if (req.body.motivo) {
                    motivo = req.body.motivo;
                }
                else {
                    throw new apiError_1.ApiError('El motivo es requerido (como query parameter o en el body)', 400);
                }
                console.log(`🗑️ Eliminando usuario ${id} por motivo: ${motivo}`);
                const result = yield this.deleteUserPermanently(id, adminId, motivo);
                apiResponse_1.default.success(res, result, result.message);
            }
            catch (error) {
                next(error);
            }
        });
    }
    // ✅ RENOMBRAR: El método original para lógica interna
    deleteUserPermanently(id, adminId, motivo) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_1.default.findByPk(id);
            if (!user) {
                throw new apiError_1.ApiError('Usuario no encontrado', 404);
            }
            // ✅ NUEVA VALIDACIÓN: Verificar contratos activos antes de eliminar
            const contractValidation = yield this.validateUserContractsForDeactivation(user.id);
            if (!contractValidation.canDeactivate) {
                throw new apiError_1.ApiError(contractValidation.message, 409);
            }
            const t = yield db_1.default.transaction();
            try {
                // ✅ PASO 1: Crear registro final en historial antes de eliminar
                yield userHistory_1.default.create({
                    id_usuario: user.id,
                    estado_anterior: user.estado,
                    estado_nuevo: false, // Marcamos como eliminado
                    usuario_cambio: adminId,
                    motivo: `ELIMINACIÓN PERMANENTE: ${motivo}`
                }, { transaction: t });
                // ✅ PASO 2: Eliminar todos los registros del historial del usuario
                yield userHistory_1.default.destroy({
                    where: { id_usuario: user.id },
                    transaction: t
                });
                // ✅ PASO 3: Eliminar registros relacionados en cascada
                yield this.deleteAssociatedRecords(user, t);
                // ✅ PASO 4: Finalmente eliminar el usuario
                yield user.destroy({ transaction: t });
                yield t.commit();
                return {
                    success: true,
                    message: `Usuario ${user.nombre} ${user.apellido} eliminado permanentemente. Motivo: ${motivo}`
                };
            }
            catch (error) {
                yield t.rollback();
                throw error;
            }
        });
    }
    // ✅ NUEVO MÉTODO: Eliminar registros asociados
    deleteAssociatedRecords(user, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const role = yield role_1.default.findByPk(user.id_rol, { transaction });
                if (!role)
                    return;
                switch (role.nombre) {
                    case 'Cliente':
                        yield this.deleteClientRecords(user.id, transaction);
                        break;
                    case 'Entrenador':
                        yield this.deleteTrainerRecords(user.id, transaction);
                        break;
                    case 'Administrador':
                    case 'Empleado':
                        console.log(`Usuario ${role.nombre} - sin registros adicionales que eliminar`);
                        break;
                }
            }
            catch (error) {
                console.error('Error eliminando registros asociados:', error);
                throw error;
            }
        });
    }
    // ✅ MÉTODO ESPECÍFICO: Eliminar registros de cliente
    deleteClientRecords(userId, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const person = yield person_model_1.default.findOne({
                where: { id_usuario: userId },
                transaction
            });
            if (person) {
                yield person.destroy({ transaction });
                console.log(`Persona ${person.codigo} eliminada`);
            }
        });
    }
    // ✅ MÉTODO ESPECÍFICO: Eliminar registros de entrenador
    deleteTrainerRecords(userId, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const trainer = yield models_1.Trainer.findOne({
                where: { id_usuario: userId },
                transaction
            });
            if (trainer) {
                yield trainer.destroy({ transaction });
                console.log(`Entrenador ${trainer.codigo} eliminado`);
            }
        });
    }
    // ✅ MÉTODO DE VALIDACIÓN: Verificar contratos activos antes de desactivar
    validateUserContractsForDeactivation(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 1. Verificar contratos donde el usuario es el titular (a través de persona)
                const userAsClientContracts = yield db_1.default.query(`
            SELECT c.id, c.codigo, c.fecha_inicio, c.fecha_fin, c.estado,
                    p.codigo as persona_codigo
            FROM contratos c 
            INNER JOIN personas p ON c.id_persona = p.id_persona 
            WHERE p.id_usuario = :userId 
            AND c.estado = 'Activo' 
            AND c.fecha_inicio <= NOW() 
            AND c.fecha_fin >= NOW()
        `, {
                    replacements: { userId },
                    type: sequelize_1.QueryTypes.SELECT
                });
                // 2. Verificar contratos que el usuario registró (como empleado/admin)
                const userRegisteredContracts = yield db_1.default.query(`
            SELECT COUNT(*) as total
            FROM contratos 
            WHERE usuario_registro = :userId 
            AND estado = 'Activo' 
            AND fecha_inicio <= NOW() 
            AND fecha_fin >= NOW()
        `, {
                    replacements: { userId },
                    type: sequelize_1.QueryTypes.SELECT
                });
                const clientContracts = userAsClientContracts;
                const registeredCount = userRegisteredContracts[0].total;
                const totalActiveContracts = clientContracts.length + parseInt(registeredCount);
                // 3. Si tiene contratos activos, no se puede eliminar
                if (totalActiveContracts > 0) {
                    let message = `No se puede eliminar el usuario porque tiene ${totalActiveContracts} contrato(s) activo(s)`;
                    if (clientContracts.length > 0) {
                        const contractDetails = clientContracts.map((c) => `${c.codigo} (vence: ${new Date(c.fecha_fin).toLocaleDateString()})`).join(', ');
                        message += `. Como titular: ${contractDetails}`;
                    }
                    if (registeredCount > 0) {
                        message += `. Contratos registrados por este usuario: ${registeredCount}`;
                    }
                    message += '. Debe finalizar o cancelar los contratos antes de eliminar el usuario.';
                    return {
                        canDeactivate: false,
                        message
                    };
                }
                return {
                    canDeactivate: true,
                    message: 'Usuario puede ser eliminado - no tiene contratos activos'
                };
            }
            catch (error) {
                console.error('Error al validar contratos del usuario:', error);
                return {
                    canDeactivate: false,
                    message: 'Error al validar contratos del usuario. Por seguridad, no se permite la eliminación.'
                };
            }
        });
    }
    searchUsers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const searchParams = user_validator_1.searchUserSchema.parse(req.query);
                const result = yield this.userService.search(searchParams);
                apiResponse_1.default.success(res, { total: result.pagination.total, pagina: result.pagination.page, limite: result.pagination.limit, total_paginas: result.pagination.totalPages, usuarios: result.data }, 'Búsqueda de usuarios exitosa');
            }
            catch (error) {
                next(error);
            }
        });
    }
    checkUserByDocument(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { tipo_documento, numero_documento } = req.params;
                const { excludeUserId } = req.query;
                if (!tipo_documento || !numero_documento) {
                    throw new apiError_1.ApiError('Tipo de documento y número de documento son requeridos', 400);
                }
                const result = yield this.userService.checkUserByDocument(tipo_documento, numero_documento, excludeUserId);
                // Siempre devolver status 200, pero con información clara sobre el estado
                apiResponse_1.default.success(res, result, result.message || (result.userExists ? 'Usuario encontrado' : 'Usuario no encontrado'));
            }
            catch (error) {
                next(error);
            }
        });
    }
    checkDocumentExists(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Obtener numero_documento desde params o query
                const numero_documento = req.params.numero_documento || req.query.numero_documento;
                const tipo_documento = req.query.tipo_documento;
                const { excludeUserId } = req.query;
                if (!numero_documento) {
                    throw new apiError_1.ApiError('Número de documento es requerido', 400);
                }
                // Si se proporciona tipo_documento, usar el método extendido para trainers
                if (tipo_documento) {
                    const result = yield this.userService.checkUserByDocument(tipo_documento, numero_documento, excludeUserId);
                    apiResponse_1.default.success(res, result, result.userExists ? 'Usuario encontrado' : 'Usuario no encontrado');
                }
                else {
                    // Método original para compatibilidad
                    const result = yield this.userService.checkDocumentExists(numero_documento, (_a = excludeUserId) !== null && _a !== void 0 ? _a : '');
                    apiResponse_1.default.success(res, result, result.userExists ? 'Documento ya existe' : 'Documento disponible');
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    checkEmailExists(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.params;
                const { excludeUserId } = req.query;
                if (!email) {
                    throw new apiError_1.ApiError('Email es requerido', 400);
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    throw new apiError_1.ApiError('Formato de email inválido', 400);
                }
                const result = yield this.userService.checkEmailExists(email, excludeUserId);
                apiResponse_1.default.success(res, result, result.exists ? 'Email ya existe' : 'Email disponible');
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.UserController = UserController;
