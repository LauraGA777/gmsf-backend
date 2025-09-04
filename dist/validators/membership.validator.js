"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idSchema = exports.updateMembershipSchema = exports.createMembershipSchema = exports.searchMembershipSchema = exports.listMembershipSchema = void 0;
const zod_1 = require("zod");
// Esquema de validación para parámetros de consulta
exports.listMembershipSchema = zod_1.z.object({
    page: zod_1.z.string().optional().default('1'),
    limit: zod_1.z.string().optional().default('10'),
    orderBy: zod_1.z.string().optional().default('nombre'),
    direction: zod_1.z.enum(['ASC', 'DESC']).optional().default('ASC'),
    estado: zod_1.z.string().optional().transform(val => val === 'true')
});
// Esquema de validación para parámetros de búsqueda
exports.searchMembershipSchema = zod_1.z.object({
    codigo: zod_1.z.string().optional(),
    nombre: zod_1.z.string().optional(),
    descripcion: zod_1.z.string().optional(),
    estado: zod_1.z.string().optional().transform(val => {
        if (val === 'true')
            return true;
        if (val === 'false')
            return false;
        return undefined;
    }),
    page: zod_1.z.string().optional().default('1'),
    limit: zod_1.z.string().optional().default('10'),
    orderBy: zod_1.z.string().optional().default('nombre'),
    direction: zod_1.z.enum(['ASC', 'DESC']).optional().default('ASC')
});
// Esquema de validación para crear membresía
exports.createMembershipSchema = zod_1.z.object({
    // Falta validación del campo código que debe seguir el patrón ^M\d{3}$
    nombre: zod_1.z.string()
        .min(1, 'El nombre es requerido')
        .max(100, 'El nombre no puede exceder los 100 caracteres'),
    descripcion: zod_1.z.string()
        .min(1, 'La descripción es requerida'),
    precio: zod_1.z.number()
        .positive('El precio debe ser mayor a 0')
        .max(9999999.99, 'El precio no puede exceder 9,999,999.99'),
    dias_acceso: zod_1.z.number()
        .int('Los días de acceso deben ser un número entero')
        .positive('Los días de acceso deben ser mayor a 0'),
    vigencia_dias: zod_1.z.number()
        .int('Los días de vigencia deben ser un número entero')
        .positive('Los días de vigencia deben ser mayor a 0')
});
// Esquema de validación para actualizar membresía
exports.updateMembershipSchema = zod_1.z.object({
    nombre: zod_1.z.string()
        .min(1, 'El nombre es requerido')
        .max(100, 'El nombre no puede exceder los 100 caracteres'),
    descripcion: zod_1.z.string()
        .min(1, 'La descripción es requerida'),
    precio: zod_1.z.number()
        .positive('El precio debe ser mayor a 0')
        .max(9999999.99, 'El precio no puede exceder 9,999,999.99'),
    dias_acceso: zod_1.z.number()
        .int('Los días de acceso deben ser un número entero')
        .positive('Los días de acceso deben ser mayor a 0'),
    vigencia_dias: zod_1.z.number()
        .int('Los días de vigencia deben ser un número entero')
        .positive('Los días de vigencia deben ser mayor a 0')
});
// Esquema para validar el ID
exports.idSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/, 'El ID debe ser un número')
        .transform(val => parseInt(val))
});
