import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import Membership from '../models/membership';
/* import Contract from '../models/contract'; */
import { z } from 'zod';
import {
    listMembershipSchema,
    searchMembershipSchema,
    createMembershipSchema,
    updateMembershipSchema,
    idSchema,
    QueryParams,
    SearchParams,
    CreateMembershipData,
    UpdateMembershipData
} from '../validators/membership.validator';

// Generar código único de membresía
const generateMembershipCode = async (): Promise<string> => {
    const lastMembership = await Membership.findOne({
        order: [['codigo', 'DESC']],
    });
    
    const lastNumber = lastMembership 
        ? parseInt(lastMembership.codigo.substring(1)) 
        : 0;
    
    return `M${String(lastNumber + 1).padStart(3, '0')}`;
};

// Obtener todas las membresías con paginación
export const getMemberships = async (req: Request<{}, {}, {}, QueryParams>, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { 
            page = '1', 
            limit = '10', 
            orderBy = 'codigo', // Changed default order to codigo
            direction = 'ASC',
            estado 
        } = listMembershipSchema.parse(req.query);

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const offset = (pageNum - 1) * limitNum;

        // Construir where según el estado
        const where = estado !== undefined ? { estado } : {};

        // Obtener membresías y total
        const [memberships, total] = await Promise.all([
            Membership.findAll({
                where,
                limit: limitNum,
                offset: offset,
                order: [['codigo', 'ASC']], // Always order by codigo first
                attributes: [
                    'id',
                    'codigo',
                    'nombre',
                    'descripcion',
                    'dias_acceso',
                    'vigencia_dias',
                    'precio',
                    'estado',
                    'fecha_creacion'
                ]
            }),
            Membership.count({ where })
        ]);

        if (memberships.length === 0) {
            res.status(404).json({
                status: 'warning',
                message: 'No se encontraron membresías',
                data: {
                    total: 0,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: 0,
                    memberships: []
                }
            });
        }

        // Transformar los datos para la respuesta
        const membershipsList = memberships.map(membership => ({
            ...membership.toJSON(),
            estado: membership.estado ? 'Activo' : 'Inactivo',
            acceso: `${membership.dias_acceso}/${membership.vigencia_dias} días`,
            precio_formato: new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP'
            }).format(membership.precio)
        }));

        res.json({
            status: 'success',
            message: `Se encontraron ${total} membresías`,
            data: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
                memberships: membershipsList
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: 'Parámetros de consulta inválidos',
                errors: error.errors
            });
            return;
        }
        next(error);
    }
};

// Buscar membresías
export const searchMemberships = async (req: Request<{}, {}, {}, SearchParams>, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { 
            codigo,
            nombre,
            descripcion,
            estado,
            page = '1',
            limit = '10',
            orderBy = 'nombre',
            direction = 'ASC'
        } = searchMembershipSchema.parse(req.query);

        // Configurar paginación
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const offset = (pageNum - 1) * limitNum;

        // Validar campo de ordenamiento
        const validOrderFields = ['codigo', 'nombre', 'precio', 'dias_acceso', 'vigencia_dias'];
        const validOrderField = validOrderFields.includes(orderBy) ? orderBy : 'nombre';

        // Construir condiciones de búsqueda
        const whereConditions: any = {};

        if (codigo) {
            whereConditions.codigo = {
                [Op.iLike]: `${codigo}%`
            };
        }

        if (nombre) {
            whereConditions.nombre = {
                [Op.iLike]: `%${nombre}%`
            };
        }

        if (descripcion) {
            whereConditions.descripcion = {
                [Op.iLike]: `%${descripcion}%`
            };
        }

        if (estado !== undefined) {
            whereConditions.estado = estado;
        }

        // Realizar búsqueda
        const [memberships, total] = await Promise.all([
            Membership.findAll({
                where: whereConditions,
                limit: limitNum,
                offset: offset,
                order: [[validOrderField, direction]],
                attributes: [
                    'id',
                    'codigo',
                    'nombre',
                    'descripcion',
                    'dias_acceso',
                    'vigencia_dias',
                    'precio',
                    'estado'
                ]
            }),
            Membership.count({ where: whereConditions })
        ]);

        // Transformar los datos para la respuesta
        const membershipsList = memberships.map(membership => ({
            ...membership.toJSON(),
            estado: membership.estado ? 'Activo' : 'Inactivo',
            acceso: `${membership.dias_acceso}/${membership.vigencia_dias} días`
        }));

        res.json({
            status: 'success',
            message: 'Búsqueda realizada exitosamente',
            data: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
                memberships: membershipsList
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: 'Parámetros de búsqueda inválidos',
                errors: error.errors
            });
            return;
        }
        next(error);
    }
};

