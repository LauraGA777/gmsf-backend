import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import User from '../models/user';
import { env } from '../config/env';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.utils';
import TokenBlacklist from '../utils/token-blacklist';
import { enviarCorreoRecuperacion } from '../utils/email.utils';
import jwt from 'jsonwebtoken';

// Interfaces
interface LoginData {
    correo: string;
    contrasena: string;
}

// Controlador de login
export const login = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { correo, contrasena }: LoginData = req.body;

        // Buscar usuario por email
        const user = await User.findOne({
            where: { correo }
        });

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Credenciales inválidas'
            });
        }

        // Verificar contraseña usando bcrypt.compare
        const validPassword = await bcrypt.compare(contrasena, user.contrasena_hash);
        if (!validPassword) {
            return res.status(401).json({
                status: 'error',
                message: 'Credenciales inválidas'
            });
        }

        // Generar tokens
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // Logs para desarrollo
        if (env.NODE_ENV === 'development') {
            console.log('Access Token generado:', accessToken);
            console.log('Refresh Token generado:', refreshToken);
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
                    id_rol: user.id_rol
                }
            }
        });

    } catch (error: any) {
        console.error('Error en login:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

// Controlador de logout
export const logout = async (req: Request, res: Response): Promise<Response> => {
    try {
        // Intentar obtener el token del header
        let token = req.headers.authorization?.split(' ')[1];
        
        // Si no hay token en el header, intentar obtenerlo de las cookies
        if (!token) {
            token = req.cookies?.accessToken;
        }

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'No se proporcionó un token de autenticación'
            });
        }

        // Agregar el token a la lista negra
        TokenBlacklist.add(token);

        // Limpiar la cookie si existe
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        // Respuesta exitosa
        return res.status(200).json({
            status: 'success',
            message: 'Logout exitoso'
        });
    } catch (error: any) {
        console.error('Error en logout:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};

// Verificación de usuario
export const verifyUser = async (userId: number) => {
    try {
        const user = await User.findByPk(userId, {
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
    } catch (error) {
        console.error('Error al verificar usuario:', error);
        throw { 
            status: 500, 
            message: "Error al verificar el usuario" 
        };
    }
};

// Recuperación de contraseña 
export const forgotPassword = async (req: Request, res: Response): Promise<Response> => {
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
        const user = await User.findOne({ 
            where: { correo } 
        });

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Correo no registrado'
            });
        }

        // Generar token de recuperación (15 minutos)
        const resetToken = generateAccessToken(user.id, '15m');

        try {
            // Enviar correo de recuperación
            await enviarCorreoRecuperacion(correo, resetToken);

            return res.status(200).json({
                status: 'success',
                message: 'Correo de recuperación enviado'
            });
        } catch (emailError) {
            console.error('Error al enviar correo:', emailError);
            return res.status(500).json({
                status: 'error',
                message: 'Error al enviar el correo de recuperación'
            });
        }

    } catch (error) {
        console.error('Error en forgotPassword:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error al procesar la solicitud'
        });
    }
};

// Cambio de contraseña
export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
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
        const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: number };

        // Buscar al usuario
        const user = await User.findByPk(decoded.userId);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }

        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

        // Actualizar la contraseña
        user.contrasena_hash = hashedPassword;
        await user.save();

        // Invalidar todos los tokens anteriores del usuario
        TokenBlacklist.add(token);

        return res.status(200).json({
            status: 'success',
            message: 'Contraseña actualizada exitosamente'
        });

    } catch (error) {
        console.error('Error en resetPassword:', error);
        
        if (error instanceof jwt.JsonWebTokenError) {
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
};

// Cambio de contraseña del usuario autenticado
export const changePassword = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { contrasenaActual, nuevaContrasena } = req.body;
        const usuarioId = req.user?.id; // Obtenemos el ID del usuario del token

        if (!usuarioId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        // Buscar usuario
        const user = await User.findByPk(usuarioId);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }

        // Verificar la contraseña actual
        const contrasenaValida = await bcrypt.compare(contrasenaActual, user.contrasena_hash);
        if (!contrasenaValida) {
            return res.status(401).json({
                status: 'error',
                message: 'Contraseña actual incorrecta'
            });
        }

        // Hashear y actualizar la nueva contraseña
        const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);
        user.contrasena_hash = hashedPassword;
        await user.save();

        return res.status(200).json({
            status: 'success',
            message: 'Contraseña actualizada exitosamente'
        });

    } catch (error) {
        console.error('Error en changePassword:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error al cambiar la contraseña'
        });
    }
};

// Obtener perfil del usuario
export const getProfile = async (req: Request, res: Response): Promise<Response> => {
    try {
        const usuarioId = req.user?.id; // Obtenemos el ID del usuario del token

        if (!usuarioId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        // Buscar usuario excluyendo datos sensibles
        const user = await User.findByPk(usuarioId, {
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
                }
            }
        });

    } catch (error) {
        console.error('Error en getProfile:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error al obtener el perfil del usuario'
        });
    }
};

// Actualización de perfil del usuario
export const updateProfile = async (req: Request, res: Response): Promise<Response> => {
    try {
        const usuarioId = req.user?.id;
        const datosActualizacion = req.body;

        if (!usuarioId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        // Buscar usuario
        const user = await User.findByPk(usuarioId);
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
        const datosFiltrados: any = {};
        camposPermitidos.forEach(campo => {
            if (datosActualizacion[campo] !== undefined) {
                datosFiltrados[campo] = datosActualizacion[campo];
            }
        });

        // Actualizar fecha_actualizacion
        datosFiltrados.fecha_actualizacion = new Date();

        // Actualizar usuario
        await user.update(datosFiltrados);

        // Obtener usuario actualizado sin datos sensibles
        const usuarioActualizado = await User.findByPk(usuarioId, {
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

    } catch (error) {
        console.error('Error en updateProfile:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error al actualizar el perfil'
        });
    }
};