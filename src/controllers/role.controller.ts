import { Request, Response, NextFunction } from 'express';
import { Op, Transaction } from 'sequelize';
import { z } from 'zod';
import Role from '../models/role';
import User from '../models/user';
import Permission from '../models/permission';
import Privilege from '../models/privilege';
import sequelize from '../config/db';
import { idSchema, createRoleSchema, updateRoleSchema, searchRoleSchema } from '../validators/role.validator';
import ApiResponse from '../utils/apiResponse';

// Generar código de rol
const generateRoleCode = async (): Promise<string> => {
    const lastRole = await Role.findOne({
        order: [['codigo', 'DESC']],
    });

    const lastCode = lastRole ? parseInt(lastRole.codigo.substring(1)) : 0;
    const newCode = `R${String(lastCode + 1).padStart(3, '0')}`;
    return newCode;
};

// Listar roles
export const getRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { pagina = 1, limite = 10, orden = 'nombre', direccion = 'ASC' } = searchRoleSchema.parse(req.query);

        const offset = (pagina - 1) * limite;

        const [roles, total] = await Promise.all([
            Role.findAll({
                include: [
                    {
                        model: Permission,
                        as: 'permisos',
                        through: { attributes: [] }
                    },
                    {
                        model: Privilege,
                        as: 'privilegios',
                        through: { attributes: [] }
                    }
                ],
                limit: limite,
                offset: offset,
                order: [[orden, direccion]]
            }),
            Role.count()
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
    } catch (error) {
        next(error);
    }
};

// Crear rol
export const createRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const transaction: Transaction = await sequelize.transaction();

    try {
        const roleData = createRoleSchema.parse(req.body);

        // Verificar nombre único
        const existingRole = await Role.findOne({
            where: { nombre: roleData.nombre },
            transaction
        });

        if (existingRole) {
            await transaction.rollback();
            res.status(400).json({
                status: 'error',
                message: "Ya existe un rol con ese nombre"
            });
            return;
        }

        // Verificar que los permisos existan
        const permisos = await Permission.findAll({
            where: {
                id: { [Op.in]: roleData.permisos },
                estado: true
            },
            transaction
        });

        if (permisos.length !== roleData.permisos.length) {
            await transaction.rollback();
            res.status(400).json({
                status: 'error',
                message: "Uno o más permisos no existen o están inactivos"
            });
            return;
        }

        // Verificar que los privilegios existan
        const privilegios = await Privilege.findAll({
            where: {
                id: { [Op.in]: roleData.privilegios }
            },
            transaction
        });

        if (privilegios.length !== roleData.privilegios.length) {
            await transaction.rollback();
            res.status(400).json({
                status: 'error',
                message: "Uno o más privilegios no existen"
            });
            return;
        }

        // Generar código único
        const codigo = await generateRoleCode();

        // Crear rol
        const role = await Role.create({
            codigo,
            nombre: roleData.nombre,
            descripcion: roleData.descripcion,
            estado: roleData.estado
        }, { transaction });

        // Asociar permisos y privilegios
        await role.setPermisos(permisos, { transaction });
        await role.setPrivilegios(privilegios, { transaction });

        await transaction.commit();

        // Obtener rol creado con sus relaciones
        const createdRole = await Role.findByPk(role.id, {
            include: [
                {
                    model: Permission,
                    as: 'permisos',
                    through: { attributes: [] }
                },
                {
                    model: Privilege,
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

    } catch (error) {
        await transaction.rollback();
        if (error instanceof z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: "Datos de rol inválidos",
                errors: error.errors
            });
            return;
        }
        next(error);
    }
};

// Actualizar rol
export const updateRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const transaction: Transaction = await sequelize.transaction();

    try {
        const { id } = idSchema.parse({ id: req.params.id });
        const updateData = updateRoleSchema.parse(req.body);

        // Buscar rol
        const role = await Role.findByPk(id, { transaction });
        if (!role) {
            await transaction.rollback();
            res.status(404).json({
                status: 'error',
                message: "Rol no encontrado"
            });
            return;
        }

        // Verificar nombre único si se va a actualizar
        if (updateData.nombre) {
            const existingRole = await Role.findOne({
                where: {
                    nombre: updateData.nombre,
                    id: { [Op.ne]: id }
                },
                transaction
            });

            if (existingRole) {
                await transaction.rollback();
                res.status(400).json({
                    status: 'error',
                    message: "Ya existe otro rol con ese nombre"
                });
                return;
            }
        }

        // Actualizar permisos si se proporcionaron
        if (updateData.permisos) {
            const permisos = await Permission.findAll({
                where: {
                    id: { [Op.in]: updateData.permisos },
                    estado: true
                },
                transaction
            });

            if (permisos.length !== updateData.permisos.length) {
                await transaction.rollback();
                res.status(400).json({
                    status: 'error',
                    message: "Uno o más permisos no existen o están inactivos"
                });
                return;
            }

            await role.setPermisos(permisos, { transaction });
        }

        // Actualizar privilegios si se proporcionaron
        if (updateData.privilegios) {
            const privilegios = await Privilege.findAll({
                where: {
                    id: { [Op.in]: updateData.privilegios }
                },
                transaction
            });

            if (privilegios.length !== updateData.privilegios.length) {
                await transaction.rollback();
                res.status(400).json({
                    status: 'error',
                    message: "Uno o más privilegios no existen"
                });
                return;
            }

            await role.setPrivilegios(privilegios, { transaction });
        }

        // Actualizar rol
        const { permisos, privilegios, ...roleUpdateData } = updateData;
        await role.update(roleUpdateData, { transaction });

        await transaction.commit();

        // Obtener rol actualizado con sus relaciones
        const updatedRole = await Role.findByPk(id, {
            include: [
                {
                    model: Permission,
                    as: 'permisos',
                    through: { attributes: [] }
                },
                {
                    model: Privilege,
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

    } catch (error) {
        await transaction.rollback();
        if (error instanceof z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: "Datos de actualización inválidos",
                errors: error.errors
            });
            return;
        }
        next(error);
    }
};

// Desactivar rol
export const deactivateRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const transaction: Transaction = await sequelize.transaction();

    try {
        const { id } = idSchema.parse({ id: req.params.id });

        // Buscar rol
        const role = await Role.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'usuarios'
                }
            ],
            transaction
        });

        if (!role) {
            await transaction.rollback();
            res.status(404).json({
                status: 'error',
                message: "Rol no encontrado"
            });
            return;
        }

        // Verificar si hay usuarios asociados
        if (role.usuarios && role.usuarios.length > 0) {
            await transaction.rollback();
            res.status(400).json({
                status: 'error',
                message: "No se puede desactivar el rol porque tiene usuarios asociados"
            });
            return;
        }

        // Desactivar rol
        await role.update({ estado: false }, { transaction });

        await transaction.commit();

        res.status(200).json({
            status: 'success',
            message: "Rol desactivado exitosamente",
            data: { role }
        });

    } catch (error) {
        await transaction.rollback();
        if (error instanceof z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: "ID de rol inválido"
            });
            return;
        }
        next(error);
    }
};

