import { Op, WhereOptions, Transaction } from 'sequelize';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import User from '../models/user';
import Role from '../models/role';
import UserHistory from '../models/userHistory';
import Contract from '../models/contract';
import Permission from '../models/permission';
import Privilege from '../models/privilege';
import sequelize from '../config/db';
import { generateAccessToken } from '../utils/jwt.utils';
import { ApiError } from '../errors/apiError';
import { UpdateUserType, SearchUserType } from '../validators/user.validator';
import { Person } from '../models';

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

export class UserService {
    private async generateUserCode(): Promise<string> {
        const lastUser = await User.findOne({
            order: [['codigo', 'DESC']],
        });

        const lastCode = lastUser ? parseInt(lastUser.codigo.substring(1)) : 0;
        return `U${String(lastCode + 1).padStart(3, '0')}`;
    }

    public async findAll(queryParams: any) {
        const {
            page = 1,
            limit = 10,
            orderBy = 'id',
            direction = 'ASC'
        } = queryParams;

        const offset = (page - 1) * limit;
        const validOrderField = 'id'; // Forcing order by id for now

        const { count, rows } = await User.findAndCountAll({
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
    }

    public async getRoles() {
        return Role.findAll({ where: { estado: true } });
    }

    public async findById(id: number) {
        const user = await User.findByPk(id, {
            attributes: { exclude: ['contrasena_hash'] },
            include: [
                {
                    model: Role,
                    as: 'rol',
                    attributes: ['id', 'codigo', 'nombre', 'descripcion', 'estado'],
                    include: [
                        { model: Permission, as: 'permisos', attributes: ['id', 'codigo', 'nombre'], through: { attributes: [] }, required: false },
                        { model: Privilege, as: 'privilegios', attributes: ['id', 'codigo', 'nombre'], through: { attributes: [] }, required: false }
                    ],
                    required: false
                }
            ]
        });

        if (!user) {
            throw new ApiError('Usuario no encontrado', 404);
        }
        return user;
    }

    public async create(userData: UserData) {
        const existingUser = await User.findOne({ where: { correo: userData.correo } });
        if (existingUser) {
            throw new ApiError('El correo electrónico ya está registrado', 400);
        }

        if (userData.id_rol) {
            const role = await Role.findByPk(userData.id_rol);
            if (!role) {
                throw new ApiError('El rol especificado no existe', 400);
            }
            if (!role.estado) {
                throw new ApiError('El rol especificado está inactivo', 400);
            }
        }

        const codigo = await this.generateUserCode();
        const contrasena_hash = await bcrypt.hash(userData.contrasena, 10);

        const user = await User.create({
            ...userData,
            codigo,
            contrasena_hash,
            estado: true,
            fecha_actualizacion: new Date(),
            asistencias_totales: 0
        });

        const accessToken = generateAccessToken(user.id);

        const createdUser = await this.findById(user.id);

        return { user: createdUser, accessToken };
    }

    public async update(id: number, data: UpdateUserType) {
        const user = await User.findByPk(id);
        if (!user) {
            throw new ApiError('Usuario no encontrado', 404);
        }

        await user.update({ ...data, fecha_actualizacion: new Date() });
        return this.findById(id);
    }

    public async activate(id: number, adminId: number) {
        const user = await User.findByPk(id);
        if (!user) {
            throw new ApiError('Usuario no encontrado', 404);
        }
        if (user.estado) {
            throw new ApiError('El usuario ya está activo', 400);
        }

        await UserHistory.create({
            id_usuario: user.id,
            estado_anterior: user.estado,
            estado_nuevo: true,
            usuario_cambio: adminId
        });

        user.estado = true;
        user.fecha_actualizacion = new Date();
        await user.save();
        return { success: true, message: 'Usuario activado exitosamente' };
    }

    public async deactivate(id: number, adminId: number) {
        const user = await User.findByPk(id);
        if (!user) {
            throw new ApiError('Usuario no encontrado', 404);
        }
        if (!user.estado) {
            throw new ApiError('El usuario ya está inactivo', 400);
        }

        const activeContracts = await Contract.count({
            where: { usuario_registro: user.id, estado: 'Activo' }
        });

        if (activeContracts > 0) {
            throw new ApiError('No se puede desactivar el usuario porque tiene contratos activos', 400);
        }

        const t = await sequelize.transaction();
        try {
            await UserHistory.create({
                id_usuario: user.id,
                estado_anterior: user.estado,
                estado_nuevo: false,
                usuario_cambio: adminId
            }, { transaction: t });
    
            user.estado = false;
            user.fecha_actualizacion = new Date();
            await user.save({ transaction: t });

            // Lógica de desactivación en cascada: si el usuario es un cliente, desactivar la persona.
            // Asumimos que el rol de cliente tiene id 2
            if (user.id_rol === 2) {
                const person = await Person.findOne({ where: { id_usuario: user.id }, transaction: t });
                if (person) {
                    person.estado = false;
                    await person.save({ transaction: t });
                }
            }
            
            await t.commit();
            return { success: true, message: 'Usuario y cliente asociado desactivados exitosamente' };

        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    public async delete(id: number, adminId: number, reason: string) {
        const user = await User.findByPk(id);
        if (!user) {
            throw new ApiError('Usuario no encontrado', 404);
        }
        if (user.estado) {
            throw new ApiError('No se puede eliminar un usuario activo', 400);
        }

        const contracts = await Contract.count({ where: { usuario_registro: user.id } });
        if (contracts > 0) {
            throw new ApiError('No se puede eliminar el usuario porque tiene contratos asociados', 400);
        }

        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        if (user.fecha_actualizacion > twelveMonthsAgo) {
            throw new ApiError('El usuario debe estar inactivo por al menos 12 meses para ser eliminado', 400);
        }

        const t = await sequelize.transaction();
        try {
            await UserHistory.create({
                id_usuario: user.id,
                estado_anterior: user.estado,
                estado_nuevo: false,
                usuario_cambio: adminId,
                motivo: reason || 'Eliminación de usuario'
            }, { transaction: t });

            await sequelize.query('SET CONSTRAINTS ALL DEFERRED', { transaction: t });
            await sequelize.query('DELETE FROM historial_usuarios WHERE id_usuario = :userId', { replacements: { userId: user.id }, transaction: t });
            await user.destroy({ transaction: t });
            await sequelize.query('SET CONSTRAINTS ALL IMMEDIATE', { transaction: t });
            await t.commit();

            return { success: true, message: 'Usuario eliminado exitosamente' };
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    public async search(params: SearchUserType) {
        const { q, pagina, limite, orden, direccion } = params;
        const offset = (pagina - 1) * limite;

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

        const { count, rows } = await User.findAndCountAll({
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
    }

    public async checkDocumentExists(documentNumber: string, excludeUserId?: string) {
        const whereConditions: any = { numero_documento: documentNumber };
        if (excludeUserId) {
            whereConditions.id = { [Op.ne]: excludeUserId };
        }
        const user = await User.findOne({ where: whereConditions });
        return { exists: !!user };
    }

    public async checkEmailExists(email: string, excludeUserId?: string) {
        const whereConditions: any = { correo: email.toLowerCase() };
        if (excludeUserId) {
            whereConditions.id = { [Op.ne]: excludeUserId };
        }
        const user = await User.findOne({ where: whereConditions });
        return { exists: !!user };
    }
} 