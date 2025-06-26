import { Request, Response, NextFunction } from 'express';
import { Op, Transaction } from 'sequelize';
import { z } from 'zod';
import Trainer from '../models/trainer';
import User from '../models/user';
import sequelize from '../config/db';
import { idSchema, createTrainerSchema, updateTrainerSchema, searchTrainerSchema } from '../validators/trainer.validator';

// Generar código de entrenador
const generateTrainerCode = async (): Promise<string> => {
    const lastTrainer = await Trainer.findOne({
        order: [['codigo', 'DESC']],
    });
    
    const lastCode = lastTrainer ? parseInt(lastTrainer.codigo.substring(1)) : 0;
    const newCode = `E${String(lastCode + 1).padStart(3, '0')}`;
    return newCode;
};

// Listar entrenadores
export const getTrainers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { pagina = 1, limite = 10, orden = 'fecha_registro', direccion = 'ASC' } = searchTrainerSchema.parse(req.query);
        
        const offset = (pagina - 1) * limite;

        const [trainers, total] = await Promise.all([
            Trainer.findAll({
                include: [{
                    model: User,
                    as: 'usuario',
                    attributes: ['nombre',
                                'apellido',
                                'correo',
                                'telefono',
                                'direccion',
                                'genero',
                                'tipo_documento',
                                'numero_documento',
                                'fecha_nacimiento']
                }],
                limit: limite,
                offset: offset,
                order: [[orden, direccion]]
            }),
            Trainer.count()
        ]);

        if (trainers.length === 0) {
            res.status(200).json({
                status: 'success',
                message: 'No hay entrenadores registrados',
                data: {
                    total: 0,
                    trainers: []
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
                trainers
            }
        });
    } catch (error) {
        next(error);
    }
};

// Crear entrenador
export const createTrainer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const transaction: Transaction = await sequelize.transaction();
    
    try {
        const trainerData = createTrainerSchema.parse(req.body);
        
        // Verificar que el usuario existe
        const user = await User.findOne({ 
            where: { numero_documento: trainerData.numero_documento },
            transaction
        });

        if (!user) {
            await transaction.rollback();
            res.status(404).json({
                status: 'error',
                message: "Usuario no encontrado"
            });
            return;
        }

        // Verificar que no exista ya un entrenador con ese usuario
        const existingTrainer = await Trainer.findOne({
            where: { id_usuario: user.id },
            transaction
        });

        if (existingTrainer) {
            await transaction.rollback();
            res.status(400).json({
                status: 'error',
                message: "Este usuario ya está registrado como entrenador"
            });
            return;
        }

        // Generar código único
        const codigo = await generateTrainerCode();

        // Crear entrenador
        const trainer = await Trainer.create({
            codigo,
            id_usuario: user.id,
            especialidad: trainerData.especialidad,
            fecha_registro: new Date(),
            estado: trainerData.estado
        }, { transaction });

        await transaction.commit();

        // Obtener entrenador creado con sus relaciones
        const createdTrainer = await Trainer.findByPk(trainer.id, {
            include: [{
                model: User,
                as: 'usuario',
                attributes: ['nombre', 'apellido', 'correo', 'telefono']
            }]
        });

        res.status(201).json({
            status: 'success',
            message: "Entrenador registrado exitosamente",
            data: { trainer: createdTrainer }
        });

    } catch (error) {
        await transaction.rollback();
        if (error instanceof z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: "Datos de entrenador inválidos",
                errors: error.errors
            });
            return;
        }
        next(error);
    }
};

// Actualizar entrenador
export const updateTrainer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const transaction: Transaction = await sequelize.transaction();
    
    try {
        const { id } = idSchema.parse({ id: req.params.id });
        const updateData = updateTrainerSchema.parse(req.body);

        // Buscar entrenador
        const trainer = await Trainer.findByPk(id, {
            include: [{
                model: User,
                as: 'usuario'
            }],
            transaction
        });

        if (!trainer) {
            await transaction.rollback();
            res.status(404).json({
                status: 'error',
                message: "Entrenador no encontrado"
            });
            return;
        }

        // Actualizar entrenador
        await trainer.update(updateData, { transaction });

        await transaction.commit();

        // Obtener entrenador actualizado
        const updatedTrainer = await Trainer.findByPk(id, {
            include: [{
                model: User,
                as: 'usuario',
                attributes: ['nombre', 'apellido', 'correo', 'telefono']
            }]
        });

        res.status(200).json({
            status: 'success',
            message: "Entrenador actualizado exitosamente",
            data: { trainer: updatedTrainer }
        });

    } catch (error) {
        await transaction.rollback();
        if (error instanceof z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: "Datos de actualización inválidos",
                errors: error.errors
            });
            return;
        }
        next(error);
    }
};

