import { z } from 'zod';
import { emailValidator, phoneValidator } from './contact.validator';

export const idSchema = z.object({
    id: z.string().or(z.number()).transform(val => Number(val))
});

export const userCreateSchema = z.object({
    nombre: z.string().min(3).max(100),
    apellido: z.string().min(3).max(100),
    correo: emailValidator,
    telefono: phoneValidator.optional(),
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
        .optional(),
    genero: z.enum(['M', 'F', 'O']).optional(),
    tipo_documento: z.enum(['CC', 'CE', 'TI', 'PP', 'DIE']),
    numero_documento: z.string().min(5).max(20),
    fecha_nacimiento: z.string().transform(val => new Date(val)).refine(
        (date) => {
            if (isNaN(date.getTime())) return false;
            
            const today = new Date();
            let age = today.getFullYear() - date.getFullYear();
            const m = today.getMonth() - date.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
                age--;
            }
            return age >= 13 && age <= 120;
        },
        { message: "La edad debe estar entre 13 y 120 años" }
    ),
    id_rol: z.number().optional()
}).refine(
    (data) => {
        // Validación específica del número de documento según el tipo
        const { tipo_documento, numero_documento } = data;
        
        if (!tipo_documento || !numero_documento) return true;
        
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
    },
    {
        message: "El formato del número de documento no es válido para el tipo seleccionado",
        path: ["numero_documento"]
    }
);

export const updateUserSchema = z.object({
    nombre: z.string().min(3).max(100).optional(),
    apellido: z.string().min(3).max(100).optional(),
    correo: emailValidator.optional(),
    telefono: phoneValidator.optional(),
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
        .optional(),
    genero: z.enum(['M', 'F', 'O']).optional(),
    tipo_documento: z.enum(['CC', 'CE', 'TI', 'PP', 'DIE']).optional(),
    numero_documento: z.string().min(5).max(20).optional(),
    fecha_nacimiento: z.string().transform(val => new Date(val)).refine(
        (date) => {
            if (isNaN(date.getTime())) return false;
            
            const today = new Date();
            let age = today.getFullYear() - date.getFullYear();
            const m = today.getMonth() - date.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
                age--;
            }
            return age >= 13 && age <= 120;
        },
        { message: "La edad debe estar entre 13 y 120 años" }
    ).optional(),
    id_rol: z.number().optional()
}).refine(
    (data) => {
        // Validación específica del número de documento según el tipo (si ambos están presentes)
        const { tipo_documento, numero_documento } = data;
        
        if (!tipo_documento || !numero_documento) return true;
        
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
    },
    {
        message: "El formato del número de documento no es válido para el tipo seleccionado",
        path: ["numero_documento"]
    }
);

export const searchUserSchema = z.object({
    q: z.string().optional(),
    pagina: z.string().or(z.number()).transform(val => Math.max(1, Number(val))).default('1'),
    limite: z.string().or(z.number()).transform(val => Math.min(50, Math.max(1, Number(val)))).default('10'),
    orden: z.enum(['id', 'nombre', 'apellido', 'correo', 'codigo']).default('nombre'),
    direccion: z.enum(['ASC', 'DESC']).default('ASC')
});

// Agregar un esquema específico para creación de entrenadores
export const trainerCreateSchema = z.object({
    nombre: z.string().min(3).max(100),
    apellido: z.string().min(3).max(100),
    correo: emailValidator,
    contrasena: z.string().min(6), // Contraseña requerida para entrenadores
    telefono: phoneValidator.optional(),
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
        .optional(),
    genero: z.enum(['M', 'F', 'O']).optional(),
    tipo_documento: z.enum(['CC', 'CE', 'TI', 'PP', 'DIE']),
    numero_documento: z.string().min(5).max(20),
    fecha_nacimiento: z.string().transform(val => new Date(val)).refine(
        (date) => {
            if (isNaN(date.getTime())) return false;
            
            const today = new Date();
            let age = today.getFullYear() - date.getFullYear();
            const m = today.getMonth() - date.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
                age--;
            }
            return age >= 16 && age <= 120;
        },
        { message: "El entrenador debe tener entre 16 y 120 años" }
    ),
    id_rol: z.number().optional()
}).refine(
    (data) => {
        // Validación específica del número de documento según el tipo
        const { tipo_documento, numero_documento } = data;
        
        if (!tipo_documento || !numero_documento) return true;
        
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
    },
    {
        message: "El formato del número de documento no es válido para el tipo seleccionado",
        path: ["numero_documento"]
    }
);

export type IdSchemaType = z.infer<typeof idSchema>;
export type UserCreateType = z.infer<typeof userCreateSchema>;
export type UpdateUserType = z.infer<typeof updateUserSchema>;
export type SearchUserType = z.infer<typeof searchUserSchema>;
export type TrainerCreateType = z.infer<typeof trainerCreateSchema>;