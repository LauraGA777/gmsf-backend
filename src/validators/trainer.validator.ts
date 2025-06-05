import { z } from 'zod';

// Schema para validar ID
export const idSchema = z.object({
    id: z.string().or(z.number()).transform(val => Number(val))
});

// Schema para crear un entrenador
export const createTrainerSchema = z.object({
    numero_documento: z.string().min(5).max(20),
    especialidad: z.string().min(3).max(100),
    estado: z.boolean().default(true)
});

// Schema para actualizar un entrenador
export const updateTrainerSchema = z.object({
    especialidad: z.string().min(3).max(100).optional(),
    estado: z.boolean().optional()
});

// Schema para búsqueda y paginación
export const searchTrainerSchema = z.object({
    q: z.string().optional(),
    pagina: z.number().int().positive().default(1),
    limite: z.number().int().positive().max(50).default(10),
    orden: z.enum(['id', 'codigo', 'especialidad', 'fecha_registro']).default('fecha_registro'),
    direccion: z.enum(['ASC', 'DESC']).default('DESC')
}); 