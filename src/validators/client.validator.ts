import { z } from "zod";

const emergencyContactSchema = z.object({
  nombre_contacto: z.string().min(3).max(100),
  telefono_contacto: z.string().regex(/^\d{7,15}$/),
  relacion_contacto: z.string().max(50).optional(),
  es_mismo_beneficiario: z.boolean().default(false),
});

const userDataSchema = z.object({
  id: z.number().optional(), // Allow passing ID for existing users
  nombre: z.string().min(3).max(100),
  apellido: z.string().min(3).max(100),
  correo: z.string().email(),
  contrasena: z.string().min(6).optional(),
  telefono: z.string().regex(/^\d{7,15}$/).optional(),
  direccion: z.string().optional(),
  genero: z.enum(["M", "F", "O"]).optional().nullable(),
  tipo_documento: z.enum(["CC", "CE", "TI", "PP", "DIE"]),
  numero_documento: z.string().min(5).max(20),
  fecha_nacimiento: z.string().refine(
    (date) => {
      const birthDate = new Date(date);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 15;
    },
    { message: "El cliente debe tener al menos 15 años" }
  ),
  id_rol: z.number().optional(),
});

const createUserDataSchema = userDataSchema.superRefine((data, ctx) => {
  if (!data.id && !data.contrasena) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["contrasena"],
      message: "La contraseña es requerida para nuevos usuarios",
    });
  }
});


const beneficiarySchema = z.object({
  usuario: userDataSchema, // Beneficiaries don't need the strict password check in this context
  relacion: z.string().min(2).max(50),
  contactos_emergencia: z.array(emergencyContactSchema).optional(),
});


// Schema for creating a new client
export const createClientSchema = z.object({
  usuario: createUserDataSchema, // Use the refined schema for the main user
  contactos_emergencia: z.array(emergencyContactSchema).optional(),
  beneficiarios: z.array(beneficiarySchema).optional(),
  relacion: z.string().min(2).max(50).optional(),
  id_titular: z.number().optional(),
});


// Schema for updating an existing client
export const updateClientSchema = z.object({
  usuario: userDataSchema.partial().omit({ numero_documento: true, tipo_documento: true }),
  contactos_emergencia: z
    .array(
      emergencyContactSchema.extend({
        id: z.number().optional(),
      })
    )
    .optional(),
  relacion: z.string().min(2).max(50).optional(),
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
  numero_documento: z.string().min(5).max(20),
});
