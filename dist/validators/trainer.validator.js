"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchTrainerSchema = exports.updateTrainerSchema = exports.createTrainerSchema = exports.idSchema = void 0;
const zod_1 = require("zod");
const user_validator_1 = require("./user.validator");
const contact_validator_1 = require("./contact.validator");
// Esquema para validar que el ID sea un número
exports.idSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/, "El ID debe ser un número").transform(Number),
});
// Esquema especial para usuarios en trainers (puede ser nuevo o existente)
const trainerUserSchema = zod_1.z.object({
    id: zod_1.z.number().optional(), // Si tiene ID, es usuario existente
    nombre: zod_1.z.string().min(3).max(100),
    apellido: zod_1.z.string().min(3).max(100),
    correo: contact_validator_1.emailValidator,
    contrasena: zod_1.z.string().optional(), // Opcional porque puede ser usuario existente
    telefono: contact_validator_1.phoneValidator.optional(),
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
        .optional(),
    genero: zod_1.z.enum(['M', 'F', 'O']).optional(),
    tipo_documento: zod_1.z.enum(['CC', 'CE', 'TI', 'PP', 'DIE']),
    numero_documento: zod_1.z.string()
        .min(5, "El número de documento debe tener al menos 5 caracteres")
        .max(20, "El número de documento no puede tener más de 20 caracteres"),
    fecha_nacimiento: zod_1.z.string().transform(val => new Date(val)).refine((date) => {
        if (isNaN(date.getTime()))
            return false;
        const today = new Date();
        let age = today.getFullYear() - date.getFullYear();
        const m = today.getMonth() - date.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
            age--;
        }
        return age >= 16;
    }, { message: "El entrenador debe tener al menos 16 años" }).refine((date) => {
        if (isNaN(date.getTime()))
            return false;
        // No permitir fechas futuras
        const today = new Date();
        return date <= today;
    }, { message: "La fecha de nacimiento no puede ser una fecha futura" }).refine((date) => {
        if (isNaN(date.getTime()))
            return false;
        // Validar fechas inconsistentes (como 31/02)
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();
        const reconstructedDate = new Date(year, month, day);
        return reconstructedDate.getDate() === day &&
            reconstructedDate.getMonth() === month &&
            reconstructedDate.getFullYear() === year;
    }, { message: "Fecha inconsistente o inválida" }),
    id_rol: zod_1.z.number().optional()
}).refine((data) => {
    // Si no tiene ID (es usuario nuevo), la contraseña es requerida
    if (!data.id && (!data.contrasena || data.contrasena.length < 6)) {
        return false;
    }
    return true;
}, {
    message: "La contraseña es requerida y debe tener al menos 6 caracteres para usuarios nuevos",
    path: ["contrasena"]
}).refine((data) => {
    // Validación específica del número de documento según el tipo
    const { tipo_documento, numero_documento } = data;
    if (!tipo_documento || !numero_documento)
        return true;
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
// Esquema para la creación de un entrenador
// Combina la creación de usuario con los campos específicos de entrenador
exports.createTrainerSchema = zod_1.z.object({
    usuario: trainerUserSchema, // Objeto anidado para los datos del usuario
    especialidad: zod_1.z.string().min(3, "La especialidad es requerida y debe tener al menos 3 caracteres.").max(100),
    estado: zod_1.z.boolean().optional().default(true),
});
// Esquema para la actualización de un entrenador
// Combina la actualización de usuario con los campos de entrenador
exports.updateTrainerSchema = zod_1.z.object({
    usuario: user_validator_1.updateUserSchema.optional(), // Los datos del usuario son opcionales en la actualización
    especialidad: zod_1.z.string().min(3).max(100).optional(),
    estado: zod_1.z.boolean().optional(),
});
// Esquema para la búsqueda y paginación de entrenadores
exports.searchTrainerSchema = zod_1.z.object({
    q: zod_1.z.string().optional(),
    pagina: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().int().positive().default(1)),
    limite: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().int().positive().max(50).default(10)),
    orden: zod_1.z.enum(['nombre', 'apellido', 'especialidad', 'codigo']).default('nombre'),
    direccion: zod_1.z.enum(['ASC', 'DESC']).default('ASC'),
    estado: zod_1.z.preprocess((val) => {
        if (String(val).toLowerCase() === 'true')
            return true;
        if (String(val).toLowerCase() === 'false')
            return false;
        return undefined;
    }, zod_1.z.boolean().optional()),
});
