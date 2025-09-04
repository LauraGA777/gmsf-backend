"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const adminOnly_middleware_1 = require("../middlewares/adminOnly.middleware");
const gymSettings_controller_1 = require("../controllers/gymSettings.controller");
const router = (0, express_1.Router)();
// Rutas públicas (sin autenticación)
router.get('/public', gymSettings_controller_1.getPublicSettings);
// Rutas protegidas (requieren autenticación)
router.use(auth_middleware_1.verifyToken);
// Rutas de solo administrador
router.use(adminOnly_middleware_1.adminOnlyAccess);
// Obtener configuraciones completas
router.get('/', gymSettings_controller_1.getSettings);
// Actualizar configuraciones
router.put('/', [
    (0, express_validator_1.body)('name').optional().isString().isLength({ min: 1, max: 100 }),
    (0, express_validator_1.body)('tagline').optional().isString().isLength({ min: 1, max: 200 }),
    (0, express_validator_1.body)('description').optional().isString().isLength({ min: 1, max: 1000 }),
    (0, express_validator_1.body)('heroImage').optional().isString(),
    (0, express_validator_1.body)('logoImage').optional().isString(),
    (0, express_validator_1.body)('services').optional().isArray(),
    (0, express_validator_1.body)('plans').optional().isArray(),
    (0, express_validator_1.body)('contact').optional().isObject(),
    (0, express_validator_1.body)('colors').optional().isObject(),
    (0, express_validator_1.body)('socialMedia').optional().isObject(),
    (0, express_validator_1.body)('gallery').optional().isArray(),
    (0, express_validator_1.body)('features').optional().isArray(),
    (0, express_validator_1.body)('testimonials').optional().isArray()
], gymSettings_controller_1.updateSettings);
// Subir imagen única
router.post('/upload', gymSettings_controller_1.upload.single('image'), gymSettings_controller_1.uploadImage);
// Subir múltiples imágenes
router.post('/upload-multiple', gymSettings_controller_1.upload.array('images', 10), gymSettings_controller_1.uploadMultipleImages);
// Eliminar imagen
router.delete('/image/:filename', gymSettings_controller_1.deleteImage);
// Resetear configuraciones
router.post('/reset', gymSettings_controller_1.resetToDefaults);
exports.default = router;
