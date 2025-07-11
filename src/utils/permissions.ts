// Permisos modulares (para BD)
export const PERMISSIONS = {
    // Módulos principales
    ASISTENCIAS: 'ASISTENCIAS',
    CLIENTES: 'CLIENTES',
    CONTRATOS: 'CONTRATOS',
    MEMBRESIAS: 'MEMBRESIAS',
    HORARIOS: 'HORARIOS',
    ENTRENADORES: 'ENTRENADORES',
    USUARIOS: 'USUARIOS',
    SISTEMA: 'SISTEMA',  

    // Permisos granulares para las rutas (mapean a módulos)
    // Asistencias
    REGISTER_ATTENDANCE: 'ASISTENCIAS',
    VIEW_ATTENDANCE: 'ASISTENCIAS',
    MANAGE_ATTENDANCE: 'ASISTENCIAS',

    // CONTRATOS 
    VIEW_CONTRACTS: 'CONTRATOS',
    CREATE_CONTRACTS: 'CONTRATOS',
    UPDATE_CONTRACTS: 'CONTRATOS',
    CANCEL_CONTRACTS: 'CONTRATOS',
    RENEW_CONTRACTS: 'CONTRATOS',
    MANAGE_CONTRACTS: 'CONTRATOS',

    // Clientes
    VIEW_CLIENTS: 'CLIENTES',
    CREATE_CLIENTS: 'CLIENTES',
    UPDATE_CLIENTS: 'CLIENTES',
    MANAGE_CLIENTS: 'CLIENTES',

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

    // Usuarios
    VIEW_USERS: 'USUARIOS',
    CREATE_USERS: 'USUARIOS',
    UPDATE_USERS: 'USUARIOS',
    ACTIVATE_USERS: 'USUARIOS',
    DEACTIVATE_USERS: 'USUARIOS',
    DELETE_USERS: 'USUARIOS',
    MANAGE_USERS: 'USUARIOS',

    // Sistema (para roles y permisos)
    VIEW_ROLES: 'SISTEMA',
    MANAGE_ROLES: 'SISTEMA',
    ASSIGN_PERMISSIONS: 'SISTEMA',
    VIEW_PERMISSIONS: 'SISTEMA',
    MANAGE_PERMISSIONS: 'SISTEMA',

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

    // ✅ PRIVILEGIOS DE CONTRATOS (NUEVO)
    CONTRACT_READ: 'CONTRACT_READ',
    CONTRACT_SEARCH: 'CONTRACT_SEARCH',
    CONTRACT_CREATE: 'CONTRACT_CREATE',
    CONTRACT_DETAILS: 'CONTRACT_DETAILS',
    CONTRACT_UPDATE: 'CONTRACT_UPDATE',
    CONTRACT_DELETE: 'CONTRACT_DELETE',
    CONTRACT_CANCEL: 'CONTRACT_CANCEL',
    CONTRACT_RENEW: 'CONTRACT_RENEW',
    CONTRACT_HISTORY: 'CONTRACT_HISTORY',
    CONTRACT_ACTIVATE: 'CONTRACT_ACTIVATE',
    CONTRACT_DEACTIVATE: 'CONTRACT_DEACTIVATE',
    CONTRACT_EXPORT: 'CONTRACT_EXPORT',
    CONTRACT_STATS: 'CONTRACT_STATS',
    
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
    TRAINER_ACTIVATE: 'TRAINER_ACTIVATE',
    TRAINER_DEACTIVATE: 'TRAINER_DEACTIVATE',
    TRAINER_DELETE: 'TRAINER_DELETE',
    TRAINER_SEARCH: 'TRAINER_SEARCH',
    TRAINER_DETAILS: 'TRAINER_DETAILS',

    // === Privilegios de Usuarios ===
    USER_READ: 'USER_READ',
    USER_SEARCH: 'USER_SEARCH', 
    USER_DETAILS: 'USER_DETAILS',
    USER_CREATE: 'USER_CREATE',
    USER_UPDATE: 'USER_UPDATE',
    USER_ACTIVATE: 'USER_ACTIVATE',
    USER_DEACTIVATE: 'USER_DEACTIVATE',
    USER_DELETE: 'USER_DELETE',
    USER_CHECK_DOCUMENT: 'USER_CHECK_DOCUMENT',
    USER_CHECK_EMAIL: 'USER_CHECK_EMAIL',
    USER_VIEW_ROLES: 'USER_VIEW_ROLES',
    USER_ASSIGN_ROLES: 'USER_ASSIGN_ROLES',
    USER_HISTORY: 'USER_HISTORY',

    // === Privilegios del Sistema ===
    SYSTEM_VIEW_ROLES: 'SYSTEM_VIEW_ROLES',
    SYSTEM_CREATE_ROLES: 'SYSTEM_CREATE_ROLES',
    SYSTEM_UPDATE_ROLES: 'SYSTEM_UPDATE_ROLES',
    SYSTEM_DELETE_ROLES: 'SYSTEM_DELETE_ROLES',
    SYSTEM_ASSIGN_ROLES: 'SYSTEM_ASSIGN_ROLES',
    SYSTEM_VIEW_PERMISSIONS: 'SYSTEM_VIEW_PERMISSIONS',
    SYSTEM_CREATE_PERMISSIONS: 'SYSTEM_CREATE_PERMISSIONS',
    SYSTEM_UPDATE_PERMISSIONS: 'SYSTEM_UPDATE_PERMISSIONS',
    SYSTEM_DELETE_PERMISSIONS: 'SYSTEM_DELETE_PERMISSIONS',
    SYSTEM_ASSIGN_PERMISSIONS: 'SYSTEM_ASSIGN_PERMISSIONS',
    SYSTEM_VIEW_LOGS: 'SYSTEM_VIEW_LOGS',
    SYSTEM_BACKUP: 'SYSTEM_BACKUP',
    SYSTEM_RESTORE: 'SYSTEM_RESTORE',
    SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE',
} as const;