// Eliminar rol
export const deleteRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const transaction: Transaction = await sequelize.transaction();

    try {
        const { id } = idSchema.parse({ id: req.params.id });

        // Buscar rol
        const role = await Role.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'usuarios'
                }
            ],
            transaction
        });

        if (!role) {
            await transaction.rollback();
            res.status(404).json({
                status: 'error',
                message: "Rol no encontrado"
            });
            return;
        }

        // Verificar si hay usuarios asociados
        if (role.usuarios && role.usuarios.length > 0) {
            await transaction.rollback();
            res.status(400).json({
                status: 'error',
                message: "No se puede eliminar el rol porque tiene usuarios asociados"
            });
            return;
        }

        // Eliminar rol
        await role.destroy({ transaction });

        await transaction.commit();

        res.status(200).json({
            status: 'success',
            message: "Rol eliminado exitosamente",
            data: { role }
        });

    } catch (error) {
        await transaction.rollback();
        if (error instanceof z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: "ID de rol inválido"
            });
            return;
        }
        next(error);
    }
};

// Buscar roles
export const searchRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { q = '', pagina = 1, limite = 10 } = searchRoleSchema.parse(req.query);

        const offset = (pagina - 1) * limite;
        const searchTerm = q.trim();

        const where = searchTerm ? {
            [Op.or]: [
                { nombre: { [Op.iLike]: `%${searchTerm}%` } },
                { descripcion: { [Op.iLike]: `%${searchTerm}%` } }
            ]
        } : {};

        const [roles, total] = await Promise.all([
            Role.findAll({
                where,
                attributes: ['id', 'nombre', 'descripcion', 'estado'],
                limit: limite,
                offset: offset,
                order: [['nombre', 'ASC']]
            }),
            Role.count({ where })
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
    } catch (error) {
        next(error);
    }
};

