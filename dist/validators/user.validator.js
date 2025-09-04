"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainerCreateSchema = exports.searchUserSchema = exports.updateUserSchema = exports.userCreateSchema = exports.idSchema = void 0;
const zod_1 = require("zod");
const contact_validator_1 = require("./contact.validator");
exports.idSchema = zod_1.z.object({
    id: zod_1.z.string().or(zod_1.z.number()).transform(val => Number(val))
});
exports.userCreateSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(3).max(100),
    apellido: zod_1.z.string().min(3).max(100),
    correo: contact_validator_1.emailValidator,
    telefono: contact_validator_1.phoneValidator.optional(),
    direccion: zod_1.z.string().optional(),
    genero: zod_1.z.enum(['M', 'F', 'O']).optional(),
    tipo_documento: zod_1.z.enum(['CC', 'CE', 'TI', 'PP', 'DIE']),
    numero_documento: zod_1.z.string().min(5).max(20),
    fecha_nacimiento: zod_1.z.string().transform(val => new Date(val)),
    id_rol: zod_1.z.number().optional()
});
exports.updateUserSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(3).max(100).optional(),
    apellido: zod_1.z.string().min(3).max(100).optional(),
    correo: contact_validator_1.emailValidator.optional(),
    telefono: contact_validator_1.phoneValidator.optional(),
    direccion: zod_1.z.string().optional(),
    genero: zod_1.z.enum(['M', 'F', 'O']).optional(),
    tipo_documento: zod_1.z.enum(['CC', 'CE', 'TI', 'PP', 'DIE']).optional(),
    numero_documento: zod_1.z.string().min(5).max(20).optional(),
    fecha_nacimiento: zod_1.z.string().transform(val => new Date(val)).optional(),
    id_rol: zod_1.z.number().optional()
});
exports.searchUserSchema = zod_1.z.object({
    q: zod_1.z.string().optional(),
    pagina: zod_1.z.string().or(zod_1.z.number()).transform(val => Math.max(1, Number(val))).default('1'),
    limite: zod_1.z.string().or(zod_1.z.number()).transform(val => Math.min(50, Math.max(1, Number(val)))).default('10'),
    orden: zod_1.z.enum(['id', 'nombre', 'apellido', 'correo', 'codigo']).default('nombre'),
    direccion: zod_1.z.enum(['ASC', 'DESC']).default('ASC')
});
// Agregar un esquema específico para creación de entrenadores
exports.trainerCreateSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(3).max(100),
    apellido: zod_1.z.string().min(3).max(100),
    correo: contact_validator_1.emailValidator,
    contrasena: zod_1.z.string().min(6), // Contraseña requerida para entrenadores
    telefono: contact_validator_1.phoneValidator.optional(),
    direccion: zod_1.z.string().optional(),
    genero: zod_1.z.enum(['M', 'F', 'O']).optional(),
    tipo_documento: zod_1.z.enum(['CC', 'CE', 'TI', 'PP', 'DIE']),
    numero_documento: zod_1.z.string().min(5).max(20),
    fecha_nacimiento: zod_1.z.string().transform(val => new Date(val)),
    id_rol: zod_1.z.number().optional()
});
