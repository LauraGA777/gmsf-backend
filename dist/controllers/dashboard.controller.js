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
exports.getDashboardOptimizedStats = exports.getDashboardStats = exports.DashboardController = void 0;
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const date_fns_1 = require("date-fns");
const attendance_1 = __importDefault(require("../models/attendance"));
const contract_1 = __importDefault(require("../models/contract"));
const membership_1 = __importDefault(require("../models/membership"));
const person_model_1 = __importDefault(require("../models/person.model"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
// Esquema de validación para estadísticas del dashboard
const dashboardQuerySchema = zod_1.z.object({
    period: zod_1.z.enum(['daily', 'monthly', 'yearly', 'custom']).optional().default('monthly'),
    date: zod_1.z.string().optional(),
    month: zod_1.z.string().optional(),
    year: zod_1.z.string().optional(),
    dateFrom: zod_1.z.string().optional(),
    dateTo: zod_1.z.string().optional()
});
class DashboardController {
    // Obtener TODAS las estadísticas del dashboard optimizadas en una sola llamada
    getOptimizedStats(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🔍 Dashboard Optimized Stats - Request params:', req.query);
                const { period, date, month, year, dateFrom, dateTo } = dashboardQuerySchema.parse(req.query);
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
                console.log('📅 Dashboard Optimized Stats - Date range:', { startDate, endDate, period });
                // Calcular período anterior para comparación
                const previousPeriod = this.calculatePreviousPeriod(startDate, endDate, period);
                // Obtener todas las estadísticas en paralelo
                const [currentStats, previousStats, attendanceChartData, revenueChartData, membershipDistribution] = yield Promise.all([
                    this.getCompleteStats(startDate, endDate),
                    this.getCompleteStats(previousPeriod.startDate, previousPeriod.endDate),
                    this.getAttendanceChartData(startDate, endDate),
                    this.getRevenueChartData(startDate, endDate),
                    this.getMembershipDistribution(startDate, endDate)
                ]);
                const optimizedData = {
                    current: currentStats,
                    previous: previousStats,
                    charts: {
                        attendance: attendanceChartData,
                        revenue: revenueChartData,
                        membershipDistribution: membershipDistribution
                    },
                    period: {
                        type: period,
                        startDate,
                        endDate,
                        previousStartDate: previousPeriod.startDate,
                        previousEndDate: previousPeriod.endDate
                    }
                };
                console.log('✅ Dashboard Optimized Stats - Response ready');
                return apiResponse_1.default.success(res, optimizedData, "Estadísticas optimizadas del dashboard obtenidas exitosamente");
            }
            catch (error) {
                console.error('❌ Dashboard Optimized Stats - Fatal error:', error);
                return apiResponse_1.default.error(res, "Error al obtener estadísticas optimizadas del dashboard", 500, process.env.NODE_ENV === 'development' ? error : undefined);
            }
        });
    }
    // Obtener todas las estadísticas del dashboard en una sola llamada
    getStats(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🔍 Dashboard Stats - Request params:', req.query);
                const { period, date, month, year, dateFrom, dateTo } = dashboardQuerySchema.parse(req.query);
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
                console.log('📅 Dashboard Stats - Date range:', { startDate, endDate, period });
                // Obtener todas las estadísticas en paralelo
                const [attendanceStats, contractStats, membershipStats, clientStats] = yield Promise.all([
                    this.getAttendanceStats(startDate, endDate),
                    this.getContractStats(startDate, endDate),
                    this.getMembershipStats(startDate, endDate),
                    this.getClientStats(startDate, endDate)
                ]);
                const dashboardData = {
                    attendance: attendanceStats,
                    contracts: contractStats,
                    memberships: membershipStats,
                    clients: clientStats,
                    period: {
                        type: period,
                        startDate,
                        endDate
                    }
                };
                console.log('✅ Dashboard Stats - Response ready');
                return apiResponse_1.default.success(res, dashboardData, "Estadísticas del dashboard obtenidas exitosamente");
            }
            catch (error) {
                console.error('❌ Dashboard Stats - Fatal error:', error);
                return apiResponse_1.default.error(res, "Error al obtener estadísticas del dashboard", 500, process.env.NODE_ENV === 'development' ? error : undefined);
            }
        });
    }
    // Obtener estadísticas de asistencia
    getAttendanceStats(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const today = new Date();
                const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
                const [totalPeriod, totalToday, activePeriod, deletedPeriod] = yield Promise.all([
                    attendance_1.default.count({
                        where: {
                            fecha_uso: { [sequelize_1.Op.between]: [startDate, endDate] }
                        }
                    }),
                    attendance_1.default.count({
                        where: {
                            fecha_uso: { [sequelize_1.Op.between]: [todayStart, todayEnd] },
                            estado: "Activo"
                        }
                    }),
                    attendance_1.default.count({
                        where: {
                            fecha_uso: { [sequelize_1.Op.between]: [startDate, endDate] },
                            estado: "Activo"
                        }
                    }),
                    attendance_1.default.count({
                        where: {
                            fecha_uso: { [sequelize_1.Op.between]: [startDate, endDate] },
                            estado: "Eliminado"
                        }
                    })
                ]);
                return {
                    total: totalPeriod,
                    today: totalToday,
                    activos: activePeriod,
                    eliminados: deletedPeriod
                };
            }
            catch (error) {
                console.error('Error getting attendance stats:', error);
                return {
                    total: 0,
                    today: 0,
                    activos: 0,
                    eliminados: 0
                };
            }
        });
    }
    // Obtener estadísticas de contratos
    getContractStats(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const today = new Date();
                const thirtyDaysFromNow = new Date();
                thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                const [totalContracts, activeContracts, expiredContracts, cancelledContracts, newContracts, expiringContracts, totalRevenue, periodRevenue] = yield Promise.all([
                    contract_1.default.count(),
                    contract_1.default.count({
                        where: {
                            estado: 'Activo',
                            fecha_inicio: { [sequelize_1.Op.lte]: today },
                            fecha_fin: { [sequelize_1.Op.gte]: today }
                        }
                    }),
                    contract_1.default.count({
                        where: {
                            estado: 'Activo',
                            fecha_fin: { [sequelize_1.Op.lt]: today }
                        }
                    }),
                    contract_1.default.count({
                        where: { estado: 'Cancelado' }
                    }),
                    contract_1.default.count({
                        where: {
                            fecha_inicio: { [sequelize_1.Op.between]: [startDate, endDate] }
                        }
                    }),
                    contract_1.default.count({
                        where: {
                            estado: 'Activo',
                            fecha_fin: { [sequelize_1.Op.between]: [today, thirtyDaysFromNow] }
                        }
                    }),
                    contract_1.default.sum('membresia_precio', {
                        where: { estado: 'Activo' }
                    }) || 0,
                    contract_1.default.sum('membresia_precio', {
                        where: {
                            fecha_inicio: { [sequelize_1.Op.between]: [startDate, endDate] }
                        }
                    }) || 0
                ]);
                return {
                    totalContracts,
                    activeContracts,
                    expiredContracts,
                    cancelledContracts,
                    newContracts,
                    expiringContracts,
                    totalRevenue,
                    periodRevenue
                };
            }
            catch (error) {
                console.error('Error getting contract stats:', error);
                return {
                    totalContracts: 0,
                    activeContracts: 0,
                    expiredContracts: 0,
                    cancelledContracts: 0,
                    newContracts: 0,
                    expiringContracts: 0,
                    totalRevenue: 0,
                    periodRevenue: 0
                };
            }
        });
    }
    // Obtener estadísticas de membresías
    getMembershipStats(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("🔍 === DIAGNÓSTICO MEMBRESÍAS ===");
            console.log("Fecha inicio:", startDate);
            console.log("Fecha fin:", endDate);
            try {
                const [totalMemberships, activeMemberships, inactiveMemberships, newMemberships] = yield Promise.all([
                    membership_1.default.count(),
                    membership_1.default.count({ where: { estado: true } }),
                    membership_1.default.count({ where: { estado: false } }),
                    membership_1.default.count({
                        where: {
                            fecha_creacion: { [sequelize_1.Op.between]: [startDate, endDate] }
                        }
                    })
                ]);
                console.log("📊 Resultados membresías:");
                console.log("- Total:", totalMemberships);
                console.log("- Activas:", activeMemberships);
                console.log("- Inactivas:", inactiveMemberships);
                console.log("- Nuevas:", newMemberships);
                console.log("================================");
                return {
                    totalMemberships,
                    activeMemberships,
                    inactiveMemberships,
                    newMemberships
                };
            }
            catch (error) {
                console.error("❌ Error en getMembershipStats:", error);
                throw error;
            }
        });
    }
    // Obtener estadísticas de clientes
    getClientStats(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [totalClients, activeClients, inactiveClients, newClients] = yield Promise.all([
                    person_model_1.default.count(),
                    person_model_1.default.count({
                        where: { estado: true }
                    }),
                    person_model_1.default.count({
                        where: { estado: false }
                    }),
                    person_model_1.default.count({
                        where: {
                            fecha_registro: { [sequelize_1.Op.between]: [startDate, endDate] }
                        }
                    })
                ]);
                return {
                    totalClients,
                    activeClients,
                    inactiveClients,
                    newClients
                };
            }
            catch (error) {
                console.error('Error getting client stats:', error);
                return {
                    totalClients: 0,
                    activeClients: 0,
                    inactiveClients: 0,
                    newClients: 0
                };
            }
        });
    }
    // Métodos auxiliares para el endpoint optimizado
    calculatePreviousPeriod(startDate, endDate, period) {
        if (period === 'monthly') {
            const previousMonth = (0, date_fns_1.subMonths)(startDate, 1);
            return {
                startDate: (0, date_fns_1.startOfMonth)(previousMonth),
                endDate: (0, date_fns_1.endOfMonth)(previousMonth)
            };
        }
        // Para otros períodos, restar la misma cantidad de días
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const previousStartDate = (0, date_fns_1.subDays)(startDate, daysDiff);
        const previousEndDate = (0, date_fns_1.subDays)(endDate, daysDiff);
        return {
            startDate: previousStartDate,
            endDate: previousEndDate
        };
    }
    getCompleteStats(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const [attendanceStats, contractStats, membershipStats, clientStats] = yield Promise.all([
                this.getAttendanceStats(startDate, endDate),
                this.getContractStats(startDate, endDate),
                this.getMembershipStats(startDate, endDate),
                this.getClientStats(startDate, endDate)
            ]);
            return {
                attendance: attendanceStats,
                contracts: contractStats,
                memberships: membershipStats,
                clients: clientStats
            };
        });
    }
    getAttendanceChartData(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('📊 Getting attendance chart data for range:', { startDate, endDate });
                // Obtener datos de asistencia agrupados por día usando una sola query
                const attendanceData = yield attendance_1.default.findAll({
                    attributes: [
                        [(0, sequelize_1.fn)('DATE', (0, sequelize_1.col)('fecha_uso')), 'date'],
                        [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'count']
                    ],
                    where: {
                        fecha_uso: { [sequelize_1.Op.between]: [startDate, endDate] },
                        estado: 'Activo'
                    },
                    group: [(0, sequelize_1.fn)('DATE', (0, sequelize_1.col)('fecha_uso'))],
                    order: [[(0, sequelize_1.fn)('DATE', (0, sequelize_1.col)('fecha_uso')), 'ASC']],
                    raw: true
                });
                // Generar array completo de días para el rango
                const days = (0, date_fns_1.eachDayOfInterval)({ start: startDate, end: endDate });
                const attendanceMap = new Map();
                // Mapear datos de asistencia por fecha
                attendanceData.forEach((item) => {
                    attendanceMap.set(item.date, parseInt(item.count));
                });
                // Crear datos de gráfico completos
                const chartData = days.map(day => {
                    const dateStr = (0, date_fns_1.format)(day, 'yyyy-MM-dd');
                    return {
                        date: dateStr,
                        asistencias: attendanceMap.get(dateStr) || 0,
                        label: (0, date_fns_1.format)(day, 'dd/MM')
                    };
                });
                console.log('✅ Attendance chart data generated:', chartData.length, 'days');
                return chartData;
            }
            catch (error) {
                console.error('Error getting attendance chart data:', error);
                return [];
            }
        });
    }
    getRevenueChartData(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('💰 Getting revenue chart data for range:', { startDate, endDate });
                // Obtener datos de ingresos agrupados por día usando una sola query
                const revenueData = yield contract_1.default.findAll({
                    attributes: [
                        [(0, sequelize_1.fn)('DATE', (0, sequelize_1.col)('fecha_inicio')), 'date'],
                        [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('membresia_precio')), 'total']
                    ],
                    where: {
                        fecha_inicio: { [sequelize_1.Op.between]: [startDate, endDate] },
                        estado: 'Activo'
                    },
                    group: [(0, sequelize_1.fn)('DATE', (0, sequelize_1.col)('fecha_inicio'))],
                    order: [[(0, sequelize_1.fn)('DATE', (0, sequelize_1.col)('fecha_inicio')), 'ASC']],
                    raw: true
                });
                // Generar array completo de días para el rango
                const days = (0, date_fns_1.eachDayOfInterval)({ start: startDate, end: endDate });
                const revenueMap = new Map();
                // Mapear datos de ingresos por fecha
                revenueData.forEach((item) => {
                    revenueMap.set(item.date, parseFloat(item.total) || 0);
                });
                // Crear datos de gráfico completos
                const chartData = days.map(day => {
                    const dateStr = (0, date_fns_1.format)(day, 'yyyy-MM-dd');
                    return {
                        date: dateStr,
                        ingresos: revenueMap.get(dateStr) || 0,
                        label: (0, date_fns_1.format)(day, 'dd/MM')
                    };
                });
                console.log('✅ Revenue chart data generated:', chartData.length, 'days');
                return chartData;
            }
            catch (error) {
                console.error('Error getting revenue chart data:', error);
                return [];
            }
        });
    }
    getMembershipDistribution(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🎯 Getting membership distribution for range:', { startDate, endDate });
                const membershipData = yield membership_1.default.findAll({
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
                            attributes: [],
                            where: {
                                estado: 'Activo',
                                fecha_inicio: { [sequelize_1.Op.lte]: new Date() },
                                fecha_fin: { [sequelize_1.Op.gte]: new Date() }
                            },
                            required: false
                        }],
                    where: {
                        estado: true
                    },
                    group: ['membresia.id'],
                    order: [[(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('contratos.id')), 'DESC']],
                    raw: true
                });
                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16'];
                const total = membershipData.reduce((sum, m) => sum + (parseInt(m.activeContracts) || 0), 0);
                const distributionData = membershipData.map((membership, index) => ({
                    name: membership.nombre,
                    value: parseInt(membership.activeContracts) || 0,
                    percentage: total > 0 ? ((parseInt(membership.activeContracts) || 0) / total) * 100 : 0,
                    color: colors[index % colors.length]
                }));
                console.log('✅ Membership distribution generated:', distributionData.length, 'memberships');
                console.log('🔍 Distribution data details:', distributionData);
                return distributionData;
            }
            catch (error) {
                console.error('Error getting membership distribution:', error);
                return [];
            }
        });
    }
}
exports.DashboardController = DashboardController;
// Crear una instancia del controlador
const dashboardController = new DashboardController();
// Exportar las funciones del controlador
exports.getDashboardStats = dashboardController.getStats.bind(dashboardController);
exports.getDashboardOptimizedStats = dashboardController.getOptimizedStats.bind(dashboardController);
// Exportar el controlador por defecto
exports.default = dashboardController;
