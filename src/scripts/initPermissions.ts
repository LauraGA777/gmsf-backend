import sequelize from '../config/db';
import { Permission, Privilege, Role } from '../models';
import { 
    PERMISSIONS, 
    PRIVILEGES,
    PERMISSION_GROUPS
} from '../utils/permissions';

interface PermissionData {
    nombre: string;
    descripcion: string;
    codigo: string;
}

interface PrivilegeData {
    nombre: string;
    descripcion: string;
    codigo: string;
}

interface RolePermissionConfig {
    codigo: string;
    permissions: string[];
    privileges: string[];
}

const PERMISSIONS_DATA: PermissionData[] = [
    // Permisos de Usuario
    { nombre: 'Ver Usuarios', descripcion: 'Permite ver la lista de usuarios', codigo: PERMISSIONS.VIEW_USERS },
    { nombre: 'Crear Usuarios', descripcion: 'Permite crear nuevos usuarios', codigo: PERMISSIONS.CREATE_USERS },
    { nombre: 'Actualizar Usuarios', descripcion: 'Permite actualizar información de usuarios', codigo: PERMISSIONS.UPDATE_USERS },
    { nombre: 'Activar Usuarios', descripcion: 'Permite activar usuarios deshabilitados', codigo: PERMISSIONS.ACTIVATE_USERS },
    { nombre: 'Desactivar Usuarios', descripcion: 'Permite desactivar usuarios', codigo: PERMISSIONS.DEACTIVATE_USERS },
    { nombre: 'Eliminar Usuarios', descripcion: 'Permite eliminar usuarios permanentemente', codigo: PERMISSIONS.DELETE_USERS },
    { nombre: 'Gestionar Usuarios', descripcion: 'Permite gestión completa de usuarios', codigo: PERMISSIONS.MANAGE_USERS },

    // Permisos de Cliente
    { nombre: 'Ver Clientes', descripcion: 'Permite ver la lista de clientes', codigo: PERMISSIONS.VIEW_CLIENTS },
    { nombre: 'Crear Clientes', descripcion: 'Permite crear nuevos clientes', codigo: PERMISSIONS.CREATE_CLIENTS },
    { nombre: 'Actualizar Clientes', descripcion: 'Permite actualizar información de clientes', codigo: PERMISSIONS.UPDATE_CLIENTS },
    { nombre: 'Gestionar Clientes', descripcion: 'Permite gestión completa de clientes', codigo: PERMISSIONS.MANAGE_CLIENTS },

    // Permisos de Contrato
    { nombre: 'Ver Contratos', descripcion: 'Permite ver la lista de contratos', codigo: PERMISSIONS.VIEW_CONTRACTS },
    { nombre: 'Crear Contratos', descripcion: 'Permite crear nuevos contratos', codigo: PERMISSIONS.CREATE_CONTRACTS },
    { nombre: 'Actualizar Contratos', descripcion: 'Permite actualizar contratos existentes', codigo: PERMISSIONS.UPDATE_CONTRACTS },
    { nombre: 'Cancelar Contratos', descripcion: 'Permite cancelar contratos', codigo: PERMISSIONS.CANCEL_CONTRACTS },
    { nombre: 'Gestionar Contratos', descripcion: 'Permite gestión completa de contratos', codigo: PERMISSIONS.MANAGE_CONTRACTS },

    // Permisos de Asistencia
    { nombre: 'Ver Asistencias', descripcion: 'Permite ver registros de asistencia', codigo: PERMISSIONS.VIEW_ATTENDANCE },
    { nombre: 'Registrar Asistencia', descripcion: 'Permite registrar asistencia de clientes', codigo: PERMISSIONS.REGISTER_ATTENDANCE },
    { nombre: 'Gestionar Asistencias', descripcion: 'Permite gestión completa de asistencias', codigo: PERMISSIONS.MANAGE_ATTENDANCE },

    // Permisos de Entrenador
    { nombre: 'Ver Entrenadores', descripcion: 'Permite ver la lista de entrenadores', codigo: PERMISSIONS.VIEW_TRAINERS },
    { nombre: 'Crear Entrenadores', descripcion: 'Permite crear nuevos entrenadores', codigo: PERMISSIONS.CREATE_TRAINERS },
    { nombre: 'Actualizar Entrenadores', descripcion: 'Permite actualizar información de entrenadores', codigo: PERMISSIONS.UPDATE_TRAINERS },
    { nombre: 'Gestionar Entrenadores', descripcion: 'Permite gestión completa de entrenadores', codigo: PERMISSIONS.MANAGE_TRAINERS },

    // Permisos de Membresía
    { nombre: 'Ver Membresías', descripcion: 'Permite ver la lista de membresías', codigo: PERMISSIONS.VIEW_MEMBERSHIPS },
    { nombre: 'Crear Membresías', descripcion: 'Permite crear nuevas membresías', codigo: PERMISSIONS.CREATE_MEMBERSHIPS },
    { nombre: 'Actualizar Membresías', descripcion: 'Permite actualizar membresías existentes', codigo: PERMISSIONS.UPDATE_MEMBERSHIPS },
    { nombre: 'Gestionar Membresías', descripcion: 'Permite gestión completa de membresías', codigo: PERMISSIONS.MANAGE_MEMBERSHIPS },

    // Permisos de Horario
    { nombre: 'Ver Horarios', descripcion: 'Permite ver horarios y sesiones', codigo: PERMISSIONS.VIEW_SCHEDULES },
    { nombre: 'Crear Horarios', descripcion: 'Permite crear nuevas sesiones de entrenamiento', codigo: PERMISSIONS.CREATE_SCHEDULES },
    { nombre: 'Actualizar Horarios', descripcion: 'Permite actualizar sesiones existentes', codigo: PERMISSIONS.UPDATE_SCHEDULES },
    { nombre: 'Gestionar Horarios', descripcion: 'Permite gestión completa de horarios', codigo: PERMISSIONS.MANAGE_SCHEDULES },

    // Permisos de Rol
    { nombre: 'Ver Roles', descripcion: 'Permite ver la lista de roles', codigo: PERMISSIONS.VIEW_ROLES },
    { nombre: 'Gestionar Roles', descripcion: 'Permite gestión completa de roles', codigo: PERMISSIONS.MANAGE_ROLES },
    { nombre: 'Asignar Permisos', descripcion: 'Permite asignar permisos a roles', codigo: PERMISSIONS.ASSIGN_PERMISSIONS },

    // Permisos adicionales
    { nombre: 'Ver Reportes', descripcion: 'Permite ver reportes del sistema', codigo: PERMISSIONS.VIEW_REPORTS },
    { nombre: 'Exportar Datos', descripcion: 'Permite exportar datos del sistema', codigo: PERMISSIONS.EXPORT_DATA },
    { nombre: 'Configuración del Sistema', descripcion: 'Permite configurar parámetros del sistema', codigo: PERMISSIONS.SYSTEM_CONFIG }
];

