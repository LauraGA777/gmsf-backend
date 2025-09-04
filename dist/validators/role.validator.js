"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRoleSchema = exports.updateRoleSchema = exports.createRoleSchema = exports.idSchema = void 0;
const zod_1 = require("zod");
// Schema para validar ID
exports.idSchema = zod_1.z.object({
    id: zod_1.z.string().or(zod_1.z.number()).transform(val => Number(val))
});
// Schema para crear un rol
exports.createRoleSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(3).max(50),
    descripcion: zod_1.z.string().optional(),
    estado: zod_1.z.boolean().default(true),
    permisos: zod_1.z.array(zod_1.z.number()).min(1, "Debe seleccionar al menos un permiso"),
    privilegios: zod_1.z.array(zod_1.z.number()).min(1, "Debe seleccionar al menos un privilegio")
});
// Schema para actualizar un rol
exports.updateRoleSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(3).max(50).optional(),
    descripcion: zod_1.z.string().optional(),
    estado: zod_1.z.boolean().optional(),
    permisos: zod_1.z.array(zod_1.z.number()).min(1, "Debe seleccionar al menos un permiso").optional(),
    privilegios: zod_1.z.array(zod_1.z.number()).min(1, "Debe seleccionar al menos un privilegio").optional()
});
// Schema para búsqueda y paginación
exports.searchRoleSchema = zod_1.z.object({
    q: zod_1.z.string().optional(),
    pagina: zod_1.z.number().int().positive().default(1),
    limite: zod_1.z.number().int().positive().max(50).default(10),
    orden: zod_1.z.enum(['id', 'codigo', 'nombre']).default('nombre'),
    direccion: zod_1.z.enum(['ASC', 'DESC']).default('ASC')
});
