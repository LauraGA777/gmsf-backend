import { RequestHandler, Router } from 'express';
import { 
    getRoles,
    createRole,
    updateRole,
    deactivateRole,
    activateRole,
    deleteRole,
    searchRoles,
    listPermissionsAndPrivileges,
    assignPrivileges,
    removePrivileges,
    getUsersByRole,
    listAllPermissionsAndPrivileges,
    getRoleWithPermissions,
    getRoleWithPermissionsSimple
} from '../controllers/role.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { 
    canViewRoles,
    canCreateRoles,
    canUpdateRoles,
    canDeleteRoles,
    canAssignRoles,
    canViewPermissions,
    canAssignPermissions,
    requireSystemPrivileges
} from '../middlewares/system.middleware';
import { PRIVILEGES } from '../utils/permissions';

const router = Router();

// Aplicar verificación de token a todas las rutas
router.use(verifyToken as unknown as RequestHandler);

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
router.get('/', 
    canViewRoles as unknown as RequestHandler,
    getRoles as unknown as RequestHandler
);

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
router.get('/search', 
    canViewRoles as unknown as RequestHandler,
    searchRoles as unknown as RequestHandler
);

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
router.get('/permissions-privileges', 
    canViewPermissions as unknown as RequestHandler,
    listPermissionsAndPrivileges as unknown as RequestHandler
);

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
router.get('/permissions-privileges/all', 
    canViewPermissions as unknown as RequestHandler,
    listAllPermissionsAndPrivileges as unknown as RequestHandler
);

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
router.post('/', 
    canCreateRoles as unknown as RequestHandler,
    createRole as unknown as RequestHandler
);

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
router.put('/:id', 
    canUpdateRoles as unknown as RequestHandler,
    updateRole as unknown as RequestHandler
);

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
router.post('/:id/privileges', 
    canAssignPermissions as unknown as RequestHandler,
    assignPrivileges as unknown as RequestHandler
);

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
router.delete('/:id/privileges', 
    canAssignPermissions as unknown as RequestHandler,
    removePrivileges as unknown as RequestHandler
);

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
router.patch('/:id/deactivate', 
    canUpdateRoles as unknown as RequestHandler,
    deactivateRole as unknown as RequestHandler
);

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
router.patch('/:id/activate', 
    canUpdateRoles as unknown as RequestHandler,
    activateRole as unknown as RequestHandler
);

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
router.delete('/:id', 
    canDeleteRoles as unknown as RequestHandler,
    deleteRole as unknown as RequestHandler
);

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
router.get('/:id/users', 
    canViewRoles as unknown as RequestHandler,
    getUsersByRole as unknown as RequestHandler
);

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
router.get('/:id/permissions', 
    requireSystemPrivileges([
        PRIVILEGES.SYSTEM_VIEW_ROLES,
        PRIVILEGES.SYSTEM_VIEW_PERMISSIONS
    ]) as unknown as RequestHandler,
    getRoleWithPermissions as unknown as RequestHandler
);

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
router.get('/:id/permissions/simple', 
    requireSystemPrivileges([
        PRIVILEGES.SYSTEM_VIEW_ROLES,
        PRIVILEGES.SYSTEM_VIEW_PERMISSIONS
    ]) as unknown as RequestHandler,
    getRoleWithPermissionsSimple as unknown as RequestHandler
);

export default router;