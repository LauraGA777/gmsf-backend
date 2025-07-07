import { Request, Response, NextFunction } from 'express';
import User from "../models/user";
import Role from "../models/role";
import bcrypt from 'bcrypt';
import { generateAccessToken } from '../utils/jwt.utils';
import { z } from 'zod';
import { idSchema, updateUserSchema, searchUserSchema } from '../validators/user.validator';
import { Op, WhereOptions } from 'sequelize';
import ApiResponse from '../utils/apiResponse';
import UserHistory from '../models/userHistory';
import Contract from '../models/contract';
import sequelize from '../config/db';

interface UserData {
    nombre: string;
    apellido: string;
    correo: string;
    contrasena: string;
    telefono?: string;
    direccion?: string;
    tipo_documento: 'CC' | 'CE' | 'TI' | 'PP' | 'DIE';
    numero_documento: string;
    fecha_nacimiento: Date;
    genero?: 'M' | 'F' | 'O';
    rol_id?: number;
}

interface QueryParams {
    page?: string;
    limit?: string;
    orderBy?: 'id' | 'nombre' | 'apellido' | 'correo' | 'codigo';
    direction?: 'ASC' | 'DESC';
}

// Generar código de usuario
const generateUserCode = async (): Promise<string> => {
    const lastUser = await User.findOne({
        order: [['codigo', 'DESC']],
    });
    
    const lastCode = lastUser ? parseInt(lastUser.codigo.substring(1)) : 0;
    const newCode = `U${String(lastCode + 1).padStart(3, '0')}`;
    return newCode;
};

// Obtener usuarios
export const getUsers = async (req: Request<{}, {}, {}, QueryParams>, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { 
            page = '1', 
            limit = '10', 
            orderBy = 'id', 
            direction = 'ASC' 
        } = req.query;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const offset = (pageNum - 1) * limitNum;

        // Aseguramos que el orden sea por ID
        const validOrderField = 'id';

        const [users, total] = await Promise.all([
            User.findAll({
                limit: limitNum,
                offset: offset,
                order: [[validOrderField, direction]],
                attributes: { 
                    exclude: ['contrasena_hash']
                }
            }),
            User.count()
        ]);

        res.json({
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
            data: users
        });
    } catch (error) {
        next(error);
    }
};

// Obtener Roles
export const getRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const roles = await Role.findAll({
            where: {
                estado: true
            }
        });

        res.json({
            status: 'success',
            data: {
                roles
            }
        });

    }
    catch (error) {
        next(error);
    }
}

// Obtener usuario por ID
export const getUsuarioById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const { id } = idSchema.parse({ id: req.params.id });
        
        const usuario = await User.findByPk(id, {
            attributes: { 
                exclude: ['contrasena_hash'] 
            }
        });

        if (!usuario) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }

        return res.status(200).json({
            status: 'success',
            data: {
                usuario: {
                    id: usuario.id,
                    codigo: usuario.codigo,
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    correo: usuario.correo,
                    telefono: usuario.telefono,
                    direccion: usuario.direccion,
                    genero: usuario.genero,
                    tipo_documento: usuario.tipo_documento,
                    numero_documento: usuario.numero_documento,
                    fecha_nacimiento: usuario.fecha_nacimiento,
                    asistencias_totales: usuario.asistencias_totales,
                    estado: usuario.estado,
                    rol_id: usuario.rol_id
                }
            }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                status: 'error',
                message: 'ID de usuario inválido'
            });
        }
        next(error);
    }
};

