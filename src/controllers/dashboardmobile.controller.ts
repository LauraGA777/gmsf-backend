import { Request, Response, NextFunction } from 'express';
import { Op, fn, col } from 'sequelize';
import { z } from 'zod';
import { format, eachDayOfInterval, subDays, subMonths, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import Attendance from '../models/attendance';
import Contract from '../models/contract';
import Membership from '../models/membership';
import Person from '../models/person.model';
import User from '../models/user';
import Trainer from '../models/trainer';
import ApiResponse from '../utils/apiResponse';

// Esquema de validación para dashboard móvil
const mobileQuerySchema = z.object({
    period: z.enum(['today', 'week', 'month']).optional().default('today'),
    compact: z.boolean().optional().default(true)
});

export class DashboardMobileController {
    // Obtener resumen rápido para móvil (datos más compactos)
    public async getQuickSummary(req: Request, res: Response, next: NextFunction) {
        try {
            console.log('📱 Dashboard Mobile Quick Summary - Request started');
            
            const { period, compact } = mobileQuerySchema.parse(req.query);
            
            // Obtener métricas principales optimizadas para móvil
            const [
                todayStats,
                quickCounters,
                revenueGrowth,
                topMembership
            ] = await Promise.all([
                this.getTodayStats(),
                this.getQuickCounters(),
                this.getRevenueGrowth(),
                this.getTopMembership()
            ]);

            const mobileData = {
                todayStats,
                quickCounters,
                revenueGrowth,
                topMembership,
                lastUpdate: new Date().toISOString()
            };

            console.log('✅ Dashboard Mobile Quick Summary - Response ready');

            return ApiResponse.success(
                res,
                mobileData,
                "Resumen rápido móvil obtenido exitosamente"
            );

        } catch (error) {
            console.error('❌ Dashboard Mobile Quick Summary - Fatal error:', error);
            return ApiResponse.error(
                res,
                "Error al obtener resumen rápido móvil",
                500,
                process.env.NODE_ENV === 'development' ? error : undefined
            );
        }
    }

    // Obtener métricas principales del dashboard móvil
    public async getMainMetrics(req: Request, res: Response, next: NextFunction) {
        try {
            console.log('📱 Dashboard Mobile Main Metrics - Request started');
            
            const { period } = mobileQuerySchema.parse(req.query);
            
            // Obtener todas las métricas principales en paralelo
            const [
                dailyRevenue,
                membershipsByMonth,
                popularMembership,
                quickAccessCounters,
                weeklyTrends
            ] = await Promise.all([
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

            return ApiResponse.success(
                res,
                mainMetrics,
                "Métricas principales móvil obtenidas exitosamente"
            );

        } catch (error) {
            console.error('❌ Dashboard Mobile Main Metrics - Fatal error:', error);
            return ApiResponse.error(
                res,
                "Error al obtener métricas principales móvil",
                500,
                process.env.NODE_ENV === 'development' ? error : undefined
            );
        }
    }

    // Obtener estadísticas de hoy (optimizado para móvil)
    private async getTodayStats() {
        try {
            const today = new Date();
            const todayStart = startOfDay(today);
            const todayEnd = endOfDay(today);

            const [
                todayRevenue,
                todayContracts,
                todayAttendance,
                activeClients
            ] = await Promise.all([
                Contract.sum('membresia_precio', {
                    where: {
                        fecha_inicio: { [Op.between]: [todayStart, todayEnd] },
                        estado: 'Activo'
                    }
                }) || 0,
                Contract.count({
                    where: {
                        fecha_inicio: { [Op.between]: [todayStart, todayEnd] },
                        estado: 'Activo'
                    }
                }),
                Attendance.count({
                    where: {
                        fecha_uso: { [Op.between]: [todayStart, todayEnd] },
                        estado: 'Activo'
                    }
                }),
                Person.count({
                    where: { estado: true }
                })
            ]);

            return {
                revenue: Number(todayRevenue),
                newContracts: todayContracts,
                attendance: todayAttendance,
                activeClients,
                date: format(today, 'dd/MM/yyyy')
            };
        } catch (error) {
            console.error('Error getting today stats:', error);
            return {
                revenue: 0,
                newContracts: 0,
                attendance: 0,
                activeClients: 0,
                date: format(new Date(), 'dd/MM/yyyy')
            };
        }
    }

    // Obtener contadores rápidos (formato compacto para móvil)
    private async getQuickCounters() {
        try {
            const [users, trainers, clients] = await Promise.all([
                User.count({ where: { estado: true } }),
                Trainer.count({ where: { estado: true } }),
                Person.count({ where: { estado: true } })
            ]);

            return {
                users,
                trainers,
                clients
            };
        } catch (error) {
            console.error('Error getting quick counters:', error);
            return {
                users: 0,
                trainers: 0,
                clients: 0
            };
        }
    }

    // Obtener crecimiento de ingresos (últimos 7 días vs 7 días anteriores)
    private async getRevenueGrowth() {
        try {
            const today = new Date();
            const sevenDaysAgo = subDays(today, 7);
            const fourteenDaysAgo = subDays(today, 14);

            const [currentWeekRevenue, previousWeekRevenue] = await Promise.all([
                Contract.sum('membresia_precio', {
                    where: {
                        fecha_inicio: { [Op.between]: [sevenDaysAgo, today] },
                        estado: 'Activo'
                    }
                }) || 0,
                Contract.sum('membresia_precio', {
                    where: {
                        fecha_inicio: { [Op.between]: [fourteenDaysAgo, sevenDaysAgo] },
                        estado: 'Activo'
                    }
                }) || 0
            ]);

            const growthPercentage = previousWeekRevenue > 0 
                ? ((currentWeekRevenue - previousWeekRevenue) / previousWeekRevenue) * 100 
                : currentWeekRevenue > 0 ? 100 : 0;

            return {
                current: Number(currentWeekRevenue),
                previous: Number(previousWeekRevenue),
                growthPercentage: Number(growthPercentage.toFixed(1)),
                isPositive: growthPercentage >= 0
            };
        } catch (error) {
            console.error('Error getting revenue growth:', error);
            return {
                current: 0,
                previous: 0,
                growthPercentage: 0,
                isPositive: true
            };
        }
    }

    // Obtener membresía top (más vendida)
    private async getTopMembership() {
        try {
            const topMembership = await Membership.findOne({
                attributes: [
                    'id',
                    'nombre',
                    'precio',
                    [fn('COUNT', col('contratos.id')), 'sales']
                ],
                include: [{
                    model: Contract,
                    as: 'contratos',
                    attributes: [],
                    where: {
                        estado: 'Activo'
                    },
                    required: false
                }],
                where: {
                    estado: true
                },
                group: ['membresia.id'],
                order: [[fn('COUNT', col('contratos.id')), 'DESC']],
                limit: 1,
                raw: true
            });

            if (topMembership) {
                const membership = topMembership as any;
                return {
                    name: membership.nombre,
                    price: Number(membership.precio),
                    sales: Number(membership.sales) || 0
                };
            }

            return null;
        } catch (error) {
            console.error('Error getting top membership:', error);
            return null;
        }
    }

    // Obtener ingresos diarios con indicador de crecimiento
    private async getDailyRevenueWithGrowth() {
        try {
            const today = new Date();
            const yesterday = subDays(today, 1);
            
            const todayStart = startOfDay(today);
            const todayEnd = endOfDay(today);
            const yesterdayStart = startOfDay(yesterday);
            const yesterdayEnd = endOfDay(yesterday);

            const [todayRevenue, yesterdayRevenue] = await Promise.all([
                Contract.sum('membresia_precio', {
                    where: {
                        fecha_inicio: { [Op.between]: [todayStart, todayEnd] },
                        estado: 'Activo'
                    }
                }) || 0,
                Contract.sum('membresia_precio', {
                    where: {
                        fecha_inicio: { [Op.between]: [yesterdayStart, yesterdayEnd] },
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
                date: format(today, 'dd/MM/yyyy')
            };
        } catch (error) {
            console.error('Error getting daily revenue with growth:', error);
            return {
                today: 0,
                yesterday: 0,
                growthPercentage: 0,
                isPositiveGrowth: true,
                date: format(new Date(), 'dd/MM/yyyy')
            };
        }
    }

    // Obtener gráfico de membresías por mes (Enero a Junio) - formato móvil
    private async getMembershipsByMonth() {
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

            const monthlyData = await Promise.all(
                months.map(async (month) => {
                    const startDate = new Date(currentYear, month.number - 1, 1);
                    const endDate = new Date(currentYear, month.number, 0);

                    const contractCount = await Contract.count({
                        where: {
                            fecha_inicio: { [Op.between]: [startDate, endDate] },
                            estado: 'Activo'
                        }
                    });

                    const revenue = await Contract.sum('membresia_precio', {
                        where: {
                            fecha_inicio: { [Op.between]: [startDate, endDate] },
                            estado: 'Activo'
                        }
                    }) || 0;

                    return {
                        month: month.name, // Nombre corto para móvil
                        fullName: month.fullName,
                        contracts: contractCount,
                        revenue: Number(revenue)
                    };
                })
            );

            return monthlyData;
        } catch (error) {
            console.error('Error getting memberships by month:', error);
            return [];
        }
    }

    // Obtener membresía más popular
    private async getPopularMembership() {
        try {
            const popularMembership = await Membership.findOne({
                attributes: [
                    'id',
                    'nombre',
                    'precio',
                    'descripcion',
                    [fn('COUNT', col('contratos.id')), 'contractCount']
                ],
                include: [{
                    model: Contract,
                    as: 'contratos',
                    attributes: [],
                    where: {
                        estado: 'Activo'
                    },
                    required: false
                }],
                where: {
                    estado: true
                },
                group: ['membresia.id'],
                order: [[fn('COUNT', col('contratos.id')), 'DESC']],
                limit: 1,
                raw: true
            });

            if (popularMembership) {
                const membership = popularMembership as any;
                return {
                    id: membership.id,
                    name: membership.nombre,
                    price: Number(membership.precio),
                    description: membership.descripcion,
                    activeContracts: Number(membership.contractCount) || 0
                };
            }

            return null;
        } catch (error) {
            console.error('Error getting popular membership:', error);
            return null;
        }
    }

    // Obtener contadores para tarjetas de acceso rápido
    private async getQuickAccessCounters() {
        try {
            const [totalUsers, totalTrainers, totalClients, activeUsers, activeTrainers, activeClients] = await Promise.all([
                User.count(),
                Trainer.count(),
                Person.count(),
                User.count({ where: { estado: true } }),
                Trainer.count({ where: { estado: true } }),
                Person.count({ where: { estado: true } })
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
        } catch (error) {
            console.error('Error getting quick access counters:', error);
            return {
                users: { total: 0, active: 0, inactive: 0 },
                trainers: { total: 0, active: 0, inactive: 0 },
                clients: { total: 0, active: 0, inactive: 0 }
            };
        }
    }

    // Obtener tendencias semanales compactas para móvil
    private async getWeeklyTrends() {
        try {
            const today = new Date();
            const lastWeek = subDays(today, 7);
            const twoWeeksAgo = subDays(today, 14);

            const [currentWeekData, previousWeekData] = await Promise.all([
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
        } catch (error) {
            console.error('Error getting weekly trends:', error);
            return {
                revenue: { current: 0, growth: 0 },
                contracts: { current: 0, growth: 0 },
                attendance: { current: 0, growth: 0 }
            };
        }
    }

    // Método auxiliar para obtener datos de una semana
    private async getWeeklyData(startDate: Date, endDate: Date) {
        const [revenue, contracts, attendance] = await Promise.all([
            Contract.sum('membresia_precio', {
                where: {
                    fecha_inicio: { [Op.between]: [startDate, endDate] },
                    estado: 'Activo'
                }
            }) || 0,
            Contract.count({
                where: {
                    fecha_inicio: { [Op.between]: [startDate, endDate] },
                    estado: 'Activo'
                }
            }),
            Attendance.count({
                where: {
                    fecha_uso: { [Op.between]: [startDate, endDate] },
                    estado: 'Activo'
                }
            })
        ]);

        return {
            revenue: Number(revenue),
            contracts,
            attendance
        };
    }

    // Método auxiliar para calcular porcentaje de crecimiento
    private calculateGrowthPercentage(current: number, previous: number): number {
        if (previous === 0) {
            return current > 0 ? 100 : 0;
        }
        return Number((((current - previous) / previous) * 100).toFixed(1));
    }

    // Formatear datos para móvil (más compacto)
    private formatForMobile(data: any[]): any[] {
        return data.map(item => ({
            ...item,
            // Redondear números grandes para mejor visualización en móvil
            revenue: item.revenue > 1000 ? Math.round(item.revenue / 1000) * 1000 : item.revenue
        }));
    }

    // Widget específico para móvil - Solo datos esenciales
    public async getMobileWidget(req: Request, res: Response, next: NextFunction) {
        try {
            console.log('📱 Dashboard Mobile Widget - Request started');
            
            const [todayRevenue, todayAttendance, activeClients, topMembership] = await Promise.all([
                Contract.sum('membresia_precio', {
                    where: {
                        fecha_inicio: { [Op.between]: [startOfDay(new Date()), endOfDay(new Date())] },
                        estado: 'Activo'
                    }
                }) || 0,
                Attendance.count({
                    where: {
                        fecha_uso: { [Op.between]: [startOfDay(new Date()), endOfDay(new Date())] },
                        estado: 'Activo'
                    }
                }),
                Person.count({ where: { estado: true } }),
                this.getTopMembership()
            ]);

            const widget = {
                todayRevenue: Number(todayRevenue),
                todayAttendance,
                activeClients,
                topMembership: topMembership?.name || 'N/A',
                lastUpdate: format(new Date(), 'HH:mm')
            };

            return ApiResponse.success(
                res,
                widget,
                "Widget móvil obtenido exitosamente"
            );

        } catch (error) {
            console.error('❌ Dashboard Mobile Widget - Fatal error:', error);
            return ApiResponse.error(
                res,
                "Error al obtener widget móvil",
                500,
                process.env.NODE_ENV === 'development' ? error : undefined
            );
        }
    }
}

// Crear una instancia del controlador
const dashboardMobileController = new DashboardMobileController();

// Exportar las funciones del controlador
export const getMobileDashboardQuickSummary = dashboardMobileController.getQuickSummary.bind(dashboardMobileController);
export const getMobileDashboardMainMetrics = dashboardMobileController.getMainMetrics.bind(dashboardMobileController);
export const getMobileDashboardWidget = dashboardMobileController.getMobileWidget.bind(dashboardMobileController);

// Exportar el controlador por defecto
export default dashboardMobileController;
