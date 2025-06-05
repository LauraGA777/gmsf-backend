import { z } from 'zod';

// Esquema de validación para parámetros de consulta
export const listMembershipSchema = z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    orderBy: z.string().optional().default('nombre'),
    direction: z.enum(['ASC', 'DESC']).optional().default('ASC'),
    estado: z.string().optional().transform(val => val === 'true')
});

// Esquema de validación para parámetros de búsqueda
export const searchMembershipSchema = z.object({
    codigo: z.string().optional(),
    nombre: z.string().optional(),
    descripcion: z.string().optional(),
    estado: z.string().optional().transform(val => {
        if (val === 'true') return true;
        if (val === 'false') return false;
        return undefined;
    }),
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    orderBy: z.string().optional().default('nombre'),
    direction: z.enum(['ASC', 'DESC']).optional().default('ASC')
});

// Esquema de validación para crear membresía
export const createMembershipSchema = z.object({
    // Falta validación del campo código que debe seguir el patrón ^M\d{3}$
    codigo: z.string()
        .regex(/^M\d{3}$/, "El código debe tener el formato M seguido de 3 dígitos"),
    nombre: z.string()
        .min(1, 'El nombre es requerido')
        .max(100, 'El nombre no puede exceder los 100 caracteres'),
    descripcion: z.string()
        .min(1, 'La descripción es requerida'),
    precio: z.number()
        .positive('El precio debe ser mayor a 0')
        .max(9999999.99, 'El precio no puede exceder 9,999,999.99'),
    dias_acceso: z.number()
        .int('Los días de acceso deben ser un número entero')
        .positive('Los días de acceso deben ser mayor a 0'),
    vigencia_dias: z.number()
        .int('Los días de vigencia deben ser un número entero')
        .positive('Los días de vigencia deben ser mayor a 0')
});

// Esquema de validación para actualizar membresía
export const updateMembershipSchema = z.object({
    nombre: z.string()
        .min(1, 'El nombre es requerido')
        .max(100, 'El nombre no puede exceder los 100 caracteres'),
    descripcion: z.string()
        .min(1, 'La descripción es requerida'),
    precio: z.number()
        .positive('El precio debe ser mayor a 0')
        .max(9999999.99, 'El precio no puede exceder 9,999,999.99'),
    dias_acceso: z.number()
        .int('Los días de acceso deben ser un número entero')
        .positive('Los días de acceso deben ser mayor a 0'),
    vigencia_dias: z.number()
        .int('Los días de vigencia deben ser un número entero')
        .positive('Los días de vigencia deben ser mayor a 0')
});

// Esquema para validar el ID
export const idSchema = z.object({
    id: z.string().regex(/^\d+$/, 'El ID debe ser un número')
        .transform(val => parseInt(val))
});

// Interfaces para los tipos de datos
export interface QueryParams {
    page?: string;
    limit?: string;
    orderBy?: string;
    direction?: 'ASC' | 'DESC';
    estado?: string;
}

export interface SearchParams {
    codigo?: string;
    nombre?: string;
    descripcion?: string;
    estado?: string;
    page?: string;
    limit?: string;
    orderBy?: string;
    direction?: 'ASC' | 'DESC';
}

export interface CreateMembershipData {
    nombre: string;
    descripcion: string;
    precio: number;
    dias_acceso: number;
    vigencia_dias: number;
}

// Interfaz para datos de actualización de membresía
export interface UpdateMembershipData {
    nombre: string;
    descripcion: string;
    precio: number;
    dias_acceso: number;
    vigencia_dias: number;
} 