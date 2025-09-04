"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const strictValidation_middleware_1 = require("../middlewares/strictValidation.middleware");
const trainer_controller_1 = require("../controllers/trainer.controller");
const trainer_middleware_1 = require("../middlewares/trainer.middleware");
const trainer_validator_1 = require("../validators/trainer.validator");
const router = (0, express_1.Router)();
const trainerController = new trainer_controller_1.TrainerController();
// Todas las rutas de entrenadores requieren autenticación
router.use(auth_middleware_1.verifyToken);
// GET /api/trainers - Listar o buscar entrenadores
router.get('/', trainer_middleware_1.canViewTrainers, (0, validate_middleware_1.validate)(trainer_validator_1.searchTrainerSchema, 'query'), trainerController.findAll);
// GET /api/trainers/search - Búsqueda explícita (si se necesita una ruta separada)
// Por ahora, la búsqueda está integrada en el GET /
// router.get('/search', canSearchTrainers, validate(searchTrainerSchema, 'query'), trainerController.findAll);
// GET /api/trainers/:id - Ver detalles de un entrenador
router.get('/:id', trainer_middleware_1.canViewTrainers, (0, validate_middleware_1.validate)(trainer_validator_1.idSchema, 'params'), trainerController.findById);
// POST /api/trainers - Crear un nuevo entrenador
router.post('/', strictValidation_middleware_1.sanitizeEmails, strictValidation_middleware_1.sanitizePhoneNumbers, strictValidation_middleware_1.strictLengthValidation, trainer_middleware_1.canCreateTrainers, (0, validate_middleware_1.validate)(trainer_validator_1.createTrainerSchema, 'body'), trainerController.create);
// PUT /api/trainers/:id - Actualizar un entrenador
router.put('/:id', strictValidation_middleware_1.sanitizeEmails, strictValidation_middleware_1.sanitizePhoneNumbers, strictValidation_middleware_1.strictLengthValidation, trainer_middleware_1.canUpdateTrainers, (0, validate_middleware_1.validate)(trainer_validator_1.idSchema, 'params'), (0, validate_middleware_1.validate)(trainer_validator_1.updateTrainerSchema, 'body'), trainerController.update);
// PATCH /api/trainers/:id/activate - Activar un entrenador
router.patch('/:id/activate', trainer_middleware_1.canActivateTrainers, (0, validate_middleware_1.validate)(trainer_validator_1.idSchema, 'params'), trainerController.activate);
// PATCH /api/trainers/:id/deactivate - Desactivar un entrenador
router.patch('/:id/deactivate', trainer_middleware_1.canDeactivateTrainers, (0, validate_middleware_1.validate)(trainer_validator_1.idSchema, 'params'), trainerController.deactivate);
// DELETE /api/trainers/:id - Eliminar un entrenador
router.delete('/:id', trainer_middleware_1.canDeleteTrainers, (0, validate_middleware_1.validate)(trainer_validator_1.idSchema, 'params'), trainerController.delete);
exports.default = router;