// Grupos de permisos por rol
export const PERMISSION_GROUPS = {
    ADMIN_PERMISSIONS: [
        PERMISSIONS.ASISTENCIAS,
        PERMISSIONS.CLIENTES,
        PERMISSIONS.CONTRATOS,
        PERMISSIONS.MEMBRESIAS,
        PERMISSIONS.HORARIOS,
        PERMISSIONS.ENTRENADORES,
        PERMISSIONS.USUARIOS,
        PERMISSIONS.SISTEMA    
    ],
    
    TRAINER_PERMISSIONS: [
        PERMISSIONS.ASISTENCIAS,
        PERMISSIONS.CLIENTES,
        PERMISSIONS.HORARIOS
    ],
    
    CLIENT_PERMISSIONS: [
        PERMISSIONS.ASISTENCIAS,
        PERMISSIONS.CONTRATOS,
        PERMISSIONS.HORARIOS
    ],
    
    BENEFICIARY_PERMISSIONS: [
        PERMISSIONS.ASISTENCIAS,
        PERMISSIONS.CONTRATOS,
        PERMISSIONS.HORARIOS

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
        // TODOS los privilegios de contratos
        PRIVILEGES.CONTRACT_READ,
        PRIVILEGES.CONTRACT_SEARCH,
        PRIVILEGES.CONTRACT_CREATE,
        PRIVILEGES.CONTRACT_DETAILS,
        PRIVILEGES.CONTRACT_UPDATE,
        PRIVILEGES.CONTRACT_DELETE,
        PRIVILEGES.CONTRACT_CANCEL,
        PRIVILEGES.CONTRACT_RENEW,
        PRIVILEGES.CONTRACT_HISTORY,
        PRIVILEGES.CONTRACT_ACTIVATE,
        PRIVILEGES.CONTRACT_DEACTIVATE,
        PRIVILEGES.CONTRACT_EXPORT,
        PRIVILEGES.CONTRACT_STATS,
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
        PRIVILEGES.TRAINER_ACTIVATE,
        PRIVILEGES.TRAINER_DEACTIVATE,
        PRIVILEGES.TRAINER_DELETE,
        PRIVILEGES.TRAINER_SEARCH,
        PRIVILEGES.TRAINER_DETAILS,
        // Usuarios (acceso completo)
        PRIVILEGES.USER_READ,
        PRIVILEGES.USER_SEARCH,
        PRIVILEGES.USER_DETAILS,
        PRIVILEGES.USER_CREATE,
        PRIVILEGES.USER_UPDATE,
        PRIVILEGES.USER_ACTIVATE,
        PRIVILEGES.USER_DEACTIVATE,
        PRIVILEGES.USER_DELETE,
        PRIVILEGES.USER_CHECK_DOCUMENT,
        PRIVILEGES.USER_CHECK_EMAIL,
        PRIVILEGES.USER_VIEW_ROLES,
        PRIVILEGES.USER_ASSIGN_ROLES,
        PRIVILEGES.USER_HISTORY,
        // Privilegios del sistema
        PRIVILEGES.SYSTEM_VIEW_ROLES,
        PRIVILEGES.SYSTEM_CREATE_ROLES,
        PRIVILEGES.SYSTEM_UPDATE_ROLES,
        PRIVILEGES.SYSTEM_DELETE_ROLES,
        PRIVILEGES.SYSTEM_ASSIGN_ROLES,
        PRIVILEGES.SYSTEM_VIEW_PERMISSIONS,
        PRIVILEGES.SYSTEM_CREATE_PERMISSIONS,
        PRIVILEGES.SYSTEM_UPDATE_PERMISSIONS,
        PRIVILEGES.SYSTEM_DELETE_PERMISSIONS,
        PRIVILEGES.SYSTEM_ASSIGN_PERMISSIONS,
        PRIVILEGES.SYSTEM_VIEW_LOGS,
        PRIVILEGES.SYSTEM_BACKUP,
        PRIVILEGES.SYSTEM_RESTORE,
        PRIVILEGES.SYSTEM_MAINTENANCE
    ],
    
    TRAINER_PRIVILEGES: [
        // Asistencias
        PRIVILEGES.ASIST_READ,
        PRIVILEGES.ASIST_SEARCH,
        PRIVILEGES.ASIST_CREATE,
        PRIVILEGES.ASIST_DETAILS,
        PRIVILEGES.ASIST_STATS,
        // Clientes (solo lectura)
        PRIVILEGES.CLIENT_READ,
        PRIVILEGES.CLIENT_DETAILS,
        PRIVILEGES.CLIENT_SEARCH_DOC,
        PRIVILEGES.CLIENT_BENEFICIARIES,
        // CONTRATOS para entrenadores (solo lectura)
        PRIVILEGES.CONTRACT_READ,
        PRIVILEGES.CONTRACT_SEARCH,
        PRIVILEGES.CONTRACT_DETAILS,
        PRIVILEGES.CONTRACT_HISTORY,
        PRIVILEGES.CONTRACT_STATS,
        // Horarios (gestión completa)
        PRIVILEGES.SCHEDULE_READ,
        PRIVILEGES.SCHEDULE_DETAILS,
        PRIVILEGES.SCHEDULE_CREATE,
        PRIVILEGES.SCHEDULE_UPDATE,
        PRIVILEGES.SCHEDULE_AVAILABILITY,
        PRIVILEGES.SCHEDULE_TRAINER_VIEW,
        PRIVILEGES.SCHEDULE_DAILY_VIEW,
        PRIVILEGES.SCHEDULE_WEEKLY_VIEW,
        PRIVILEGES.SCHEDULE_MONTHLY_VIEW,
        PRIVILEGES.SCHEDULE_TRAINERS_ACTIVE
    ],
    
    CLIENT_PRIVILEGES: [
        // Asistencias (solo lectura propia)
        PRIVILEGES.ASIST_READ,
        PRIVILEGES.ASIST_DETAILS,
        // CONTRATOS para clientes (solo sus propios contratos)
        PRIVILEGES.CONTRACT_READ,
        PRIVILEGES.CONTRACT_DETAILS,
        PRIVILEGES.CONTRACT_HISTORY,
        // Horarios (solo consulta)
        PRIVILEGES.SCHEDULE_READ,
        PRIVILEGES.SCHEDULE_DETAILS,
        PRIVILEGES.SCHEDULE_AVAILABILITY,
        PRIVILEGES.SCHEDULE_CLIENT_VIEW,
        PRIVILEGES.SCHEDULE_DAILY_VIEW,
        PRIVILEGES.SCHEDULE_WEEKLY_VIEW,
    ],
    
    BENEFICIARY_PRIVILEGES: [
        // Mismos privilegios que Cliente
        PRIVILEGES.ASIST_READ,
        PRIVILEGES.ASIST_DETAILS,
        // CONTRATOS para clientes (solo sus propios contratos)
        PRIVILEGES.CONTRACT_READ,
        PRIVILEGES.CONTRACT_DETAILS,
        PRIVILEGES.CONTRACT_HISTORY,
        // Horarios (solo consulta)
        PRIVILEGES.SCHEDULE_READ,
        PRIVILEGES.SCHEDULE_DETAILS,
        PRIVILEGES.SCHEDULE_AVAILABILITY,
        PRIVILEGES.SCHEDULE_CLIENT_VIEW,
        PRIVILEGES.SCHEDULE_TRAINER_VIEW,
        PRIVILEGES.SCHEDULE_DAILY_VIEW,
        PRIVILEGES.SCHEDULE_WEEKLY_VIEW,
        PRIVILEGES.SCHEDULE_TRAINERS_ACTIVE,
    ]
};

