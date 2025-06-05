import { RequestHandler, Router } from 'express';
import { 
    getRoles,
    createRole,
    updateRole,
    deactivateRole,
    deleteRole,
    searchRoles,
    listPermissionsAndPrivileges,
    assignPrivileges,
    removePrivileges
} from '../controllers/role.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Obtener lista de roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *       - in: query
 *         name: orden
 *         schema:
 *           type: string
 *           enum: [id, codigo, nombre]
 *           default: nombre
 *       - in: query
 *         name: direccion
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 */
router.get('/', 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
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
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 */
router.get('/search', 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    searchRoles as unknown as RequestHandler
);

/**
 * @swagger
 * /api/roles/permissions:
 *   get:
 *     summary: Obtener permisos y privilegios
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 */
router.get('/permissions', 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    listPermissionsAndPrivileges as unknown as RequestHandler
);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Crear un nuevo rol
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - permisos
 *               - privilegios
 *             properties:
 *               nombre:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *               descripcion:
 *                 type: string
 *               estado:
 *                 type: boolean
 *                 default: true
 *               permisos:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 minItems: 1
 *               privilegios:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 minItems: 1
 */
router.post('/', 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *               descripcion:
 *                 type: string
 *               estado:
 *                 type: boolean
 *               permisos:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 minItems: 1
 *               privilegios:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 minItems: 1
 */
router.put('/:id', 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: integer
 */
router.post('/:id/privileges', 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.delete('/:id/privileges', 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.patch('/:id/deactivate', 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    deactivateRole as unknown as RequestHandler
);

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Eliminar un rol
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.delete('/:id', 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    deleteRole as unknown as RequestHandler
);

export default router; 