// Crear nueva membresía
export const createMembership = async (req: Request<{}, {}, CreateMembershipData>, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        // Validar datos de entrada
        const membershipData = createMembershipSchema.parse(req.body);

        // Validar que vigencia_dias sea mayor o igual a dias_acceso
        if (membershipData.vigencia_dias < membershipData.dias_acceso) {
            return res.status(400).json({
                status: 'error',
                message: 'Los días de vigencia deben ser mayores o iguales a los días de acceso'
            });
        }

        // Verificar si ya existe una membresía con el mismo nombre
        const existingMembership = await Membership.findOne({
            where: { nombre: membershipData.nombre }
        });

        if (existingMembership) {
            return res.status(400).json({
                status: 'error',
                message: 'Ya existe una membresía con este nombre'
            });
        }

        // Generar código único
        const codigo = await generateMembershipCode();

        // Crear la membresía
        const newMembership = await Membership.create({
            ...membershipData,
            fecha_creacion: new Date(),
            estado: true,
            codigo
        });

        // Obtener la membresía creada sin campos sensibles
        const membership = await Membership.findByPk(newMembership.id, {
            attributes: [
                'id',
                'codigo',
                'nombre',
                'descripcion',
                'dias_acceso',
                'vigencia_dias',
                'precio',
                'estado',
                'fecha_creacion'
            ]
        });

        return res.status(201).json({
            status: 'success',
            message: 'Membresía creada exitosamente',
            data: {
                membership: {
                    ...membership?.toJSON(),
                    estado: 'Activo',
                    acceso: `${membership?.dias_acceso}/${membership?.vigencia_dias} días`
                }
            }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                status: 'error',
                message: 'Datos de membresía inválidos',
                errors: error.errors.map(err => ({
                    campo: err.path.join('.'),
                    mensaje: err.message
                }))
            });
        }
        next(error);
    }
};

// Actualizar membresía
export const updateMembership = async (
    req: Request<{ id: string }, {}, UpdateMembershipData>,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        // Validar ID
        const { id } = idSchema.parse({ id: req.params.id });

        // Validar datos de actualización
        const membershipData = updateMembershipSchema.parse(req.body);

        // Buscar la membresía
        const membership = await Membership.findByPk(id);
        if (!membership) {
            return res.status(404).json({
                status: 'error',
                message: 'Membresía no encontrada'
            });
        }

        // Validar que vigencia_dias sea mayor o igual a dias_acceso
        if (membershipData.vigencia_dias < membershipData.dias_acceso) {
            return res.status(400).json({
                status: 'error',
                message: 'Los días de vigencia deben ser mayores o iguales a los días de acceso'
            });
        }

        // Verificar si el nuevo nombre ya existe (excluyendo la membresía actual)
        if (membershipData.nombre !== membership.nombre) {
            const existingMembership = await Membership.findOne({
                where: {
                    nombre: membershipData.nombre,
                    id: { [Op.ne]: id }
                }
            });

            if (existingMembership) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Ya existe otra membresía con este nombre'
                });
            }
        }

        // Actualizar la membresía
        await membership.update(membershipData);

        // Obtener la membresía actualizada
        const updatedMembership = await Membership.findByPk(id, {
            attributes: [
                'id',
                'codigo',
                'nombre',
                'descripcion',
                'dias_acceso',
                'vigencia_dias',
                'precio',
                'estado',
                'fecha_creacion'
            ]
        });

        return res.json({
            status: 'success',
            message: 'Membresía actualizada exitosamente',
            data: {
                membership: {
                    ...updatedMembership?.toJSON(),
                    estado: updatedMembership?.estado ? 'Activo' : 'Inactivo',
                    acceso: `${updatedMembership?.dias_acceso}/${updatedMembership?.vigencia_dias} días`
                }
            }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                status: 'error',
                message: 'Datos de membresía inválidos',
                errors: error.errors.map(err => ({
                    campo: err.path.join('.'),
                    mensaje: err.message
                }))
            });
        }
        next(error);
    }
};

