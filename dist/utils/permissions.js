"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidPrivilege = exports.isValidPermission = exports.getAllSystemPrivileges = exports.getAllSystemPermissions = exports.hasGranularPermission = exports.getModuleFromPermission = exports.userHasAnyPrivilege = exports.userHasPrivilege = exports.userHasAllPermissions = exports.userHasAnyPermission = exports.userHasPermission = exports.PRIVILEGE_GROUPS = exports.PERMISSION_GROUPS = exports.PRIVILEGES = exports.PERMISSIONS = void 0;
// Permisos modulares (para BD)
exports.PERMISSIONS = {
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
};
// Privilegios específicos (mantener los existentes)
exports.PRIVILEGES = {
    // Privilegios de Asistencias
    ASIST_READ: 'ASIST_READ',
    ASIST_SEARCH: 'ASIST_SEARCH',
    ASIST_CREATE: 'ASIST_CREATE',
    ASIST_DETAILS: 'ASIST_DETAILS',
    ASIST_UPDATE: 'ASIST_UPDATE',
    ASIST_DELETE: 'ASIST_DELETE',
    ASIST_STATS: 'ASIST_STATS',
    ASIST_MY_HISTORY: 'ASIST_MY_HISTORY',
    ASIST_MY_STATS: 'ASIST_MY_STATS',
    ASIST_CLIENT_INFO: 'ASIST_CLIENT_INFO',
    ASIST_CLIENT_STATS: 'ASIST_CLIENT_STATS',
    ASIST_CLIENT_HISTORY: 'ASIST_CLIENT_HISTORY',
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
    MEMBERSHIP_MY_VIEW: 'MEMBERSHIP_MY_VIEW',
    MEMBERSHIP_MY_HISTORY: 'MEMBERSHIP_MY_HISTORY',
    MEMBERSHIP_MY_BENEFITS: 'MEMBERSHIP_MY_BENEFITS',
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
};
// Grupos de permisos por rol
exports.PERMISSION_GROUPS = {
    ADMIN_PERMISSIONS: [
        exports.PERMISSIONS.ASISTENCIAS,
        exports.PERMISSIONS.CLIENTES,
        exports.PERMISSIONS.CONTRATOS,
        exports.PERMISSIONS.MEMBRESIAS,
        exports.PERMISSIONS.HORARIOS,
        exports.PERMISSIONS.ENTRENADORES,
        exports.PERMISSIONS.USUARIOS,
        exports.PERMISSIONS.SISTEMA
    ],
    TRAINER_PERMISSIONS: [
        exports.PERMISSIONS.ASISTENCIAS,
        exports.PERMISSIONS.CLIENTES,
        exports.PERMISSIONS.HORARIOS
    ],
    CLIENT_PERMISSIONS: [
        exports.PERMISSIONS.ASISTENCIAS,
        exports.PERMISSIONS.CONTRATOS,
        exports.PERMISSIONS.HORARIOS,
        exports.PERMISSIONS.MEMBRESIAS
    ],
    BENEFICIARY_PERMISSIONS: [
        exports.PERMISSIONS.ASISTENCIAS,
        exports.PERMISSIONS.CONTRATOS,
        exports.PERMISSIONS.HORARIOS,
        exports.PERMISSIONS.MEMBRESIAS
    ]
};
// Grupos de privilegios por rol (mantener los existentes)
exports.PRIVILEGE_GROUPS = {
    ADMIN_PRIVILEGES: [
        // Todos los privilegios de asistencias
        exports.PRIVILEGES.ASIST_READ,
        exports.PRIVILEGES.ASIST_SEARCH,
        exports.PRIVILEGES.ASIST_CREATE,
        exports.PRIVILEGES.ASIST_DETAILS,
        exports.PRIVILEGES.ASIST_UPDATE,
        exports.PRIVILEGES.ASIST_DELETE,
        exports.PRIVILEGES.ASIST_STATS,
        exports.PRIVILEGES.ASIST_MY_HISTORY,
        exports.PRIVILEGES.ASIST_MY_STATS,
        exports.PRIVILEGES.ASIST_CLIENT_INFO,
        exports.PRIVILEGES.ASIST_CLIENT_STATS,
        exports.PRIVILEGES.ASIST_CLIENT_HISTORY,
        // Todos los privilegios de clientes
        exports.PRIVILEGES.CLIENT_READ,
        exports.PRIVILEGES.CLIENT_DETAILS,
        exports.PRIVILEGES.CLIENT_SEARCH_DOC,
        exports.PRIVILEGES.CLIENT_CREATE,
        exports.PRIVILEGES.CLIENT_UPDATE,
        exports.PRIVILEGES.CLIENT_DELETE,
        exports.PRIVILEGES.CLIENT_BENEFICIARIES,
        // TODOS los privilegios de contratos
        exports.PRIVILEGES.CONTRACT_READ,
        exports.PRIVILEGES.CONTRACT_SEARCH,
        exports.PRIVILEGES.CONTRACT_CREATE,
        exports.PRIVILEGES.CONTRACT_DETAILS,
        exports.PRIVILEGES.CONTRACT_UPDATE,
        exports.PRIVILEGES.CONTRACT_DELETE,
        exports.PRIVILEGES.CONTRACT_CANCEL,
        exports.PRIVILEGES.CONTRACT_RENEW,
        exports.PRIVILEGES.CONTRACT_HISTORY,
        exports.PRIVILEGES.CONTRACT_ACTIVATE,
        exports.PRIVILEGES.CONTRACT_DEACTIVATE,
        exports.PRIVILEGES.CONTRACT_EXPORT,
        exports.PRIVILEGES.CONTRACT_STATS,
        // Todos los privilegios de membresías
        exports.PRIVILEGES.MEMBERSHIP_READ,
        exports.PRIVILEGES.MEMBERSHIP_SEARCH,
        exports.PRIVILEGES.MEMBERSHIP_CREATE,
        exports.PRIVILEGES.MEMBERSHIP_UPDATE,
        exports.PRIVILEGES.MEMBERSHIP_DEACTIVATE,
        exports.PRIVILEGES.MEMBERSHIP_DETAILS,
        exports.PRIVILEGES.MEMBERSHIP_REACTIVATE,
        // Todos los privilegios de horarios
        exports.PRIVILEGES.SCHEDULE_READ,
        exports.PRIVILEGES.SCHEDULE_DETAILS,
        exports.PRIVILEGES.SCHEDULE_CREATE,
        exports.PRIVILEGES.SCHEDULE_UPDATE,
        exports.PRIVILEGES.SCHEDULE_DELETE,
        exports.PRIVILEGES.SCHEDULE_AVAILABILITY,
        exports.PRIVILEGES.SCHEDULE_CLIENT_VIEW,
        exports.PRIVILEGES.SCHEDULE_TRAINER_VIEW,
        exports.PRIVILEGES.SCHEDULE_DAILY_VIEW,
        exports.PRIVILEGES.SCHEDULE_WEEKLY_VIEW,
        exports.PRIVILEGES.SCHEDULE_MONTHLY_VIEW,
        exports.PRIVILEGES.SCHEDULE_TRAINERS_ACTIVE,
        exports.PRIVILEGES.SCHEDULE_CLIENTS_ACTIVE,
        // Todos los privilegios de entrenadores
        exports.PRIVILEGES.TRAINER_READ,
        exports.PRIVILEGES.TRAINER_CREATE,
        exports.PRIVILEGES.TRAINER_UPDATE,
        exports.PRIVILEGES.TRAINER_ACTIVATE,
        exports.PRIVILEGES.TRAINER_DEACTIVATE,
        exports.PRIVILEGES.TRAINER_DELETE,
        exports.PRIVILEGES.TRAINER_SEARCH,
        exports.PRIVILEGES.TRAINER_DETAILS,
        // Usuarios (acceso completo)
        exports.PRIVILEGES.USER_READ,
        exports.PRIVILEGES.USER_SEARCH,
        exports.PRIVILEGES.USER_DETAILS,
        exports.PRIVILEGES.USER_CREATE,
        exports.PRIVILEGES.USER_UPDATE,
        exports.PRIVILEGES.USER_ACTIVATE,
        exports.PRIVILEGES.USER_DEACTIVATE,
        exports.PRIVILEGES.USER_DELETE,
        exports.PRIVILEGES.USER_CHECK_DOCUMENT,
        exports.PRIVILEGES.USER_CHECK_EMAIL,
        exports.PRIVILEGES.USER_VIEW_ROLES,
        exports.PRIVILEGES.USER_ASSIGN_ROLES,
        exports.PRIVILEGES.USER_HISTORY,
        // Privilegios del sistema
        exports.PRIVILEGES.SYSTEM_VIEW_ROLES,
        exports.PRIVILEGES.SYSTEM_CREATE_ROLES,
        exports.PRIVILEGES.SYSTEM_UPDATE_ROLES,
        exports.PRIVILEGES.SYSTEM_DELETE_ROLES,
        exports.PRIVILEGES.SYSTEM_ASSIGN_ROLES,
        exports.PRIVILEGES.SYSTEM_VIEW_PERMISSIONS,
        exports.PRIVILEGES.SYSTEM_CREATE_PERMISSIONS,
        exports.PRIVILEGES.SYSTEM_UPDATE_PERMISSIONS,
        exports.PRIVILEGES.SYSTEM_DELETE_PERMISSIONS,
        exports.PRIVILEGES.SYSTEM_ASSIGN_PERMISSIONS,
        exports.PRIVILEGES.SYSTEM_VIEW_LOGS,
        exports.PRIVILEGES.SYSTEM_BACKUP,
        exports.PRIVILEGES.SYSTEM_RESTORE,
        exports.PRIVILEGES.SYSTEM_MAINTENANCE
    ],
    TRAINER_PRIVILEGES: [
        // Asistencias
        exports.PRIVILEGES.ASIST_READ,
        exports.PRIVILEGES.ASIST_SEARCH,
        exports.PRIVILEGES.ASIST_CREATE,
        exports.PRIVILEGES.ASIST_DETAILS,
        exports.PRIVILEGES.ASIST_STATS,
        // Clientes (solo lectura)
        exports.PRIVILEGES.CLIENT_READ,
        exports.PRIVILEGES.CLIENT_DETAILS,
        exports.PRIVILEGES.CLIENT_SEARCH_DOC,
        exports.PRIVILEGES.CLIENT_BENEFICIARIES,
        // CONTRATOS para entrenadores (solo lectura)
        exports.PRIVILEGES.CONTRACT_READ,
        exports.PRIVILEGES.CONTRACT_SEARCH,
        exports.PRIVILEGES.CONTRACT_DETAILS,
        exports.PRIVILEGES.CONTRACT_HISTORY,
        exports.PRIVILEGES.CONTRACT_STATS,
        // Horarios (gestión completa)
        exports.PRIVILEGES.SCHEDULE_READ,
        exports.PRIVILEGES.SCHEDULE_DETAILS,
        exports.PRIVILEGES.SCHEDULE_CREATE,
        exports.PRIVILEGES.SCHEDULE_UPDATE,
        exports.PRIVILEGES.SCHEDULE_AVAILABILITY,
        exports.PRIVILEGES.SCHEDULE_TRAINER_VIEW,
        exports.PRIVILEGES.SCHEDULE_DAILY_VIEW,
        exports.PRIVILEGES.SCHEDULE_WEEKLY_VIEW,
        exports.PRIVILEGES.SCHEDULE_MONTHLY_VIEW,
        exports.PRIVILEGES.SCHEDULE_TRAINERS_ACTIVE
    ],
    CLIENT_PRIVILEGES: [
        // Asistencias (solo lectura propia)
        exports.PRIVILEGES.ASIST_READ,
        exports.PRIVILEGES.ASIST_DETAILS,
        exports.PRIVILEGES.ASIST_MY_HISTORY,
        exports.PRIVILEGES.ASIST_MY_STATS,
        exports.PRIVILEGES.ASIST_CLIENT_INFO,
        exports.PRIVILEGES.ASIST_CLIENT_STATS,
        exports.PRIVILEGES.ASIST_CLIENT_HISTORY,
        // CONTRATOS para clientes (solo sus propios contratos)
        exports.PRIVILEGES.CONTRACT_READ,
        exports.PRIVILEGES.CONTRACT_DETAILS,
        exports.PRIVILEGES.CONTRACT_HISTORY,
        // Horarios (consulta y creación limitada)
        exports.PRIVILEGES.SCHEDULE_READ,
        exports.PRIVILEGES.SCHEDULE_DETAILS,
        exports.PRIVILEGES.SCHEDULE_CREATE,
        exports.PRIVILEGES.SCHEDULE_AVAILABILITY,
        exports.PRIVILEGES.SCHEDULE_CLIENT_VIEW,
        exports.PRIVILEGES.SCHEDULE_DAILY_VIEW,
        exports.PRIVILEGES.SCHEDULE_WEEKLY_VIEW,
        // Membresia
        exports.PRIVILEGES.MEMBERSHIP_READ,
        exports.PRIVILEGES.MEMBERSHIP_MY_VIEW,
        exports.PRIVILEGES.MEMBERSHIP_MY_HISTORY,
        exports.PRIVILEGES.MEMBERSHIP_MY_BENEFITS,
    ],
    BENEFICIARY_PRIVILEGES: [
        // Mismos privilegios que Cliente
        exports.PRIVILEGES.ASIST_READ,
        exports.PRIVILEGES.ASIST_DETAILS,
        exports.PRIVILEGES.ASIST_MY_HISTORY,
        exports.PRIVILEGES.ASIST_MY_STATS,
        exports.PRIVILEGES.ASIST_CLIENT_INFO,
        exports.PRIVILEGES.ASIST_CLIENT_STATS,
        exports.PRIVILEGES.ASIST_CLIENT_HISTORY,
        // CONTRATOS para clientes (solo sus propios contratos)
        exports.PRIVILEGES.CONTRACT_READ,
        exports.PRIVILEGES.CONTRACT_DETAILS,
        exports.PRIVILEGES.CONTRACT_HISTORY,
        // Horarios (consulta y creación limitada)
        exports.PRIVILEGES.SCHEDULE_READ,
        exports.PRIVILEGES.SCHEDULE_DETAILS,
        exports.PRIVILEGES.SCHEDULE_CREATE,
        exports.PRIVILEGES.SCHEDULE_AVAILABILITY,
        exports.PRIVILEGES.SCHEDULE_CLIENT_VIEW,
        exports.PRIVILEGES.SCHEDULE_TRAINER_VIEW,
        exports.PRIVILEGES.SCHEDULE_DAILY_VIEW,
        exports.PRIVILEGES.SCHEDULE_WEEKLY_VIEW,
        exports.PRIVILEGES.SCHEDULE_TRAINERS_ACTIVE,
        // Membresía
        exports.PRIVILEGES.MEMBERSHIP_READ,
        exports.PRIVILEGES.MEMBERSHIP_MY_VIEW,
        exports.PRIVILEGES.MEMBERSHIP_MY_HISTORY,
        exports.PRIVILEGES.MEMBERSHIP_MY_BENEFITS,
    ]
};
// === FUNCIONES HELPER PARA VERIFICAR PERMISOS ===
/*Verifica si un usuario tiene un permiso específico*/
const userHasPermission = (userPermissions, requiredPermission) => {
    if (!userPermissions || userPermissions.length === 0)
        return false;
    if (!requiredPermission)
        return false;
    return userPermissions.includes(requiredPermission);
};
exports.userHasPermission = userHasPermission;
/*Verifica si un usuario tiene al menos uno de los permisos requeridos*/
const userHasAnyPermission = (userPermissions, requiredPermissions) => {
    if (!userPermissions || userPermissions.length === 0)
        return false;
    if (!requiredPermissions || requiredPermissions.length === 0)
        return false;
    return requiredPermissions.some(permission => userPermissions.includes(permission));
};
exports.userHasAnyPermission = userHasAnyPermission;
/*Verifica si un usuario tiene todos los permisos requeridos*/
const userHasAllPermissions = (userPermissions, requiredPermissions) => {
    if (!userPermissions || userPermissions.length === 0)
        return false;
    if (!requiredPermissions || requiredPermissions.length === 0)
        return true;
    return requiredPermissions.every(permission => userPermissions.includes(permission));
};
exports.userHasAllPermissions = userHasAllPermissions;
/*Verifica si un usuario tiene un privilegio específico*/
const userHasPrivilege = (userPrivileges, requiredPrivilege) => {
    if (!userPrivileges || userPrivileges.length === 0)
        return false;
    if (!requiredPrivilege)
        return false;
    return userPrivileges.includes(requiredPrivilege);
};
exports.userHasPrivilege = userHasPrivilege;
/*Verifica si un usuario tiene al menos uno de los privilegios requeridos*/
const userHasAnyPrivilege = (userPrivileges, requiredPrivileges) => {
    if (!userPrivileges || userPrivileges.length === 0)
        return false;
    if (!requiredPrivileges || requiredPrivileges.length === 0)
        return false;
    return requiredPrivileges.some(privilege => userPrivileges.includes(privilege));
};
exports.userHasAnyPrivilege = userHasAnyPrivilege;
/*Obtiene el módulo padre de un permiso granular*/
const getModuleFromPermission = (permission) => {
    // Los permisos granulares mapean a los valores de los módulos
    const modulePermission = exports.PERMISSIONS[permission];
    return modulePermission || permission;
};
exports.getModuleFromPermission = getModuleFromPermission;
/*Verifica si un permiso granular está incluido en los permisos modulares del usuario*/
const hasGranularPermission = (userModulePermissions, granularPermission) => {
    if (!userModulePermissions || userModulePermissions.length === 0)
        return false;
    if (!granularPermission)
        return false;
    const modulePermission = (0, exports.getModuleFromPermission)(granularPermission);
    return userModulePermissions.includes(modulePermission);
};
exports.hasGranularPermission = hasGranularPermission;
/*Obtiene todos los permisos válidos del sistema*/
const getAllSystemPermissions = () => {
    return Object.values(exports.PERMISSIONS);
};
exports.getAllSystemPermissions = getAllSystemPermissions;
/*Obtiene todos los privilegios válidos del sistema*/
const getAllSystemPrivileges = () => {
    return Object.values(exports.PRIVILEGES);
};
exports.getAllSystemPrivileges = getAllSystemPrivileges;
/*Verifica si un permiso existe en el sistema*/
const isValidPermission = (permission) => {
    return Object.values(exports.PERMISSIONS).includes(permission);
};
exports.isValidPermission = isValidPermission;
/*Verifica si un privilegio existe en el sistema*/
const isValidPrivilege = (privilege) => {
    return Object.values(exports.PRIVILEGES).includes(privilege);
};
exports.isValidPrivilege = isValidPrivilege;
