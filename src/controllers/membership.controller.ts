import { Request, Response, NextFunction } from 'express';
import { Op, fn, col } from 'sequelize';
import Membership from '../models/membership';
import Contract from '../models/contract';
import { z } from 'zod';
import sequelize from '../config/db';
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
import ApiResponse from '../utils/apiResponse';

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

// Esquema de validación para estadísticas de membresías
const membershipStatsQuerySchema = z.object({
    period: z.enum(['daily', 'monthly', 'yearly', 'custom']).optional().default('monthly'),
    date: z.string().optional(),
    month: z.string().optional(),
    year: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional()
});

// Obtener todas las membresías con paginación
export const getMemberships = async (req: Request<{}, {}, {}, QueryParams>, res: Response, next: NextFunction): Promise<void> => {
    try {
        const {
            page = '1',
            limit = '10',
            orderBy = 'codigo',
            direction = 'ASC',
            
        } = listMembershipSchema.parse(req.query);

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const offset = (pageNum - 1) * limitNum;

        const validOrderFields = ['id', 'codigo', 'nombre', 'precio', 'dias_acceso', 'vigencia_dias'];
        const validOrderField = validOrderFields.includes(orderBy) ? orderBy : 'codigo';

        const [memberships, total] = await Promise.all([
            Membership.findAll({
                limit: limitNum,
                offset: offset,
                order: [
                    [sequelize.literal('CAST(SUBSTRING(codigo, 2) AS INTEGER)'), direction],
                    ['codigo', direction]
                ],
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
            Membership.count()
        ]);

        // Transformar los datos para la respuesta
        const membershipsList = memberships.map(membership => ({
            ...membership.toJSON(),
            estado: membership.estado,
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
            estado: membership.estado,
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
                    estado: membership?.estado,
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
                    estado: updatedMembership?.estado,
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
export const deactivateMembership = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const { id } = idSchema.parse({ id: req.params.id });
        const adminId = req.user?.id;

        if (!adminId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }

        // Buscar membresía
        const membership = await Membership.findByPk(id);
        if (!membership) {
            return res.status(404).json({
                status: 'error',
                message: 'Membresía no encontrada'
            });
        }

        // Verificar si ya está inactiva
        if (!membership.estado) {
            return res.status(400).json({
                status: 'error',
                message: 'La membresía ya está inactiva'
            });
        }

        // Verificar si hay contratos activos
        const activeContracts = await Contract.findOne({
            where: {
                id_membresia: membership.id,
                estado: 'Activo'
            }
        });

        if (activeContracts) {
            return res.status(400).json({
                status: 'error',
                message: 'No se puede desactivar la membresía porque tiene contratos activos'
            });
        }

        // Desactivar la membresía
        membership.estado = false;
        await membership.save();

        return res.status(200).json({
            status: 'success',
            message: 'Membresía desactivada exitosamente'
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
            estado: membership.estado,
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
                    estado: updatedMembership?.estado,
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

// Get membership statistics
export const getMembershipStats = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        console.log('🔍 Membership Stats - Request params:', req.query);
        
        const { period, date, month, year, dateFrom, dateTo } = membershipStatsQuerySchema.parse(req.query);
        
        let startDate: Date;
        let endDate: Date;
        
        // Configurar fechas según el período
        if (period === 'daily') {
            const targetDate = date ? new Date(date) : new Date();
            startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
            endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        } else if (period === 'monthly') {
            const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();
            const targetYear = year ? parseInt(year) : new Date().getFullYear();
            startDate = new Date(targetYear, targetMonth, 1);
            endDate = new Date(targetYear, targetMonth + 1, 0);
        } else if (period === 'yearly') {
            const targetYear = year ? parseInt(year) : new Date().getFullYear();
            startDate = new Date(targetYear, 0, 1);
            endDate = new Date(targetYear, 11, 31);
        } else { // custom
            if (!dateFrom || !dateTo) {
                return ApiResponse.error(res, "Para el período 'custom', se requieren 'dateFrom' y 'dateTo'.", 400);
            }
            startDate = new Date(dateFrom);
            endDate = new Date(dateTo);
            // Asegurarse de que endDate incluya todo el día
            endDate.setHours(23, 59, 59, 999);
        }

        console.log('📅 Membership Stats - Date range:', { startDate, endDate, period });

        // Obtener estadísticas básicas de forma segura
        const [
            totalMemberships,
            activeMemberships,
            inactiveMemberships,
            newMemberships
        ] = await Promise.all([
            // Total membresías
            Membership.count().catch(error => {
                console.error('Error counting total memberships:', error);
                return 0;
            }),
            
            // Membresías activas
            Membership.count({
                where: { estado: true }
            }).catch(error => {
                console.error('Error counting active memberships:', error);
                return 0;
            }),
            
            // Membresías inactivas
            Membership.count({
                where: { estado: false }
            }).catch(error => {
                console.error('Error counting inactive memberships:', error);
                return 0;
            }),
            
            // Nuevas membresías en el período
            Membership.count({
                where: {
                    fecha_creacion: {
                        [Op.between]: [startDate, endDate]
                    }
                }
            }).catch(error => {
                console.error('Error counting new memberships:', error);
                return 0;
            })
        ]);

        console.log('📊 Membership Stats - Basic counts:', {
            totalMemberships,
            activeMemberships,
            inactiveMemberships,
            newMemberships
        });

        // Definir tipo para las membresías populares
        interface PopularMembership {
            id: number;
            nombre: string;
            precio: number;
            activeContracts: number;
        }

        // Obtener membresías populares de forma segura
        let popularMemberships: PopularMembership[] = [];
        try {
            const membershipsWithContracts = await Membership.findAll({
                attributes: [
                    'id',
                    'nombre',
                    'precio',
                    [
                        fn('COUNT', col('contratos.id')),
                        'activeContracts'
                    ]
                ],
                include: [{
                    model: Contract,
                    as: 'contratos',
                    where: {
                        estado: 'Activo',
                        fecha_inicio: { [Op.lte]: new Date() },
                        fecha_fin: { [Op.gte]: new Date() }
                    },
                    attributes: [],
                    required: false
                }],
                group: ['Membership.id'],
                order: [[fn('COUNT', col('contratos.id')), 'DESC']],
                limit: 10,
                raw: true
            });

            // Procesar el resultado para obtener el conteo
            popularMemberships = membershipsWithContracts.map((membership: any) => ({
                id: membership.id,
                nombre: membership.nombre,
                precio: membership.precio,
                activeContracts: parseInt(membership.activeContracts) || 0
            }));

            console.log('🔥 Membership Stats - Popular memberships found:', popularMemberships.length);
        } catch (error) {
            console.error('Error fetching popular memberships:', error);
            // Fallback: obtener solo las membresías sin conteo
            try {
                const simpleMemberships = await Membership.findAll({
                    attributes: ['id', 'nombre', 'precio'],
                    where: { estado: true },
                    limit: 5,
                    order: [['nombre', 'ASC']]
                });
                popularMemberships = simpleMemberships.map((membership: any) => ({
                    id: membership.id,
                    nombre: membership.nombre,
                    precio: membership.precio,
                    activeContracts: 0
                }));
            } catch (fallbackError) {
                console.error('Fallback error for popular memberships:', fallbackError);
                popularMemberships = [];
            }
        }

        const stats = {
            totalMemberships,
            activeMemberships,
            inactiveMemberships,
            newMemberships,
            popularMemberships,
            period: {
                type: period,
                startDate,
                endDate
            }
        };

        console.log('✅ Membership Stats - Final response:', {
            ...stats,
            popularMemberships: `${stats.popularMemberships.length} memberships`
        });

        return ApiResponse.success(
            res,
            stats,
            "Estadísticas de membresías obtenidas exitosamente"
        );
    } catch (error) {
        console.error('❌ Membership Stats - Fatal error:', error);
        return ApiResponse.error(
            res,
            "Error al obtener estadísticas de membresías",
            500,
            process.env.NODE_ENV === 'development' ? error : undefined
        );
    }
};

