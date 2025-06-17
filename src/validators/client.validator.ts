import { z } from "zod";

const emergencyContactSchema = z.object({
  nombre_contacto: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
  telefono_contacto: z.string()
    .regex(/^\d{7,15}$/, "El teléfono debe tener entre 7 y 15 dígitos"),
  relacion_contacto: z.string()
    .min(3, "La relación debe tener al menos 3 caracteres")
    .max(50, "La relación no puede tener más de 50 caracteres"),
  es_mismo_beneficiario: z.boolean().default(false),
});

const userDataSchema = z.object({
  id: z.number().optional(),
  nombre: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
  apellido: z.string()
    .min(3, "El apellido debe tener al menos 3 caracteres")
    .max(100, "El apellido no puede tener más de 100 caracteres"),
  correo: z.string()
    .email("Correo electrónico inválido")
    .min(5, "El correo es demasiado corto")
    .max(100, "El correo no puede tener más de 100 caracteres"),
  contrasena: z.string().refine(
    (val) => val.length === 0 || val.length >= 6,
    { message: "Si se proporciona, la contraseña debe tener al menos 6 caracteres" }
  ).optional(),
  telefono: z.string()
    .regex(/^\d{7,15}$/, "El teléfono debe tener entre 7 y 15 dígitos")
    .optional()
    .nullable(),
  direccion: z.string()
    .max(200, "La dirección no puede tener más de 200 caracteres")
    .optional()
    .nullable(),
  genero: z.enum(["M", "F", "O"])
    .optional()
    .nullable(),
  tipo_documento: z.enum(["CC", "CE", "TI", "PP", "DIE"]),
  numero_documento: z.string()
    .min(5, "El número de documento debe tener al menos 5 caracteres")
    .max(20, "El número de documento no puede tener más de 20 caracteres"),
  fecha_nacimiento: z.string().refine(
    (date) => {
      const birthDate = new Date(date);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 13;
    },
    { message: "El cliente debe tener al menos 13 años" }
  ),
  id_rol: z.number().optional(),
});

const beneficiarySchema = z.object({
  usuario: userDataSchema,
  relacion: z.string()
    .min(3, "La relación debe tener al menos 3 caracteres")
    .max(50, "La relación no puede tener más de 50 caracteres"),
  contactos_emergencia: z.array(emergencyContactSchema).optional(),
});

const updateBeneficiarySchema = z.object({
  id: z.number().optional(),
  usuario: userDataSchema.partial().extend({
    id: z.number().optional(),
  }),
  relacion: z.string()
    .min(3, "La relación debe tener al menos 3 caracteres")
    .max(50, "La relación no puede tener más de 50 caracteres"),
});

// Schema for creating a new client
export const createClientSchema = z.object({
  usuario: userDataSchema,
  contactos_emergencia: z.array(emergencyContactSchema)
    .min(1, "Se requiere al menos un contacto de emergencia"),
  beneficiarios: z.array(beneficiarySchema).optional(),
  relacion: z.string()
    .min(3, "La relación debe tener al menos 3 caracteres")
    .max(50, "La relación no puede tener más de 50 caracteres")
    .optional(),
  id_titular: z.number().optional(),
});

// Schema for updating an existing client
export const updateClientSchema = z.object({
  usuario: userDataSchema
    .partial()
    .omit({ numero_documento: true, tipo_documento: true })
    .optional(),
  contactos_emergencia: z
    .array(
      emergencyContactSchema.extend({
        id: z.number().optional(),
      })
    )
    .min(1, "Se requiere al menos un contacto de emergencia")
    .optional(),
  beneficiarios: z.array(updateBeneficiarySchema).optional(),
  relacion: z.string()
    .min(3, "La relación debe tener al menos 3 caracteres")
    .max(50, "La relación no puede tener más de 50 caracteres")
    .optional(),
  estado: z.boolean().optional(),
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

// Schema for client document parameter
export const clientDocumentSchema = z.object({
  tipo_documento: z.enum(["CC", "CE", "TI", "PP", "DIE"]),
  numero_documento: z.string()
    .min(5, "El número de documento debe tener al menos 5 caracteres")
    .max(20, "El número de documento no puede tener más de 20 caracteres"),
});
