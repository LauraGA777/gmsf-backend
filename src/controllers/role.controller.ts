import { Request, Response, NextFunction } from 'express';
import { Op, Transaction } from 'sequelize';
import { z } from 'zod';
import Role from '../models/role';
import User from '../models/user';
import Permission from '../models/permission';
import Privilege from '../models/privilege';
import sequelize from '../config/db';
import { idSchema, createRoleSchema, updateRoleSchema, searchRoleSchema } from '../validators/role.validator';
import ApiResponse from '../utils/apiResponse';

// Generar código de rol
const generateRoleCode = async (): Promise<string> => {
    const lastRole = await Role.findOne({
        order: [['codigo', 'DESC']],
    });
    
    const lastCode = lastRole ? parseInt(lastRole.codigo.substring(1)) : 0;
    const newCode = `R${String(lastCode + 1).padStart(3, '0')}`;
    return newCode;
};

// Listar roles
export const getRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { pagina = 1, limite = 10, orden = 'nombre', direccion = 'ASC' } = searchRoleSchema.parse(req.query);
        
        const offset = (pagina - 1) * limite;

        const [roles, total] = await Promise.all([
            Role.findAll({
                include: [
                    {
                        model: Permission,
                        as: 'permisos',
                        through: { attributes: [] }
                    },
                    {
                        model: Privilege,
                        as: 'privilegios',
                        through: { attributes: [] }
                    }
                ],
                limit: limite,
                offset: offset,
                order: [[orden, direccion]]
            }),
            Role.count()
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
    } catch (error) {
        next(error);
    }
};

// Crear rol
export const createRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const transaction: Transaction = await sequelize.transaction();
    
    try {
        const roleData = createRoleSchema.parse(req.body);
        
        // Verificar nombre único
        const existingRole = await Role.findOne({ 
            where: { nombre: roleData.nombre },
            transaction
        });

        if (existingRole) {
            await transaction.rollback();
            res.status(400).json({
                status: 'error',
                message: "Ya existe un rol con ese nombre"
            });
            return;
        }

        // Verificar que los permisos existan
        const permisos = await Permission.findAll({
            where: { 
                id: { [Op.in]: roleData.permisos },
                estado: true
            },
            transaction
        });

        if (permisos.length !== roleData.permisos.length) {
            await transaction.rollback();
            res.status(400).json({
                status: 'error',
                message: "Uno o más permisos no existen o están inactivos"
            });
            return;
        }

        // Verificar que los privilegios existan
        const privilegios = await Privilege.findAll({
            where: { 
                id: { [Op.in]: roleData.privilegios }
            },
            transaction
        });

        if (privilegios.length !== roleData.privilegios.length) {
            await transaction.rollback();
            res.status(400).json({
                status: 'error',
                message: "Uno o más privilegios no existen"
            });
            return;
        }

        // Generar código único
        const codigo = await generateRoleCode();

        // Crear rol
        const role = await Role.create({
            codigo,
            nombre: roleData.nombre,
            descripcion: roleData.descripcion,
            estado: roleData.estado
        }, { transaction });

        // Asociar permisos y privilegios
        await role.setPermisos(permisos, { transaction });
        await role.setPrivilegios(privilegios, { transaction });

        await transaction.commit();

        // Obtener rol creado con sus relaciones
        const createdRole = await Role.findByPk(role.id, {
            include: [
                {
                    model: Permission,
                    as: 'permisos',
                    through: { attributes: [] }
                },
                {
                    model: Privilege,
                    as: 'privilegios',
                    through: { attributes: [] }
                }
            ]
        });

        res.status(201).json({
            status: 'success',
            message: "Rol creado exitosamente",
            data: { role: createdRole }
        });

    } catch (error) {
        await transaction.rollback();
        if (error instanceof z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: "Datos de rol inválidos",
                errors: error.errors
            });
            return;
        }
        next(error);
    }
};

