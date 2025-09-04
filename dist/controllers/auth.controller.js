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
exports.getRoles = exports.updateProfile = exports.getProfile = exports.changePassword = exports.resetPassword = exports.forgotPassword = exports.verifyUser = exports.logout = exports.login = void 0;
const role_1 = __importDefault(require("../models/role"));
const permission_1 = __importDefault(require("../models/permission"));
const privilege_1 = __importDefault(require("../models/privilege"));
const person_model_1 = __importDefault(require("../models/person.model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = __importDefault(require("../models/user"));
const env_1 = require("../config/env");
const jwt_utils_1 = require("../utils/jwt.utils");
const token_blacklist_1 = __importDefault(require("../utils/token-blacklist"));
const email_utils_1 = require("../utils/email.utils");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const role_validator_1 = require("../validators/role.validator");
// Controlador de login
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { correo, contrasena } = req.body;
        // Buscar usuario por email
        const user = yield user_1.default.findOne({
            where: { correo }
        });
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Credenciales inválidas'
            });
        }
        // Verificar contraseña usando bcrypt.compare
        const validPassword = yield bcrypt_1.default.compare(contrasena, user.contrasena_hash);
        if (!validPassword) {
            return res.status(401).json({
                status: 'error',
                message: 'Credenciales inválidas'
            });
        }
        // Generar tokens
        const accessToken = (0, jwt_utils_1.generateAccessToken)(user.id);
        const refreshToken = (0, jwt_utils_1.generateRefreshToken)(user.id);
        // Buscar información de persona si el usuario es cliente o beneficiario (roles 3 o 4)
        let personaId = null;
        if (user.id_rol === 3 || user.id_rol === 4) {
            const persona = yield person_model_1.default.findOne({
                where: { id_usuario: user.id }
            });
            if (persona) {
                personaId = persona.id_persona;
            }
        }
        // Logs para desarrollo
        if (env_1.env.NODE_ENV === 'development') {
            console.log('Access Token generado:', accessToken);
            console.log('Refresh Token generado:', refreshToken);
            if (personaId) {
                console.log('ID Persona encontrado:', personaId);
            }
        }
        // Respuesta exitosa
        return res.status(200).json({
            status: 'success',
            message: 'Login exitoso',
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    nombre: user.nombre,
                    correo: user.correo,
                    id_rol: user.id_rol,
                    id_persona: personaId, // Incluir el ID de persona para clientes
                }
            }
        });
    }
    catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.login = login;
