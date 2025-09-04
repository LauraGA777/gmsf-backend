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
exports.getMobileDashboardHealthCheck = exports.getMobileDashboardDiagnostic = exports.getMobileDashboardWidget = exports.getMobileDashboardMainMetrics = exports.getMobileDashboardQuickSummary = exports.DashboardMobileController = void 0;
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const date_fns_1 = require("date-fns");
const db_1 = __importDefault(require("../config/db"));
const attendance_1 = __importDefault(require("../models/attendance"));
const contract_1 = __importDefault(require("../models/contract"));
const membership_1 = __importDefault(require("../models/membership"));
const person_model_1 = __importDefault(require("../models/person.model"));
const user_1 = __importDefault(require("../models/user"));
const trainer_1 = __importDefault(require("../models/trainer"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
// Esquema de validación para dashboard móvil
const mobileQuerySchema = zod_1.z.object({
    period: zod_1.z.enum(['today', 'week', 'month']).optional().default('today'),
    compact: zod_1.z.union([
        zod_1.z.boolean(),
        zod_1.z.string().transform((val) => val === 'true' || val === '1'),
        zod_1.z.undefined()
    ]).optional().default(true)
});
class DashboardMobileController {
    // Obtener resumen rápido para móvil (datos más compactos)
    getQuickSummary(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('📱 Dashboard Mobile Quick Summary - Request started');
                console.log('📱 Query params:', req.query);
                const { period, compact } = mobileQuerySchema.parse(req.query);
                console.log('📱 Parsed params:', { period, compact });
                // Obtener métricas principales optimizadas para móvil
                console.log('📱 Starting individual queries with detailed logging...');
                // Query 1: Today Stats
                console.log('📱 Step 1: Getting today stats...');
                let todayStats;
                try {
                    todayStats = yield this.getTodayStats();
                    console.log('✅ Today stats successful:', todayStats);
                }
                catch (err) {
                    console.error('❌ Error in getTodayStats:', err);
                    todayStats = { revenue: 0, newContracts: 0, attendance: 0, activeClients: 0, date: (0, date_fns_1.format)(new Date(), 'dd/MM/yyyy') };
                }
                // Query 2: Quick Counters
                console.log('📱 Step 2: Getting quick counters...');
                let quickCounters;
                try {
                    quickCounters = yield this.getQuickCounters();
                    console.log('✅ Quick counters successful:', quickCounters);
                }
                catch (err) {
                    console.error('❌ Error in getQuickCounters:', err);
                    quickCounters = { users: 0, trainers: 0, clients: 0 };
                }
                // Query 3: Revenue Growth
                console.log('📱 Step 3: Getting revenue growth...');
                let revenueGrowth;
                try {
                    revenueGrowth = yield this.getRevenueGrowth();
                    console.log('✅ Revenue growth successful:', revenueGrowth);
                }
                catch (err) {
                    console.error('❌ Error in getRevenueGrowth:', err);
                    revenueGrowth = { current: 0, previous: 0, growthPercentage: 0, isPositive: true };
                }
                // Query 4: Top Membership
                console.log('📱 Step 4: Getting top membership...');
                let topMembership;
                try {
                    topMembership = yield this.getTopMembership();
                    console.log('✅ Top membership successful:', topMembership);
                }
                catch (err) {
                    console.error('❌ Error in getTopMembership:', err);
                    topMembership = null;
                }
                console.log('📱 All queries completed. Building response...');
                const mobileData = {
                    todayStats,
                    quickCounters,
                    revenueGrowth,
                    topMembership,
                    lastUpdate: new Date().toISOString()
                };
                console.log('✅ Dashboard Mobile Quick Summary - Response ready');
                return apiResponse_1.default.success(res, mobileData, "Resumen rápido móvil obtenido exitosamente");
            }
            catch (error) {
                console.error('❌ Dashboard Mobile Quick Summary - Fatal error:', error);
                console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
                return apiResponse_1.default.error(res, "Error al obtener resumen rápido móvil", 500, {
                    error: error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined,
                    timestamp: new Date().toISOString()
                });
            }
        });
    }
    // Obtener métricas principales del dashboard móvil
    getMainMetrics(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('📱 Dashboard Mobile Main Metrics - Request started');
                const { period } = mobileQuerySchema.parse(req.query);
                // Obtener todas las métricas principales en paralelo
                const [dailyRevenue, membershipsByMonth, popularMembership, quickAccessCounters, weeklyTrends] = yield Promise.all([
                    this.getDailyRevenueWithGrowth(),
                    this.getMembershipsByMonth(),
                    this.getPopularMembership(),
                    this.getQuickAccessCounters(),
                    this.getWeeklyTrends()
                ]);
                const mainMetrics = {
                    dailyRevenue,
                    membershipsByMonth: this.formatForMobile(membershipsByMonth),
                    popularMembership,
                    quickAccessCounters,
                    weeklyTrends,
                    period
                };
                console.log('✅ Dashboard Mobile Main Metrics - Response ready');
                return apiResponse_1.default.success(res, mainMetrics, "Métricas principales móvil obtenidas exitosamente");
            }
            catch (error) {
                console.error('❌ Dashboard Mobile Main Metrics - Fatal error:', error);
                return apiResponse_1.default.error(res, "Error al obtener métricas principales móvil", 500, process.env.NODE_ENV === 'development' ? error : undefined);
            }
        });
    }
    // Obtener estadísticas de hoy (optimizado para móvil)
    getTodayStats() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('📊 Getting today stats...');
                const today = new Date();
                const todayStart = (0, date_fns_1.startOfDay)(today);
                const todayEnd = (0, date_fns_1.endOfDay)(today);
                console.log('📊 Date range:', { todayStart, todayEnd });
                const [todayRevenue, todayContracts, todayAttendance, activeClients] = yield Promise.all([
                    contract_1.default.sum('membresia_precio', {
                        where: {
                            fecha_inicio: { [sequelize_1.Op.between]: [todayStart, todayEnd] },
                            estado: 'Activo'
                        }
                    }).then(result => {
                        console.log('📊 Today revenue query result:', result);
                        return result || 0;
                    }),
                    contract_1.default.count({
                        where: {
                            fecha_inicio: { [sequelize_1.Op.between]: [todayStart, todayEnd] },
                            estado: 'Activo'
                        }
                    }).then(result => {
                        console.log('📊 Today contracts query result:', result);
                        return result;
                    }),
                    attendance_1.default.count({
                        where: {
                            fecha_uso: { [sequelize_1.Op.between]: [todayStart, todayEnd] },
                            estado: 'Activo'
                        }
                    }).then(result => {
                        console.log('📊 Today attendance query result:', result);
                        return result;
                    }),
                    person_model_1.default.count({
                        where: { estado: true }
                    }).then(result => {
                        console.log('📊 Active clients query result:', result);
                        return result;
                    })
                ]);
                const result = {
                    revenue: Number(todayRevenue),
                    newContracts: todayContracts,
                    attendance: todayAttendance,
                    activeClients,
                    date: (0, date_fns_1.format)(today, 'dd/MM/yyyy')
                };
                console.log('✅ Today stats result:', result);
                return result;
            }
            catch (error) {
                console.error('❌ Error getting today stats:', error);
                throw error;
            }
        });
    }
    // Obtener contadores rápidos (formato compacto para móvil)
    getQuickCounters() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('📊 Getting quick counters...');
                const [users, trainers, clients] = yield Promise.all([
                    user_1.default.count({ where: { estado: true } }).then(result => {
                        console.log('📊 Active users query result:', result);
                        return result;
                    }),
                    trainer_1.default.count({ where: { estado: true } }).then(result => {
                        console.log('📊 Active trainers query result:', result);
                        return result;
                    }),
                    person_model_1.default.count({ where: { estado: true } }).then(result => {
                        console.log('📊 Active persons query result:', result);
                        return result;
                    })
                ]);
                const result = { users, trainers, clients };
                console.log('✅ Quick counters result:', result);
                return result;
            }
            catch (error) {
                console.error('❌ Error getting quick counters:', error);
                throw error;
            }
        });
    }
    // Obtener crecimiento de ingresos (últimos 7 días vs 7 días anteriores)
    getRevenueGrowth() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('📊 Getting revenue growth...');
                const today = new Date();
                const sevenDaysAgo = (0, date_fns_1.subDays)(today, 7);
                const fourteenDaysAgo = (0, date_fns_1.subDays)(today, 14);
                console.log('📊 Revenue growth date ranges:', {
                    current: { from: sevenDaysAgo, to: today },
                    previous: { from: fourteenDaysAgo, to: sevenDaysAgo }
                });
                const [currentWeekRevenue, previousWeekRevenue] = yield Promise.all([
                    contract_1.default.sum('membresia_precio', {
                        where: {
                            fecha_inicio: { [sequelize_1.Op.between]: [sevenDaysAgo, today] },
                            estado: 'Activo'
                        }
                    }).then(result => {
                        console.log('📊 Current week revenue:', result);
                        return result || 0;
                    }),
                    contract_1.default.sum('membresia_precio', {
                        where: {
                            fecha_inicio: { [sequelize_1.Op.between]: [fourteenDaysAgo, sevenDaysAgo] },
                            estado: 'Activo'
                        }
                    }).then(result => {
                        console.log('📊 Previous week revenue:', result);
                        return result || 0;
                    })
                ]);
                const growthPercentage = previousWeekRevenue > 0
                    ? ((currentWeekRevenue - previousWeekRevenue) / previousWeekRevenue) * 100
                    : currentWeekRevenue > 0 ? 100 : 0;
                const result = {
                    current: Number(currentWeekRevenue),
                    previous: Number(previousWeekRevenue),
                    growthPercentage: Number(growthPercentage.toFixed(1)),
                    isPositive: growthPercentage >= 0
                };
                console.log('✅ Revenue growth result:', result);
                return result;
            }
            catch (error) {
                console.error('❌ Error getting revenue growth:', error);
                throw error;
            }
        });
    }
    // Obtener membresía top (más vendida) - CORREGIDO Y SIMPLIFICADO
    getTopMembership() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🔍 Getting top membership...');
                // Estrategia 1: Query simplificada para obtener membresía con más contratos
                const topMembershipQuery = `
                SELECT m.id, m.nombre, m.precio, COUNT(c.id) as sales
                FROM membresias m
                LEFT JOIN contratos c ON m.id = c.id_membresia AND c.estado = 'Activo'
                WHERE m.estado = true
                GROUP BY m.id, m.nombre, m.precio
                ORDER BY COUNT(c.id) DESC
                LIMIT 1;
            `;
                const results = yield db_1.default.query(topMembershipQuery, {
                    type: sequelize_1.QueryTypes.SELECT
                });
                console.log('🔍 Top membership query results:', results);
                if (results && results.length > 0) {
                    const result = results[0];
                    console.log('🔍 Processing result:', result);
                    return {
                        name: result.nombre,
                        price: Number(result.precio),
                        sales: Number(result.sales)
                    };
                }
                // Estrategia 2: Si no hay resultados, obtener la primera membresía activa
                console.log('🔍 No query results, getting first active membership...');
                const firstMembership = yield membership_1.default.findOne({
                    where: { estado: true },
                    order: [['id', 'ASC']]
                });
                console.log('🔍 First membership found:', firstMembership ? {
                    id: firstMembership.id,
                    nombre: firstMembership.nombre,
                    precio: firstMembership.precio
                } : null);
                if (firstMembership) {
                    return {
                        name: firstMembership.nombre,
                        price: Number(firstMembership.precio),
                        sales: 0
                    };
                }
                console.log('❌ No memberships found at all');
                return null;
            }
            catch (error) {
                console.error('❌ Error getting top membership:', error);
                console.error('❌ Error details:', error instanceof Error ? error.message : String(error));
                return null;
            }
        });
    }
    // Obtener ingresos diarios con indicador de crecimiento
    getDailyRevenueWithGrowth() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const today = new Date();
                const yesterday = (0, date_fns_1.subDays)(today, 1);
                const todayStart = (0, date_fns_1.startOfDay)(today);
                const todayEnd = (0, date_fns_1.endOfDay)(today);
                const yesterdayStart = (0, date_fns_1.startOfDay)(yesterday);
                const yesterdayEnd = (0, date_fns_1.endOfDay)(yesterday);
                const [todayRevenue, yesterdayRevenue] = yield Promise.all([
                    contract_1.default.sum('membresia_precio', {
                        where: {
                            fecha_inicio: { [sequelize_1.Op.between]: [todayStart, todayEnd] },
                            estado: 'Activo'
                        }
                    }) || 0,
                    contract_1.default.sum('membresia_precio', {
                        where: {
                            fecha_inicio: { [sequelize_1.Op.between]: [yesterdayStart, yesterdayEnd] },
                            estado: 'Activo'
                        }
                    }) || 0
                ]);
                const growthPercentage = yesterdayRevenue > 0
                    ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
                    : todayRevenue > 0 ? 100 : 0;
                return {
                    today: Number(todayRevenue),
                    yesterday: Number(yesterdayRevenue),
                    growthPercentage: Number(growthPercentage.toFixed(1)),
                    isPositiveGrowth: growthPercentage >= 0,
                    date: (0, date_fns_1.format)(today, 'dd/MM/yyyy')
                };
            }
            catch (error) {
                console.error('Error getting daily revenue with growth:', error);
                return {
                    today: 0,
                    yesterday: 0,
                    growthPercentage: 0,
                    isPositiveGrowth: true,
                    date: (0, date_fns_1.format)(new Date(), 'dd/MM/yyyy')
                };
            }
        });
    }
    // Obtener gráfico de membresías por mes (Enero a Junio) - formato móvil
    getMembershipsByMonth() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const currentYear = new Date().getFullYear();
                const months = [
                    { number: 1, name: 'Ene', fullName: 'Enero' },
                    { number: 2, name: 'Feb', fullName: 'Febrero' },
                    { number: 3, name: 'Mar', fullName: 'Marzo' },
                    { number: 4, name: 'Abr', fullName: 'Abril' },
                    { number: 5, name: 'May', fullName: 'Mayo' },
                    { number: 6, name: 'Jun', fullName: 'Junio' }
                ];
                const monthlyData = yield Promise.all(months.map((month) => __awaiter(this, void 0, void 0, function* () {
                    const startDate = new Date(currentYear, month.number - 1, 1);
                    const endDate = new Date(currentYear, month.number, 0);
                    const contractCount = yield contract_1.default.count({
                        where: {
                            fecha_inicio: { [sequelize_1.Op.between]: [startDate, endDate] },
                            estado: 'Activo'
                        }
                    });
                    const revenue = (yield contract_1.default.sum('membresia_precio', {
                        where: {
                            fecha_inicio: { [sequelize_1.Op.between]: [startDate, endDate] },
                            estado: 'Activo'
                        }
                    })) || 0;
                    return {
                        month: month.name, // Nombre corto para móvil
                        fullName: month.fullName,
                        contracts: contractCount,
                        revenue: Number(revenue)
                    };
                })));
                return monthlyData;
            }
            catch (error) {
                console.error('Error getting memberships by month:', error);
                return [];
            }
        });
    }
    // Obtener membresía más popular - CORREGIDO Y SIMPLIFICADO
    getPopularMembership() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🔍 Getting popular membership for main metrics...');
                // Query simplificada para obtener membresía con más contratos
                const popularMembershipQuery = `
                SELECT m.id, m.nombre, m.precio, m.descripcion, COUNT(c.id) as contract_count
                FROM membresias m
                LEFT JOIN contratos c ON m.id = c.id_membresia AND c.estado = 'Activo'
                WHERE m.estado = true
                GROUP BY m.id, m.nombre, m.precio, m.descripcion
                ORDER BY COUNT(c.id) DESC
                LIMIT 1;
            `;
                const results = yield db_1.default.query(popularMembershipQuery, {
                    type: sequelize_1.QueryTypes.SELECT
                });
                console.log('🔍 Popular membership query results:', results);
                if (results && results.length > 0) {
                    const result = results[0];
                    console.log('🔍 Processing popular membership result:', result);
                    return {
                        id: result.id,
                        name: result.nombre,
                        price: Number(result.precio),
                        description: result.descripcion || 'Sin descripción',
                        activeContracts: Number(result.contract_count)
                    };
                }
                // Estrategia de fallback: Obtener la primera membresía activa
                console.log('🔍 No query results, getting first active membership...');
                const firstMembership = yield membership_1.default.findOne({
                    where: { estado: true },
                    order: [['id', 'ASC']]
                });
                if (firstMembership) {
                    return {
                        id: firstMembership.id,
                        name: firstMembership.nombre,
                        price: Number(firstMembership.precio),
                        description: firstMembership.descripcion || 'Sin descripción',
                        activeContracts: 0
                    };
                }
                console.log('❌ No memberships found at all');
                return null;
            }
            catch (error) {
                console.error('❌ Error getting popular membership:', error);
                console.error('❌ Error details:', error instanceof Error ? error.message : String(error));
                return null;
            }
        });
    }
    // Obtener contadores para tarjetas de acceso rápido
    getQuickAccessCounters() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [totalUsers, totalTrainers, totalClients, activeUsers, activeTrainers, activeClients] = yield Promise.all([
                    user_1.default.count(),
                    trainer_1.default.count(),
                    person_model_1.default.count(),
                    user_1.default.count({ where: { estado: true } }),
                    trainer_1.default.count({ where: { estado: true } }),
                    person_model_1.default.count({ where: { estado: true } })
                ]);
                return {
                    users: {
                        total: totalUsers,
                        active: activeUsers,
                        inactive: totalUsers - activeUsers
                    },
                    trainers: {
                        total: totalTrainers,
                        active: activeTrainers,
                        inactive: totalTrainers - activeTrainers
                    },
                    clients: {
                        total: totalClients,
                        active: activeClients,
                        inactive: totalClients - activeClients
                    }
                };
            }
            catch (error) {
                console.error('Error getting quick access counters:', error);
                return {
                    users: { total: 0, active: 0, inactive: 0 },
                    trainers: { total: 0, active: 0, inactive: 0 },
                    clients: { total: 0, active: 0, inactive: 0 }
                };
            }
        });
    }
    // Obtener tendencias semanales compactas para móvil
    getWeeklyTrends() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const today = new Date();
                const lastWeek = (0, date_fns_1.subDays)(today, 7);
                const twoWeeksAgo = (0, date_fns_1.subDays)(today, 14);
                const [currentWeekData, previousWeekData] = yield Promise.all([
                    this.getWeeklyData(lastWeek, today),
                    this.getWeeklyData(twoWeeksAgo, lastWeek)
                ]);
                return {
                    revenue: {
                        current: currentWeekData.revenue,
                        growth: this.calculateGrowthPercentage(currentWeekData.revenue, previousWeekData.revenue)
                    },
                    contracts: {
                        current: currentWeekData.contracts,
                        growth: this.calculateGrowthPercentage(currentWeekData.contracts, previousWeekData.contracts)
                    },
                    attendance: {
                        current: currentWeekData.attendance,
                        growth: this.calculateGrowthPercentage(currentWeekData.attendance, previousWeekData.attendance)
                    }
                };
            }
            catch (error) {
                console.error('Error getting weekly trends:', error);
                return {
                    revenue: { current: 0, growth: 0 },
                    contracts: { current: 0, growth: 0 },
                    attendance: { current: 0, growth: 0 }
                };
            }
        });
    }
    // Método auxiliar para obtener datos de una semana
    getWeeklyData(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const [revenue, contracts, attendance] = yield Promise.all([
                contract_1.default.sum('membresia_precio', {
                    where: {
                        fecha_inicio: { [sequelize_1.Op.between]: [startDate, endDate] },
                        estado: 'Activo'
                    }
                }) || 0,
                contract_1.default.count({
                    where: {
                        fecha_inicio: { [sequelize_1.Op.between]: [startDate, endDate] },
                        estado: 'Activo'
                    }
                }),
                attendance_1.default.count({
                    where: {
                        fecha_uso: { [sequelize_1.Op.between]: [startDate, endDate] },
                        estado: 'Activo'
                    }
                })
            ]);
            return {
                revenue: Number(revenue),
                contracts,
                attendance
            };
        });
    }
    // Método auxiliar para calcular porcentaje de crecimiento
    calculateGrowthPercentage(current, previous) {
        if (previous === 0) {
            return current > 0 ? 100 : 0;
        }
        return Number((((current - previous) / previous) * 100).toFixed(1));
    }
    // Formatear datos para móvil (más compacto)
    formatForMobile(data) {
        return data.map(item => (Object.assign(Object.assign({}, item), { 
            // Redondear números grandes para mejor visualización en móvil
            revenue: item.revenue > 1000 ? Math.round(item.revenue / 1000) * 1000 : item.revenue })));
    }
    // Widget específico para móvil - Solo datos esenciales
    getMobileWidget(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('📱 Dashboard Mobile Widget - Request started');
                const [todayRevenue, todayAttendance, activeClients, topMembership] = yield Promise.all([
                    contract_1.default.sum('membresia_precio', {
                        where: {
                            fecha_inicio: { [sequelize_1.Op.between]: [(0, date_fns_1.startOfDay)(new Date()), (0, date_fns_1.endOfDay)(new Date())] },
                            estado: 'Activo'
                        }
                    }) || 0,
                    attendance_1.default.count({
                        where: {
                            fecha_uso: { [sequelize_1.Op.between]: [(0, date_fns_1.startOfDay)(new Date()), (0, date_fns_1.endOfDay)(new Date())] },
                            estado: 'Activo'
                        }
                    }),
                    person_model_1.default.count({ where: { estado: true } }),
                    this.getTopMembership()
                ]);
                const widget = {
                    todayRevenue: Number(todayRevenue),
                    todayAttendance,
                    activeClients,
                    topMembership: (topMembership === null || topMembership === void 0 ? void 0 : topMembership.name) || 'N/A',
                    lastUpdate: (0, date_fns_1.format)(new Date(), 'HH:mm')
                };
                return apiResponse_1.default.success(res, widget, "Widget móvil obtenido exitosamente");
            }
            catch (error) {
                console.error('❌ Dashboard Mobile Widget - Fatal error:', error);
                return apiResponse_1.default.error(res, "Error al obtener widget móvil", 500, process.env.NODE_ENV === 'development' ? error : undefined);
            }
        });
    }
    // Endpoint de prueba básico para verificar conectividad
    getHealthCheck(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🔍 Dashboard Mobile Health Check - Starting...');
                // Prueba básica de conexión a BD
                yield db_1.default.authenticate();
                console.log('✅ Database connection successful');
                // Prueba de queries básicas
                const basicCounts = {
                    users: yield user_1.default.count().catch(err => { console.error('❌ User count error:', err); return 0; }),
                    trainers: yield trainer_1.default.count().catch(err => { console.error('❌ Trainer count error:', err); return 0; }),
                    persons: yield person_model_1.default.count().catch(err => { console.error('❌ Person count error:', err); return 0; }),
                    memberships: yield membership_1.default.count().catch(err => { console.error('❌ Membership count error:', err); return 0; }),
                    contracts: yield contract_1.default.count().catch(err => { console.error('❌ Contract count error:', err); return 0; }),
                    attendance: yield attendance_1.default.count().catch(err => { console.error('❌ Attendance count error:', err); return 0; })
                };
                console.log('📊 Basic counts:', basicCounts);
                return apiResponse_1.default.success(res, {
                    database_connected: true,
                    basic_counts: basicCounts,
                    timestamp: new Date().toISOString()
                }, "Health check completado exitosamente");
            }
            catch (error) {
                console.error('❌ Health Check Error:', error);
                return apiResponse_1.default.error(res, "Error en health check", 500, process.env.NODE_ENV === 'development' ? {
                    error: error.message,
                    stack: error.stack
                } : undefined);
            }
        });
    }
    // Endpoint de diagnóstico para verificar datos en BD - SIMPLIFICADO
    getDiagnostic(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🔍 Dashboard Mobile Diagnostic - Starting...');
                const [totalMemberships, activeMemberships, totalContracts, activeContracts] = yield Promise.all([
                    membership_1.default.count(),
                    membership_1.default.count({ where: { estado: true } }),
                    contract_1.default.count(),
                    contract_1.default.count({ where: { estado: 'Activo' } })
                ]);
                // Obtener algunas membresías de ejemplo
                const sampleMemberships = yield membership_1.default.findAll({
                    where: { estado: true },
                    limit: 5,
                    attributes: ['id', 'nombre', 'precio', 'descripcion', 'estado']
                });
                // Obtener algunos contratos con sus membresías (sin GROUP BY problemático)
                const sampleContracts = yield contract_1.default.findAll({
                    limit: 10,
                    attributes: ['id', 'estado', 'fecha_inicio', 'fecha_fin', 'id_membresia'],
                    include: [{
                            model: membership_1.default,
                            as: 'membresia',
                            attributes: ['id', 'nombre', 'precio']
                        }]
                });
                // Query directa para obtener conteo de contratos por membresía
                const membershipContractsQuery = `
                SELECT m.id, m.nombre, 
                       COUNT(c.id) as total_contratos,
                       COUNT(CASE WHEN c.estado = 'Activo' THEN 1 END) as contratos_activos
                FROM membresias m
                LEFT JOIN contratos c ON m.id = c.id_membresia
                WHERE m.estado = true
                GROUP BY m.id, m.nombre
                ORDER BY COUNT(c.id) DESC
                LIMIT 5;
            `;
                const membershipContracts = yield db_1.default.query(membershipContractsQuery, {
                    type: sequelize_1.QueryTypes.SELECT
                });
                const diagnostic = {
                    database_counts: {
                        totalMemberships,
                        activeMemberships,
                        totalContracts,
                        activeContracts
                    },
                    sample_memberships: sampleMemberships,
                    sample_contracts: sampleContracts.map(c => ({
                        id: c.id,
                        estado: c.estado,
                        fecha_inicio: c.fecha_inicio,
                        fecha_fin: c.fecha_fin,
                        membresia: c.membresia ? {
                            id: c.membresia.id,
                            nombre: c.membresia.nombre,
                            precio: c.membresia.precio
                        } : null
                    })),
                    membership_with_contracts: membershipContracts
                };
                return apiResponse_1.default.success(res, diagnostic, "Diagnóstico de base de datos completado");
            }
            catch (error) {
                console.error('❌ Dashboard Mobile Diagnostic - Fatal error:', error);
                return apiResponse_1.default.error(res, "Error en diagnóstico", 500, process.env.NODE_ENV === 'development' ? error : undefined);
            }
        });
    }
}
exports.DashboardMobileController = DashboardMobileController;
// Crear una instancia del controlador
const dashboardMobileController = new DashboardMobileController();
// Exportar las funciones del controlador
exports.getMobileDashboardQuickSummary = dashboardMobileController.getQuickSummary.bind(dashboardMobileController);
exports.getMobileDashboardMainMetrics = dashboardMobileController.getMainMetrics.bind(dashboardMobileController);
exports.getMobileDashboardWidget = dashboardMobileController.getMobileWidget.bind(dashboardMobileController);
exports.getMobileDashboardDiagnostic = dashboardMobileController.getDiagnostic.bind(dashboardMobileController);
exports.getMobileDashboardHealthCheck = dashboardMobileController.getHealthCheck.bind(dashboardMobileController);
// Exportar el controlador por defecto
exports.default = dashboardMobileController;
