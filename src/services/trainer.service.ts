import { Op, Transaction } from 'sequelize';
import sequelize from '../config/db';
import { Trainer, User, Role } from '../models';
import { ApiError } from '../errors/apiError';
import { UserService } from './user.service';
import { CreateTrainerInput, UpdateTrainerInput, SearchTrainerInput } from '../validators/trainer.validator';
import { UserCreateType, UpdateUserType } from '../validators/user.validator';

export class TrainerService {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    private async generateTrainerCode(transaction: Transaction): Promise<string> {
        const lastTrainer = await Trainer.findOne({
            order: [['codigo', 'DESC']],
            lock: transaction.LOCK.UPDATE,
            transaction,
        });
        if (lastTrainer) {
            const lastCodeNumber = parseInt(lastTrainer.codigo.substring(1), 10);
            return `E${String(lastCodeNumber + 1).padStart(3, '0')}`;
        }
        return 'E001';
    }

    private async getTrainerRole(transaction: Transaction): Promise<Role> {
        const trainerRole = await Role.findOne({ where: { nombre: 'Entrenador' }, transaction });
        if (!trainerRole) {
            throw new ApiError("El rol 'Entrenador' no existe. Por favor, créelo antes de registrar un entrenador.", 500);
        }
        return trainerRole;
    }

    public async create(data: CreateTrainerInput): Promise<Trainer> {
        const transaction = await sequelize.transaction();
        try {
            const { usuario: userData, especialidad, estado } = data;
            const trainerRole = await this.getTrainerRole(transaction);

            // Verificar si el usuario ya existe por documento o correo
            let user = await this.userService.findUserByDocumentOrEmail(userData.numero_documento, userData.correo, transaction);

            if (user) {
                // Si el usuario existe, verificar si ya es un entrenador
                const existingTrainer = await Trainer.findOne({ where: { id_usuario: user.id }, transaction });
                if (existingTrainer) {
                    throw new ApiError('Este usuario ya está registrado como entrenador.', 409);
                }
                // Si no es entrenador, se le asigna el rol y se actualizan sus datos
                const { contrasena, ...userDataWithoutPassword } = userData;
                await this.userService.update(user.id, { ...userDataWithoutPassword, id_rol: trainerRole.id });
            } else {
                // Si el usuario no existe, lo creamos
                if (!userData.contrasena) {
                    throw new ApiError('La contraseña es requerida para crear un nuevo usuario.', 400);
                }
                const { user: newUser } = await this.userService.create({ ...userData, contrasena: userData.contrasena, id_rol: trainerRole.id }, transaction);
                user = newUser;
            }

            if (!user) {
                throw new ApiError('No se pudo crear o encontrar el usuario.', 500);
            }

            // Crear el entrenador
            const codigo = await this.generateTrainerCode(transaction);
            const newTrainer = await Trainer.create({
                id_usuario: user.id,
                codigo,
                especialidad,
                estado,
            }, { transaction });

            await transaction.commit();
            return this.findById(newTrainer.id); // Devolvemos el entrenador con todos los datos
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    public async update(id: number, data: UpdateTrainerInput): Promise<Trainer> {
        const transaction = await sequelize.transaction();
        try {
            const trainer = await Trainer.findByPk(id, { transaction });
            if (!trainer) {
                throw new ApiError('Entrenador no encontrado', 404);
            }

            const { usuario: userData, especialidad, estado } = data;

            // Actualizar datos del usuario si se proporcionan
            if (userData) {
                await this.userService.update(trainer.id_usuario, userData as UpdateUserType, transaction);
            }

            // Actualizar datos del entrenador
            await trainer.update({ especialidad, estado }, { transaction });

            await transaction.commit();
            return this.findById(id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    
    public async findAll(options: SearchTrainerInput) {
        const { pagina = 1, limite = 10, q, orden = 'nombre', direccion = 'ASC', estado } = options;
        const offset = (pagina - 1) * limite;

        const whereClause: any = {};
        if (estado !== undefined) {
            whereClause.estado = estado;
        }
        
        const userWhereClause = q ? {
            [Op.or]: [
                { nombre: { [Op.iLike]: `%${q}%` } },
                { apellido: { [Op.iLike]: `%${q}%` } },
                { correo: { [Op.iLike]: `%${q}%` } },
                { numero_documento: { [Op.iLike]: `%${q}%` } },
            ],
        } : {};

        const { count, rows } = await Trainer.findAndCountAll({
            where: whereClause,
            include: [{
                model: User,
                as: 'usuario',
                attributes: { exclude: ['contrasena_hash'] },
                where: userWhereClause,
            }],
            limit: limite,
            offset,
            order: orden === 'codigo' 
                ? [['codigo', direccion], [{ model: User, as: 'usuario' }, 'nombre', 'ASC']]
                : [[{ model: User, as: 'usuario' }, orden, direccion], ['codigo', 'ASC']],
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
    }

    public async findById(id: number): Promise<Trainer> {
        const trainer = await Trainer.findByPk(id, {
            include: [{
                model: User,
                as: 'usuario',
                attributes: { exclude: ['contrasena_hash'] },
                include: [{ model: Role, as: 'rol' }]
            }],
        });
        if (!trainer) {
            throw new ApiError('Entrenador no encontrado', 404);
        }
        return trainer;
    }

    public async activate(id: number): Promise<{ message: string }> {
        const trainer = await this.findById(id);
        await trainer.update({ estado: true });
        // También activamos el usuario asociado
        await User.update({ estado: true }, { where: { id: trainer.id_usuario } });
        return { message: 'Entrenador activado exitosamente.' };
    }
    
    public async deactivate(id: number): Promise<{ message: string }> {
        const trainer = await this.findById(id);
        await trainer.update({ estado: false });
        // La lógica de desactivar el usuario si es solo entrenador se manejará en el servicio de usuario
        return { message: 'Entrenador desactivado exitosamente.' };
    }

    public async delete(id: number): Promise<{ message: string }> {
        const trainer = await Trainer.findByPk(id);
        if (!trainer) {
            throw new ApiError('Entrenador no encontrado', 404);
        }
        // La asociación con onDelete: 'CASCADE' se encargará de eliminar el entrenador si se elimina el usuario.
        // Aquí solo eliminamos el usuario, y el entrenador se borrará en cascada.
        await this.userService.delete(trainer.id_usuario, null, 'Eliminación de registro de entrenador.');
        return { message: 'Entrenador y usuario asociado eliminados permanentemente.' };
    }
} 