// Desactivar membresía
export const deactivateMembership = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        // Validar ID
        const { id } = idSchema.parse({ id: req.params.id });

        // Buscar la membresía
        const membership = await Membership.findByPk(id);
        if (!membership) {
            return res.status(404).json({
                status: 'error',
                message: 'Membresía no encontrada'
            });
        }

        // Verificar si ya está desactivada
        if (!membership.estado) {
            return res.status(400).json({
                status: 'error',
                message: 'La membresía ya está desactivada'
            });
        }

        /* // Verificar si hay contratos activos
        const activeContracts = await Contract.findOne({
            where: {
                id_membresia: id,
                estado: true,
                fecha_fin: {
                    [Op.gt]: new Date() // fecha_fin mayor que la fecha actual
                }
            }
        }); 

        if (activeContracts) {
            return res.status(400).json({
                status: 'error',
                message: 'No se puede desactivar la membresía porque tiene contratos activos'
            });
        }*/

        // Desactivar la membresía
        await membership.update({ 
            estado: false
        });

        // Obtener la membresía actualizada
        const updatedMembership = await Membership.findByPk(id, {
            attributes: [
                'id',
                'codigo',
                'nombre',
                'descripcion',
                'dias_acceso',
                'vigencia_dias',
                'precio',
                'estado',
                'fecha_creacion'
            ]
        });

        return res.json({
            status: 'success',
            message: 'Membresía desactivada exitosamente',
            data: {
                membership: {
                    ...updatedMembership?.toJSON(),
                    estado: 'Inactivo',
                    acceso: `${updatedMembership?.dias_acceso}/${updatedMembership?.vigencia_dias} días`
                }
            }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                status: 'error',
                message: 'ID de membresía inválido',
                errors: error.errors
            });
        }
        next(error);
    }
};

// Obtener detalles de una membresía
export const getMembershipDetails = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        // Validar ID
        const { id } = idSchema.parse({ id: req.params.id });

        // Buscar la membresía con todos sus detalles
        const membership = await Membership.findByPk(id, {
            attributes: [
                'id',
                'codigo',
                'nombre',
                'descripcion',
                'dias_acceso',
                'vigencia_dias',
                'precio',
                'estado',
                'fecha_creacion'
            ]
        });

        if (!membership) {
            return res.status(404).json({
                status: 'error',
                message: 'Membresía no encontrada'
            });
        }

        // Formatear la respuesta
        const membershipDetails = {
            ...membership.toJSON(),
            estado: membership.estado ? 'Activo' : 'Inactivo',
            acceso: `${membership.dias_acceso}/${membership.vigencia_dias} días`,
            precio_formato: new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP'
            }).format(membership.precio)
        };

        return res.json({
            status: 'success',
            message: 'Detalles de membresía obtenidos exitosamente',
            data: {
                membership: membershipDetails
            }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                status: 'error',
                message: 'ID de membresía inválido',
                errors: error.errors
            });
        }
        next(error);
    }
};

// Reactivar membresía
export const reactivateMembership = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        // Validar ID
        const { id } = idSchema.parse({ id: req.params.id });

        // Buscar la membresía
        const membership = await Membership.findByPk(id);
        if (!membership) {
            return res.status(404).json({
                status: 'error',
                message: 'Membresía no encontrada'
            });
        }

        // Verificar si ya está activa
        if (membership.estado) {
            return res.status(400).json({
                status: 'error',
                message: 'La membresía ya está activa'
            });
        }

        // Reactivar la membresía
        await membership.update({ 
            estado: true
        });

        // Obtener la membresía actualizada
        const updatedMembership = await Membership.findByPk(id, {
            attributes: [
                'id',
                'codigo',
                'nombre',
                'descripcion',
                'dias_acceso',
                'vigencia_dias',
                'precio',
                'estado',
                'fecha_creacion'
            ]
        });

        return res.json({
            status: 'success',
            message: 'Membresía reactivada exitosamente',
            data: {
                membership: {
                    ...updatedMembership?.toJSON(),
                    estado: 'Activo',
                    acceso: `${updatedMembership?.dias_acceso}/${updatedMembership?.vigencia_dias} días`
                }
            }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                status: 'error',
                message: 'ID de membresía inválido',
                errors: error.errors
            });
        }
        next(error);
    }
};