// === FUNCIONES HELPER PARA VERIFICAR PERMISOS ===

/*Verifica si un usuario tiene un permiso específico*/
export const userHasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
    if (!userPermissions || userPermissions.length === 0) return false;
    if (!requiredPermission) return false;
    
    return userPermissions.includes(requiredPermission);
};

/*Verifica si un usuario tiene al menos uno de los permisos requeridos*/
export const userHasAnyPermission = (userPermissions: string[], requiredPermissions: string[]): boolean => {
    if (!userPermissions || userPermissions.length === 0) return false;
    if (!requiredPermissions || requiredPermissions.length === 0) return false;
    
    return requiredPermissions.some(permission => userPermissions.includes(permission));
};

/*Verifica si un usuario tiene todos los permisos requeridos*/
export const userHasAllPermissions = (userPermissions: string[], requiredPermissions: string[]): boolean => {
    if (!userPermissions || userPermissions.length === 0) return false;
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    
    return requiredPermissions.every(permission => userPermissions.includes(permission));
};

/*Verifica si un usuario tiene un privilegio específico*/
export const userHasPrivilege = (userPrivileges: string[], requiredPrivilege: string): boolean => {
    if (!userPrivileges || userPrivileges.length === 0) return false;
    if (!requiredPrivilege) return false;
    
    return userPrivileges.includes(requiredPrivilege);
};

