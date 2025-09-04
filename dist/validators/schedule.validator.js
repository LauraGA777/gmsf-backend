"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientCreateTrainingSchema = exports.clientAvailableSlotsSchema = exports.availabilitySchema = exports.trainingIdSchema = exports.trainingQuerySchema = exports.updateTrainingSchema = exports.createTrainingSchema = void 0;
const zod_1 = require("zod");
// Base schema for training session data
const trainingBaseSchema = zod_1.z.object({
    titulo: zod_1.z.string().min(1).max(100),
    descripcion: zod_1.z.string().optional(),
    fecha_inicio: zod_1.z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Fecha de inicio inválida",
    }),
    fecha_fin: zod_1.z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Fecha de fin inválida",
    }),
    id_entrenador: zod_1.z.number(),
    id_cliente: zod_1.z.number(),
    estado: zod_1.z
        .enum(["Programado", "En proceso", "Completado", "Cancelado"])
        .default("Programado"),
    notas: zod_1.z.string().optional(),
});
// Schema for creating a new training session
exports.createTrainingSchema = trainingBaseSchema;
// Schema for updating an existing training session
exports.updateTrainingSchema = trainingBaseSchema.partial();
// Schema for training session query parameters
exports.trainingQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).default("1"),
    limit: zod_1.z.string().transform(Number).default("10"),
    search: zod_1.z.string().optional(),
    estado: zod_1.z.enum(["Programado", "En proceso", "Completado", "Cancelado"]).optional(),
    id_entrenador: zod_1.z.string().transform(Number).optional(),
    id_cliente: zod_1.z.string().transform(Number).optional(),
    fecha_inicio: zod_1.z.string().optional(),
    fecha_fin: zod_1.z.string().optional(),
});
// Schema for training session ID parameter
exports.trainingIdSchema = zod_1.z.object({
    id: zod_1.z.string().transform((val) => Number(val)),
});
// Schema for checking schedule availability
exports.availabilitySchema = zod_1.z.object({
    fecha_inicio: zod_1.z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Fecha de inicio inválida",
    }),
    fecha_fin: zod_1.z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Fecha de fin inválida",
    }),
    id_entrenador: zod_1.z.number().optional(),
});
// === VALIDADORES ESPECÍFICOS PARA CLIENTES ===
// Schema for client available time slots query
exports.clientAvailableSlotsSchema = zod_1.z.object({
    fecha: zod_1.z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Fecha inválida",
    }),
    id_entrenador: zod_1.z.string().transform(Number).optional(),
});
// Schema for client training creation (más restrictivo)
exports.clientCreateTrainingSchema = zod_1.z.object({
    titulo: zod_1.z.string().min(1).max(100).optional().default("Sesión de Entrenamiento Personal"),
    descripcion: zod_1.z.string().max(500).optional(),
    fecha_inicio: zod_1.z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Fecha de inicio inválida",
    }),
    fecha_fin: zod_1.z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Fecha de fin inválida",
    }),
    id_entrenador: zod_1.z.number().min(1, "Debe seleccionar un entrenador"),
    notas: zod_1.z.string().max(200).optional(),
});
