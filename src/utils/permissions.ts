// Permisos modulares (para BD)
export const PERMISSIONS = {
    // Módulos principales
    ASISTENCIAS: 'ASISTENCIAS',
    CLIENTES: 'CLIENTES', 
    MEMBRESIAS: 'MEMBRESIAS',
    HORARIOS: 'HORARIOS',
    ENTRENADORES: 'ENTRENADORES',

    // Permisos granulares para las rutas (mapean a módulos)
    // Asistencias
    REGISTER_ATTENDANCE: 'ASISTENCIAS',
    VIEW_ATTENDANCE: 'ASISTENCIAS',
    MANAGE_ATTENDANCE: 'ASISTENCIAS',

    // Clientes
    VIEW_CLIENTS: 'CLIENTES',
    CREATE_CLIENTS: 'CLIENTES',
    UPDATE_CLIENTS: 'CLIENTES',
    MANAGE_CLIENTS: 'CLIENTES',

    // Contratos (mapea a MEMBRESIAS)
    VIEW_CONTRACTS: 'MEMBRESIAS',
    CREATE_CONTRACTS: 'MEMBRESIAS',
    UPDATE_CONTRACTS: 'MEMBRESIAS',
    CANCEL_CONTRACTS: 'MEMBRESIAS',
    MANAGE_CONTRACTS: 'MEMBRESIAS',

    // Membresías
    VIEW_MEMBERSHIPS: 'MEMBRESIAS',
    CREATE_MEMBERSHIPS: 'MEMBRESIAS',
    UPDATE_MEMBERSHIPS: 'MEMBRESIAS',
    MANAGE_MEMBERSHIPS: 'MEMBRESIAS',

    // Horarios
    VIEW_SCHEDULES: 'HORARIOS',
    CREATE_SCHEDULES: 'HORARIOS',
    UPDATE_SCHEDULES: 'HORARIOS',
    MANAGE_SCHEDULES: 'HORARIOS',

    // Entrenadores
    VIEW_TRAINERS: 'ENTRENADORES',
    CREATE_TRAINERS: 'ENTRENADORES',
    UPDATE_TRAINERS: 'ENTRENADORES',
    MANAGE_TRAINERS: 'ENTRENADORES',

    // Roles (mapea a sistema general)
    VIEW_ROLES: 'ENTRENADORES', // Los administradores pueden gestionar roles
    MANAGE_ROLES: 'ENTRENADORES',
    ASSIGN_PERMISSIONS: 'ENTRENADORES',

    // Usuarios (mapea a sistema general)
    VIEW_USERS: 'CLIENTES', // Ver usuarios es parte de gestión de clientes
    CREATE_USERS: 'CLIENTES',
    UPDATE_USERS: 'CLIENTES',
    ACTIVATE_USERS: 'CLIENTES',
    DEACTIVATE_USERS: 'CLIENTES',
    DELETE_USERS: 'CLIENTES',
    MANAGE_USERS: 'CLIENTES'
} as const;

// Privilegios específicos (mantener los existentes)
export const PRIVILEGES = {
    // Privilegios de Asistencias
    ASIST_READ: 'ASIST_READ',
    ASIST_SEARCH: 'ASIST_SEARCH',
    ASIST_CREATE: 'ASIST_CREATE',
    ASIST_DETAILS: 'ASIST_DETAILS',
    ASIST_UPDATE: 'ASIST_UPDATE',
    ASIST_DELETE: 'ASIST_DELETE',
    ASIST_STATS: 'ASIST_STATS',
    
    // Privilegios de Clientes
    CLIENT_READ: 'CLIENT_READ',
    CLIENT_DETAILS: 'CLIENT_DETAILS',
    CLIENT_SEARCH_DOC: 'CLIENT_SEARCH_DOC',
    CLIENT_CREATE: 'CLIENT_CREATE',
    CLIENT_UPDATE: 'CLIENT_UPDATE',
    CLIENT_DELETE: 'CLIENT_DELETE',
    CLIENT_BENEFICIARIES: 'CLIENT_BENEFICIARIES',
    
    // Privilegios de Membresías
    MEMBERSHIP_READ: 'MEMBERSHIP_READ',
    MEMBERSHIP_SEARCH: 'MEMBERSHIP_SEARCH',
    MEMBERSHIP_CREATE: 'MEMBERSHIP_CREATE',
    MEMBERSHIP_UPDATE: 'MEMBERSHIP_UPDATE',
    MEMBERSHIP_DEACTIVATE: 'MEMBERSHIP_DEACTIVATE',
    MEMBERSHIP_DETAILS: 'MEMBERSHIP_DETAILS',
    MEMBERSHIP_REACTIVATE: 'MEMBERSHIP_REACTIVATE',
    
    // Privilegios de Horarios
    SCHEDULE_READ: 'SCHEDULE_READ',
    SCHEDULE_DETAILS: 'SCHEDULE_DETAILS',
    SCHEDULE_CREATE: 'SCHEDULE_CREATE',
    SCHEDULE_UPDATE: 'SCHEDULE_UPDATE',
    SCHEDULE_DELETE: 'SCHEDULE_DELETE',
    SCHEDULE_AVAILABILITY: 'SCHEDULE_AVAILABILITY',
    SCHEDULE_CLIENT_VIEW: 'SCHEDULE_CLIENT_VIEW',
    SCHEDULE_TRAINER_VIEW: 'SCHEDULE_TRAINER_VIEW',
    SCHEDULE_DAILY_VIEW: 'SCHEDULE_DAILY_VIEW',
    SCHEDULE_WEEKLY_VIEW: 'SCHEDULE_WEEKLY_VIEW',
    SCHEDULE_MONTHLY_VIEW: 'SCHEDULE_MONTHLY_VIEW',
    SCHEDULE_TRAINERS_ACTIVE: 'SCHEDULE_TRAINERS_ACTIVE',
    SCHEDULE_CLIENTS_ACTIVE: 'SCHEDULE_CLIENTS_ACTIVE',
    
    // Privilegios de Entrenadores
    TRAINER_READ: 'TRAINER_READ',
    TRAINER_CREATE: 'TRAINER_CREATE',
    TRAINER_UPDATE: 'TRAINER_UPDATE',
    TRAINER_DEACTIVATE: 'TRAINER_DEACTIVATE',
    TRAINER_DELETE: 'TRAINER_DELETE',
    TRAINER_SEARCH: 'TRAINER_SEARCH',
    TRAINER_DETAILS: 'TRAINER_DETAILS'
} as const;

