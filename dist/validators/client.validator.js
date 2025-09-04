"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientDocumentSchema = exports.clientIdSchema = exports.clientQuerySchema = exports.updateClientSchema = exports.createClientSchema = void 0;
const zod_1 = require("zod");
const contact_validator_1 = require("./contact.validator");
const emergencyContactSchema = zod_1.z.object({
    nombre_contacto: zod_1.z.string()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(100, "El nombre no puede tener más de 100 caracteres"),
    telefono_contacto: contact_validator_1.phoneValidator,
    relacion_contacto: zod_1.z.string()
        .min(3, "La relación debe tener al menos 3 caracteres")
        .max(50, "La relación no puede tener más de 50 caracteres"),
    es_mismo_beneficiario: zod_1.z.boolean().default(false),
});
// Base schema sin validaciones complejas para poder usar .partial()
const baseUserDataSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    nombre: zod_1.z.string()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(100, "El nombre no puede tener más de 100 caracteres"),
    apellido: zod_1.z.string()
        .min(3, "El apellido debe tener al menos 3 caracteres")
        .max(100, "El apellido no puede tener más de 100 caracteres"),
    correo: contact_validator_1.emailValidator,
    contrasena: zod_1.z.string().optional(),
    telefono: contact_validator_1.phoneValidator.optional().nullable(),
    direccion: zod_1.z.string()
        .min(5, "La dirección debe tener al menos 5 caracteres")
        .max(200, "La dirección no puede tener más de 200 caracteres")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s#\-]+$/, "La dirección contiene caracteres no permitidos")
        .refine((address) => {
        if (!address)
            return true; // Opcional
        const trimmed = address.trim().toLowerCase();
        const roadTypes = ['calle', 'carrera', 'diagonal', 'transversal', 'avenida', 'autopista', 'cl', 'cra', 'dg', 'tv', 'av', 'aut'];
        return roadTypes.some(type => trimmed.startsWith(type));
    }, { message: "La dirección debe comenzar con un tipo de vía válido (Calle, Carrera, Diagonal, etc.)" })
        .refine((address) => {
        if (!address)
            return true; // Opcional
        return /\d/.test(address);
    }, { message: "La dirección debe contener números" })
        .optional()
        .nullable(),
    genero: zod_1.z.enum(["M", "F", "O"])
        .optional()
        .nullable(),
    tipo_documento: zod_1.z.enum(["CC", "CE", "TI", "PP", "DIE"]),
    numero_documento: zod_1.z.string()
        .min(5, "El número de documento debe tener al menos 5 caracteres")
        .max(20, "El número de documento no puede tener más de 20 caracteres"),
    fecha_nacimiento: zod_1.z.string(),
    id_rol: zod_1.z.number().optional(),
});
// Schema completo con validaciones
const userDataSchema = baseUserDataSchema.extend({
    contrasena: zod_1.z.string().refine((val) => val.length === 0 || val.length >= 6, { message: "Si se proporciona, la contraseña debe tener al menos 6 caracteres" }).optional(),
    fecha_nacimiento: zod_1.z.string().refine((date) => {
        if (!date)
            return false;
        const birthDate = new Date(date);
        if (isNaN(birthDate.getTime()))
            return false;
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 13;
    }, { message: "El cliente debe tener al menos 13 años" }).refine((date) => {
        if (!date)
            return false;
        const birthDate = new Date(date);
        if (isNaN(birthDate.getTime()))
            return false;
        // No permitir fechas futuras
        const today = new Date();
        return birthDate <= today;
    }, { message: "La fecha de nacimiento no puede ser una fecha futura" }).refine((date) => {
        if (!date)
            return false;
        const birthDate = new Date(date);
        if (isNaN(birthDate.getTime()))
            return false;
        // Validar fechas inconsistentes (como 31/02)
        const day = birthDate.getDate();
        const month = birthDate.getMonth();
        const year = birthDate.getFullYear();
        const reconstructedDate = new Date(year, month, day);
        return reconstructedDate.getDate() === day &&
            reconstructedDate.getMonth() === month &&
            reconstructedDate.getFullYear() === year;
    }, { message: "Fecha inconsistente o inválida" }),
}).refine((data) => {
    const { tipo_documento, numero_documento } = data;
    if (!tipo_documento || !numero_documento)
        return true;
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
});
const beneficiarySchema = zod_1.z.object({
    usuario: userDataSchema,
    relacion: zod_1.z.string()
        .min(3, "La relación debe tener al menos 3 caracteres")
        .max(50, "La relación no puede tener más de 50 caracteres"),
    contactos_emergencia: zod_1.z.array(emergencyContactSchema).optional(),
});
const updateBeneficiarySchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    usuario: baseUserDataSchema.partial().extend({
        id: zod_1.z.number().optional(),
    }),
    relacion: zod_1.z.string()
        .min(3, "La relación debe tener al menos 3 caracteres")
        .max(50, "La relación no puede tener más de 50 caracteres"),
});
// Schema for creating a new client
exports.createClientSchema = zod_1.z.object({
    usuario: userDataSchema,
    contactos_emergencia: zod_1.z.array(emergencyContactSchema)
        .min(1, "Se requiere al menos un contacto de emergencia"),
    beneficiarios: zod_1.z.array(beneficiarySchema).optional(),
    relacion: zod_1.z.string()
        .min(3, "La relación debe tener al menos 3 caracteres")
        .max(50, "La relación no puede tener más de 50 caracteres")
        .optional(),
    id_titular: zod_1.z.number().optional(),
});
// Schema for updating an existing client
exports.updateClientSchema = zod_1.z.object({
    usuario: baseUserDataSchema
        .partial()
        .omit({ numero_documento: true, tipo_documento: true })
        .optional(),
    contactos_emergencia: zod_1.z
        .array(emergencyContactSchema.extend({
        id: zod_1.z.number().optional(),
    }))
        .min(1, "Se requiere al menos un contacto de emergencia")
        .optional(),
    beneficiarios: zod_1.z.array(updateBeneficiarySchema).optional(),
    relacion: zod_1.z.string()
        .min(3, "La relación debe tener al menos 3 caracteres")
        .max(50, "La relación no puede tener más de 50 caracteres")
        .optional(),
    estado: zod_1.z.boolean().optional(),
});
// Schema for client query parameters
exports.clientQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).default("1"),
    limit: zod_1.z.string().transform(Number).default("10"),
    search: zod_1.z.string().optional(),
    estado: zod_1.z
        .enum(["true", "false"])
        .transform((val) => val === "true")
        .optional(),
    id_titular: zod_1.z.string().transform(Number).optional(),
});
// Schema for client ID parameter
exports.clientIdSchema = zod_1.z.object({
    id: zod_1.z.string().transform((val) => Number(val)),
});
// Schema for client document parameter
exports.clientDocumentSchema = zod_1.z.object({
    tipo_documento: zod_1.z.enum(["CC", "CE", "TI", "PP", "DIE"]),
    numero_documento: zod_1.z.string()
        .min(5, "El número de documento debe tener al menos 5 caracteres")
        .max(20, "El número de documento no puede tener más de 20 caracteres"),
});
