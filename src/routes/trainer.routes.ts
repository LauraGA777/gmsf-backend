import { RequestHandler, Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { canViewTrainers, canCreateTrainers, canUpdateTrainers, canDeactivateTrainers, canDeleteTrainers, canSearchTrainers } from '../middlewares/trainer.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
    idSchema,
    createTrainerSchema,
    updateTrainerSchema,
    searchTrainerSchema
} from '../validators/trainer.validator';
import {
    getTrainers,
    createTrainer,
    updateTrainer,
    deactivateTrainer,
    deleteTrainer,
    searchTrainers,
    getTrainerDetails
} from '../controllers/trainer.controller';

const router = Router();

/**
 * @swagger
 * /api/trainers:
 *   get:
 *     summary: Listar entrenadores
 *     tags: [Entrenadores]
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
 *     responses:
 *       200:
 *         description: Lista de entrenadores obtenida exitosamente
 */
router.get('/', 
    verifyToken as unknown as RequestHandler,
    canViewTrainers as unknown as RequestHandler,
    validate(searchTrainerSchema, "query"),
    getTrainers as unknown as RequestHandler
);

/**
 * @swagger
 * /api/trainers/search:
 *   get:
 *     summary: Buscar entrenadores
 *     tags: [Entrenadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: Resultados de búsqueda obtenidos exitosamente
 */
router.get('/search', 
    verifyToken as unknown as RequestHandler,
    canSearchTrainers as unknown as RequestHandler,
    validate(searchTrainerSchema, "query"),
    searchTrainers as unknown as RequestHandler
);

/**
 * @swagger
 * /api/trainers/{id}:
 *   get:
 *     summary: Ver detalles de un entrenador
 *     tags: [Entrenadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles del entrenador obtenidos exitosamente
 *       404:
 *         description: Entrenador no encontrado
 */
router.get('/:id', 
    verifyToken as unknown as RequestHandler,
    canViewTrainers as unknown as RequestHandler,
    validate(idSchema, "params"),
    getTrainerDetails as unknown as RequestHandler
);

/**
 * @swagger
 * /api/trainers:
 *   post:
 *     summary: Crear un nuevo entrenador
 *     tags: [Entrenadores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numero_documento
 *               - especialidad
 *             properties:
 *               numero_documento:
 *                 type: string
 *               especialidad:
 *                 type: string
 *               estado:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Entrenador creado exitosamente
 */
router.post('/', 
    verifyToken as unknown as RequestHandler,
    canCreateTrainers as unknown as RequestHandler,
    validate(createTrainerSchema, "body"),
    createTrainer as unknown as RequestHandler
);

/**
 * @swagger
 * /api/trainers/{id}:
 *   put:
 *     summary: Actualizar un entrenador
 *     tags: [Entrenadores]
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
 *               especialidad:
 *                 type: string
 *               estado:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Entrenador actualizado exitosamente
 *       404:
 *         description: Entrenador no encontrado
 */
router.put('/:id', 
    verifyToken as unknown as RequestHandler,
    canUpdateTrainers as unknown as RequestHandler,
    validate(idSchema, "params"),
    validate(updateTrainerSchema, "body"),
    updateTrainer as unknown as RequestHandler
);

/**
 * @swagger
 * /api/trainers/{id}/deactivate:
 *   patch:
 *     summary: Desactivar un entrenador
 *     tags: [Entrenadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Entrenador desactivado exitosamente
 *       404:
 *         description: Entrenador no encontrado
 */
router.patch('/:id/deactivate', 
    verifyToken as unknown as RequestHandler,
    canDeactivateTrainers as unknown as RequestHandler,
    validate(idSchema, "params"),
    deactivateTrainer as unknown as RequestHandler
);

/**
 * @swagger
 * /api/trainers/{id}:
 *   delete:
 *     summary: Eliminar un entrenador
 *     tags: [Entrenadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Entrenador eliminado exitosamente
 *       404:
 *         description: Entrenador no encontrado
 */
router.delete('/:id', 
    verifyToken as unknown as RequestHandler,
    canDeleteTrainers as unknown as RequestHandler,
    validate(idSchema, "params"),
    deleteTrainer as unknown as RequestHandler
);

export default router; 