/*Verifica si un usuario tiene al menos uno de los privilegios requeridos*/
export const userHasAnyPrivilege = (userPrivileges: string[], requiredPrivileges: string[]): boolean => {
    if (!userPrivileges || userPrivileges.length === 0) return false;
    if (!requiredPrivileges || requiredPrivileges.length === 0) return false;
    
    return requiredPrivileges.some(privilege => userPrivileges.includes(privilege));
};

/*Obtiene el módulo padre de un permiso granular*/
export const getModuleFromPermission = (permission: string): string => {
    // Los permisos granulares mapean a los valores de los módulos
    const modulePermission = PERMISSIONS[permission as keyof typeof PERMISSIONS];
    return modulePermission || permission;
};

/*Verifica si un permiso granular está incluido en los permisos modulares del usuario*/
export const hasGranularPermission = (userModulePermissions: string[], granularPermission: string): boolean => {
    if (!userModulePermissions || userModulePermissions.length === 0) return false;
    if (!granularPermission) return false;
    
    const modulePermission = getModuleFromPermission(granularPermission);
    return userModulePermissions.includes(modulePermission);
};

/*Obtiene todos los permisos válidos del sistema*/
export const getAllSystemPermissions = (): string[] => {
    return Object.values(PERMISSIONS);
};

/*Obtiene todos los privilegios válidos del sistema*/
export const getAllSystemPrivileges = (): string[] => {
    return Object.values(PRIVILEGES);
};

/*Verifica si un permiso existe en el sistema*/
export const isValidPermission = (permission: string): boolean => {
    return Object.values(PERMISSIONS).includes(permission as any);
};

/*Verifica si un privilegio existe en el sistema*/
export const isValidPrivilege = (privilege: string): boolean => {
    return Object.values(PRIVILEGES).includes(privilege as any);
};

// === TIPOS DE TYPESCRIPT ===
export type PermissionType = typeof PERMISSIONS[keyof typeof PERMISSIONS];
export type PrivilegeType = typeof PRIVILEGES[keyof typeof PRIVILEGES];
export type PermissionGroupType = keyof typeof PERMISSION_GROUPS;
export type PrivilegeGroupType = keyof typeof PRIVILEGE_GROUPS;