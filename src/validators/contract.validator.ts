import { z } from "zod";

// Base schema for contract data
const contractBaseSchema = z.object({
  id_persona: z.number({
    required_error: "El ID de la persona es requerido",
  }),
  id_membresia: z.number({
    required_error: "El ID de la membresía es requerida",
  }),
  fecha_inicio: z
    .string()
    .refine((date: string) => !isNaN(Date.parse(date)), {
      message: "Fecha de inicio inválida",
    })
    .refine(
      (date: string) => {
        const startDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return startDate >= today;
      },
      {
        message: "La fecha de inicio no puede ser anterior a la fecha actual",
      }
    ),
  usuario_registro: z.number().optional(),
});

// Schema for creating a new contract
export const createContractSchema = contractBaseSchema;

// Schema for updating an existing contract
export const updateContractSchema = z
  .object({
    id_membresia: z.number().optional(),
    fecha_inicio: z
      .string()
      .refine((date: string) => !isNaN(Date.parse(date)), {
        message: "Fecha de inicio inválida",
      })
      .refine(
        (date: string) => {
          const startDate = new Date(date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return startDate >= today;
        },
        {
          message: "La fecha de inicio no puede ser anterior a la fecha actual",
        }
      )
      .optional(),
    estado: z
      .enum(["Activo", "Congelado", "Vencido", "Cancelado", "Por vencer"])
      .optional(),
    usuario_actualizacion: z.number().optional(),
    motivo: z.string().optional(),
  })
  .partial();

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

// Schema for renewing a contract
export const renewContractSchema = z.object({
  id_contrato: z.number({
    required_error: "El ID del contrato es requerido",
  }),
  id_membresia: z.number({
    required_error: "El ID de la membresía es requerido",
  }),
  fecha_inicio: z
    .string()
    .refine((date: string) => !isNaN(Date.parse(date)), {
      message: "Fecha de inicio inválida",
    })
    .refine(
      (date: string) => {
        const startDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return startDate >= today;
      },
      {
        message: "La fecha de inicio no puede ser anterior a la fecha actual",
      }
    ),
  usuario_registro: z.number({
    required_error: "El ID del usuario que registra es requerido",
  }),
});

// Schema for freezing a contract
export const freezeContractSchema = z.object({
  id_contrato: z.number({
    required_error: "El ID del contrato es requerido",
  }),
  motivo: z.string({
    required_error: "El motivo es requerido",
  }),
  usuario_actualizacion: z.number({
    required_error: "El ID del usuario que actualiza es requerido",
  }),
});
