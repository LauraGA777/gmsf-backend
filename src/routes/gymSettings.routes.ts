import { Router } from 'express';
import { body } from 'express-validator';
import { verifyToken } from '../middlewares/auth.middleware';
import { adminOnlyAccess } from '../middlewares/adminOnly.middleware';
import {
  getSettings,
  updateSettings,
  uploadImage,
  deleteImage,
  uploadMultipleImages,
  resetToDefaults,
  getPublicSettings,
  upload
} from '../controllers/gymSettings.controller';

const router = Router();

// Rutas públicas (sin autenticación)
router.get('/public', getPublicSettings);

// Rutas protegidas (requieren autenticación)
router.use(verifyToken);

// Rutas de solo administrador
router.use(adminOnlyAccess);

// Obtener configuraciones completas
router.get('/', getSettings);

// Actualizar configuraciones
router.put('/', [
  body('name').optional().isString().isLength({ min: 1, max: 100 }),
  body('tagline').optional().isString().isLength({ min: 1, max: 200 }),
  body('description').optional().isString().isLength({ min: 1, max: 1000 }),
  body('heroImage').optional().isString(),
  body('logoImage').optional().isString(),
  body('services').optional().isArray(),
  body('plans').optional().isArray(),
  body('contact').optional().isObject(),
  body('colors').optional().isObject(),
  body('socialMedia').optional().isObject(),
  body('gallery').optional().isArray(),
  body('features').optional().isArray(),
  body('testimonials').optional().isArray()
], updateSettings);

// Subir imagen única
router.post('/upload', upload.single('image'), uploadImage);

// Subir múltiples imágenes
router.post('/upload-multiple', upload.array('images', 10), uploadMultipleImages);

// Eliminar imagen
router.delete('/image/:filename', deleteImage);

// Resetear configuraciones
router.post('/reset', resetToDefaults);

export default router; 