import { z } from "zod";

// Base schema for contract data
const contractBaseSchema = z.object({
  codigo: z
    .string()
    .regex(
      /^C\d{4}$/,
      "El código debe tener el formato C seguido de 4 dígitos"
    ),
  id_persona: z.number(),
  id_membresia: z.number(),
  fecha_inicio: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha de inicio inválida",
  }),
  fecha_fin: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha de fin inválida",
  }),
  membresia_precio: z.number().positive(),
  estado: z.enum(["Activo", "Congelado", "Vencido", "Cancelado", "Por vencer"]),
  usuario_registro: z.number().optional(),
});

// Schema for creating a new contract
export const createContractSchema = contractBaseSchema;

// Schema for updating an existing contract
export const updateContractSchema = contractBaseSchema.partial().extend({
  usuario_actualizacion: z.number().optional(),
  motivo: z.string().optional(),
});

// Schema for contract query parameters
export const contractQuerySchema = z.object({
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("10"),
  search: z.string().optional(),
  estado: z
    .enum(["Activo", "Congelado", "Vencido", "Cancelado", "Por vencer"])
    .optional(),
  id_persona: z.string().transform(Number).optional(),
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional(),
});

// Schema for contract ID parameter
export const contractIdSchema = z.object({
  id: z.string().transform((val) => Number(val)),
});

// Schema for renewing a contract
export const renewContractSchema = z.object({
  id_contrato: z.number(),
  id_membresia: z.number(),
  fecha_inicio: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha de inicio inválida",
  }),
  fecha_fin: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha de fin inválida",
  }),
  membresia_precio: z.number().positive(),
  usuario_registro: z.number(),
});

// Schema for freezing a contract
export const freezeContractSchema = z.object({
  id_contrato: z.number(),
  motivo: z.string(),
  usuario_actualizacion: z.number(),
});
