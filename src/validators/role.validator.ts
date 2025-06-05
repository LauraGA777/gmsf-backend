import { z } from 'zod';

// Schema para validar ID
export const idSchema = z.object({
    id: z.string().or(z.number()).transform(val => Number(val))
});

// Schema para crear un rol
export const createRoleSchema = z.object({
    nombre: z.string().min(3).max(50),
    descripcion: z.string().optional(),
    estado: z.boolean().default(true),
    permisos: z.array(z.number()).min(1, "Debe seleccionar al menos un permiso"),
    privilegios: z.array(z.number()).min(1, "Debe seleccionar al menos un privilegio")
});

// Schema para actualizar un rol
export const updateRoleSchema = z.object({
    nombre: z.string().min(3).max(50).optional(),
    descripcion: z.string().optional(),
    estado: z.boolean().optional(),
    permisos: z.array(z.number()).min(1, "Debe seleccionar al menos un permiso").optional(),
    privilegios: z.array(z.number()).min(1, "Debe seleccionar al menos un privilegio").optional()
});

// Schema para búsqueda y paginación
export const searchRoleSchema = z.object({
    q: z.string().optional(),
    pagina: z.number().int().positive().default(1),
    limite: z.number().int().positive().max(50).default(10),
    orden: z.enum(['id', 'codigo', 'nombre']).default('nombre'),
    direccion: z.enum(['ASC', 'DESC']).default('ASC')
}); 