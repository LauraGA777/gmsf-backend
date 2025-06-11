import { z } from "zod";

const fechaInicioSchema = z
  .string()
  .refine((date: string) => !isNaN(Date.parse(date)), {
    message: "Fecha de inicio inválida",
  })
  .refine(
    (date: string) => {
      // Use string comparison for dates to avoid timezone issues.
      // This is the most robust way to compare dates regardless of server/client timezone.
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
      const day = String(today.getDate()).padStart(2, '0');
      const todayString = `${year}-${month}-${day}`;

      return date >= todayString;
    },
    {
      message: "La fecha de inicio no puede ser anterior a la fecha actual",
    }
  );

// Base schema for contract data
const contractBaseSchema = z.object({
  id_persona: z.number({
    required_error: "El ID de la persona es requerido",
  }),
  id_membresia: z.number({
    required_error: "El ID de la membresía es requerida",
  }),
  fecha_inicio: fechaInicioSchema,
  usuario_registro: z.number().optional(),
});

// Schema for creating a new contract
export const createContractSchema = contractBaseSchema;

// Schema for updating an existing contract
export const updateContractSchema = z.object({
  id_membresia: z.number().optional(),
  fecha_inicio: z
    .string()
    .refine((date: string) => !isNaN(Date.parse(date)), {
        message: "Fecha de inicio inválida",
    })
    .optional(),
  estado: z
    .enum(["Activo", "Congelado", "Vencido", "Cancelado", "Por vencer"])
    .optional(),
  usuario_actualizacion: z.preprocess(
      (val) => (typeof val === 'string' && val.trim() !== '' ? parseInt(val, 10) : val),
      z.number()
    )
    .nullable()
    .optional(),
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
  id: z.string().transform((val: string) => Number(val)),
});