// Grupos de permisos por rol
export const PERMISSION_GROUPS = {
    ADMIN_PERMISSIONS: [
        PERMISSIONS.ASISTENCIAS,
        PERMISSIONS.CLIENTES,
        PERMISSIONS.MEMBRESIAS,
        PERMISSIONS.HORARIOS,
        PERMISSIONS.ENTRENADORES
    ],
    
    TRAINER_PERMISSIONS: [
        PERMISSIONS.ASISTENCIAS,
        PERMISSIONS.CLIENTES,
        PERMISSIONS.HORARIOS
    ],
    
    CLIENT_PERMISSIONS: [
        PERMISSIONS.ASISTENCIAS,
        PERMISSIONS.HORARIOS,
        PERMISSIONS.MEMBRESIAS
    ],
    
    BENEFICIARY_PERMISSIONS: [
        PERMISSIONS.ASISTENCIAS,
        PERMISSIONS.HORARIOS,
        PERMISSIONS.MEMBRESIAS
    ]
};

// Grupos de privilegios por rol (mantener los existentes)
export const PRIVILEGE_GROUPS = {
    ADMIN_PRIVILEGES: [
        // Todos los privilegios de asistencias
        PRIVILEGES.ASIST_READ,
        PRIVILEGES.ASIST_SEARCH,
        PRIVILEGES.ASIST_CREATE,
        PRIVILEGES.ASIST_DETAILS,
        PRIVILEGES.ASIST_UPDATE,
        PRIVILEGES.ASIST_DELETE,
        PRIVILEGES.ASIST_STATS,
        // Todos los privilegios de clientes
        PRIVILEGES.CLIENT_READ,
        PRIVILEGES.CLIENT_DETAILS,
        PRIVILEGES.CLIENT_SEARCH_DOC,
        PRIVILEGES.CLIENT_CREATE,
        PRIVILEGES.CLIENT_UPDATE,
        PRIVILEGES.CLIENT_DELETE,
        PRIVILEGES.CLIENT_BENEFICIARIES,
        // Todos los privilegios de membresías
        PRIVILEGES.MEMBERSHIP_READ,
        PRIVILEGES.MEMBERSHIP_SEARCH,
        PRIVILEGES.MEMBERSHIP_CREATE,
        PRIVILEGES.MEMBERSHIP_UPDATE,
        PRIVILEGES.MEMBERSHIP_DEACTIVATE,
        PRIVILEGES.MEMBERSHIP_DETAILS,
        PRIVILEGES.MEMBERSHIP_REACTIVATE,
        // Todos los privilegios de horarios
        PRIVILEGES.SCHEDULE_READ,
        PRIVILEGES.SCHEDULE_DETAILS,
        PRIVILEGES.SCHEDULE_CREATE,
        PRIVILEGES.SCHEDULE_UPDATE,
        PRIVILEGES.SCHEDULE_DELETE,
        PRIVILEGES.SCHEDULE_AVAILABILITY,
        PRIVILEGES.SCHEDULE_CLIENT_VIEW,
        PRIVILEGES.SCHEDULE_TRAINER_VIEW,
        PRIVILEGES.SCHEDULE_DAILY_VIEW,
        PRIVILEGES.SCHEDULE_WEEKLY_VIEW,
        PRIVILEGES.SCHEDULE_MONTHLY_VIEW,
        PRIVILEGES.SCHEDULE_TRAINERS_ACTIVE,
        PRIVILEGES.SCHEDULE_CLIENTS_ACTIVE,
        // Todos los privilegios de entrenadores
        PRIVILEGES.TRAINER_READ,
        PRIVILEGES.TRAINER_CREATE,
        PRIVILEGES.TRAINER_UPDATE,
        PRIVILEGES.TRAINER_DEACTIVATE,
        PRIVILEGES.TRAINER_DELETE,
        PRIVILEGES.TRAINER_SEARCH,
        PRIVILEGES.TRAINER_DETAILS
    ],
    
    TRAINER_PRIVILEGES: [
        // Asistencias
        PRIVILEGES.ASIST_READ,
        PRIVILEGES.ASIST_SEARCH,
        PRIVILEGES.ASIST_CREATE,
        PRIVILEGES.ASIST_DETAILS,
        PRIVILEGES.ASIST_UPDATE,
        PRIVILEGES.ASIST_STATS,
        // Clientes (solo lectura)
        PRIVILEGES.CLIENT_READ,
        PRIVILEGES.CLIENT_DETAILS,
        PRIVILEGES.CLIENT_SEARCH_DOC,
        PRIVILEGES.CLIENT_BENEFICIARIES,
        // Horarios (gestión completa)
        PRIVILEGES.SCHEDULE_READ,
        PRIVILEGES.SCHEDULE_DETAILS,
        PRIVILEGES.SCHEDULE_CREATE,
        PRIVILEGES.SCHEDULE_UPDATE,
        PRIVILEGES.SCHEDULE_AVAILABILITY,
        PRIVILEGES.SCHEDULE_CLIENT_VIEW,
        PRIVILEGES.SCHEDULE_TRAINER_VIEW,
        PRIVILEGES.SCHEDULE_DAILY_VIEW,
        PRIVILEGES.SCHEDULE_WEEKLY_VIEW,
        PRIVILEGES.SCHEDULE_MONTHLY_VIEW,
        PRIVILEGES.SCHEDULE_CLIENTS_ACTIVE
    ],
    
    CLIENT_PRIVILEGES: [
        // Asistencias (solo lectura propia)
        PRIVILEGES.ASIST_READ,
        PRIVILEGES.ASIST_DETAILS,
        // Horarios (solo consulta)
        PRIVILEGES.SCHEDULE_READ,
        PRIVILEGES.SCHEDULE_DETAILS,
        PRIVILEGES.SCHEDULE_AVAILABILITY,
        PRIVILEGES.SCHEDULE_CLIENT_VIEW,
        PRIVILEGES.SCHEDULE_TRAINER_VIEW,
        PRIVILEGES.SCHEDULE_DAILY_VIEW,
        PRIVILEGES.SCHEDULE_WEEKLY_VIEW,
        PRIVILEGES.SCHEDULE_TRAINERS_ACTIVE,
        // Membresías (solo consulta)
        PRIVILEGES.MEMBERSHIP_READ,
        PRIVILEGES.MEMBERSHIP_SEARCH,
        PRIVILEGES.MEMBERSHIP_DETAILS
    ],
    
    BENEFICIARY_PRIVILEGES: [
        // Mismos privilegios que Cliente
        PRIVILEGES.ASIST_READ,
        PRIVILEGES.ASIST_DETAILS,
        PRIVILEGES.SCHEDULE_READ,
        PRIVILEGES.SCHEDULE_DETAILS,
        PRIVILEGES.SCHEDULE_AVAILABILITY,
        PRIVILEGES.SCHEDULE_CLIENT_VIEW,
        PRIVILEGES.SCHEDULE_TRAINER_VIEW,
        PRIVILEGES.SCHEDULE_DAILY_VIEW,
        PRIVILEGES.SCHEDULE_WEEKLY_VIEW,
        PRIVILEGES.SCHEDULE_TRAINERS_ACTIVE,
        PRIVILEGES.MEMBERSHIP_READ,
        PRIVILEGES.MEMBERSHIP_SEARCH,
        PRIVILEGES.MEMBERSHIP_DETAILS
    ]
};

