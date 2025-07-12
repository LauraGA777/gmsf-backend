import { z } from 'zod';
import { userCreateSchema, updateUserSchema } from './user.validator';

// Esquema para validar que el ID sea un número
export const idSchema = z.object({
    id: z.string().regex(/^\d+$/, "El ID debe ser un número").transform(Number),
});

// Esquema especial para usuarios en trainers (puede ser nuevo o existente)
const trainerUserSchema = z.object({
    id: z.number().optional(), // Si tiene ID, es usuario existente
    nombre: z.string().min(3).max(100),
    apellido: z.string().min(3).max(100),
    correo: z.string().email(),
    contrasena: z.string().optional(), // Opcional porque puede ser usuario existente
    telefono: z.string().regex(/^\d{7,15}$/).optional(),
    direccion: z.string().optional(),
    genero: z.enum(['M', 'F', 'O']).optional(),
    tipo_documento: z.enum(['CC', 'CE', 'TI', 'PP', 'DIE']),
    numero_documento: z.string().min(5).max(20),
    fecha_nacimiento: z.string().transform(val => new Date(val)),
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