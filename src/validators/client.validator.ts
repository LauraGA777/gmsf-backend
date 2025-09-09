import { z } from "zod";
import { emailValidator, phoneValidator } from "./contact.validator";

const emergencyContactSchema = z.object({
  nombre_contacto: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
  telefono_contacto: phoneValidator,
  relacion_contacto: z.string()
    .min(3, "La relación debe tener al menos 3 caracteres")
    .max(50, "La relación no puede tener más de 50 caracteres"),
  es_mismo_beneficiario: z.boolean().default(false),
});

// Base schema sin validaciones complejas para poder usar .partial()
const baseUserDataSchema = z.object({
  id: z.number().optional(),
  nombre: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
  apellido: z.string()
    .min(3, "El apellido debe tener al menos 3 caracteres")
    .max(100, "El apellido no puede tener más de 100 caracteres"),
  correo: emailValidator,
  contrasena: z.string().optional(),
  telefono: phoneValidator.optional().nullable(),
  direccion: z.string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(200, "La dirección no puede tener más de 200 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s#\-]+$/, "La dirección contiene caracteres no permitidos")
    .refine(
      (address) => {
        if (!address) return true; // Opcional
        const trimmed = address.trim().toLowerCase();
        const roadTypes = ['calle', 'carrera', 'diagonal', 'transversal', 'avenida', 'autopista', 'cl', 'cra', 'dg', 'tv', 'av', 'aut'];
        return roadTypes.some(type => trimmed.startsWith(type));
      },
      { message: "La dirección debe comenzar con un tipo de vía válido (Calle, Carrera, Diagonal, etc.)" }
    )
    .refine(
      (address) => {
        if (!address) return true; // Opcional
        return /\d/.test(address);
      },
      { message: "La dirección debe contener números" }
    )
    .optional()
    .nullable(),
  genero: z.enum(["M", "F", "O"])
    .optional()
    .nullable(),
  tipo_documento: z.enum(["CC", "CE", "TI", "PP", "DIE"]),
  numero_documento: z.string()
    .min(5, "El número de documento debe tener al menos 5 caracteres")
    .max(20, "El número de documento no puede tener más de 20 caracteres"),
  fecha_nacimiento: z.string(),
  id_rol: z.number().optional(),
});

// Schema completo con validaciones
const userDataSchema = baseUserDataSchema.extend({
  contrasena: z.string().refine(
    (val) => val.length === 0 || val.length >= 6,
    { message: "Si se proporciona, la contraseña debe tener al menos 6 caracteres" }
  ).optional(),
  fecha_nacimiento: z.string().refine(
    (date) => {
      if (!date) return false;
      const birthDate = new Date(date);
      if (isNaN(birthDate.getTime())) return false;
      
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 13 && age <= 120;
    },
    { message: "El cliente debe tener entre 13 y 120 años" }
  ).refine(
    (date) => {
      if (!date) return false;
      const birthDate = new Date(date);
      if (isNaN(birthDate.getTime())) return false;
      
      // No permitir fechas futuras
      const today = new Date();
      return birthDate <= today;
    },
    { message: "La fecha de nacimiento no puede ser una fecha futura" }
  ).refine(
    (date) => {
      if (!date) return false;
      const birthDate = new Date(date);
      if (isNaN(birthDate.getTime())) return false;
      
      // Validar fechas inconsistentes (como 31/02)
      const day = birthDate.getDate();
      const month = birthDate.getMonth();
      const year = birthDate.getFullYear();
      
      const reconstructedDate = new Date(year, month, day);
      return reconstructedDate.getDate() === day && 
             reconstructedDate.getMonth() === month && 
             reconstructedDate.getFullYear() === year;
    },
    { message: "Fecha inconsistente o inválida" }
  ),
}).refine(
  (data) => {
    const { tipo_documento, numero_documento } = data;
    
    if (!tipo_documento || !numero_documento) return true;
    
    // Validaciones específicas por tipo de documento
    switch (tipo_documento) {
      case 'CC': // Cédula de ciudadanía: solo números
      case 'CE': // Cédula de extranjería: solo números
      case 'TI': // Tarjeta de identidad: solo números
        return /^\d+$/.test(numero_documento);
      case 'PP': // Pasaporte: números y letras
      case 'DIE': // Documento de identificación extranjera: números y letras
        return /^[A-Za-z0-9]+$/.test(numero_documento);
      default:
        return true;
    }
  }, {
    message: "El formato del número de documento no es válido para el tipo seleccionado",
    path: ["numero_documento"]
  }
);

const beneficiarySchema = z.object({
  usuario: userDataSchema,
  relacion_con_titular: z.string()
    .min(3, "La relación debe tener al menos 3 caracteres")
    .max(50, "La relación no puede tener más de 50 caracteres"),
  contactos_emergencia: z.array(emergencyContactSchema).optional(),
});

const updateBeneficiarySchema = z.object({
  id: z.number().optional(),
  usuario: z.object({
    id: z.number().optional(),
    nombre: z.string()
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(100, "El nombre no puede tener más de 100 caracteres")
      .optional(),
    apellido: z.string()
      .min(3, "El apellido debe tener al menos 3 caracteres")
      .max(100, "El apellido no puede tener más de 100 caracteres")
      .optional(),
    correo: emailValidator.optional(),
    telefono: phoneValidator.optional().nullable(),
    direccion: z.union([
      z.string().min(5, "La dirección debe tener al menos 5 caracteres").max(200, "La dirección no puede tener más de 200 caracteres"),
      z.literal(""),
      z.null(),
      z.undefined()
    ]).optional(),
    genero: z.enum(["M", "F", "O"]).optional().nullable(),
    tipo_documento: z.enum(["CC", "CE", "TI", "PP", "DIE"]).optional(),
    numero_documento: z.string()
      .min(5, "El número de documento debe tener al menos 5 caracteres")
      .max(20, "El número de documento no puede tener más de 20 caracteres")
      .optional(),
    fecha_nacimiento: z.string().optional(),
    id_rol: z.number().optional(),
  }).partial(),
  relacion_con_titular: z.string()
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
  usuario: baseUserDataSchema
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