const PRIVILEGES_DATA: PrivilegeData[] = [
    // Privilegios de usuarios
    { nombre: 'Acceso Completo Usuarios', descripcion: 'Acceso completo a la gestión de usuarios', codigo: PRIVILEGES.FULL_USER_ACCESS },
    { nombre: 'Acceso Solo Lectura Usuarios', descripcion: 'Acceso de solo lectura a usuarios', codigo: PRIVILEGES.READONLY_USER_ACCESS },
    
    // Privilegios de contratos
    { nombre: 'Aprobar Contratos', descripcion: 'Permite aprobar contratos pendientes', codigo: PRIVILEGES.APPROVE_CONTRACTS },
    { nombre: 'Cancelar Contratos Activos', descripcion: 'Permite cancelar contratos activos', codigo: PRIVILEGES.CANCEL_ACTIVE_CONTRACTS },
    
    // Privilegios de asistencias
    { nombre: 'Modificar Historial Asistencias', descripcion: 'Permite modificar el historial de asistencias', codigo: PRIVILEGES.MODIFY_ATTENDANCE_HISTORY },
    { nombre: 'Eliminar Asistencias', descripcion: 'Permite eliminar registros de asistencia', codigo: PRIVILEGES.DELETE_ATTENDANCE },
    
    // Privilegios administrativos
    { nombre: 'Super Administrador', descripcion: 'Acceso de super administrador', codigo: PRIVILEGES.SUPER_ADMIN },
    { nombre: 'Respaldo y Restauración', descripcion: 'Permite hacer respaldos y restaurar datos', codigo: PRIVILEGES.BACKUP_RESTORE },
    
    // Privilegios de entrenador
    { nombre: 'Asignar Planes de Entrenamiento', descripcion: 'Permite asignar planes de entrenamiento', codigo: PRIVILEGES.ASSIGN_TRAINING_PLANS },
    { nombre: 'Ver Progreso de Clientes', descripcion: 'Permite ver el progreso de los clientes', codigo: PRIVILEGES.VIEW_CLIENT_PROGRESS },
    
    // Privilegios financieros
    { nombre: 'Ver Datos Financieros', descripcion: 'Permite ver datos financieros', codigo: PRIVILEGES.VIEW_FINANCIAL_DATA },
    { nombre: 'Gestionar Pagos', descripcion: 'Permite gestionar pagos', codigo: PRIVILEGES.MANAGE_PAYMENTS }
];

// Array con todos los permisos disponibles para el administrador
const ALL_PERMISSIONS = Object.values(PERMISSIONS);

// Array con todos los privilegios disponibles para el administrador
const ALL_PRIVILEGES = Object.values(PRIVILEGES);

