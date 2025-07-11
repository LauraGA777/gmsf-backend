import { z } from 'zod';

export const idSchema = z.object({
    id: z.string().or(z.number()).transform(val => Number(val))
});

export const userCreateSchema = z.object({
    nombre: z.string().min(3).max(100),
    apellido: z.string().min(3).max(100),
    correo: z.string().email(),
    contrasena: z.string().min(6),
    telefono: z.string().regex(/^\d{7,15}$/).optional(),
    direccion: z.string().optional(),
    genero: z.enum(['M', 'F', 'O']).optional(),
    tipo_documento: z.enum(['CC', 'CE', 'TI', 'PP', 'DIE']),
    numero_documento: z.string().min(5).max(20),
    fecha_nacimiento: z.string().transform(val => new Date(val)),
    id_rol: z.number().optional()
});

export const updateUserSchema = z.object({
    nombre: z.string().min(3).max(100).optional(),
    apellido: z.string().min(3).max(100).optional(),
    correo: z.string().email().optional(),
    telefono: z.string().regex(/^\d{7,15}$/).optional(),
    direccion: z.string().optional(),
    genero: z.enum(['M', 'F', 'O']).optional(),
    tipo_documento: z.enum(['CC', 'CE', 'TI', 'PP', 'DIE']).optional(),
    numero_documento: z.string().min(5).max(20).optional(),
    fecha_nacimiento: z.string().transform(val => new Date(val)).optional(),
    id_rol: z.number().optional()
});

export const searchUserSchema = z.object({
    q: z.string().optional(),
    pagina: z.string().or(z.number()).transform(val => Math.max(1, Number(val))).default('1'),
    limite: z.string().or(z.number()).transform(val => Math.min(50, Math.max(1, Number(val)))).default('10'),
    orden: z.enum(['id', 'nombre', 'apellido', 'correo', 'codigo']).default('nombre'),
    direccion: z.enum(['ASC', 'DESC']).default('ASC')
});

export type IdSchemaType = z.infer<typeof idSchema>;
export type UserCreateType = z.infer<typeof userCreateSchema>;
export type UpdateUserType = z.infer<typeof updateUserSchema>;
export type SearchUserType = z.infer<typeof searchUserSchema>;