// Funciones helper para verificar permisos
export const userHasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
    return userPermissions.includes(requiredPermission);
};

export const userHasAnyPermission = (userPermissions: string[], requiredPermissions: string[]): boolean => {
    return requiredPermissions.some(permission => userPermissions.includes(permission));
};

export const userHasAllPermissions = (userPermissions: string[], requiredPermissions: string[]): boolean => {
    return requiredPermissions.every(permission => userPermissions.includes(permission));
};

export const userHasPrivilege = (userPrivileges: string[], requiredPrivilege: string): boolean => {
    return userPrivileges.includes(requiredPrivilege);
};

export const userHasAnyPrivilege = (userPrivileges: string[], requiredPrivileges: string[]): boolean => {
    return requiredPrivileges.some(privilege => userPrivileges.includes(privilege));
};

// Mapeo de permisos granulares a módulos
export const getModuleFromPermission = (permission: string): string => {
    // Los permisos granulares mapean a los valores de los módulos
    return PERMISSIONS[permission as keyof typeof PERMISSIONS] || permission;
};

// Verificar si un permiso granular está incluido en los permisos del usuario
export const hasGranularPermission = (userModulePermissions: string[], granularPermission: string): boolean => {
    const modulePermission = getModuleFromPermission(granularPermission);
    return userModulePermissions.includes(modulePermission);
};
