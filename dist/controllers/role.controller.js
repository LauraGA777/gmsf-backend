"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersByRole = exports.getRoleWithPermissionsSimple = exports.getRoleWithPermissions = exports.removePrivileges = exports.assignPrivileges = exports.listAllPermissionsAndPrivileges = exports.listPermissionsAndPrivileges = exports.searchRoles = exports.deleteRole = exports.activateRole = exports.deactivateRole = exports.updateRole = exports.createRole = exports.getRoles = void 0;
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const role_1 = __importDefault(require("../models/role"));
const user_1 = __importDefault(require("../models/user"));
const permission_1 = __importDefault(require("../models/permission"));
const privilege_1 = __importDefault(require("../models/privilege"));
const db_1 = __importDefault(require("../config/db"));
const role_validator_1 = require("../validators/role.validator");
// Generar código de rol
const generateRoleCode = () => __awaiter(void 0, void 0, void 0, function* () {
    const lastRole = yield role_1.default.findOne({
        order: [['codigo', 'DESC']],
    });
    const lastCode = lastRole ? parseInt(lastRole.codigo.substring(1)) : 0;
    const newCode = `R${String(lastCode + 1).padStart(3, '0')}`;
    return newCode;
});
// Listar roles
const getRoles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pagina = 1, limite = 10, orden = 'nombre', direccion = 'ASC' } = role_validator_1.searchRoleSchema.parse(req.query);
        const offset = (pagina - 1) * limite;
        const [roles, total] = yield Promise.all([
            role_1.default.findAll({
                include: [
                    {
                        model: permission_1.default,
                        as: 'permisos',
                        through: { attributes: [] }
                    },
                    {
                        model: privilege_1.default,
                        as: 'privilegios',
                        through: { attributes: [] }
                    }
                ],
                limit: limite,
                offset: offset,
                order: [[orden, direccion]]
            }),
            role_1.default.count()
        ]);
        if (roles.length === 0) {
            res.status(200).json({
                status: 'success',
                message: 'No hay roles registrados',
                data: {
                    total: 0,
                    roles: []
                }
            });
            return;
        }
        res.status(200).json({
            status: 'success',
            data: {
                total,
                pagina,
                limite,
                total_paginas: Math.ceil(total / limite),
                roles
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getRoles = getRoles;
// Crear rol
const createRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield db_1.default.transaction();
    try {
        const roleData = role_validator_1.createRoleSchema.parse(req.body);
        // Verificar nombre único
        const existingRole = yield role_1.default.findOne({
            where: { nombre: roleData.nombre },
            transaction
        });
        if (existingRole) {
            yield transaction.rollback();
            res.status(400).json({
                status: 'error',
                message: "Ya existe un rol con ese nombre"
            });
            return;
        }
        // Verificar que los permisos existan
        const permisos = yield permission_1.default.findAll({
            where: {
                id: { [sequelize_1.Op.in]: roleData.permisos },
                estado: true
            },
            transaction
        });
        if (permisos.length !== roleData.permisos.length) {
            yield transaction.rollback();
            res.status(400).json({
                status: 'error',
                message: "Uno o más permisos no existen o están inactivos"
            });
            return;
        }
        // Verificar que los privilegios existan
        const privilegios = yield privilege_1.default.findAll({
            where: {
                id: { [sequelize_1.Op.in]: roleData.privilegios }
            },
            transaction
        });
        if (privilegios.length !== roleData.privilegios.length) {
            yield transaction.rollback();
            res.status(400).json({
                status: 'error',
                message: "Uno o más privilegios no existen"
            });
            return;
        }
        // Generar código único
        const codigo = yield generateRoleCode();
        // Crear rol
        const role = yield role_1.default.create({
            codigo,
            nombre: roleData.nombre,
            descripcion: roleData.descripcion,
            estado: roleData.estado
        }, { transaction });
        // Asociar permisos y privilegios
        yield role.setPermisos(permisos, { transaction });
        yield role.setPrivilegios(privilegios, { transaction });
        yield transaction.commit();
        // Obtener rol creado con sus relaciones
        const createdRole = yield role_1.default.findByPk(role.id, {
            include: [
                {
                    model: permission_1.default,
                    as: 'permisos',
                    through: { attributes: [] }
                },
                {
                    model: privilege_1.default,
                    as: 'privilegios',
                    through: { attributes: [] }
                }
            ]
        });
        res.status(201).json({
            status: 'success',
            message: "Rol creado exitosamente",
            data: { role: createdRole }
        });
    }
    catch (error) {
        yield transaction.rollback();
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: "Datos de rol inválidos",
                errors: error.errors
            });
            return;
        }
        next(error);
    }
});
exports.createRole = createRole;
// Actualizar rol
const updateRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield db_1.default.transaction();
    try {
        const { id } = role_validator_1.idSchema.parse({ id: req.params.id });
        const updateData = role_validator_1.updateRoleSchema.parse(req.body);
        // Buscar rol
        const role = yield role_1.default.findByPk(id, { transaction });
        if (!role) {
            yield transaction.rollback();
            res.status(404).json({
                status: 'error',
                message: "Rol no encontrado"
            });
            return;
        }
        // Verificar nombre único si se va a actualizar
        if (updateData.nombre) {
            const existingRole = yield role_1.default.findOne({
                where: {
                    nombre: updateData.nombre,
                    id: { [sequelize_1.Op.ne]: id }
                },
                transaction
            });
            if (existingRole) {
                yield transaction.rollback();
                res.status(400).json({
                    status: 'error',
                    message: "Ya existe otro rol con ese nombre"
                });
                return;
            }
        }
        // Actualizar permisos si se proporcionaron
        if (updateData.permisos) {
            const permisos = yield permission_1.default.findAll({
                where: {
                    id: { [sequelize_1.Op.in]: updateData.permisos },
                    estado: true
                },
                transaction
            });
            if (permisos.length !== updateData.permisos.length) {
                yield transaction.rollback();
                res.status(400).json({
                    status: 'error',
                    message: "Uno o más permisos no existen o están inactivos"
                });
                return;
            }
            yield role.setPermisos(permisos, { transaction });
        }
        // Actualizar privilegios si se proporcionaron
        if (updateData.privilegios) {
            const privilegios = yield privilege_1.default.findAll({
                where: {
                    id: { [sequelize_1.Op.in]: updateData.privilegios }
                },
                transaction
            });
            if (privilegios.length !== updateData.privilegios.length) {
                yield transaction.rollback();
                res.status(400).json({
                    status: 'error',
                    message: "Uno o más privilegios no existen"
                });
                return;
            }
            yield role.setPrivilegios(privilegios, { transaction });
        }
        // Actualizar rol
        const { permisos, privilegios } = updateData, roleUpdateData = __rest(updateData, ["permisos", "privilegios"]);
        yield role.update(roleUpdateData, { transaction });
        yield transaction.commit();
        // Obtener rol actualizado con sus relaciones
        const updatedRole = yield role_1.default.findByPk(id, {
            include: [
                {
                    model: permission_1.default,
                    as: 'permisos',
                    through: { attributes: [] }
                },
                {
                    model: privilege_1.default,
                    as: 'privilegios',
                    through: { attributes: [] }
                }
            ]
        });
        res.status(200).json({
            status: 'success',
            message: "Rol actualizado exitosamente",
            data: { role: updatedRole }
        });
    }
    catch (error) {
        yield transaction.rollback();
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: "Datos de actualización inválidos",
                errors: error.errors
            });
            return;
        }
        next(error);
    }
});
exports.updateRole = updateRole;
// Desactivar rol
const deactivateRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield db_1.default.transaction();
    try {
        const { id } = role_validator_1.idSchema.parse({ id: req.params.id });
        // Buscar rol
        const role = yield role_1.default.findByPk(id, {
            include: [
                {
                    model: user_1.default,
                    as: 'usuarios'
                }
            ],
            transaction
        });
        if (!role) {
            yield transaction.rollback();
            res.status(404).json({
                status: 'error',
                message: "Rol no encontrado"
            });
            return;
        }
        // Verificar si hay usuarios asociados
        if (role.usuarios && role.usuarios.length > 0) {
            yield transaction.rollback();
            res.status(400).json({
                status: 'error',
                message: "No se puede desactivar el rol porque tiene usuarios asociados"
            });
            return;
        }
        // Desactivar rol
        yield role.update({ estado: false }, { transaction });
        yield transaction.commit();
        res.status(200).json({
            status: 'success',
            message: "Rol desactivado exitosamente",
            data: { role }
        });
    }
    catch (error) {
        yield transaction.rollback();
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: "ID de rol inválido"
            });
            return;
        }
        next(error);
    }
});
exports.deactivateRole = deactivateRole;
// Activar rol
const activateRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield db_1.default.transaction();
    try {
        const { id } = role_validator_1.idSchema.parse({ id: req.params.id });
        // Buscar rol
        const role = yield role_1.default.findByPk(id, {
            include: [
                {
                    model: user_1.default,
                    as: 'usuarios'
                }
            ],
            transaction
        });
        if (!role) {
            yield transaction.rollback();
            res.status(404).json({
                status: 'error',
                message: "Rol no encontrado"
            });
            return;
        }
        // Verificar si el rol ya está activo
        if (role.estado) {
            yield transaction.rollback();
            res.status(400).json({
                status: 'error',
                message: "El rol ya está activo"
            });
            return;
        }
        // Activar rol
        yield role.update({ estado: true }, { transaction });
        yield transaction.commit();
        res.status(200).json({
            status: 'success',
            message: "Rol activado exitosamente",
            data: { role }
        });
    }
    catch (error) {
        yield transaction.rollback();
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: "ID de rol inválido"
            });
            return;
        }
        next(error);
    }
});
exports.activateRole = activateRole;
// Eliminar rol
const deleteRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield db_1.default.transaction();
    try {
        const { id } = role_validator_1.idSchema.parse({ id: req.params.id });
        // Buscar rol
        const role = yield role_1.default.findByPk(id, {
            include: [
                {
                    model: user_1.default,
                    as: 'usuarios'
                }
            ],
            transaction
        });
        if (!role) {
            yield transaction.rollback();
            res.status(404).json({
                status: 'error',
                message: "Rol no encontrado"
            });
            return;
        }
        // Verificar si hay usuarios asociados
        if (role.usuarios && role.usuarios.length > 0) {
            yield transaction.rollback();
            res.status(400).json({
                status: 'error',
                message: "No se puede eliminar el rol porque tiene usuarios asociados"
            });
            return;
        }
        // Eliminar rol
        yield role.destroy({ transaction });
        yield transaction.commit();
        res.status(200).json({
            status: 'success',
            message: "Rol eliminado exitosamente",
            data: { role }
        });
    }
    catch (error) {
        yield transaction.rollback();
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: "ID de rol inválido"
            });
            return;
        }
        next(error);
    }
});
exports.deleteRole = deleteRole;
// Buscar roles
const searchRoles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { q = '', pagina = 1, limite = 10 } = role_validator_1.searchRoleSchema.parse(req.query);
        const offset = (pagina - 1) * limite;
        const searchTerm = q.trim();
        const where = searchTerm ? {
            [sequelize_1.Op.or]: [
                { nombre: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
                { descripcion: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } }
            ]
        } : {};
        const [roles, total] = yield Promise.all([
            role_1.default.findAll({
                where,
                attributes: ['id', 'nombre', 'descripcion', 'estado'],
                limit: limite,
                offset: offset,
                order: [['nombre', 'ASC']]
            }),
            role_1.default.count({ where })
        ]);
        res.status(200).json({
            status: 'success',
            data: {
                total,
                pagina,
                limite,
                total_paginas: Math.ceil(total / limite),
                roles
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.searchRoles = searchRoles;
// Listar todos los permisos y privilegios
const listPermissionsAndPrivileges = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Obtener permisos con privilegios
        const permisos = yield permission_1.default.findAll({
            where: { estado: true },
            include: [{
                    model: privilege_1.default,
                    as: 'privilegios',
                    attributes: ['id', 'nombre', 'descripcion', 'codigo']
                }],
            attributes: ['id', 'nombre', 'descripcion', 'codigo'],
            order: [
                ['nombre', 'ASC'],
                [{ model: privilege_1.default, as: 'privilegios' }, 'nombre', 'ASC']
            ]
        });
        // Obtener privilegios independientes (sin permiso padre)
        const privilegiosIndependientes = yield privilege_1.default.findAll({
            where: {
                id_permiso: null
            },
            attributes: ['id', 'nombre', 'descripcion', 'codigo'],
            order: [['nombre', 'ASC']]
        });
        // Organizar por módulos (basado en el código o nombre)
        const modulos = new Map();
        // Procesar permisos
        permisos.forEach(permiso => {
            const moduloNombre = extractModuleName(permiso.nombre);
            if (!modulos.has(moduloNombre)) {
                modulos.set(moduloNombre, {
                    nombre: moduloNombre,
                    permisos: [],
                    privilegios: []
                });
            }
            modulos.get(moduloNombre).permisos.push({
                id: permiso.id,
                nombre: permiso.nombre,
                descripcion: permiso.descripcion,
                codigo: permiso.codigo,
                privilegios: permiso.privilegios || []
            });
        });
        // Procesar privilegios independientes
        privilegiosIndependientes.forEach(privilegio => {
            const moduloNombre = extractModuleName(privilegio.nombre);
            if (!modulos.has(moduloNombre)) {
                modulos.set(moduloNombre, {
                    nombre: moduloNombre,
                    permisos: [],
                    privilegios: []
                });
            }
            modulos.get(moduloNombre).privilegios.push({
                id: privilegio.id,
                nombre: privilegio.nombre,
                descripcion: privilegio.descripcion,
                codigo: privilegio.codigo
            });
        });
        // Convertir Map a array y ordenar módulos
        const modulosOrdenados = Array.from(modulos.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
        res.status(200).json({
            status: 'success',
            data: {
                modulos: modulosOrdenados,
                resumen: {
                    total_modulos: modulosOrdenados.length,
                    total_permisos: permisos.length,
                    total_privilegios: privilegiosIndependientes.length +
                        permisos.reduce((acc, p) => { var _a; return acc + (((_a = p.privilegios) === null || _a === void 0 ? void 0 : _a.length) || 0); }, 0)
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.listPermissionsAndPrivileges = listPermissionsAndPrivileges;
// Listar todos los permisos y privilegios (con formato específico)
const listAllPermissionsAndPrivileges = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [permisos, privilegios] = yield Promise.all([
            permission_1.default.findAll({
                where: { estado: true },
                attributes: ['id', 'nombre', 'descripcion', 'codigo'],
                order: [['nombre', 'ASC']]
            }),
            privilege_1.default.findAll({
                attributes: ['id', 'nombre', 'descripcion', 'codigo', 'id_permiso'],
                include: [{
                        model: permission_1.default,
                        as: 'permiso',
                        attributes: ['id', 'nombre']
                    }],
                order: [['nombre', 'ASC']]
            })
        ]);
        res.status(200).json({
            status: 'success',
            data: {
                permisos,
                privilegios,
                total_permisos: permisos.length,
                total_privilegios: privilegios.length
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.listAllPermissionsAndPrivileges = listAllPermissionsAndPrivileges;
// Función auxiliar para extraer nombre del módulo basado en entidades del sistema
function extractModuleName(nombre) {
    // Definir módulos del sistema basados en entidades
    const modulosEntidades = {
        // Módulo de Usuarios
        'usuarios': ['usuario', 'user', 'acceso', 'login', 'auth', 'autenticacion'],
        'roles': ['rol', 'role', 'permiso', 'privilegio', 'permission', 'privilege'],
        // Módulo de Clientes
        'clientes': ['cliente', 'client', 'customer', 'persona', 'person'],
        'contratos': ['contrato', 'contract', 'acuerdo', 'agreement'],
        'membresias': ['membresia', 'membership', 'suscripcion', 'subscription'],
        // Módulo de Entrenamiento
        'entrenadores': ['entrenador', 'trainer', 'instructor', 'coach'],
        'entrenamientos': ['entrenamiento', 'training', 'ejercicio', 'workout'],
        'horarios': ['horario', 'schedule', 'sesion', 'session', 'cita', 'appointment'],
        // Módulo de Asistencias
        'asistencias': ['asistencia', 'attendance', 'presencia', 'registro'],
        // Módulo de Reportes
        'reportes': ['reporte', 'report', 'estadistica', 'statistic', 'analytic'],
        // Módulo de Sistema
        'sistema': ['sistema', 'system', 'configuracion', 'config', 'backup', 'respaldo', 'exportar', 'import'],
        // Módulo de Administración
        'administracion': ['admin', 'administra', 'gestiona', 'manage', 'super']
    };
    const nombreLower = nombre.toLowerCase();
    // Buscar en qué módulo encaja basándose en las palabras clave
    for (const [modulo, palabrasClave] of Object.entries(modulosEntidades)) {
        for (const palabra of palabrasClave) {
            if (nombreLower.includes(palabra)) {
                return modulo.charAt(0).toUpperCase() + modulo.slice(1);
            }
        }
    }
    // Si no encuentra una coincidencia específica, usar patrones generales
    const patterns = [
        /^Gestión de (\w+)/i,
        /^Administrar (\w+)/i,
        /^Manejo de (\w+)/i,
        /^(\w+) - /i,
        /^(\w+):/i
    ];
    for (const pattern of patterns) {
        const match = nombre.match(pattern);
        if (match) {
            const palabra = match[1].toLowerCase();
            // Mapear palabras específicas a módulos
            if (palabra.includes('usuario') || palabra.includes('user'))
                return 'Usuarios';
            if (palabra.includes('cliente') || palabra.includes('client'))
                return 'Clientes';
            if (palabra.includes('entrenador') || palabra.includes('trainer'))
                return 'Entrenadores';
            if (palabra.includes('asistencia') || palabra.includes('attendance'))
                return 'Asistencias';
            if (palabra.includes('contrato') || palabra.includes('contract'))
                return 'Contratos';
            if (palabra.includes('membresia') || palabra.includes('membership'))
                return 'Membresias';
            if (palabra.includes('horario') || palabra.includes('schedule'))
                return 'Horarios';
            if (palabra.includes('reporte') || palabra.includes('report'))
                return 'Reportes';
            if (palabra.includes('rol') || palabra.includes('role'))
                return 'Roles';
            return palabra.charAt(0).toUpperCase() + palabra.slice(1);
        }
    }
    // Como último recurso, usar la primera palabra significativa
    const firstWord = nombre.split(' ')[0].toLowerCase();
    // Mapear palabras específicas
    if (firstWord.includes('ver') || firstWord.includes('crear') || firstWord.includes('actualizar') ||
        firstWord.includes('eliminar') || firstWord.includes('gestionar') || firstWord.includes('administrar')) {
        const secondWord = nombre.split(' ')[1];
        if (secondWord) {
            const segundaPalabra = secondWord.toLowerCase();
            if (segundaPalabra.includes('usuario'))
                return 'Usuarios';
            if (segundaPalabra.includes('cliente'))
                return 'Clientes';
            if (segundaPalabra.includes('entrenador'))
                return 'Entrenadores';
            if (segundaPalabra.includes('asistencia'))
                return 'Asistencias';
            if (segundaPalabra.includes('contrato'))
                return 'Contratos';
            if (segundaPalabra.includes('membresia'))
                return 'Membresias';
            if (segundaPalabra.includes('horario'))
                return 'Horarios';
            if (segundaPalabra.includes('reporte'))
                return 'Reportes';
            if (segundaPalabra.includes('rol'))
                return 'Roles';
            return segundaPalabra.charAt(0).toUpperCase() + segundaPalabra.slice(1);
        }
    }
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
}
// Asignar privilegios a un rol
const assignPrivileges = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield db_1.default.transaction();
    try {
        const { id } = role_validator_1.idSchema.parse({ id: req.params.id });
        const { privilegios } = zod_1.z.object({
            privilegios: zod_1.z.array(zod_1.z.number()).min(1, "Debe seleccionar al menos un privilegio")
        }).parse(req.body);
        // Buscar rol
        const role = yield role_1.default.findByPk(id, { transaction });
        if (!role) {
            yield transaction.rollback();
            res.status(404).json({
                status: 'error',
                message: "Rol no encontrado"
            });
            return;
        }
        // Verificar que los privilegios existan
        const privilegiosExistentes = yield privilege_1.default.findAll({
            where: { id: { [sequelize_1.Op.in]: privilegios } },
            transaction
        });
        if (privilegiosExistentes.length !== privilegios.length) {
            yield transaction.rollback();
            res.status(400).json({
                status: 'error',
                message: "Uno o más privilegios no existen"
            });
            return;
        }
        // Asignar privilegios
        yield role.setPrivilegios(privilegiosExistentes, { transaction });
        yield transaction.commit();
        // Obtener rol actualizado con sus privilegios
        const updatedRole = yield role_1.default.findByPk(id, {
            include: [{
                    model: privilege_1.default,
                    as: 'privilegios',
                    through: { attributes: [] }
                }]
        });
        res.status(200).json({
            status: 'success',
            message: "Privilegios asignados exitosamente",
            data: { role: updatedRole }
        });
    }
    catch (error) {
        yield transaction.rollback();
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: "Datos inválidos",
                errors: error.errors
            });
            return;
        }
        next(error);
    }
});
exports.assignPrivileges = assignPrivileges;
// Retirar privilegios de un rol
const removePrivileges = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const transaction = yield db_1.default.transaction();
    try {
        const { id } = role_validator_1.idSchema.parse({ id: req.params.id });
        const { privilegios } = zod_1.z.object({
            privilegios: zod_1.z.array(zod_1.z.number()).min(1, "Debe seleccionar al menos un privilegio")
        }).parse(req.body);
        // Buscar rol
        const role = yield role_1.default.findByPk(id, {
            include: [{
                    model: privilege_1.default,
                    as: 'privilegios'
                }],
            transaction
        });
        if (!role) {
            yield transaction.rollback();
            res.status(404).json({
                status: 'error',
                message: "Rol no encontrado"
            });
            return;
        }
        // Obtener privilegios actuales
        const privilegiosActuales = ((_a = role.privilegios) === null || _a === void 0 ? void 0 : _a.map(p => p.id)) || [];
        // Filtrar privilegios a mantener
        const privilegiosRestantes = privilegiosActuales.filter(id => !privilegios.includes(id));
        // Obtener objetos Privilege para los IDs restantes
        const privilegiosAMantener = yield privilege_1.default.findAll({
            where: { id: { [sequelize_1.Op.in]: privilegiosRestantes } },
            transaction
        });
        // Actualizar privilegios
        yield role.setPrivilegios(privilegiosAMantener, { transaction });
        yield transaction.commit();
        // Obtener rol actualizado
        const updatedRole = yield role_1.default.findByPk(id, {
            include: [{
                    model: privilege_1.default,
                    as: 'privilegios',
                    through: { attributes: [] }
                }]
        });
        res.status(200).json({
            status: 'success',
            message: "Privilegios retirados exitosamente",
            data: { role: updatedRole }
        });
    }
    catch (error) {
        yield transaction.rollback();
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: "Datos inválidos",
                errors: error.errors
            });
            return;
        }
        next(error);
    }
});
exports.removePrivileges = removePrivileges;
// Obtener rol con sus permisos y privilegios
const getRoleWithPermissions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = role_validator_1.idSchema.parse({ id: req.params.id });
        const role = yield role_1.default.findByPk(id, {
            include: [
                {
                    model: permission_1.default,
                    as: 'permisos',
                    attributes: ['id', 'nombre', 'descripcion', 'codigo'],
                    through: { attributes: [] }
                },
                {
                    model: privilege_1.default,
                    as: 'privilegios',
                    attributes: ['id', 'nombre', 'descripcion', 'codigo', 'id_permiso'],
                    through: { attributes: [] },
                    include: [
                        {
                            model: permission_1.default,
                            as: 'permiso',
                            attributes: ['id', 'nombre', 'codigo'],
                            required: false
                        }
                    ]
                }
            ],
            attributes: ['id', 'codigo', 'nombre', 'descripcion', 'estado', 'fecha_creacion', 'fecha_actualizacion']
        });
        if (!role) {
            res.status(404).json({
                status: 'error',
                message: 'Rol no encontrado'
            });
            return;
        }
        // Organizar por módulos basándose en los permisos
        const modulos = new Map();
        // Procesar permisos del rol
        if (role.permisos && role.permisos.length > 0) {
            role.permisos.forEach((permiso) => {
                const moduloNombre = extractModuleName(permiso.nombre);
                if (!modulos.has(moduloNombre)) {
                    modulos.set(moduloNombre, {
                        nombre: moduloNombre,
                        permiso: permiso,
                        privilegios: []
                    });
                }
            });
        }
        // Agregar privilegios a sus módulos correspondientes
        if (role.privilegios && role.privilegios.length > 0) {
            role.privilegios.forEach((privilegio) => {
                let moduloNombre;
                if (privilegio.permiso) {
                    // Privilegio asociado a un permiso
                    moduloNombre = extractModuleName(privilegio.permiso.nombre);
                }
                else {
                    // Privilegio independiente
                    moduloNombre = extractModuleName(privilegio.nombre);
                }
                if (!modulos.has(moduloNombre)) {
                    modulos.set(moduloNombre, {
                        nombre: moduloNombre,
                        permiso: null,
                        privilegios: []
                    });
                }
                modulos.get(moduloNombre).privilegios.push({
                    id: privilegio.id,
                    nombre: privilegio.nombre,
                    descripcion: privilegio.descripcion,
                    codigo: privilegio.codigo,
                    permiso_asociado: privilegio.permiso || null
                });
            });
        }
        // Convertir Map a array y ordenar módulos
        const modulosOrdenados = Array.from(modulos.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
        res.status(200).json({
            status: 'success',
            data: {
                rol: {
                    id: role.id,
                    codigo: role.codigo,
                    nombre: role.nombre,
                    descripcion: role.descripcion,
                    estado: role.estado,
                    fecha_creacion: role.fecha_creacion,
                    fecha_actualizacion: role.fecha_actualizacion
                },
                modulos: modulosOrdenados,
                resumen: {
                    total_modulos: modulosOrdenados.length,
                    total_permisos: ((_a = role.permisos) === null || _a === void 0 ? void 0 : _a.length) || 0,
                    total_privilegios: ((_b = role.privilegios) === null || _b === void 0 ? void 0 : _b.length) || 0
                }
            }
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: 'ID de rol inválido',
                errors: error.errors
            });
            return;
        }
        next(error);
    }
});
exports.getRoleWithPermissions = getRoleWithPermissions;
// Obtener rol con permisos y privilegios (formato simple)
const getRoleWithPermissionsSimple = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = role_validator_1.idSchema.parse({ id: req.params.id });
        const role = yield role_1.default.findByPk(id, {
            include: [
                {
                    model: permission_1.default,
                    as: 'permisos',
                    attributes: ['id', 'nombre', 'descripcion', 'codigo'],
                    through: { attributes: [] }
                },
                {
                    model: privilege_1.default,
                    as: 'privilegios',
                    attributes: ['id', 'nombre', 'descripcion', 'codigo', 'id_permiso'],
                    through: { attributes: [] }
                }
            ],
            attributes: ['id', 'codigo', 'nombre', 'descripcion', 'estado', 'createdAt', 'updatedAt']
        });
        if (!role) {
            res.status(404).json({
                status: 'error',
                message: 'Rol no encontrado'
            });
            return;
        }
        res.status(200).json({
            status: 'success',
            data: {
                rol: {
                    id: role.id,
                    codigo: role.codigo,
                    nombre: role.nombre,
                    descripcion: role.descripcion,
                    estado: role.estado,
                    fecha_creacion: role.fecha_creacion,
                    fecha_actualizacion: role.fecha_actualizacion
                },
                permisos: role.permisos || [],
                privilegios: role.privilegios || [],
                resumen: {
                    total_permisos: ((_a = role.permisos) === null || _a === void 0 ? void 0 : _a.length) || 0,
                    total_privilegios: ((_b = role.privilegios) === null || _b === void 0 ? void 0 : _b.length) || 0
                }
            }
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: 'ID de rol inválido',
                errors: error.errors
            });
            return;
        }
        next(error);
    }
});
exports.getRoleWithPermissionsSimple = getRoleWithPermissionsSimple;
// Obtener usuarios por rol
const getUsersByRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = role_validator_1.idSchema.parse({ id: req.params.id });
        const { pagina = 1, limite = 10, activos = true } = zod_1.z.object({
            pagina: zod_1.z.number().min(1).optional(),
            limite: zod_1.z.number().min(1).max(100).optional(),
            activos: zod_1.z.boolean().optional()
        }).parse(req.query);
        const offset = (pagina - 1) * limite;
        // Buscar rol
        const role = yield role_1.default.findByPk(id, {
            attributes: ['id', 'nombre', 'descripcion', 'estado']
        });
        if (!role) {
            res.status(404).json({
                status: 'error',
                message: "Rol no encontrado"
            });
            return;
        }
        // Construir condición where para usuarios
        const userWhere = { id_rol: id };
        if (activos !== undefined) {
            userWhere.estado = activos;
        }
        // 🔧 VERSIÓN SEGURA: Obtener todos los atributos del modelo User
        const [usuarios, total] = yield Promise.all([
            user_1.default.findAll({
                where: userWhere,
                // ✅ Sin especificar attributes - deja que Sequelize use las columnas del modelo
                limit: limite,
                offset: offset,
                order: [['id', 'ASC']] // ✅ Orden seguro usando ID
            }),
            user_1.default.count({ where: userWhere })
        ]);
        res.status(200).json({
            status: 'success',
            data: {
                rol: role,
                total,
                pagina,
                limite,
                total_paginas: Math.ceil(total / limite),
                usuarios
            }
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: "Parámetros inválidos",
                errors: error.errors
            });
            return;
        }
        next(error);
    }
});
exports.getUsersByRole = getUsersByRole;