// Controlador de logout
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Intentar obtener el token del header
        let token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        // Si no hay token en el header, intentar obtenerlo de las cookies
        if (!token) {
            token = (_b = req.cookies) === null || _b === void 0 ? void 0 : _b.accessToken;
        }
        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'No se proporcionó un token de autenticación'
            });
        }
        // Agregar el token a la lista negra
        token_blacklist_1.default.add(token);
        // Limpiar la cookie si existe
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        // Respuesta exitosa
        return res.status(200).json({
            status: 'success',
            message: 'Logout exitoso'
        });
    }
    catch (error) {
        console.error('Error en logout:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
exports.logout = logout;
// Verificación de usuario
const verifyUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findByPk(userId, {
            attributes: {
                exclude: ["contrasena_hash"]
            }
        });
        if (!user) {
            throw {
                status: 404,
                message: "Usuario no encontrado"
            };
        }
        return user;
    }
    catch (error) {
        console.error('Error al verificar usuario:', error);
        throw {
            status: 500,
            message: "Error al verificar el usuario"
        };
    }
});
exports.verifyUser = verifyUser;
// Recuperación de contraseña 
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { correo } = req.body;
        // Validar que se proporcionó un correo
        if (!correo) {
            return res.status(400).json({
                status: 'error',
                message: 'El correo es requerido'
            });
        }
        // Buscar usuario por correo
        const user = yield user_1.default.findOne({
            where: { correo }
        });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Correo no registrado'
            });
        }
        // Generar token de recuperación (15 minutos)
        const resetToken = (0, jwt_utils_1.generateAccessToken)(user.id, '15m');
        try {
            // Enviar correo de recuperación
            yield (0, email_utils_1.enviarCorreoRecuperacion)(correo, resetToken);
            return res.status(200).json({
                status: 'success',
                message: 'Correo de recuperación enviado'
            });
        }
        catch (emailError) {
            console.error('Error al enviar correo:', emailError);
            return res.status(500).json({
                status: 'error',
                message: 'Error al enviar el correo de recuperación'
            });
        }
    }
    catch (error) {
        console.error('Error en forgotPassword:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error al procesar la solicitud'
        });
    }
});
exports.forgotPassword = forgotPassword;
// Cambio de contraseña
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const { nuevaContrasena } = req.body;
        // Verificar que el token existe
        if (!token) {
            return res.status(400).json({
                status: 'error',
                message: 'Token no proporcionado'
            });
        }
        // Verificar el token y obtener el ID del usuario
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        // Buscar al usuario
        const user = yield user_1.default.findByPk(decoded.userId);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }
        // Hashear la nueva contraseña
        const hashedPassword = yield bcrypt_1.default.hash(nuevaContrasena, 10);
        // Actualizar la contraseña
        user.contrasena_hash = hashedPassword;
        yield user.save();
        // Invalidar todos los tokens anteriores del usuario
        token_blacklist_1.default.add(token);
        return res.status(200).json({
            status: 'success',
            message: 'Contraseña actualizada exitosamente'
        });
    }
    catch (error) {
        console.error('Error en resetPassword:', error);
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(400).json({
                status: 'error',
                message: 'Token inválido o expirado'
            });
        }
        return res.status(500).json({
            status: 'error',
            message: 'Error al restablecer la contraseña'
        });
    }
});
exports.resetPassword = resetPassword;
// Cambio de contraseña del usuario autenticado
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { contrasenaActual, nuevaContrasena } = req.body;
        const usuarioId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Obtenemos el ID del usuario del token
        if (!usuarioId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }
        // Buscar usuario
        const user = yield user_1.default.findByPk(usuarioId);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }
        // Verificar la contraseña actual
        const contrasenaValida = yield bcrypt_1.default.compare(contrasenaActual, user.contrasena_hash);
        if (!contrasenaValida) {
            return res.status(401).json({
                status: 'error',
                message: 'Contraseña actual incorrecta'
            });
        }
        // Hashear y actualizar la nueva contraseña
        const hashedPassword = yield bcrypt_1.default.hash(nuevaContrasena, 10);
        user.contrasena_hash = hashedPassword;
        yield user.save();
        return res.status(200).json({
            status: 'success',
            message: 'Contraseña actualizada exitosamente'
        });
    }
    catch (error) {
        console.error('Error en changePassword:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error al cambiar la contraseña'
        });
    }
});
exports.changePassword = changePassword;
// Obtener perfil del usuario
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const usuarioId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!usuarioId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }
        // Buscar usuario incluyendo rol con permisos y privilegios
        const user = yield user_1.default.findByPk(usuarioId, {
            include: [{
                    model: role_1.default,
                    as: 'rol',
                    include: [
                        {
                            model: permission_1.default,
                            as: 'permisos',
                            through: { attributes: [] }
                        },
                        {
                            model: privilege_1.default,
                            as: 'privilegios',
                            through: { attributes: [] }
                        }
                    ]
                }],
            attributes: {
                exclude: ['contrasena_hash']
            }
        });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }
        return res.status(200).json({
            status: 'success',
            data: {
                usuario: {
                    codigo: user.codigo,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    correo: user.correo,
                    telefono: user.telefono,
                    direccion: user.direccion,
                    genero: user.genero,
                    tipo_documento: user.tipo_documento,
                    numero_documento: user.numero_documento,
                    fecha_nacimiento: user.fecha_nacimiento,
                    asistencias_totales: user.asistencias_totales,
                    estado: user.estado,
                    id_rol: user.id_rol,
                    rol: user.rol // Incluir información del rol con permisos y privilegios
                }
            }
        });
    }
    catch (error) {
        console.error('Error en getProfile:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error al obtener el perfil del usuario'
        });
    }
});
exports.getProfile = getProfile;
// Actualización de perfil del usuario
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const usuarioId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const datosActualizacion = req.body;
        if (!usuarioId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }
        // Buscar usuario
        const user = yield user_1.default.findByPk(usuarioId);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }
        // Lista de campos permitidos para actualización
        const camposPermitidos = [
            'nombre',
            'apellido',
            'fecha_nacimiento',
            'genero',
            'correo',
            'telefono',
            'direccion',
            'tipo_documento',
            'numero_documento'
        ];
        // Filtrar solo los campos permitidos
        const datosFiltrados = {};
        camposPermitidos.forEach(campo => {
            if (datosActualizacion[campo] !== undefined) {
                datosFiltrados[campo] = datosActualizacion[campo];
            }
        });
        // Actualizar fecha_actualizacion
        datosFiltrados.fecha_actualizacion = new Date();
        // Actualizar usuario
        yield user.update(datosFiltrados);
        // Obtener usuario actualizado sin datos sensibles
        const usuarioActualizado = yield user_1.default.findByPk(usuarioId, {
            attributes: {
                exclude: ['contrasena_hash']
            }
        });
        if (!usuarioActualizado) {
            return res.status(500).json({
                status: 'error',
                message: 'Error al obtener los datos actualizados'
            });
        }
        return res.status(200).json({
            status: 'success',
            message: 'Perfil actualizado exitosamente',
            data: {
                usuario: {
                    nombre: usuarioActualizado.nombre,
                    apellido: usuarioActualizado.apellido,
                    correo: usuarioActualizado.correo,
                    telefono: usuarioActualizado.telefono,
                    direccion: usuarioActualizado.direccion,
                    tipo_documento: usuarioActualizado.tipo_documento,
                    numero_documento: usuarioActualizado.numero_documento,
                    fecha_nacimiento: usuarioActualizado.fecha_nacimiento,
                    fecha_actualizacion: usuarioActualizado.fecha_actualizacion,
                    asistencias_totales: usuarioActualizado.asistencias_totales,
                    estado: usuarioActualizado.estado
                }
            }
        });
    }
    catch (error) {
        console.error('Error en updateProfile:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error al actualizar el perfil'
        });
    }
});
exports.updateProfile = updateProfile;
const getRoles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pagina = 1, limite = 10, orden = 'nombre', direccion = 'ASC' } = role_validator_1.searchRoleSchema.parse(req.query);
        const offset = (pagina - 1) * limite;
        const [roles, total] = yield Promise.all([
            role_1.default.findAll({
                include: [
                    {
                        model: permission_1.default,
                        as: 'permisos',
                        through: { attributes: [] }
                    },
                    {
                        model: privilege_1.default,
                        as: 'privilegios',
                        through: { attributes: [] }
                    }
                ],
                limit: limite,
                offset: offset,
                order: [[orden, direccion]]
            }),
            role_1.default.count()
        ]);
        if (roles.length === 0) {
            res.status(200).json({
                status: 'success',
                message: 'No hay roles registrados',
                data: {
                    total: 0,
                    roles: []
                }
            });
            return;
        }
        res.status(200).json({
            status: 'success',
            data: {
                total,
                pagina,
                limite,
                total_paginas: Math.ceil(total / limite),
                roles
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getRoles = getRoles;
