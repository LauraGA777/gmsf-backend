import { Request, Response, NextFunction } from 'express';
import User from "../models/user";
import Role from "../models/role";
import bcrypt from 'bcrypt';
import { generateAccessToken } from '../utils/jwt.utils';
import { z } from 'zod';
import { idSchema, updateUserSchema, searchUserSchema } from '../validators/user.validator';
import { Op, WhereOptions } from 'sequelize';
import ApiResponse from '../utils/apiResponse';


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
    id_rol?: number;
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
            orderBy = 'nombre', 
            direction = 'ASC' 
        } = req.query;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const offset = (pageNum - 1) * limitNum;

        const validOrderField = ['id', 'nombre', 'apellido', 'correo', 'codigo'].includes(orderBy) ? orderBy : 'nombre';

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
                    id_rol: usuario.id_rol
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
        if (userData.id_rol) {
            const role = await Role.findByPk(userData.id_rol);
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
            id_rol: userData.id_rol,
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
                    id_rol: userUpdated.id_rol
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

// Desactivar usuario (soft delete)
export const deactivateUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const { id } = idSchema.parse({ id: req.params.id });

        // Buscar usuario
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }

        // Actualizar estado a false (soft delete)
        await user.update({ 
            estado: false,
            fecha_actualizacion: new Date()
        });

        return res.status(200).json({
            status: 'success',
            message: 'Usuario desactivado exitosamente',
            data: {
                usuario: {
                    id: user.id,
                    codigo: user.codigo,
                    estado: user.estado,
                    fecha_actualizacion: user.fecha_actualizacion
                }
            }
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

// Eliminar usuario físicamente
export const hardDeleteUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const { id } = idSchema.parse({ id: req.params.id });

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

        // Verificar tiempo de inactividad (12 meses)
        const docesMesesAtras = new Date();
        docesMesesAtras.setMonth(docesMesesAtras.getMonth() - 12);

        if (user.fecha_actualizacion > docesMesesAtras) {
            return res.status(400).json({
                status: 'error',
                message: 'El usuario debe estar inactivo por al menos 12 meses para ser eliminado',
                data: {
                    fecha_ultima_actualizacion: user.fecha_actualizacion,
                    fecha_minima_requerida: docesMesesAtras
                }
            });
        }

        /* Verificar contratos activos
        const contratosActivos = await Contract.findOne({
            where: {
                id_usuario: id,
                estado: 'Activo'
            }
        }); 

        if (contratosActivos) {
            return res.status(400).json({
                status: 'error',
                message: 'No se puede eliminar un usuario con contratos activos'
            });
        }*/

        // Eliminar usuario y sus registros relacionados
        await user.destroy();

        return res.status(200).json({
            status: 'success',
            message: 'Usuario eliminado exitosamente',
            data: {
                usuario: {
                    id: user.id,
                    codigo: user.codigo
                }
            }
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
                    id_rol: user.id_rol
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

export { 
    getUsers as getUser, 
    register as createUser, 
    updateUsers as updateUser, 
    deactivateUser as deleteUser, 
    hardDeleteUser as permanentDeleteUser,
    searchUsers as searchUser
};