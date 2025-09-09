import { z } from 'zod';
import { userCreateSchema, updateUserSchema } from './user.validator';
import { emailValidator, phoneValidator } from './contact.validator';

// Esquema para validar que el ID sea un número
export const idSchema = z.object({
    id: z.string().regex(/^\d+$/, "El ID debe ser un número").transform(Number),
});

// Esquema especial para usuarios en trainers (puede ser nuevo o existente)
const trainerUserSchema = z.object({
    id: z.number().optional(), // Si tiene ID, es usuario existente
    nombre: z.string().min(3).max(100),
    apellido: z.string().min(3).max(100),
    correo: emailValidator,
    contrasena: z.string().optional(), // Opcional porque puede ser usuario existente
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
    numero_documento: z.string()
        .min(5, "El número de documento debe tener al menos 5 caracteres")
        .max(20, "El número de documento no puede tener más de 20 caracteres"),
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
    ).refine(
      (date) => {
        if (isNaN(date.getTime())) return false;
        
        // No permitir fechas futuras
        const today = new Date();
        return date <= today;
      },
      { message: "La fecha de nacimiento no puede ser una fecha futura" }
    ).refine(
      (date) => {
        if (isNaN(date.getTime())) return false;
        
        // Validar fechas inconsistentes (como 31/02)
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();
        
        const reconstructedDate = new Date(year, month, day);
        return reconstructedDate.getDate() === day && 
               reconstructedDate.getMonth() === month && 
               reconstructedDate.getFullYear() === year;
      },
      { message: "Fecha inconsistente o inválida" }
    ),
    id_rol: z.number().optional()
}).refine(
    (data) => {
        // Si no tiene ID (es usuario nuevo), la contraseña es requerida
        if (!data.id && (!data.contrasena || data.contrasena.length < 6)) {
            return false;
        }
        return true;
    },
    {
        message: "La contraseña es requerida y debe tener al menos 6 caracteres para usuarios nuevos",
        path: ["contrasena"]
    }
).refine(
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

// Esquema para la creación de un entrenador
// Combina la creación de usuario con los campos específicos de entrenador
export const createTrainerSchema = z.object({
    usuario: trainerUserSchema, // Objeto anidado para los datos del usuario
    especialidad: z.string().min(3, "La especialidad es requerida y debe tener al menos 3 caracteres.").max(100),
    estado: z.boolean().optional().default(true),
});

// Esquema para la actualización de un entrenador
// Combina la actualización de usuario con los campos de entrenador
export const updateTrainerSchema = z.object({
    usuario: updateUserSchema.optional(), // Los datos del usuario son opcionales en la actualización
    especialidad: z.string().min(3).max(100).optional(),
    estado: z.boolean().optional(),
});

// Esquema para la búsqueda y paginación de entrenadores
export const searchTrainerSchema = z.object({
    q: z.string().optional(),
    pagina: z.preprocess((val) => Number(val), z.number().int().positive().default(1)),
    limite: z.preprocess((val) => Number(val), z.number().int().positive().max(50).default(10)),
    orden: z.enum(['nombre', 'apellido', 'especialidad', 'codigo']).default('nombre'),
    direccion: z.enum(['ASC', 'DESC']).default('ASC'),
    estado: z.preprocess((val) => {
        if (String(val).toLowerCase() === 'true') return true;
        if (String(val).toLowerCase() === 'false') return false;
        return undefined;
    }, z.boolean().optional()),
});

// Tipos inferidos de los esquemas para usarlos en el servicio y controlador
export type CreateTrainerInput = z.infer<typeof createTrainerSchema>;
export type UpdateTrainerInput = z.infer<typeof updateTrainerSchema>;
export type SearchTrainerInput = z.infer<typeof searchTrainerSchema>; 