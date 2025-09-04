"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyMembershipBenefits = exports.getMyMembershipHistory = exports.getMyActiveMembership = exports.getMembershipStats = exports.reactivateMembership = exports.getMembershipDetails = exports.deactivateMembership = exports.updateMembership = exports.createMembership = exports.searchMemberships = exports.getMemberships = void 0;
const sequelize_1 = require("sequelize");
const membership_1 = __importDefault(require("../models/membership"));
const contract_1 = __importDefault(require("../models/contract"));
const person_model_1 = __importDefault(require("../models/person.model"));
const user_1 = __importDefault(require("../models/user"));
const zod_1 = require("zod");
const db_1 = __importDefault(require("../config/db"));
const membership_validator_1 = require("../validators/membership.validator");
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
// Generar código único de membresía
const generateMembershipCode = () => __awaiter(void 0, void 0, void 0, function* () {
    const lastMembership = yield membership_1.default.findOne({
        order: [['codigo', 'DESC']],
    });
    const lastNumber = lastMembership
        ? parseInt(lastMembership.codigo.substring(1))
        : 0;
    return `M${String(lastNumber + 1).padStart(3, '0')}`;
});
// Esquema de validación para estadísticas de membresías
const membershipStatsQuerySchema = zod_1.z.object({
    period: zod_1.z.enum(['daily', 'monthly', 'yearly', 'custom']).optional().default('monthly'),
    date: zod_1.z.string().optional(),
    month: zod_1.z.string().optional(),
    year: zod_1.z.string().optional(),
    dateFrom: zod_1.z.string().optional(),
    dateTo: zod_1.z.string().optional()
});
// Obtener todas las membresías con paginación
const getMemberships = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = '1', limit = '10', orderBy = 'codigo', direction = 'ASC', } = membership_validator_1.listMembershipSchema.parse(req.query);
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const offset = (pageNum - 1) * limitNum;
        const validOrderFields = ['id', 'codigo', 'nombre', 'precio', 'dias_acceso', 'vigencia_dias'];
        const validOrderField = validOrderFields.includes(orderBy) ? orderBy : 'codigo';
        const [memberships, total] = yield Promise.all([
            membership_1.default.findAll({
                limit: limitNum,
                offset: offset,
                order: [
                    [db_1.default.literal('CAST(SUBSTRING(codigo, 2) AS INTEGER)'), direction],
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
            membership_1.default.count()
        ]);
        // Transformar los datos para la respuesta
        const membershipsList = memberships.map(membership => (Object.assign(Object.assign({}, membership.toJSON()), { estado: membership.estado, acceso: `${membership.dias_acceso}/${membership.vigencia_dias} días`, precio_formato: new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP'
            }).format(membership.precio) })));
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
    }
    catch (error) {
        next(error);
    }
});
exports.getMemberships = getMemberships;
// Buscar membresías
const searchMemberships = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { codigo, nombre, descripcion, estado, page = '1', limit = '10', orderBy = 'nombre', direction = 'ASC' } = membership_validator_1.searchMembershipSchema.parse(req.query);
        // Configurar paginación
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const offset = (pageNum - 1) * limitNum;
        // Validar campo de ordenamiento
        const validOrderFields = ['codigo', 'nombre', 'precio', 'dias_acceso', 'vigencia_dias'];
        const validOrderField = validOrderFields.includes(orderBy) ? orderBy : 'nombre';
        // Construir condiciones de búsqueda
        const whereConditions = {};
        if (codigo) {
            whereConditions.codigo = {
                [sequelize_1.Op.iLike]: `${codigo}%`
            };
        }
        if (nombre) {
            whereConditions.nombre = {
                [sequelize_1.Op.iLike]: `%${nombre}%`
            };
        }
        if (descripcion) {
            whereConditions.descripcion = {
                [sequelize_1.Op.iLike]: `%${descripcion}%`
            };
        }
        if (estado !== undefined) {
            whereConditions.estado = estado;
        }
        // Realizar búsqueda
        const [memberships, total] = yield Promise.all([
            membership_1.default.findAll({
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
            membership_1.default.count({ where: whereConditions })
        ]);
        // Transformar los datos para la respuesta
        const membershipsList = memberships.map(membership => (Object.assign(Object.assign({}, membership.toJSON()), { estado: membership.estado, acceso: `${membership.dias_acceso}/${membership.vigencia_dias} días` })));
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: 'Parámetros de búsqueda inválidos',
                errors: error.errors
            });
            return;
        }
        next(error);
    }
});
exports.searchMemberships = searchMemberships;
// Crear nueva membresía
const createMembership = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validar datos de entrada
        const membershipData = membership_validator_1.createMembershipSchema.parse(req.body);
        // Validar que vigencia_dias sea mayor o igual a dias_acceso
        if (membershipData.vigencia_dias < membershipData.dias_acceso) {
            return res.status(400).json({
                status: 'error',
                message: 'Los días de vigencia deben ser mayores o iguales a los días de acceso'
            });
        }
        // Verificar si ya existe una membresía con el mismo nombre
        const existingMembership = yield membership_1.default.findOne({
            where: { nombre: membershipData.nombre }
        });
        if (existingMembership) {
            return res.status(400).json({
                status: 'error',
                message: 'Ya existe una membresía con este nombre'
            });
        }
        // Generar código único
        const codigo = yield generateMembershipCode();
        // Crear la membresía
        const newMembership = yield membership_1.default.create(Object.assign(Object.assign({}, membershipData), { fecha_creacion: new Date(), estado: true, codigo }));
        // Obtener la membresía creada sin campos sensibles
        const membership = yield membership_1.default.findByPk(newMembership.id, {
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
                membership: Object.assign(Object.assign({}, membership === null || membership === void 0 ? void 0 : membership.toJSON()), { estado: membership === null || membership === void 0 ? void 0 : membership.estado, acceso: `${membership === null || membership === void 0 ? void 0 : membership.dias_acceso}/${membership === null || membership === void 0 ? void 0 : membership.vigencia_dias} días` })
            }
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
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
});
exports.createMembership = createMembership;
// Actualizar membresía
const updateMembership = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validar ID
        const { id } = membership_validator_1.idSchema.parse({ id: req.params.id });
        // Validar datos de actualización
        const membershipData = membership_validator_1.updateMembershipSchema.parse(req.body);
        // Buscar la membresía
        const membership = yield membership_1.default.findByPk(id);
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
            const existingMembership = yield membership_1.default.findOne({
                where: {
                    nombre: membershipData.nombre,
                    id: { [sequelize_1.Op.ne]: id }
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
        yield membership.update(membershipData);
        // Obtener la membresía actualizada
        const updatedMembership = yield membership_1.default.findByPk(id, {
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
                membership: Object.assign(Object.assign({}, updatedMembership === null || updatedMembership === void 0 ? void 0 : updatedMembership.toJSON()), { estado: updatedMembership === null || updatedMembership === void 0 ? void 0 : updatedMembership.estado, acceso: `${updatedMembership === null || updatedMembership === void 0 ? void 0 : updatedMembership.dias_acceso}/${updatedMembership === null || updatedMembership === void 0 ? void 0 : updatedMembership.vigencia_dias} días` })
            }
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
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
});
exports.updateMembership = updateMembership;
// Desactivar membresía
const deactivateMembership = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = membership_validator_1.idSchema.parse({ id: req.params.id });
        const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!adminId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }
        // Buscar membresía
        const membership = yield membership_1.default.findByPk(id);
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
        const activeContracts = yield contract_1.default.findOne({
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
        yield membership.save();
        return res.status(200).json({
            status: 'success',
            message: 'Membresía desactivada exitosamente'
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                status: 'error',
                message: 'ID de membresía inválido',
                errors: error.errors
            });
        }
        next(error);
    }
});
exports.deactivateMembership = deactivateMembership;
// Obtener detalles de una membresía
const getMembershipDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validar ID
        const { id } = membership_validator_1.idSchema.parse({ id: req.params.id });
        // Buscar la membresía con todos sus detalles
        const membership = yield membership_1.default.findByPk(id, {
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
        const membershipDetails = Object.assign(Object.assign({}, membership.toJSON()), { estado: membership.estado, acceso: `${membership.dias_acceso}/${membership.vigencia_dias} días`, precio_formato: new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP'
            }).format(membership.precio) });
        return res.json({
            status: 'success',
            message: 'Detalles de membresía obtenidos exitosamente',
            data: {
                membership: membershipDetails
            }
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                status: 'error',
                message: 'ID de membresía inválido',
                errors: error.errors
            });
        }
        next(error);
    }
});
exports.getMembershipDetails = getMembershipDetails;
// Reactivar membresía
const reactivateMembership = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validar ID
        const { id } = membership_validator_1.idSchema.parse({ id: req.params.id });
        // Buscar la membresía
        const membership = yield membership_1.default.findByPk(id);
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
        yield membership.update({
            estado: true
        });
        // Obtener la membresía actualizada
        const updatedMembership = yield membership_1.default.findByPk(id, {
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
                membership: Object.assign(Object.assign({}, updatedMembership === null || updatedMembership === void 0 ? void 0 : updatedMembership.toJSON()), { estado: updatedMembership === null || updatedMembership === void 0 ? void 0 : updatedMembership.estado, acceso: `${updatedMembership === null || updatedMembership === void 0 ? void 0 : updatedMembership.dias_acceso}/${updatedMembership === null || updatedMembership === void 0 ? void 0 : updatedMembership.vigencia_dias} días` })
            }
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                status: 'error',
                message: 'ID de membresía inválido',
                errors: error.errors
            });
        }
        next(error);
    }
});
exports.reactivateMembership = reactivateMembership;
// Get membership statistics
const getMembershipStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('🔍 Membership Stats - Request params:', req.query);
        const { period, date, month, year, dateFrom, dateTo } = membershipStatsQuerySchema.parse(req.query);
        let startDate;
        let endDate;
        // Configurar fechas según el período
        if (period === 'daily') {
            const targetDate = date ? new Date(date) : new Date();
            startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
            endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        }
        else if (period === 'monthly') {
            const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();
            const targetYear = year ? parseInt(year) : new Date().getFullYear();
            startDate = new Date(targetYear, targetMonth, 1);
            endDate = new Date(targetYear, targetMonth + 1, 0);
        }
        else if (period === 'yearly') {
            const targetYear = year ? parseInt(year) : new Date().getFullYear();
            startDate = new Date(targetYear, 0, 1);
            endDate = new Date(targetYear, 11, 31);
        }
        else { // custom
            if (!dateFrom || !dateTo) {
                return apiResponse_1.default.error(res, "Para el período 'custom', se requieren 'dateFrom' y 'dateTo'.", 400);
            }
            startDate = new Date(dateFrom);
            endDate = new Date(dateTo);
            // Asegurarse de que endDate incluya todo el día
            endDate.setHours(23, 59, 59, 999);
        }
        console.log('📅 Membership Stats - Date range:', { startDate, endDate, period });
        // Obtener estadísticas básicas de forma segura
        const [totalMemberships, activeMemberships, inactiveMemberships, newMemberships] = yield Promise.all([
            // Total membresías
            membership_1.default.count().catch(error => {
                console.error('Error counting total memberships:', error);
                return 0;
            }),
            // Membresías activas
            membership_1.default.count({
                where: { estado: true }
            }).catch(error => {
                console.error('Error counting active memberships:', error);
                return 0;
            }),
            // Membresías inactivas
            membership_1.default.count({
                where: { estado: false }
            }).catch(error => {
                console.error('Error counting inactive memberships:', error);
                return 0;
            }),
            // Nuevas membresías en el período
            membership_1.default.count({
                where: {
                    fecha_creacion: {
                        [sequelize_1.Op.between]: [startDate, endDate]
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
        // Obtener membresías populares de forma segura
        let popularMemberships = [];
        try {
            const membershipsWithContracts = yield membership_1.default.findAll({
                attributes: [
                    'id',
                    'nombre',
                    'precio',
                    [
                        (0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('contratos.id')),
                        'activeContracts'
                    ]
                ],
                include: [{
                        model: contract_1.default,
                        as: 'contratos',
                        where: {
                            estado: 'Activo',
                            fecha_inicio: { [sequelize_1.Op.lte]: new Date() },
                            fecha_fin: { [sequelize_1.Op.gte]: new Date() }
                        },
                        attributes: [],
                        required: false
                    }],
                group: ['Membership.id'],
                order: [[(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('contratos.id')), 'DESC']],
                limit: 10,
                raw: true
            });
            // Procesar el resultado para obtener el conteo
            popularMemberships = membershipsWithContracts.map((membership) => ({
                id: membership.id,
                nombre: membership.nombre,
                precio: membership.precio,
                activeContracts: parseInt(membership.activeContracts) || 0
            }));
            console.log('🔥 Membership Stats - Popular memberships found:', popularMemberships.length);
        }
        catch (error) {
            console.error('Error fetching popular memberships:', error);
            // Fallback: obtener solo las membresías sin conteo
            try {
                const simpleMemberships = yield membership_1.default.findAll({
                    attributes: ['id', 'nombre', 'precio'],
                    where: { estado: true },
                    limit: 5,
                    order: [['nombre', 'ASC']]
                });
                popularMemberships = simpleMemberships.map((membership) => ({
                    id: membership.id,
                    nombre: membership.nombre,
                    precio: membership.precio,
                    activeContracts: 0
                }));
            }
            catch (fallbackError) {
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
        console.log('✅ Membership Stats - Final response:', Object.assign(Object.assign({}, stats), { popularMemberships: `${stats.popularMemberships.length} memberships` }));
        return apiResponse_1.default.success(res, stats, "Estadísticas de membresías obtenidas exitosamente");
    }
    catch (error) {
        console.error('❌ Membership Stats - Fatal error:', error);
        return apiResponse_1.default.error(res, "Error al obtener estadísticas de membresías", 500, process.env.NODE_ENV === 'development' ? error : undefined);
    }
});
exports.getMembershipStats = getMembershipStats;
// Obtener membresía activa del cliente autenticado
const getMyActiveMembership = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return apiResponse_1.default.error(res, "Usuario no autenticado", 401);
        }
        // Buscar el contrato activo del usuario con su membresía
        const activeContract = yield contract_1.default.findOne({
            where: {
                estado: 'Activo',
                fecha_inicio: { [sequelize_1.Op.lte]: new Date() },
                fecha_fin: { [sequelize_1.Op.gte]: new Date() }
            },
            include: [
                {
                    model: membership_1.default,
                    as: 'membresia',
                    attributes: [
                        'id',
                        'codigo',
                        'nombre',
                        'descripcion',
                        'dias_acceso',
                        'vigencia_dias',
                        'precio'
                    ]
                },
                {
                    model: person_model_1.default,
                    as: 'persona',
                    include: [{
                            model: user_1.default,
                            as: 'usuario',
                            where: { id: userId },
                            attributes: ['id', 'nombre', 'apellido']
                        }]
                }
            ]
        });
        if (!activeContract) {
            return apiResponse_1.default.error(res, "No tienes una membresía activa", 404);
        }
        const membership = activeContract.membresia;
        const now = new Date();
        const fechaInicio = new Date(activeContract.fecha_inicio);
        const fechaFin = new Date(activeContract.fecha_fin);
        // Calcular días transcurridos y restantes
        const diasTranscurridos = Math.floor((now.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
        const diasRestantes = Math.max(0, Math.floor((fechaFin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        // Calcular porcentaje de uso
        const totalDias = Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
        const porcentajeUso = Math.min(100, Math.max(0, (diasTranscurridos / totalDias) * 100));
        // Determinar estado de la membresía
        let estadoMembresia = 'Activa';
        if (diasRestantes <= 7) {
            estadoMembresia = 'Próxima a vencer';
        }
        else if (diasRestantes <= 0) {
            estadoMembresia = 'Vencida';
        }
        const membershipStatus = {
            contrato: {
                id: activeContract.id,
                codigo: activeContract.codigo,
                estado: activeContract.estado,
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin
            },
            membresia: Object.assign(Object.assign({}, membership === null || membership === void 0 ? void 0 : membership.toJSON()), { precio_formato: new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP'
                }).format((membership === null || membership === void 0 ? void 0 : membership.precio) || 0) }),
            estado: {
                estado_actual: estadoMembresia,
                dias_transcurridos: diasTranscurridos,
                dias_restantes: diasRestantes,
                porcentaje_uso: Math.round(porcentajeUso),
                acceso_disponible: diasRestantes > 0
            }
        };
        return apiResponse_1.default.success(res, membershipStatus, "Estado de membresía obtenido exitosamente");
    }
    catch (error) {
        console.error('Error getting my active membership:', error);
        return apiResponse_1.default.error(res, "Error al obtener el estado de la membresía", 500);
    }
});
exports.getMyActiveMembership = getMyActiveMembership;
// Obtener historial de membresías del cliente
const getMyMembershipHistory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { page = '1', limit = '10' } = req.query;
        if (!userId) {
            return apiResponse_1.default.error(res, "Usuario no autenticado", 401);
        }
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const offset = (pageNum - 1) * limitNum;
        // Buscar todos los contratos del usuario (activos e inactivos)
        const [contracts, total] = yield Promise.all([
            contract_1.default.findAll({
                include: [
                    {
                        model: membership_1.default,
                        as: 'membresia',
                        attributes: [
                            'id',
                            'codigo',
                            'nombre',
                            'descripcion',
                            'precio'
                        ]
                    },
                    {
                        model: person_model_1.default,
                        as: 'persona',
                        include: [{
                                model: user_1.default,
                                as: 'usuario',
                                where: { id: userId },
                                attributes: ['id', 'nombre', 'apellido']
                            }]
                    }
                ],
                order: [['fecha_inicio', 'DESC']],
                limit: limitNum,
                offset: offset
            }),
            contract_1.default.count({
                include: [{
                        model: person_model_1.default,
                        as: 'persona',
                        include: [{
                                model: user_1.default,
                                as: 'usuario',
                                where: { id: userId }
                            }]
                    }]
            })
        ]);
        const membershipHistory = contracts.map(contract => {
            var _a, _b, _c, _d;
            const now = new Date();
            const fechaInicio = new Date(contract.fecha_inicio);
            const fechaFin = new Date(contract.fecha_fin);
            let estadoDetallado = contract.estado;
            if (contract.estado === 'Activo' && fechaFin < now) {
                estadoDetallado = 'Vencido';
            }
            else if (contract.estado === 'Activo' && fechaFin > now) {
                const diasRestantes = Math.floor((fechaFin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                if (diasRestantes <= 7) {
                    estadoDetallado = 'Por vencer';
                }
            }
            return {
                contrato_id: contract.id,
                codigo_contrato: contract.codigo,
                membresia: {
                    nombre: (_a = contract.membresia) === null || _a === void 0 ? void 0 : _a.nombre,
                    descripcion: (_b = contract.membresia) === null || _b === void 0 ? void 0 : _b.descripcion,
                    precio: (_c = contract.membresia) === null || _c === void 0 ? void 0 : _c.precio,
                    precio_formato: new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP'
                    }).format(((_d = contract.membresia) === null || _d === void 0 ? void 0 : _d.precio) || 0)
                },
                periodo: {
                    fecha_inicio: fechaInicio,
                    fecha_fin: fechaFin,
                    duracion_dias: Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24))
                },
                estado: contract.estado,
                estado_detallado: estadoDetallado
            };
        });
        return apiResponse_1.default.success(res, {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
            historial: membershipHistory
        }, "Historial de membresías obtenido exitosamente");
    }
    catch (error) {
        console.error('Error getting membership history:', error);
        return apiResponse_1.default.error(res, "Error al obtener el historial de membresías", 500);
    }
});
exports.getMyMembershipHistory = getMyMembershipHistory;
// Obtener beneficios y detalles de la membresía actual
const getMyMembershipBenefits = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return apiResponse_1.default.error(res, "Usuario no autenticado", 401);
        }
        // Buscar el contrato activo del usuario
        const activeContract = yield contract_1.default.findOne({
            where: {
                estado: 'Activo',
                fecha_inicio: { [sequelize_1.Op.lte]: new Date() },
                fecha_fin: { [sequelize_1.Op.gte]: new Date() }
            },
            include: [
                {
                    model: membership_1.default,
                    as: 'membresia'
                },
                {
                    model: person_model_1.default,
                    as: 'persona',
                    include: [{
                            model: user_1.default,
                            as: 'usuario',
                            where: { id: userId }
                        }]
                }
            ]
        });
        if (!activeContract) {
            return apiResponse_1.default.error(res, "No tienes una membresía activa", 404);
        }
        const membership = activeContract.membresia;
        const now = new Date();
        const fechaFin = new Date(activeContract.fecha_fin);
        const diasRestantes = Math.max(0, Math.floor((fechaFin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        const benefits = {
            membresia: {
                nombre: membership === null || membership === void 0 ? void 0 : membership.nombre,
                descripcion: membership === null || membership === void 0 ? void 0 : membership.descripcion,
                acceso_total: `${membership === null || membership === void 0 ? void 0 : membership.dias_acceso}/${membership === null || membership === void 0 ? void 0 : membership.vigencia_dias} días`
            },
            acceso: {
                puede_ingresar: diasRestantes > 0,
                dias_restantes: diasRestantes,
                acceso_hasta: fechaFin
            },
            servicios_incluidos: [
                "Acceso completo al área de pesas",
                "Uso de máquinas cardiovasculares",
                "Acceso a vestidores y duchas",
                "Asesoría básica de entrenamiento"
            ],
            horarios: {
                lunes_viernes: "05:00 AM - 10:00 PM",
                sabados: "06:00 AM - 08:00 PM",
                domingos: "07:00 AM - 06:00 PM",
                festivos: "07:00 AM - 02:00 PM"
            }
        };
        return apiResponse_1.default.success(res, benefits, "Beneficios de membresía obtenidos exitosamente");
    }
    catch (error) {
        console.error('Error getting membership benefits:', error);
        return apiResponse_1.default.error(res, "Error al obtener los beneficios de la membresía", 500);
    }
});
exports.getMyMembershipBenefits = getMyMembershipBenefits;
