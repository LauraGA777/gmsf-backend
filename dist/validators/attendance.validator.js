"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttendanceSchema = exports.updateAttendanceSchema = exports.searchAttendanceSchema = exports.listAttendanceSchema = exports.createAttendanceSchema = exports.idSchema = void 0;
const zod_1 = require("zod");
// Esquema para validar ID
exports.idSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/, 'El ID debe ser un número')
});
// Esquema para crear asistencia
exports.createAttendanceSchema = zod_1.z.object({
    id_persona: zod_1.z.number({
        required_error: 'El ID de la persona es requerido'
    }),
    id_contrato: zod_1.z.number({
        required_error: 'El ID del contrato es requerido',
        invalid_type_error: 'El ID del contrato debe ser un número'
    }),
    fecha_uso: zod_1.z.date().default(() => new Date()),
    hora_registro: zod_1.z.string().time({
        message: 'La hora debe tener un formato válido (HH:MM:SS)'
    }),
    estado: zod_1.z.enum(['Activo', 'Eliminado'], {
        required_error: 'El estado es requerido'
    }).default('Activo'),
    usuario_registro: zod_1.z.number().optional(),
    usuario_actualizacion: zod_1.z.number().optional()
});
// Esquema para listar asistencias
exports.listAttendanceSchema = zod_1.z.object({
    page: zod_1.z.string().optional(),
    limit: zod_1.z.string().optional(),
    orderBy: zod_1.z.enum(['fecha_uso', 'fecha_registro', 'estado']).optional(),
    direction: zod_1.z.enum(['ASC', 'DESC']).optional(),
    fecha_inicio: zod_1.z.string().datetime().optional(),
    fecha_fin: zod_1.z.string().datetime().optional()
}).refine((data) => {
    if (data.fecha_inicio || data.fecha_fin) {
        return data.fecha_inicio && data.fecha_fin;
    }
    return true;
}, {
    message: 'Si se proporciona una fecha, debe proporcionar tanto fecha de inicio como fecha fin'
}).refine((data) => {
    if (data.fecha_inicio && data.fecha_fin) {
        return new Date(data.fecha_fin) >= new Date(data.fecha_inicio);
    }
    return true;
}, {
    message: 'La fecha fin debe ser mayor o igual a la fecha de inicio'
});
// Esquema para búsqueda de asistencias
exports.searchAttendanceSchema = zod_1.z.object({
    codigo_usuario: zod_1.z.string().optional(),
    nombre_usuario: zod_1.z.string().optional(),
    estado: zod_1.z.enum(['Activo', 'Eliminado']).optional(),
    fecha_inicio: zod_1.z.string().datetime().optional(),
    fecha_fin: zod_1.z.string().datetime().optional(),
    page: zod_1.z.string().optional(),
    limit: zod_1.z.string().optional(),
    orderBy: zod_1.z.enum(['fecha_uso', 'fecha_registro', 'estado']).optional(),
    direction: zod_1.z.enum(['ASC', 'DESC']).optional()
}).refine((data) => {
    if (data.fecha_inicio || data.fecha_fin) {
        return data.fecha_inicio && data.fecha_fin;
    }
    return true;
}, {
    message: 'Si se proporciona una fecha, debe proporcionar tanto fecha de inicio como fecha fin'
}).refine((data) => {
    if (data.fecha_inicio && data.fecha_fin) {
        return new Date(data.fecha_fin) >= new Date(data.fecha_inicio);
    }
    return true;
}, {
    message: 'La fecha fin debe ser mayor o igual a la fecha de inicio'
});
// Esquema para actualizar asistencia
exports.updateAttendanceSchema = zod_1.z.object({
    estado: zod_1.z.enum(['Activo', 'Eliminado']),
    usuario_actualizacion: zod_1.z.number()
});
// Esquema para eliminar asistencias
exports.deleteAttendanceSchema = zod_1.z.object({
    fecha_inicio: zod_1.z.string().datetime({
        message: 'La fecha de inicio debe ser una fecha válida'
    }),
    fecha_fin: zod_1.z.string().datetime({
        message: 'La fecha fin debe ser una fecha válida'
    }),
    usuario_actualizacion: zod_1.z.number()
}).refine((data) => {
    return new Date(data.fecha_fin) >= new Date(data.fecha_inicio);
}, {
    message: 'La fecha fin debe ser mayor o igual a la fecha de inicio'
});
