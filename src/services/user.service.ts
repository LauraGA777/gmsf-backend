import { Op, WhereOptions, Transaction } from 'sequelize';
import bcrypt from 'bcrypt';
import User from '../models/user';
import Role from '../models/role';
import UserHistory from '../models/userHistory';
import Contract from '../models/contract';
import Permission from '../models/permission';
import Privilege from '../models/privilege';
import sequelize from '../config/db';
import { generateAccessToken } from '../utils/jwt.utils';
import { ApiError } from '../errors/apiError';
import { UpdateUserType, SearchUserType, UserCreateType } from '../validators/user.validator';
import Person from '../models/person.model';
import Trainer from '../models/trainer';
import { enviarCorreoBienvenida } from '../utils/email.utils';

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

    public async findUserByDocumentOrEmail(numero_documento: string, correo: string, transaction?: Transaction): Promise<User | null> {
        return User.findOne({
            where: {
                [Op.or]: [{ numero_documento }, { correo }]
            },
            transaction
        });
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

    public async create(userData: UserCreateType, transaction?: Transaction) {
        const existingUser = await User.findOne({ 
            where: { 
                [Op.or]: [{ correo: userData.correo }, { numero_documento: userData.numero_documento }] 
            },
            transaction
        });
        if (existingUser) {
            throw new ApiError('El correo electrónico o número de documento ya está registrado', 400);
        }

        if (userData.id_rol) {
            const role = await Role.findByPk(userData.id_rol, { transaction });
            if (!role) {
                throw new ApiError('El rol especificado no existe', 400);
            }
            if (!role.estado) {
                throw new ApiError('El rol especificado está inactivo', 400);
            }
        }

        const codigo = await this.generateUserCode();
        
        // SIEMPRE usar número de documento como contraseña inicial
        const contrasena_hash = await bcrypt.hash(userData.numero_documento, 10);

        // Crear usuario
        const user = await User.create({
            ...userData,
            codigo,
            contrasena_hash,
            estado: true,
            fecha_actualizacion: new Date(),
            asistencias_totales: 0,
            primer_acceso: true // Siempre es primer acceso
        }, { transaction });

        // Siempre enviar email de bienvenida
        try {
            await enviarCorreoBienvenida(userData.correo, {
                nombre: userData.nombre,
                apellido: userData.apellido,
                numeroDocumento: userData.numero_documento,
            });
        } catch (emailError) {
            console.error('Error enviando email de bienvenida:', emailError);
            // No fallar la creación del usuario si el email falla
        }

        const accessToken = generateAccessToken(user.id);

        const createdUser = await User.findByPk(user.id, { 
            transaction, 
            attributes: { exclude: ['contrasena_hash'] },
            include: [{ model: Role, as: 'rol'}] 
        });

        return {
            user: createdUser,
            accessToken,
            message: 'Usuario creado exitosamente. Se ha enviado un email con las credenciales de acceso.'
        };
    }

    public async update(id: number, data: UpdateUserType, transaction?: Transaction) {
        const user = await User.findByPk(id, { transaction });
        if (!user) {
            throw new ApiError('Usuario no encontrado', 404);
        }

        await user.update({ ...data, fecha_actualizacion: new Date() }, { transaction });
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

        // ✅ MEJORA 1: Verificar múltiples tipos de contratos activos
        const contractValidation = await this.validateUserContractsForDeactivation(user.id);
        if (!contractValidation.canDeactivate) {
            throw new ApiError(contractValidation.message, 409);
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

            // ✅ MEJORA 2: Lógica de desactivación en cascada mejorada
            await this.deactivateAssociatedRecords(user, t);
            
            await t.commit();
            return { success: true, message: 'Usuario y roles asociados desactivados exitosamente' };

        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    // ✅ NUEVO MÉTODO: Validación completa de contratos
    private async validateUserContractsForDeactivation(userId: number): Promise<{
        canDeactivate: boolean;
        message: string;
        details?: any;
    }> {
        try {
            // Verificar contratos donde el usuario es el titular (a través de persona)
            const userAsClientContracts = await Contract.findAll({
                include: [
                    {
                        model: Person,
                        as: 'persona',
                        where: { id_usuario: userId },
                        attributes: ['id_persona', 'codigo']
                    }
                ],
                where: {
                    estado: 'Activo',
                    fecha_inicio: { [Op.lte]: new Date() },
                    fecha_fin: { [Op.gte]: new Date() }
                },
                attributes: ['id', 'codigo', 'fecha_inicio', 'fecha_fin']
            });

            // Verificar contratos que el usuario registró (como empleado/admin)
            const userRegisteredContracts = await Contract.count({
                where: { 
                    usuario_registro: userId, 
                    estado: 'Activo',
                    fecha_inicio: { [Op.lte]: new Date() },
                    fecha_fin: { [Op.gte]: new Date() }
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

        } catch (error) {
            console.error('Error validating contracts for user deactivation:', error);
            throw new ApiError('Error al validar contratos del usuario', 500);
        }
    }

    // ✅ NUEVO MÉTODO: Desactivación en cascada mejorada
    private async deactivateAssociatedRecords(user: any, transaction: Transaction): Promise<void> {
        try {
            const role = await Role.findByPk(user.id_rol, { transaction });
            if (!role) return;

            switch (role.nombre) {
                case 'Cliente':
                    await this.deactivateClientRecords(user.id, transaction);
                    break;
                case 'Entrenador':
                    await this.deactivateTrainerRecords(user.id, transaction);
                    break;
                case 'Administrador':
                case 'Empleado':
                    // Los administradores/empleados no tienen registros adicionales que desactivar
                    console.log(`Usuario ${role.nombre} desactivado - sin registros adicionales`);
                    break;
                default:
                    console.log(`Rol desconocido: ${role.nombre}`);
            }
        } catch (error) {
            console.error('Error en desactivación en cascada:', error);
            throw error;
        }
    }

    // ✅ MÉTODO ESPECÍFICO: Desactivar registros de cliente
    private async deactivateClientRecords(userId: number, transaction: Transaction): Promise<void> {
        const person = await Person.findOne({ 
            where: { id_usuario: userId }, 
            transaction 
        });
        
        if (person) {
            person.estado = false;
            await person.save({ transaction });
            console.log(`Persona ${person.codigo} desactivada`);
        }
    }

    // ✅ MÉTODO ESPECÍFICO: Desactivar registros de entrenador
    private async deactivateTrainerRecords(userId: number, transaction: Transaction): Promise<void> {
        const trainer = await Trainer.findOne({ 
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
            await trainer.save({ transaction });
            console.log(`Entrenador ${trainer.codigo} desactivado`);
        }
    }

    public async delete(id: number, adminId: number | null, reason: string) {
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
            const historyData: any = {
                id_usuario: user.id,
                estado_anterior: user.estado,
                estado_nuevo: false,
                motivo: reason || 'Eliminación de usuario'
            };
            if (adminId !== null) {
                historyData.usuario_cambio = adminId;
            }

            await UserHistory.create(historyData, { transaction: t });

            // Eliminar el usuario (y el entrenador en cascada)
            await user.destroy({ transaction: t });
            
            await t.commit();
            return { success: true, message: 'Usuario eliminado permanentemente' };

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

    public async checkDocumentExists(numero_documento: string, excludeUserId?: string) {
        const whereConditions: any = { numero_documento };
        if (excludeUserId) {
            whereConditions.id = { [Op.ne]: excludeUserId };
        }

        const user = await User.findOne({ where: whereConditions });
        return { userExists: !!user };
    }

    public async checkUserByDocument(tipo_documento: string, numero_documento: string, excludeUserId?: string) {
        const whereConditions: any = { 
            tipo_documento, 
            numero_documento: { [Op.iLike]: numero_documento } // Búsqueda insensible a mayúsculas/minúsculas
        };
        if (excludeUserId) {
            whereConditions.id = { [Op.ne]: excludeUserId };
        }

        const user = await User.findOne({ 
            where: whereConditions,
            attributes: { exclude: ["contrasena_hash", "contrasena"] },
            include: [
                {
                    model: Role,
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
        const trainer = await Trainer.findOne({
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
                direccion: (user as any).direccion,
                genero: (user as any).genero,
                tipo_documento: user.tipo_documento,
                numero_documento: user.numero_documento,
                fecha_nacimiento: (user as any).fecha_nacimiento,
                rol: user.rol
            },
            message: "Usuario encontrado. Los datos se han autocompletado. Solo complete la especialidad para registrarlo como entrenador."
        };
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