// Registrar usuario
export const register = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userData: UserData = req.body;

        // Verificar si el correo existe
        const existingUser = await User.findOne({ 
            where: { correo: userData.correo } 
        });
        
        if (existingUser) {
            return ApiResponse.error(
                res,
                "El correo electrónico ya está registrado",
                400
            );
        }

        // Verificar si el rol existe
        if (userData.rol_id) {
            const role = await Role.findByPk(userData.rol_id);
            if (!role) {
                return ApiResponse.error(
                    res,
                    "El rol especificado no existe",
                    400
                );
            }
            if (!role.estado) {
                return ApiResponse.error(
                    res,
                    "El rol especificado está inactivo",
                    400
                );
            }
        }

        // Generar código único
        const codigo = await generateUserCode();

        // Encriptar contraseña
        const contrasena_hash = await bcrypt.hash(userData.contrasena, 10);

        // Crear usuario
        const user = await User.create({
            codigo,
            nombre: userData.nombre,
            apellido: userData.apellido,
            correo: userData.correo,
            contrasena_hash,
            telefono: userData.telefono,
            direccion: userData.direccion,
            tipo_documento: userData.tipo_documento,
            numero_documento: userData.numero_documento,
            fecha_nacimiento: userData.fecha_nacimiento,
            genero: userData.genero,
            rol_id: userData.rol_id,
            estado: true,
            fecha_actualizacion: new Date(),
            asistencias_totales: 0
        });

        // Generar token de acceso
        const accessToken = generateAccessToken(user.id);

        // Obtener usuario creado con información del rol
        const createdUser = await User.findByPk(user.id, {
            attributes: { 
                exclude: ['contrasena_hash'] 
            },
            include: [{
                model: Role,
                as: 'rol',
                attributes: ['id', 'codigo', 'nombre', 'descripcion']
            }]
        });

        return ApiResponse.success(
            res, 
            {
                user: createdUser,
                accessToken
            },
            "Usuario registrado exitosamente",
            undefined,
            201
        );

    } catch (error: any) {
        console.error('Error en el registro:', error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return ApiResponse.error(
                res,
                "El correo electrónico o número de documento ya está registrado",
                400
            );
        }

        return ApiResponse.error(
            res,
            "Error interno del servidor durante el registro",
            500
        );
    }
};

// Actualizar todos los campos de un usuario
export const updateUsers = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const { id } = idSchema.parse({ id: req.params.id });
        const datosActualizacion = updateUserSchema.parse(req.body);

        // Buscar usuario
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }

        // Actualizar usuario con los datos validados
        await user.update({
            ...datosActualizacion,
            fecha_actualizacion: new Date()
        });

        // Obtener usuario actualizado sin datos sensibles
        const userUpdated = await User.findByPk(id, {
            attributes: { 
                exclude: ['contrasena_hash']
            }
        });

        if (!userUpdated) {
            return res.status(500).json({
                status: 'error',
                message: 'Error al obtener los datos actualizados'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Usuario actualizado exitosamente',
            data: {
                usuario: {
                        id: userUpdated.id,
                    codigo: userUpdated.codigo,
                    nombre: userUpdated.nombre,
                    apellido: userUpdated.apellido,
                    correo: userUpdated.correo,
                    telefono: userUpdated.telefono,
                    direccion: userUpdated.direccion,
                    genero: userUpdated.genero,
                    tipo_documento: userUpdated.tipo_documento,
                    numero_documento: userUpdated.numero_documento,
                    fecha_nacimiento: userUpdated.fecha_nacimiento,
                    fecha_actualizacion: userUpdated.fecha_actualizacion,
                    asistencias_totales: userUpdated.asistencias_totales,
                        estado: userUpdated.estado,
                    rol_id: userUpdated.rol_id
                }
            }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                status: 'error',
                message: 'Datos de actualización inválidos',
                errors: error.errors
            });
        }
        next(error);
    }
};

// Activar usuario
const activateUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const { id } = idSchema.parse({ id: req.params.id });
        const adminId = req.user?.id;

        if (!adminId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        // Buscar usuario
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }

        // Verificar si ya está activo
        if (user.estado) {
            return res.status(400).json({
                status: 'error',
                message: 'El usuario ya está activo'
            });
        }

        // Registrar el cambio en el historial
        await UserHistory.create({
            id_usuario: user.id,
            estado_anterior: user.estado,
            estado_nuevo: true,
            usuario_cambio: adminId
        });

        // Actualizar estado del usuario
        user.estado = true;
        user.fecha_actualizacion = new Date();
        await user.save();

        return res.status(200).json({
            status: 'success',
            message: 'Usuario activado exitosamente'
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                status: 'error',
                message: 'ID de usuario inválido',
                errors: error.errors
            });
        }
        next(error);
    }
};

