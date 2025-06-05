import { z } from "zod";

// Base schema for client data
const clientBaseSchema = z.object({
  id_usuario: z.number().optional(),
  codigo: z
    .string()
    .regex(
      /^P\d{3}$/,
      "El código debe tener el formato P seguido de 3 dígitos"
    ),
  id_titular: z.number().optional(),
  relacion: z.string().max(50).optional(),
  estado: z.boolean().default(true),
});

// Schema for creating a new client
export const createClientSchema = clientBaseSchema.extend({
  usuario: z
    .object({
      nombre: z.string().min(3).max(100),
      apellido: z.string().min(3).max(100),
      correo: z.string().email(),
      contrasena: z.string().min(6),
      telefono: z
        .string()
        .regex(/^\d{7,15}$/)
        .optional(),
      direccion: z.string().optional(),
      genero: z.enum(["M", "F", "O"]).optional(),
      tipo_documento: z.enum(["CC", "CE", "TI", "PP", "DIE"]).optional(),
      numero_documento: z.string().min(5).max(20),
      fecha_nacimiento: z.string().refine(
        (date) => {
          const birthDate = new Date(date);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          return age >= 15;
        },
        { message: "El cliente debe tener al menos 15 años" }
      ),
    })
    .optional(),
  contactos_emergencia: z
    .array(
      z.object({
        nombre_contacto: z.string().min(3).max(100),
        telefono_contacto: z.string().regex(/^\d{7,15}$/),
        relacion_contacto: z.string().max(50).optional(),
        es_mismo_beneficiario: z.boolean().default(false),
      })
    )
    .optional(),
});

// Schema for updating an existing client
export const updateClientSchema = clientBaseSchema.partial().extend({
  usuario: z
    .object({
      nombre: z.string().min(3).max(100).optional(),
      apellido: z.string().min(3).max(100).optional(),
      correo: z.string().email().optional(),
      telefono: z
        .string()
        .regex(/^\d{7,15}$/)
        .optional(),
      direccion: z.string().optional(),
      genero: z.enum(["M", "F", "O"]).optional(),
      tipo_documento: z.enum(["CC", "CE", "TI", "PP", "DIE"]).optional(),
      numero_documento: z.string().min(5).max(20).optional(),
      fecha_nacimiento: z.string().optional(),
    })
    .optional(),
  contactos_emergencia: z
    .array(
      z.object({
        id: z.number().optional(),
        nombre_contacto: z.string().min(3).max(100),
        telefono_contacto: z.string().regex(/^\d{7,15}$/),
        relacion_contacto: z.string().max(50).optional(),
        es_mismo_beneficiario: z.boolean().default(false),
      })
    )
    .optional(),
});

// Schema for client query parameters
export const clientQuerySchema = z.object({
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("10"),
  search: z.string().optional(),
  estado: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  id_titular: z.string().transform(Number).optional(),
});

// Schema for client ID parameter
export const clientIdSchema = z.object({
  id: z.string().transform((val) => Number(val)),
});
