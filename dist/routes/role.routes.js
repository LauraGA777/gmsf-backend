"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const role_controller_1 = require("../controllers/role.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const system_middleware_1 = require("../middlewares/system.middleware");
const permissions_1 = require("../utils/permissions");
const router = (0, express_1.Router)();
// Aplicar verificación de token a todas las rutas
router.use(auth_middleware_1.verifyToken);
/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Obtener lista de roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 */
// ✅ Trae todos los roles con paginación, ordenamiento y filtrado (SYSTEM_VIEW_ROLES)
router.get('/', system_middleware_1.canViewRoles, role_controller_1.getRoles);
/**
 * @swagger
 * /api/roles/search:
 *   get:
 *     summary: Buscar roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 */
// ✅ Busca roles por nombre (SYSTEM_VIEW_ROLES)
router.get('/search', system_middleware_1.canViewRoles, role_controller_1.searchRoles);
/**
 * @swagger
 * /api/roles/permissions-privileges:
 *   get:
 *     summary: Obtener permisos y privilegios organizados por módulo
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 */
// ✅ Obtiene los permisos y privilegios organizados por módulo (SYSTEM_VIEW_PERMISSIONS)
router.get('/permissions-privileges', system_middleware_1.canViewPermissions, role_controller_1.listPermissionsAndPrivileges);
/**
 * @swagger
 * /api/roles/permissions-privileges/all:
 *   get:
 *     summary: Obtener todos los permisos y privilegios (vista simplificada)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 */
// ✅ Obtiene todos los permisos y privilegios en un formato simplificado (SYSTEM_VIEW_PERMISSIONS)
router.get('/permissions-privileges/all', system_middleware_1.canViewPermissions, role_controller_1.listAllPermissionsAndPrivileges);
/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Crear un nuevo rol
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 */
// ✅ Crea un nuevo rol con permisos y privilegios (SYSTEM_CREATE_ROLES)
router.post('/', system_middleware_1.canCreateRoles, role_controller_1.createRole);
/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Actualizar un rol existente
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 */
// ✅ Actualiza un rol existente con permisos y privilegios (SYSTEM_UPDATE_ROLES)
router.put('/:id', system_middleware_1.canUpdateRoles, role_controller_1.updateRole);
/**
 * @swagger
 * /api/roles/{id}/privileges:
 *   post:
 *     summary: Asignar privilegios a un rol
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 */
// ✅ Asigna privilegios a un rol (SYSTEM_ASSIGN_PERMISSIONS)
router.post('/:id/privileges', system_middleware_1.canAssignPermissions, role_controller_1.assignPrivileges);
/**
 * @swagger
 * /api/roles/{id}/privileges:
 *   delete:
 *     summary: Eliminar privilegios de un rol
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 */
// ✅ Elimina privilegios de un rol (SYSTEM_ASSIGN_PERMISSIONS)
router.delete('/:id/privileges', system_middleware_1.canAssignPermissions, role_controller_1.removePrivileges);
/**
 * @swagger
 * /api/roles/{id}/deactivate:
 *   patch:
 *     summary: Desactivar un rol
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 */
// ✅ Desactiva un rol (SYSTEM_UPDATE_ROLES)
router.patch('/:id/deactivate', system_middleware_1.canUpdateRoles, role_controller_1.deactivateRole);
/**
 * @swagger
 * /api/roles/{id}/activate:
 *   patch:
 *     summary: Activar un rol
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 */
// ✅ Activa un rol (SYSTEM_UPDATE_ROLES)
router.patch('/:id/activate', system_middleware_1.canUpdateRoles, role_controller_1.activateRole);
/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Eliminar un rol
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 */
// ✅ Elimina un rol (SYSTEM_DELETE_ROLES)
router.delete('/:id', system_middleware_1.canDeleteRoles, role_controller_1.deleteRole);
/**
 * @swagger
 * /api/roles/{id}/users:
 *   get:
 *     summary: Obtener usuarios por rol
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 */
// ✅ Obtiene los usuarios asociados a un rol específico (SYSTEM_VIEW_ROLES)
router.get('/:id/users', system_middleware_1.canViewRoles, role_controller_1.getUsersByRole);
/**
 * @swagger
 * /api/roles/{id}/permissions:
 *   get:
 *     summary: Obtener rol con sus permisos y privilegios organizados por módulo
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 */
// ✅ Obtiene un rol con sus permisos y privilegios organizados por módulo (SYSTEM_VIEW_ROLES + SYSTEM_VIEW_PERMISSIONS)
router.get('/:id/permissions', (0, system_middleware_1.requireSystemPrivileges)([
    permissions_1.PRIVILEGES.SYSTEM_VIEW_ROLES,
    permissions_1.PRIVILEGES.SYSTEM_VIEW_PERMISSIONS
]), role_controller_1.getRoleWithPermissions);
/**
 * @swagger
 * /api/roles/{id}/permissions/simple:
 *   get:
 *     summary: Obtener rol con sus permisos y privilegios (formato simple)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 */
// ✅ Obtiene un rol con sus permisos y privilegios en un formato simplificado (SYSTEM_VIEW_ROLES + SYSTEM_VIEW_PERMISSIONS)
router.get('/:id/permissions/simple', (0, system_middleware_1.requireSystemPrivileges)([
    permissions_1.PRIVILEGES.SYSTEM_VIEW_ROLES,
    permissions_1.PRIVILEGES.SYSTEM_VIEW_PERMISSIONS
]), role_controller_1.getRoleWithPermissionsSimple);
exports.default = router;
