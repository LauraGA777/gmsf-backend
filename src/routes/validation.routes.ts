import { Router, RequestHandler } from 'express';
import { validateEmailController, validatePhoneController, validateContactController } from '../controllers/validation.controller';

const router = Router();

// Validar correo electrónico
router.post('/email', validateEmailController as unknown as RequestHandler);

// Validar teléfono
router.post('/phone', validatePhoneController as unknown as RequestHandler);

// Validar datos de contacto completos
router.post('/contact', validateContactController as unknown as RequestHandler);

export default router;
