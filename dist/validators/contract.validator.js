"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractIdSchema = exports.contractQuerySchema = exports.updateContractSchema = exports.createContractSchema = void 0;
const zod_1 = require("zod");
const fechaInicioSchema = zod_1.z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha de inicio inválida",
})
    .refine((date) => {
    // Use string comparison for dates to avoid timezone issues.
    // This is the most robust way to compare dates regardless of server/client timezone.
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    return date >= todayString;
}, {
    message: "La fecha de inicio no puede ser anterior a la fecha actual",
});
// Base schema for contract data
const contractBaseSchema = zod_1.z.object({
    id_persona: zod_1.z.number({
        required_error: "El ID de la persona es requerido",
    }),
    id_membresia: zod_1.z.number({
        required_error: "El ID de la membresía es requerida",
    }),
    fecha_inicio: fechaInicioSchema,
    usuario_registro: zod_1.z.number().optional(),
});
// Schema for creating a new contract
exports.createContractSchema = contractBaseSchema;
// Schema for updating an existing contract
exports.updateContractSchema = zod_1.z.object({
    id_membresia: zod_1.z.number().optional(),
    fecha_inicio: zod_1.z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), {
        message: "Fecha de inicio inválida",
    })
        .optional(),
    estado: zod_1.z
        .enum(["Activo", "Congelado", "Vencido", "Cancelado", "Por vencer"])
        .optional(),
    usuario_actualizacion: zod_1.z.number().optional(),
    motivo: zod_1.z.string().optional(),
});
// Schema for contract query parameters
exports.contractQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).default("1"),
    limit: zod_1.z.string().transform(Number).default("10"),
    search: zod_1.z.string().optional(),
    estado: zod_1.z
        .enum(["Activo", "Congelado", "Vencido", "Cancelado", "Por vencer"])
        .optional(),
    id_persona: zod_1.z.string().transform(Number).optional(),
    fecha_inicio: zod_1.z.string().optional(),
    fecha_fin: zod_1.z.string().optional(),
});
// Schema for contract ID parameter
exports.contractIdSchema = zod_1.z.object({
    id: zod_1.z.string().transform((val) => Number(val)),
});