// Configuración de permisos y privilegios para roles existentes
const ROLE_PERMISSIONS_CONFIG: RolePermissionConfig[] = [
    {
        codigo: 'R001', // Administrador
        permissions: ALL_PERMISSIONS,
        privileges: ALL_PRIVILEGES
    },
    {
        codigo: 'R002', // Entrenador
        permissions: PERMISSION_GROUPS.TRAINER_PERMISSIONS,
        privileges: [
            PRIVILEGES.ASSIGN_TRAINING_PLANS,
            PRIVILEGES.VIEW_CLIENT_PROGRESS
        ]
    },
    {
        codigo: 'R003', // Cliente
        permissions: [
            PERMISSIONS.VIEW_SCHEDULES,
            PERMISSIONS.VIEW_TRAINERS,
            PERMISSIONS.VIEW_MEMBERSHIPS
        ],
        privileges: [
            PRIVILEGES.READONLY_USER_ACCESS
        ]
    },
    {
        codigo: 'R004', // Beneficiario
        permissions: [
            PERMISSIONS.VIEW_SCHEDULES,
            PERMISSIONS.VIEW_TRAINERS
        ],
        privileges: [
            PRIVILEGES.READONLY_USER_ACCESS
        ]
    }
];

async function initializePermissions() {
    try {
        console.log('🚀 Iniciando configuración de permisos y roles...');

        // Verificar conexión a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida');

        // Sincronizar tablas (sin forzar recreación para preservar datos existentes)
        await sequelize.sync({ alter: true });
        console.log('✅ Tablas sincronizadas');

        // 1. Insertar permisos
        console.log('\n📋 Insertando permisos...');
        for (const permissionData of PERMISSIONS_DATA) {
            const [permission, created] = await Permission.findOrCreate({
                where: { codigo: permissionData.codigo },
                defaults: {
                    nombre: permissionData.nombre,
                    descripcion: permissionData.descripcion,
                    codigo: permissionData.codigo
                }
            });
            
            if (created) {
                console.log(`  ✅ Permiso creado: ${permission.nombre}`);
            } else {
                console.log(`  ℹ️  Permiso existente: ${permission.nombre}`);
            }
        }

        // 2. Insertar privilegios
        console.log('\n🔐 Insertando privilegios...');
        for (const privilegeData of PRIVILEGES_DATA) {
            const [privilege, created] = await Privilege.findOrCreate({
                where: { codigo: privilegeData.codigo },
                defaults: {
                    nombre: privilegeData.nombre,
                    descripcion: privilegeData.descripcion,
                    codigo: privilegeData.codigo
                }
            });
            
            if (created) {
                console.log(`  ✅ Privilegio creado: ${privilege.nombre}`);
            } else {
                console.log(`  ℹ️  Privilegio existente: ${privilege.nombre}`);
            }
        }

        // 3. Asignar permisos y privilegios a roles existentes
        console.log('\n👤 Asignando permisos y privilegios a roles existentes...');
        for (const roleConfig of ROLE_PERMISSIONS_CONFIG) {
            // Buscar el rol existente por código
            const role = await Role.findOne({
                where: { codigo: roleConfig.codigo }
            });

            if (!role) {
                console.log(`  ⚠️  Rol con código ${roleConfig.codigo} no encontrado, omitiendo...`);
                continue;
            }

            console.log(`  📋 Configurando rol: ${role.nombre} (${role.codigo})`);

            // Asignar permisos al rol
            const permissions = await Permission.findAll({
                where: { codigo: roleConfig.permissions }
            });
            
            if (permissions.length > 0) {
                await role.setPermisos(permissions);
                console.log(`    ✅ ${permissions.length} permisos asignados a ${role.nombre}`);
            } else {
                console.log(`    ⚠️  No se encontraron permisos para ${role.nombre}`);
            }

            // Asignar privilegios al rol
            const privileges = await Privilege.findAll({
                where: { codigo: roleConfig.privileges }
            });
            
            if (privileges.length > 0) {
                await role.setPrivilegios(privileges);
                console.log(`    ✅ ${privileges.length} privilegios asignados a ${role.nombre}`);
            } else {
                console.log(`    ⚠️  No se encontraron privilegios para ${role.nombre}`);
            }
        }

        console.log('\n🎉 ¡Configuración de permisos y roles completada exitosamente!');
        console.log('\n📊 Resumen:');
        console.log(`  - ${PERMISSIONS_DATA.length} permisos configurados`);
        console.log(`  - ${PRIVILEGES_DATA.length} privilegios configurados`);
        console.log(`  - ${ROLE_PERMISSIONS_CONFIG.length} roles configurados con permisos y privilegios`);

    } catch (error) {
        console.error('❌ Error durante la inicialización:', error);
        throw error;
    }
}

// Ejecutar el script
if (require.main === module) {
    initializePermissions()
        .then(() => {
            console.log('\n✅ Script ejecutado correctamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Error ejecutando el script:', error);
            process.exit(1);
        });
}

export default initializePermissions;
