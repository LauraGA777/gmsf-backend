import { fromZonedTime, toZonedTime, format as formatTz } from 'date-fns-tz';
import { startOfDay, endOfDay, format, isToday as isDateToday } from 'date-fns';

// Zona horaria de Bogotá, Colombia
const BOGOTA_TIMEZONE = 'America/Bogota';

export class DateTimeUtils {
    /**
     * Obtiene la fecha y hora actual en zona horaria de Bogotá
     */
    static nowInBogota(): Date {
        const now = new Date();
        return toZonedTime(now, BOGOTA_TIMEZONE);
    }

    /**
     * Obtiene solo la fecha actual en zona horaria de Bogotá (sin horas)
     */
    static todayInBogota(): Date {
        const now = this.nowInBogota();
        return startOfDay(now);
    }

    /**
     * Obtiene la hora actual en formato HH:mm:ss en zona horaria de Bogotá
     */
    static currentTimeInBogota(): string {
        const now = this.nowInBogota();
        return format(now, 'HH:mm:ss');
    }

    /**
     * Convierte una fecha a zona horaria de Bogotá
     */
    static toBogotaTime(date: Date): Date {
        return toZonedTime(date, BOGOTA_TIMEZONE);
    }

    /**
     * Convierte una fecha de zona horaria de Bogotá a UTC
     */
    static fromBogotaTimeToUtc(date: Date): Date {
        return fromZonedTime(date, BOGOTA_TIMEZONE);
    }

    /**
     * Formatea una fecha en zona horaria de Bogotá
     */
    static formatInBogota(date: Date, formatStr: string = 'yyyy-MM-dd HH:mm:ss'): string {
        const zonedDate = this.toBogotaTime(date);
        return format(zonedDate, formatStr);
    }

    /**
     * Obtiene el inicio del día en zona horaria de Bogotá
     */
    static startOfDayInBogota(date?: Date): Date {
        const targetDate = date || this.nowInBogota();
        const zonedDate = this.toBogotaTime(targetDate);
        return startOfDay(zonedDate);
    }

    /**
     * Obtiene el final del día en zona horaria de Bogotá
     */
    static endOfDayInBogota(date?: Date): Date {
        const targetDate = date || this.nowInBogota();
        const zonedDate = this.toBogotaTime(targetDate);
        return endOfDay(zonedDate);
    }

    /**
     * Verifica si una fecha está en el día actual en zona horaria de Bogotá
     */
    static isToday(date: Date): boolean {
        const today = this.todayInBogota();
        const targetDate = this.toBogotaTime(date);
        
        return isDateToday(targetDate) && 
               format(targetDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
    }

    /**
     * Crea un rango de fechas para buscar registros del día actual en Bogotá
     */
    static getTodayRange(): { start: Date; end: Date } {
        const start = this.startOfDayInBogota();
        const end = this.endOfDayInBogota();
        
        return { start, end };
    }

    /**
     * Crea una fecha específica en zona horaria de Bogotá
     */
    static createDateInBogota(year: number, month: number, day: number, hour = 0, minute = 0, second = 0): Date {
        const localDate = new Date(year, month - 1, day, hour, minute, second);
        return this.fromBogotaTimeToUtc(localDate);
    }

    /**
     * Obtiene información legible de la zona horaria actual
     */
    static getTimezoneInfo(): string {
        const now = this.nowInBogota();
        return `Zona horaria: ${BOGOTA_TIMEZONE}, Fecha/Hora actual: ${this.formatInBogota(now)}`;
    }
}

export default DateTimeUtils;