// Desactivar usuario
const deactivateUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const { id } = idSchema.parse({ id: req.params.id });
        const adminId = req.user?.id;

        if (!adminId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        // Buscar usuario
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }

        // Verificar si ya está inactivo
        if (!user.estado) {
            return res.status(400).json({
                status: 'error',
                message: 'El usuario ya está inactivo'
            });
        }

        // Verificar contratos activos
        const contratosActivos = await Contract.findAll({
            where: {
                usuario_registro: user.id,
                estado: 'Activo'
            }
        });

        if (contratosActivos.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'No se puede desactivar el usuario porque tiene contratos activos',
                data: {
                    contratosActivos: contratosActivos.length
                }
            });
        }

        // Registrar el cambio en el historial
        await UserHistory.create({
            id_usuario: user.id,
            estado_anterior: user.estado,
            estado_nuevo: false,
            usuario_cambio: adminId
        });

        // Actualizar estado del usuario
        user.estado = false;
        user.fecha_actualizacion = new Date();
        await user.save();

        return res.status(200).json({
            status: 'success',
            message: 'Usuario desactivado exitosamente'
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                status: 'error',
                message: 'ID de usuario inválido',
                errors: error.errors
            });
        }
        next(error);
    }
};

// Eliminar usuario permanentemente
const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const { id } = idSchema.parse({ id: req.params.id });
        const adminId = req.user?.id;
        const { motivo } = req.body;

        if (!adminId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        // Buscar usuario
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }

        // Verificar si el usuario está inactivo
        if (user.estado) {
            return res.status(400).json({
                status: 'error',
                message: 'No se puede eliminar un usuario activo'
            });
        }

        // Verificar si tiene contratos (activos o históricos)
        const contratos = await Contract.findAll({
            where: {
                usuario_registro: user.id
            }
        });

        if (contratos.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'No se puede eliminar el usuario porque tiene contratos asociados'
            });
        }

        // Verificar tiempo de inactividad (12 meses)
        const doceMesesAtras = new Date();
        doceMesesAtras.setMonth(doceMesesAtras.getMonth() - 12);

        if (user.fecha_actualizacion > doceMesesAtras) {
            return res.status(400).json({
                status: 'error',
                message: 'El usuario debe estar inactivo por al menos 12 meses para ser eliminado'
            });
        }

        // Iniciar transacción
        const t = await sequelize.transaction();

        try {
            // 1. Registrar el motivo de eliminación en el historial
            await UserHistory.create({
                id_usuario: user.id,
                estado_anterior: user.estado,
                estado_nuevo: false,
                usuario_cambio: adminId,
                motivo: motivo || 'Eliminación de usuario'
            }, { transaction: t });

            // 2. Desactivar temporalmente la restricción de clave foránea
            await sequelize.query('SET CONSTRAINTS ALL DEFERRED', { transaction: t });

            // 3. Eliminar registros del historial
            await sequelize.query(
                'DELETE FROM historial_usuarios WHERE id_usuario = :userId',
                {
                    replacements: { userId: user.id },
                    transaction: t
                }
            );

            // 4. Eliminar el usuario
            await sequelize.query(
                'DELETE FROM usuarios WHERE id = :userId',
                {
                    replacements: { userId: user.id },
                    transaction: t
                }
            );

            // 5. Reactivar las restricciones
            await sequelize.query('SET CONSTRAINTS ALL IMMEDIATE', { transaction: t });

            // Confirmar transacción
            await t.commit();

            return res.status(200).json({
                status: 'success',
                message: 'Usuario eliminado exitosamente'
            });

        } catch (error) {
            // Revertir transacción en caso de error
            await t.rollback();
            throw error;
        }

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                status: 'error',
                message: 'ID de usuario inválido',
                errors: error.errors
            });
        }
        next(error);
    }
};

