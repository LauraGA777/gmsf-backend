import { Router, RequestHandler } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { TrainerController } from '../controllers/trainer.controller';
import {
    canViewTrainers,
    canCreateTrainers,
    canUpdateTrainers,
    canActivateTrainers,
    canDeactivateTrainers,
    canDeleteTrainers,
    canSearchTrainers
} from '../middlewares/trainer.middleware';
import {
    idSchema,
    createTrainerSchema,
    updateTrainerSchema,
    searchTrainerSchema
} from '../validators/trainer.validator';

const router = Router();
const trainerController = new TrainerController();

// Todas las rutas de entrenadores requieren autenticación
router.use(verifyToken as unknown as RequestHandler);

// GET /api/trainers - Listar o buscar entrenadores
router.get(
    '/',
    canViewTrainers as unknown as RequestHandler,
    validate(searchTrainerSchema, 'query'),
    trainerController.findAll
);

// GET /api/trainers/search - Búsqueda explícita (si se necesita una ruta separada)
// Por ahora, la búsqueda está integrada en el GET /
// router.get('/search', canSearchTrainers, validate(searchTrainerSchema, 'query'), trainerController.findAll);

// GET /api/trainers/:id - Ver detalles de un entrenador
router.get(
    '/:id',
    canViewTrainers as unknown as RequestHandler,
    validate(idSchema, 'params'),
    trainerController.findById
);

// POST /api/trainers - Crear un nuevo entrenador
router.post(
    '/',
    canCreateTrainers as unknown as RequestHandler,
    validate(createTrainerSchema, 'body'),
    trainerController.create
);

// PUT /api/trainers/:id - Actualizar un entrenador
router.put(
    '/:id',
    canUpdateTrainers as unknown as RequestHandler,
    validate(idSchema, 'params'),
    validate(updateTrainerSchema, 'body'),
    trainerController.update
);

// PATCH /api/trainers/:id/activate - Activar un entrenador
router.patch(
    '/:id/activate',
    canActivateTrainers as unknown as RequestHandler,
    validate(idSchema, 'params'),
    trainerController.activate
);

// PATCH /api/trainers/:id/deactivate - Desactivar un entrenador
router.patch(
    '/:id/deactivate',
    canDeactivateTrainers as unknown as RequestHandler,
    validate(idSchema, 'params'),
    trainerController.deactivate
);

// DELETE /api/trainers/:id - Eliminar un entrenador
router.delete(
    '/:id',
    canDeleteTrainers as unknown as RequestHandler,
    validate(idSchema, 'params'),
    trainerController.delete
);

export default router; 