// Actualizar rol
export const updateRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const transaction: Transaction = await sequelize.transaction();
    
    try {
        const { id } = idSchema.parse({ id: req.params.id });
        const updateData = updateRoleSchema.parse(req.body);

        // Buscar rol
        const role = await Role.findByPk(id, { transaction });
        if (!role) {
            await transaction.rollback();
            res.status(404).json({
                status: 'error',
                message: "Rol no encontrado"
            });
            return;
        }

        // Verificar nombre único si se va a actualizar
        if (updateData.nombre) {
            const existingRole = await Role.findOne({
                where: {
                    nombre: updateData.nombre,
                    id: { [Op.ne]: id }
                },
                transaction
            });

            if (existingRole) {
                await transaction.rollback();
                res.status(400).json({
                    status: 'error',
                    message: "Ya existe otro rol con ese nombre"
                });
                return;
            }
        }

        // Actualizar permisos si se proporcionaron
        if (updateData.permisos) {
            const permisos = await Permission.findAll({
                where: { 
                    id: { [Op.in]: updateData.permisos },
                    estado: true
                },
                transaction
            });

            if (permisos.length !== updateData.permisos.length) {
                await transaction.rollback();
                res.status(400).json({
                    status: 'error',
                    message: "Uno o más permisos no existen o están inactivos"
                });
                return;
            }

            await role.setPermisos(permisos, { transaction });
        }

        // Actualizar privilegios si se proporcionaron
        if (updateData.privilegios) {
            const privilegios = await Privilege.findAll({
                where: { 
                    id: { [Op.in]: updateData.privilegios }
                },
                transaction
            });

            if (privilegios.length !== updateData.privilegios.length) {
                await transaction.rollback();
                res.status(400).json({
                    status: 'error',
                    message: "Uno o más privilegios no existen"
                });
                return;
            }

            await role.setPrivilegios(privilegios, { transaction });
        }

        // Actualizar rol
        const { permisos, privilegios, ...roleUpdateData } = updateData;
        await role.update(roleUpdateData, { transaction });

        await transaction.commit();

        // Obtener rol actualizado con sus relaciones
        const updatedRole = await Role.findByPk(id, {
            include: [
                {
                    model: Permission,
                    as: 'permisos',
                    through: { attributes: [] }
                },
                {
                    model: Privilege,
                    as: 'privilegios',
                    through: { attributes: [] }
                }
            ]
        });

        res.status(200).json({
            status: 'success',
            message: "Rol actualizado exitosamente",
            data: { role: updatedRole }
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

// Desactivar rol
export const deactivateRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const transaction: Transaction = await sequelize.transaction();
    
    try {
        const { id } = idSchema.parse({ id: req.params.id });

        // Buscar rol
        const role = await Role.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'usuarios'
                }
            ],
            transaction
        });

        if (!role) {
            await transaction.rollback();
            res.status(404).json({
                status: 'error',
                message: "Rol no encontrado"
            });
            return;
        }

        // Verificar si hay usuarios asociados
        if (role.usuarios && role.usuarios.length > 0) {
            await transaction.rollback();
            res.status(400).json({
                status: 'error',
                message: "No se puede desactivar el rol porque tiene usuarios asociados"
            });
            return;
        }

        // Desactivar rol
        await role.update({ estado: false }, { transaction });

        await transaction.commit();

        res.status(200).json({
            status: 'success',
            message: "Rol desactivado exitosamente",
            data: { role }
        });

    } catch (error) {
        await transaction.rollback();
        if (error instanceof z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: "ID de rol inválido"
            });
            return;
        }
        next(error);
    }
};

// Eliminar rol
export const deleteRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const transaction: Transaction = await sequelize.transaction();
    
    try {
        const { id } = idSchema.parse({ id: req.params.id });

        // Buscar rol
        const role = await Role.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'usuarios'
                }
            ],
            transaction
        });

        if (!role) {
            await transaction.rollback();
            res.status(404).json({
                status: 'error',
                message: "Rol no encontrado"
            });
            return;
        }

        // Verificar si hay usuarios asociados
        if (role.usuarios && role.usuarios.length > 0) {
            await transaction.rollback();
            res.status(400).json({
                status: 'error',
                message: "No se puede eliminar el rol porque tiene usuarios asociados"
            });
            return;
        }

        // Eliminar rol
        await role.destroy({ transaction });

        await transaction.commit();

        res.status(200).json({
            status: 'success',
            message: "Rol eliminado exitosamente",
            data: { role }
        });

    } catch (error) {
        await transaction.rollback();
        if (error instanceof z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: "ID de rol inválido"
            });
            return;
        }
        next(error);
    }
};