// Buscar usuarios
const searchUsers = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        // Validar y extraer parámetros de búsqueda
        const { q, pagina, limite, orden, direccion } = searchUserSchema.parse(req.query);
        
        // Calcular offset para paginación
        const offset = (pagina - 1) * limite;

        // Construir condiciones de búsqueda
        let where: WhereOptions = {};
        if (q) {
            where = {
                [Op.or]: [
                    { nombre: { [Op.iLike]: `%${q}%` } },
                    { apellido: { [Op.iLike]: `%${q}%` } },
                    { correo: { [Op.iLike]: `%${q}%` } },
                    { numero_documento: { [Op.like]: `%${q}%` } },
                    { codigo: { [Op.like]: `%${q}%` } }
                ]
            };
        }

        // Realizar búsqueda paginada
        const { count, rows } = await User.findAndCountAll({
            where,
            limit: limite,
            offset: offset,
            order: [[orden, direccion]],
            attributes: { 
                exclude: ['contrasena_hash']
            }
        });

        return res.status(200).json({
            status: 'success',
            data: {
                total: count,
                pagina: pagina,
                limite: limite,
                total_paginas: Math.ceil(count / limite),
                usuarios: rows.map(user => ({
                    id: user.id,
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
                    fecha_actualizacion: user.fecha_actualizacion,
                    asistencias_totales: user.asistencias_totales,
                    estado: user.estado,
                    rol_id: user.rol_id
                }))
            }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                status: 'error',
                message: 'Parámetros de búsqueda inválidos',
                errors: error.errors
            });
        }
        next(error);
    }
};

// Verificar si un número de documento ya existe
export const checkDocumentExists = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        // Obtener número de documento desde los parámetros de la URL
        const { numero_documento } = req.params;
        const { excludeUserId } = req.query; // Para excluir usuario al editar
        
        // Validar el número de documento
        if (!numero_documento) {
            return res.status(400).json({
                status: 'error',
                message: 'Número de documento es requerido'
            });
        }

        // Construir condiciones de búsqueda
        const whereConditions: any = { numero_documento };
        
        // Si se proporciona excludeUserId, excluir ese usuario de la búsqueda
        if (excludeUserId) {
            whereConditions.id = { [Op.ne]: excludeUserId };
        }

        // Buscar usuario por número de documento
        const user = await User.findOne({
            where: whereConditions
        });

        if (user) {
            return res.status(200).json({
                status: 'success',
                message: 'Número de documento ya existe',
                data: { exists: true }
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Número de documento disponible',
            data: { exists: false }
        });

    } catch (error) {
        next(error);
    }
};

// Verificar si un correo ya existe
export const checkEmailExists = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        // Obtener email desde los parámetros de la URL
        const { email } = req.params;
        const { excludeUserId } = req.query; // Para excluir usuario al editar
        
        // Validar el email
        if (!email) {
            return res.status(400).json({
                status: 'error',
                message: 'Email es requerido'
            });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                status: 'error',
                message: 'Formato de email inválido'
            });
        }

        // Construir condiciones de búsqueda
        const whereConditions: any = { correo: email.toLowerCase() };
        
        // Si se proporciona excludeUserId, excluir ese usuario de la búsqueda
        if (excludeUserId) {
            whereConditions.id = { [Op.ne]: excludeUserId };
        }

        // Buscar usuario por correo
        const user = await User.findOne({
            where: whereConditions
        });

        if (user) {
            return res.status(200).json({
                status: 'success',
                message: 'Email ya existe',
                data: { exists: true }
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Email disponible',
            data: { exists: false }
        });

    } catch (error) {
        next(error);
    }
};

export { 
    getUsers as getUser, 
    register as createUser, 
    updateUsers as updateUser, 
    activateUser,
    deactivateUser,
    deleteUser,
    searchUsers as searchUser
};