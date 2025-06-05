import { z } from "zod";

// Base schema for training session data
const trainingBaseSchema = z.object({
  titulo: z.string().min(3).max(100),
  descripcion: z.string().optional(),
  fecha_inicio: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha de inicio inválida",
  }),
  fecha_fin: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha de fin inválida",
  }),
  id_entrenador: z.number(),
  id_cliente: z.number(),
  estado: z
    .enum(["Programado", "Completado", "Cancelado"])
    .default("Programado"),
  notas: z.string().optional(),
});

// Schema for creating a new training session
export const createTrainingSchema = trainingBaseSchema;

// Schema for updating an existing training session
export const updateTrainingSchema = trainingBaseSchema.partial();

// Schema for training session query parameters
export const trainingQuerySchema = z.object({
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("10"),
  search: z.string().optional(),
  estado: z.enum(["Programado", "Completado", "Cancelado"]).optional(),
  id_entrenador: z.string().transform(Number).optional(),
  id_cliente: z.string().transform(Number).optional(),
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional(),
});

// Schema for training session ID parameter
export const trainingIdSchema = z.object({
  id: z.string().transform((val) => Number(val)),
});

// Schema for checking schedule availability
export const availabilitySchema = z.object({
  fecha_inicio: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha de inicio inválida",
  }),
  fecha_fin: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha de fin inválida",
  }),
  id_entrenador: z.number().optional(),
});
