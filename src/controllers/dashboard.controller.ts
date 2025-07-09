import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { z } from 'zod';
import Attendance from '../models/attendance';
import Contract from '../models/contract';
import Membership from '../models/membership';
import Person from '../models/person.model';
import User from '../models/user';
import ApiResponse from '../utils/apiResponse';

// Esquema de validación para estadísticas del dashboard
const dashboardQuerySchema = z.object({
    period: z.enum(['daily', 'monthly', 'yearly', 'custom']).optional().default('monthly'),
    date: z.string().optional(),
    month: z.string().optional(),
    year: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional()
});

export class DashboardController {
    // Obtener todas las estadísticas del dashboard en una sola llamada
    public async getStats(req: Request, res: Response, next: NextFunction) {
        try {
            console.log('🔍 Dashboard Stats - Request params:', req.query);
            
            const { period, date, month, year, dateFrom, dateTo } = dashboardQuerySchema.parse(req.query);
            
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

            console.log('📅 Dashboard Stats - Date range:', { startDate, endDate, period });

            // Obtener todas las estadísticas en paralelo
            const [attendanceStats, contractStats, membershipStats, clientStats] = await Promise.all([
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

            return ApiResponse.success(
                res,
                dashboardData,
                "Estadísticas del dashboard obtenidas exitosamente"
            );

        } catch (error) {
            console.error('❌ Dashboard Stats - Fatal error:', error);
            return ApiResponse.error(
                res,
                "Error al obtener estadísticas del dashboard",
                500,
                process.env.NODE_ENV === 'development' ? error : undefined
            );
        }
    }

    // Obtener estadísticas de asistencia
    private async getAttendanceStats(startDate: Date, endDate: Date) {
        try {
            const today = new Date();
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

            const [totalPeriod, totalToday, activePeriod, deletedPeriod] = await Promise.all([
                Attendance.count({
                    where: {
                        fecha_uso: { [Op.between]: [startDate, endDate] }
                    }
                }),
                Attendance.count({
                    where: {
                        fecha_uso: { [Op.between]: [todayStart, todayEnd] },
                        estado: "Activo"
                    }
                }),
                Attendance.count({
                    where: {
                        fecha_uso: { [Op.between]: [startDate, endDate] },
                        estado: "Activo"
                    }
                }),
                Attendance.count({
                    where: {
                        fecha_uso: { [Op.between]: [startDate, endDate] },
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
        } catch (error) {
            console.error('Error getting attendance stats:', error);
            return {
                total: 0,
                today: 0,
                activos: 0,
                eliminados: 0
            };
        }
    }

    // Obtener estadísticas de contratos
    private async getContractStats(startDate: Date, endDate: Date) {
        try {
            const today = new Date();
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

            const [
                totalContracts,
                activeContracts,
                expiredContracts,
                cancelledContracts,
                newContracts,
                expiringContracts,
                totalRevenue,
                periodRevenue
            ] = await Promise.all([
                Contract.count(),
                Contract.count({
                    where: {
                        estado: 'Activo',
                        fecha_inicio: { [Op.lte]: today },
                        fecha_fin: { [Op.gte]: today }
                    }
                }),
                Contract.count({
                    where: {
                        estado: 'Activo',
                        fecha_fin: { [Op.lt]: today }
                    }
                }),
                Contract.count({
                    where: { estado: 'Cancelado' }
                }),
                Contract.count({
                    where: {
                        fecha_inicio: { [Op.between]: [startDate, endDate] }
                    }
                }),
                Contract.count({
                    where: {
                        estado: 'Activo',
                        fecha_fin: { [Op.between]: [today, thirtyDaysFromNow] }
                    }
                }),
                Contract.sum('membresia_precio', {
                    where: { estado: 'Activo' }
                }) || 0,
                Contract.sum('membresia_precio', {
                    where: {
                        fecha_inicio: { [Op.between]: [startDate, endDate] }
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
        } catch (error) {
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
    }

    // Obtener estadísticas de membresías
    private async getMembershipStats(startDate: Date, endDate: Date) {
        try {
            const [
                totalMemberships,
                activeMemberships,
                inactiveMemberships,
                newMemberships
            ] = await Promise.all([
                Membership.count(),
                Membership.count({
                    where: { estado: true }
                }),
                Membership.count({
                    where: { estado: false }
                }),
                Membership.count({
                    where: {
                        fecha_creacion: { [Op.between]: [startDate, endDate] }
                    }
                })
            ]);

            return {
                totalMemberships,
                activeMemberships,
                inactiveMemberships,
                newMemberships
            };
        } catch (error) {
            console.error('Error getting membership stats:', error);
            return {
                totalMemberships: 0,
                activeMemberships: 0,
                inactiveMemberships: 0,
                newMemberships: 0
            };
        }
    }

    // Obtener estadísticas de clientes
    private async getClientStats(startDate: Date, endDate: Date) {
        try {
            const [
                totalClients,
                activeClients,
                inactiveClients,
                newClients
            ] = await Promise.all([
                Person.count(),
                Person.count({
                    where: { estado: true }
                }),
                Person.count({
                    where: { estado: false }
                }),
                Person.count({
                    where: {
                        fecha_registro: { [Op.between]: [startDate, endDate] }
                    }
                })
            ]);

            return {
                totalClients,
                activeClients,
                inactiveClients,
                newClients
            };
        } catch (error) {
            console.error('Error getting client stats:', error);
            return {
                totalClients: 0,
                activeClients: 0,
                inactiveClients: 0,
                newClients: 0
            };
        }
    }
}

// Crear una instancia del controlador
const dashboardController = new DashboardController();

// Exportar las funciones del controlador
export const getDashboardStats = dashboardController.getStats.bind(dashboardController);

// Exportar el controlador por defecto
export default dashboardController; 