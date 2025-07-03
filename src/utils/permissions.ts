// Constantes para permisos del sistema
export const PERMISSIONS = {
    // Gestión de usuarios
    MANAGE_USERS: 'gestionar_usuarios',
    VIEW_USERS: 'ver_usuarios',
    CREATE_USERS: 'crear_usuarios',
    UPDATE_USERS: 'actualizar_usuarios',
    DELETE_USERS: 'eliminar_usuarios',
    ACTIVATE_USERS: 'activar_usuarios',
    DEACTIVATE_USERS: 'desactivar_usuarios',
    
    // Gestión de contratos
    MANAGE_CONTRACTS: 'gestionar_contratos',
    VIEW_CONTRACTS: 'ver_contratos',
    CREATE_CONTRACTS: 'crear_contratos',
    UPDATE_CONTRACTS: 'actualizar_contratos',
    CANCEL_CONTRACTS: 'cancelar_contratos',
    
    // Gestión de asistencias
    MANAGE_ATTENDANCE: 'gestionar_asistencias',
    VIEW_ATTENDANCE: 'ver_asistencias',
    REGISTER_ATTENDANCE: 'registrar_asistencias',
    
    // Gestión de clientes
    MANAGE_CLIENTS: 'gestionar_clientes',
    VIEW_CLIENTS: 'ver_clientes',
    CREATE_CLIENTS: 'crear_clientes',
    UPDATE_CLIENTS: 'actualizar_clientes',
    
    // Gestión de entrenamientos y horarios
    MANAGE_SCHEDULES: 'gestionar_horarios',
    VIEW_SCHEDULES: 'ver_horarios',
    CREATE_SCHEDULES: 'crear_horarios',
    UPDATE_SCHEDULES: 'actualizar_horarios',
    
    // Gestión de entrenadores
    MANAGE_TRAINERS: 'gestionar_entrenadores',
    VIEW_TRAINERS: 'ver_entrenadores',
    CREATE_TRAINERS: 'crear_entrenadores',
    UPDATE_TRAINERS: 'actualizar_entrenadores',
    
    // Gestión de membresías
    MANAGE_MEMBERSHIPS: 'gestionar_membresias',
    VIEW_MEMBERSHIPS: 'ver_membresias',
    CREATE_MEMBERSHIPS: 'crear_membresias',
    UPDATE_MEMBERSHIPS: 'actualizar_membresias',
    
    // Gestión de roles y permisos
    MANAGE_ROLES: 'gestionar_roles',
    VIEW_ROLES: 'ver_roles',
    ASSIGN_PERMISSIONS: 'asignar_permisos',
    
    // Reportes y sistema
    VIEW_REPORTS: 'ver_reportes',
    EXPORT_DATA: 'exportar_datos',
    SYSTEM_CONFIG: 'configuracion_sistema'
} as const;

// Constantes para privilegios específicos
export const PRIVILEGES = {
    // Privilegios de usuarios
    FULL_USER_ACCESS: 'acceso_completo_usuarios',
    READONLY_USER_ACCESS: 'acceso_lectura_usuarios',
    
    // Privilegios de contratos
    APPROVE_CONTRACTS: 'aprobar_contratos',
    CANCEL_ACTIVE_CONTRACTS: 'cancelar_contratos_activos',
    
    // Privilegios de asistencias
    MODIFY_ATTENDANCE_HISTORY: 'modificar_historial_asistencias',
    DELETE_ATTENDANCE: 'eliminar_asistencias',
    
    // Privilegios administrativos
    SUPER_ADMIN: 'super_administrador',
    BACKUP_RESTORE: 'respaldo_restauracion',
    
    // Privilegios de entrenador
    ASSIGN_TRAINING_PLANS: 'asignar_planes_entrenamiento',
    VIEW_CLIENT_PROGRESS: 'ver_progreso_clientes',
    
    // Privilegios financieros
    VIEW_FINANCIAL_DATA: 'ver_datos_financieros',
    MANAGE_PAYMENTS: 'gestionar_pagos'
} as const;

// Grupos de permisos predefinidos para roles comunes
export const PERMISSION_GROUPS = {
    ADMIN_PERMISSIONS: [
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.MANAGE_CONTRACTS,
        PERMISSIONS.MANAGE_ATTENDANCE,
        PERMISSIONS.MANAGE_CLIENTS,
        PERMISSIONS.MANAGE_SCHEDULES,
        PERMISSIONS.MANAGE_TRAINERS,
        PERMISSIONS.MANAGE_MEMBERSHIPS,
        PERMISSIONS.MANAGE_ROLES,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.EXPORT_DATA,
        PERMISSIONS.SYSTEM_CONFIG
    ],
    
    TRAINER_PERMISSIONS: [
        PERMISSIONS.VIEW_USERS,
        PERMISSIONS.VIEW_CONTRACTS,
        PERMISSIONS.MANAGE_ATTENDANCE,
        PERMISSIONS.VIEW_CLIENTS,
        PERMISSIONS.UPDATE_CLIENTS,
        PERMISSIONS.MANAGE_SCHEDULES,
        PERMISSIONS.VIEW_TRAINERS,
        PERMISSIONS.VIEW_MEMBERSHIPS
    ],
    
    RECEPTIONIST_PERMISSIONS: [
        PERMISSIONS.VIEW_USERS,
        PERMISSIONS.VIEW_CONTRACTS,
        PERMISSIONS.REGISTER_ATTENDANCE,
        PERMISSIONS.VIEW_CLIENTS,
        PERMISSIONS.CREATE_CLIENTS,
        PERMISSIONS.UPDATE_CLIENTS,
        PERMISSIONS.VIEW_SCHEDULES,
        PERMISSIONS.VIEW_MEMBERSHIPS
    ]
};

// Función helper para verificar si un usuario tiene un permiso específico
export const userHasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
    return userPermissions.includes(requiredPermission);
};

// Función helper para verificar si un usuario tiene cualquiera de los permisos
export const userHasAnyPermission = (userPermissions: string[], requiredPermissions: string[]): boolean => {
    return requiredPermissions.some(permission => userPermissions.includes(permission));
};

// Función helper para verificar si un usuario tiene todos los permisos
export const userHasAllPermissions = (userPermissions: string[], requiredPermissions: string[]): boolean => {
    return requiredPermissions.every(permission => userPermissions.includes(permission));
};
