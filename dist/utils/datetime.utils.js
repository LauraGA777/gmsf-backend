"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateTimeUtils = void 0;
const date_fns_tz_1 = require("date-fns-tz");
const date_fns_1 = require("date-fns");
// Zona horaria de Bogotá, Colombia
const BOGOTA_TIMEZONE = 'America/Bogota';
class DateTimeUtils {
    /**
     * Obtiene la fecha y hora actual en zona horaria de Bogotá
     */
    static nowInBogota() {
        const now = new Date();
        return (0, date_fns_tz_1.toZonedTime)(now, BOGOTA_TIMEZONE);
    }
    /**
     * Obtiene solo la fecha actual en zona horaria de Bogotá (sin horas)
     */
    static todayInBogota() {
        const now = this.nowInBogota();
        return (0, date_fns_1.startOfDay)(now);
    }
    /**
     * Obtiene la hora actual en formato HH:mm:ss en zona horaria de Bogotá
     */
    static currentTimeInBogota() {
        const now = new Date(); // UTC
        return (0, date_fns_tz_1.format)(now, 'HH:mm:ss', { timeZone: BOGOTA_TIMEZONE });
    }
    /**
     * Convierte una fecha a zona horaria de Bogotá
     */
    static toBogotaTime(date) {
        return (0, date_fns_tz_1.toZonedTime)(date, BOGOTA_TIMEZONE);
    }
    /**
     * Convierte una fecha de zona horaria de Bogotá a UTC
     */
    static fromBogotaTimeToUtc(date) {
        return (0, date_fns_tz_1.fromZonedTime)(date, BOGOTA_TIMEZONE);
    }
    /**
     * Formatea una fecha en zona horaria de Bogotá
     */
    static formatInBogota(date, formatStr = 'yyyy-MM-dd HH:mm:ss') {
        return (0, date_fns_tz_1.format)(date, formatStr, { timeZone: BOGOTA_TIMEZONE });
    }
    /**
     * Obtiene el inicio del día en zona horaria de Bogotá
     */
    static startOfDayInBogota(date) {
        const targetDate = date || this.nowInBogota();
        const zonedDate = this.toBogotaTime(targetDate);
        return (0, date_fns_1.startOfDay)(zonedDate);
    }
    /**
     * Obtiene el final del día en zona horaria de Bogotá
     */
    static endOfDayInBogota(date) {
        const targetDate = date || this.nowInBogota();
        const zonedDate = this.toBogotaTime(targetDate);
        return (0, date_fns_1.endOfDay)(zonedDate);
    }
    /**
     * Verifica si una fecha está en el día actual en zona horaria de Bogotá
     */
    static isToday(date) {
        const today = this.todayInBogota();
        const targetDate = this.toBogotaTime(date);
        return (0, date_fns_1.isToday)(targetDate) &&
            (0, date_fns_1.format)(targetDate, 'yyyy-MM-dd') === (0, date_fns_1.format)(today, 'yyyy-MM-dd');
    }
    /**
     * Crea un rango de fechas para buscar registros del día actual en Bogotá
     */
    static getTodayRange() {
        const start = this.startOfDayInBogota();
        const end = this.endOfDayInBogota();
        return { start, end };
    }
    /**
     * Crea una fecha específica en zona horaria de Bogotá
     */
    static createDateInBogota(year, month, day, hour = 0, minute = 0, second = 0) {
        const localDate = new Date(year, month - 1, day, hour, minute, second);
        return this.fromBogotaTimeToUtc(localDate);
    }
    /**
     * Obtiene información legible de la zona horaria actual
     */
    static getTimezoneInfo() {
        const now = new Date();
        const formatted = (0, date_fns_tz_1.format)(now, 'yyyy-MM-dd HH:mm:ss zzz', { timeZone: BOGOTA_TIMEZONE });
        return `Zona horaria: ${BOGOTA_TIMEZONE}, Fecha/Hora actual: ${formatted}`;
    }
    // Obtener rango del mes actual
    static getCurrentMonthRange() {
        const now = this.nowInBogota();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        return { start, end };
    }
    // Obtener rango de la semana actual
    static getCurrentWeekRange() {
        const now = this.nowInBogota();
        const dayOfWeek = now.getDay();
        const start = new Date(now);
        start.setDate(now.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return { start, end };
    }
    // Obtener rango del año actual
    static getCurrentYearRange() {
        const now = this.nowInBogota();
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        return { start, end };
    }
}
exports.DateTimeUtils = DateTimeUtils;
exports.default = DateTimeUtils;