// Listar todos los permisos y privilegios
export const listPermissionsAndPrivileges = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Obtener permisos con privilegios
        const permisos = await Permission.findAll({
            where: { estado: true },
            include: [{
                model: Privilege,
                as: 'privilegios',
                attributes: ['id', 'nombre', 'descripcion', 'codigo']
            }],
            attributes: ['id', 'nombre', 'descripcion', 'codigo'],
            order: [
                ['nombre', 'ASC'],
                [{ model: Privilege, as: 'privilegios' }, 'nombre', 'ASC']
            ]
        });

        // Obtener privilegios independientes (sin permiso padre)
        const privilegiosIndependientes = await Privilege.findAll({
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
        const modulosOrdenados = Array.from(modulos.values()).sort((a, b) => 
            a.nombre.localeCompare(b.nombre)
        );

        res.status(200).json({
            status: 'success',
            data: {
                modulos: modulosOrdenados,
                resumen: {
                    total_modulos: modulosOrdenados.length,
                    total_permisos: permisos.length,
                    total_privilegios: privilegiosIndependientes.length + 
                        permisos.reduce((acc, p) => acc + (p.privilegios?.length || 0), 0)
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

// Listar todos los permisos y privilegios (con formato específico)
export const listAllPermissionsAndPrivileges = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const [permisos, privilegios] = await Promise.all([
            Permission.findAll({
                where: { estado: true },
                attributes: ['id', 'nombre', 'descripcion', 'codigo'],
                order: [['nombre', 'ASC']]
            }),
            Privilege.findAll({
                attributes: ['id', 'nombre', 'descripcion', 'codigo', 'id_permiso'],
                include: [{
                    model: Permission,
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

    } catch (error) {
        next(error);
    }
};

// Función auxiliar para extraer nombre del módulo basado en entidades del sistema
function extractModuleName(nombre: string): string {
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
            if (palabra.includes('usuario') || palabra.includes('user')) return 'Usuarios';
            if (palabra.includes('cliente') || palabra.includes('client')) return 'Clientes';
            if (palabra.includes('entrenador') || palabra.includes('trainer')) return 'Entrenadores';
            if (palabra.includes('asistencia') || palabra.includes('attendance')) return 'Asistencias';
            if (palabra.includes('contrato') || palabra.includes('contract')) return 'Contratos';
            if (palabra.includes('membresia') || palabra.includes('membership')) return 'Membresias';
            if (palabra.includes('horario') || palabra.includes('schedule')) return 'Horarios';
            if (palabra.includes('reporte') || palabra.includes('report')) return 'Reportes';
            if (palabra.includes('rol') || palabra.includes('role')) return 'Roles';
            
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
            if (segundaPalabra.includes('usuario')) return 'Usuarios';
            if (segundaPalabra.includes('cliente')) return 'Clientes';
            if (segundaPalabra.includes('entrenador')) return 'Entrenadores';
            if (segundaPalabra.includes('asistencia')) return 'Asistencias';
            if (segundaPalabra.includes('contrato')) return 'Contratos';
            if (segundaPalabra.includes('membresia')) return 'Membresias';
            if (segundaPalabra.includes('horario')) return 'Horarios';
            if (segundaPalabra.includes('reporte')) return 'Reportes';
            if (segundaPalabra.includes('rol')) return 'Roles';
            
            return segundaPalabra.charAt(0).toUpperCase() + segundaPalabra.slice(1);
        }
    }

    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
}

// Asignar privilegios a un rol
export const assignPrivileges = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const transaction: Transaction = await sequelize.transaction();

    try {
        const { id } = idSchema.parse({ id: req.params.id });
        const { privilegios } = z.object({
            privilegios: z.array(z.number()).min(1, "Debe seleccionar al menos un privilegio")
        }).parse(req.body);

        // Buscar rol
        const role = await Role.findByPk(id, { transaction });
        if (!role) {
            await transaction.rollback();
            res.status(404).json({
                status: 'error',
                message: "Rol no encontrado"
            });
            return;
        }

        // Verificar que los privilegios existan
        const privilegiosExistentes = await Privilege.findAll({
            where: { id: { [Op.in]: privilegios } },
            transaction
        });

        if (privilegiosExistentes.length !== privilegios.length) {
            await transaction.rollback();
            res.status(400).json({
                status: 'error',
                message: "Uno o más privilegios no existen"
            });
            return;
        }

        // Asignar privilegios
        await role.setPrivilegios(privilegiosExistentes, { transaction });
        await transaction.commit();

        // Obtener rol actualizado con sus privilegios
        const updatedRole = await Role.findByPk(id, {
            include: [{
                model: Privilege,
                as: 'privilegios',
                through: { attributes: [] }
            }]
        });

        res.status(200).json({
            status: 'success',
            message: "Privilegios asignados exitosamente",
            data: { role: updatedRole }
        });

    } catch (error) {
        await transaction.rollback();
        if (error instanceof z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: "Datos inválidos",
                errors: error.errors
            });
            return;
        }
        next(error);
    }
};

// Retirar privilegios de un rol
export const removePrivileges = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const transaction: Transaction = await sequelize.transaction();

    try {
        const { id } = idSchema.parse({ id: req.params.id });
        const { privilegios } = z.object({
            privilegios: z.array(z.number()).min(1, "Debe seleccionar al menos un privilegio")
        }).parse(req.body);

        // Buscar rol
        const role = await Role.findByPk(id, {
            include: [{
                model: Privilege,
                as: 'privilegios'
            }],
            transaction
        });

        if (!role) {
            await transaction.rollback();
            res.status(404).json({
                status: 'error',
                message: "Rol no encontrado"
            });
            return;
        }

        // Obtener privilegios actuales
        const privilegiosActuales = role.privilegios?.map(p => p.id) || [];

        // Filtrar privilegios a mantener
        const privilegiosRestantes = privilegiosActuales.filter(
            id => !privilegios.includes(id)
        );

        // Obtener objetos Privilege para los IDs restantes
        const privilegiosAMantener = await Privilege.findAll({
            where: { id: { [Op.in]: privilegiosRestantes } },
            transaction
        });

        // Actualizar privilegios
        await role.setPrivilegios(privilegiosAMantener, { transaction });
        await transaction.commit();

        // Obtener rol actualizado
        const updatedRole = await Role.findByPk(id, {
            include: [{
                model: Privilege,
                as: 'privilegios',
                through: { attributes: [] }
            }]
        });

        res.status(200).json({
            status: 'success',
            message: "Privilegios retirados exitosamente",
            data: { role: updatedRole }
        });

    } catch (error) {
        await transaction.rollback();
        if (error instanceof z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: "Datos inválidos",
                errors: error.errors
            });
            return;
        }
        next(error);
    }
};

// Obtener rol con sus permisos y privilegios
export const getRoleWithPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = idSchema.parse({ id: req.params.id });

        const role = await Role.findByPk(id, {
            include: [
                {
                    model: Permission,
                    as: 'permisos',
                    attributes: ['id', 'nombre', 'descripcion', 'codigo'],
                    through: { attributes: [] }
                },
                {
                    model: Privilege,
                    as: 'privilegios',
                    attributes: ['id', 'nombre', 'descripcion', 'codigo', 'id_permiso'],
                    through: { attributes: [] },
                    include: [
                        {
                            model: Permission,
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
            role.permisos.forEach((permiso: any) => {
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
            role.privilegios.forEach((privilegio: any) => {
                let moduloNombre;
                
                if (privilegio.permiso) {
                    // Privilegio asociado a un permiso
                    moduloNombre = extractModuleName(privilegio.permiso.nombre);
                } else {
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
        const modulosOrdenados = Array.from(modulos.values()).sort((a, b) => 
            a.nombre.localeCompare(b.nombre)
        );

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
                    total_permisos: role.permisos?.length || 0,
                    total_privilegios: role.privilegios?.length || 0
                }
            }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: 'ID de rol inválido',
                errors: error.errors
            });
            return;
        }
        next(error);
    }
};

// Obtener rol con permisos y privilegios (formato simple)
export const getRoleWithPermissionsSimple = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = idSchema.parse({ id: req.params.id });

        const role = await Role.findByPk(id, {
            include: [
                {
                    model: Permission,
                    as: 'permisos',
                    attributes: ['id', 'nombre', 'descripcion', 'codigo'],
                    through: { attributes: [] }
                },
                {
                    model: Privilege,
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
                    total_permisos: role.permisos?.length || 0,
                    total_privilegios: role.privilegios?.length || 0
                }
            }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: 'ID de rol inválido',
                errors: error.errors
            });
            return;
        }
        next(error);
    }
};

// Obtener usuarios por rol
export const getUsersByRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = idSchema.parse({ id: req.params.id });
        const { pagina = 1, limite = 10, activos = true } = z.object({
            pagina: z.number().min(1).optional(),
            limite: z.number().min(1).max(100).optional(),
            activos: z.boolean().optional()
        }).parse(req.query);

        const offset = (pagina - 1) * limite;

        // Buscar rol
        const role = await Role.findByPk(id, {
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
        const userWhere: any = { rol_id: id };
        if (activos !== undefined) {
            userWhere.estado = activos;
        }

        // Obtener usuarios del rol con paginación
        const [usuarios, total] = await Promise.all([
            User.findAll({
                where: userWhere,
                attributes: ['id', 'codigo', 'nombres', 'apellidos', 'email', 'telefono', 'estado', 'fecha_creacion'],
                limit: limite,
                offset: offset,
                order: [['nombres', 'ASC'], ['apellidos', 'ASC']]
            }),
            User.count({ where: userWhere })
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

    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: "Parámetros inválidos",
                errors: error.errors
            });
            return;
        }
        next(error);
    }
};