// Desactivar entrenador
export const deactivateTrainer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const transaction: Transaction = await sequelize.transaction();
    
    try {
        const { id } = idSchema.parse({ id: req.params.id });

        // Buscar entrenador
        const trainer = await Trainer.findByPk(id, {
            include: [{
                model: User,
                as: 'usuario'
            }],
            transaction
        });

        if (!trainer) {
            await transaction.rollback();
            res.status(404).json({
                status: 'error',
                message: "Entrenador no encontrado"
            });
            return;
        }

        // TODO: Validar que no tenga agendas programadas
        // Esta validación se implementará cuando se cree el módulo de agendas

        // Desactivar entrenador
        await trainer.update({ estado: false }, { transaction });

        await transaction.commit();

        res.status(200).json({
            status: 'success',
            message: "Entrenador desactivado exitosamente",
            data: { trainer }
        });

    } catch (error) {
        await transaction.rollback();
        if (error instanceof z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: "ID de entrenador inválido"
            });
            return;
        }
        next(error);
    }
};

// Eliminar entrenador
export const deleteTrainer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const transaction: Transaction = await sequelize.transaction();
    
    try {
        const { id } = idSchema.parse({ id: req.params.id });

        // Buscar entrenador
        const trainer = await Trainer.findByPk(id, {
            include: [{
                model: User,
                as: 'usuario'
            }],
            transaction
        });

        if (!trainer) {
            await transaction.rollback();
            res.status(404).json({
                status: 'error',
                message: "Entrenador no encontrado"
            });
            return;
        }

        // TODO: Validar que no tenga agendas programadas
        // Esta validación se implementará cuando se cree el módulo de agendas

        // Eliminar entrenador
        await trainer.destroy({ transaction });

        await transaction.commit();

        res.status(200).json({
            status: 'success',
            message: "Entrenador eliminado exitosamente",
            data: { trainer }
        });

    } catch (error) {
        await transaction.rollback();
        if (error instanceof z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: "ID de entrenador inválido"
            });
            return;
        }
        next(error);
    }
};

// Buscar entrenadores
export const searchTrainers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { q = '', pagina = 1, limite = 10 } = searchTrainerSchema.parse(req.query);
        
        const offset = (pagina - 1) * limite;
        const searchTerm = q.trim();

        const where = searchTerm ? {
            [Op.or]: [
                { '$usuario.nombre$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$usuario.apellido$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$usuario.correo$': { [Op.iLike]: `%${searchTerm}%` } },
                { especialidad: { [Op.iLike]: `%${searchTerm}%` } }
            ]
        } : {};

        const [trainers, total] = await Promise.all([
            Trainer.findAll({
                where,
                include: [{
                    model: User,
                    as: 'usuario',
                    attributes: ['nombre', 'apellido', 'correo', 'telefono']
                }],
                limit: limite,
                offset: offset,
                order: [['fecha_registro', 'DESC']]
            }),
            Trainer.count({
                where,
                include: [{
                    model: User,
                    as: 'usuario'
                }]
            })
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                total,
                pagina,
                limite,
                total_paginas: Math.ceil(total / limite),
                trainers
            }
        });
    } catch (error) {
        next(error);
    }
};

// Ver detalles de un entrenador
export const getTrainerDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = idSchema.parse({ id: req.params.id });

        const trainer = await Trainer.findByPk(id, {
            include: [{
                model: User,
                as: 'usuario',
                attributes: [
                    'nombre', 'apellido', 'correo', 'telefono', 'direccion',
                    'genero', 'tipo_documento', 'numero_documento', 'fecha_nacimiento'
                ]
            }]
        });

        if (!trainer) {
            res.status(404).json({
                status: 'error',
                message: "Entrenador no encontrado"
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: { trainer }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: "ID de entrenador inválido"
            });
            return;
        }
        next(error);
    }
}; 