// Buscar roles
export const searchRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { q = '', pagina = 1, limite = 10 } = searchRoleSchema.parse(req.query);
        
        const offset = (pagina - 1) * limite;
        const searchTerm = q.trim();

        const where = searchTerm ? {
            [Op.or]: [
                { nombre: { [Op.iLike]: `%${searchTerm}%` } },
                { descripcion: { [Op.iLike]: `%${searchTerm}%` } }
            ]
        } : {};

        const [roles, total] = await Promise.all([
            Role.findAll({
                where,
                attributes: ['id', 'nombre', 'descripcion', 'estado'],
                limit: limite,
                offset: offset,
                order: [['nombre', 'ASC']]
            }),
            Role.count({ where })
        ]);

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
    } catch (error) {
        next(error);
    }
};

// Listar todos los permisos y privilegios
export const listPermissionsAndPrivileges = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const permisos = await Permission.findAll({
            where: { estado: true },
            include: [{
                model: Privilege,
                as: 'privilegios',
                attributes: ['id', 'nombre']
            }],
            order: [
                ['nombre', 'ASC'],
                [{ model: Privilege, as: 'privilegios' }, 'nombre', 'ASC']
            ]
        });

        res.status(200).json({
            status: 'success',
            data: { permisos }
        });
    } catch (error) {
        next(error);
    }
};

// Asignar privilegios a un rol
export const assignPrivileges = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const transaction: Transaction = await sequelize.transaction();
    
    try {
        const { id } = idSchema.parse({ id: req.params.id });
        const { privilegios } = z.object({
            privilegios: z.array(z.number()).min(1, "Debe seleccionar al menos un privilegio")
        }).parse(req.body);

        // Buscar rol
        const role = await Role.findByPk(id, { transaction });
        if (!role) {
            await transaction.rollback();
            res.status(404).json({
                status: 'error',
                message: "Rol no encontrado"
            });
            return;
        }

        // Verificar que los privilegios existan
        const privilegiosExistentes = await Privilege.findAll({
            where: { id: { [Op.in]: privilegios } },
            transaction
        });

        if (privilegiosExistentes.length !== privilegios.length) {
            await transaction.rollback();
            res.status(400).json({
                status: 'error',
                message: "Uno o más privilegios no existen"
            });
            return;
        }

        // Asignar privilegios
        await role.setPrivilegios(privilegiosExistentes, { transaction });
        await transaction.commit();

        // Obtener rol actualizado con sus privilegios
        const updatedRole = await Role.findByPk(id, {
            include: [{
                model: Privilege,
                as: 'privilegios',
                through: { attributes: [] }
            }]
        });

        res.status(200).json({
            status: 'success',
            message: "Privilegios asignados exitosamente",
            data: { role: updatedRole }
        });

    } catch (error) {
        await transaction.rollback();
        if (error instanceof z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: "Datos inválidos",
                errors: error.errors
            });
            return;
        }
        next(error);
    }
};

// Retirar privilegios de un rol
export const removePrivileges = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const transaction: Transaction = await sequelize.transaction();
    
    try {
        const { id } = idSchema.parse({ id: req.params.id });
        const { privilegios } = z.object({
            privilegios: z.array(z.number()).min(1, "Debe seleccionar al menos un privilegio")
        }).parse(req.body);

        // Buscar rol
        const role = await Role.findByPk(id, {
            include: [{
                model: Privilege,
                as: 'privilegios'
            }],
            transaction
        });

        if (!role) {
            await transaction.rollback();
            res.status(404).json({
                status: 'error',
                message: "Rol no encontrado"
            });
            return;
        }

        // Obtener privilegios actuales
        const privilegiosActuales = role.privilegios?.map(p => p.id) || [];
        
        // Filtrar privilegios a mantener
        const privilegiosRestantes = privilegiosActuales.filter(
            id => !privilegios.includes(id)
        );

        // Obtener objetos Privilege para los IDs restantes
        const privilegiosAMantener = await Privilege.findAll({
            where: { id: { [Op.in]: privilegiosRestantes } },
            transaction
        });

        // Actualizar privilegios
        await role.setPrivilegios(privilegiosAMantener, { transaction });
        await transaction.commit();

        // Obtener rol actualizado
        const updatedRole = await Role.findByPk(id, {
            include: [{
                model: Privilege,
                as: 'privilegios',
                through: { attributes: [] }
            }]
        });

        res.status(200).json({
            status: 'success',
            message: "Privilegios retirados exitosamente",
            data: { role: updatedRole }
        });

    } catch (error) {
        await transaction.rollback();
        if (error instanceof z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: "Datos inválidos",
                errors: error.errors
            });
            return;
        }
        next(error);
    }
}; 