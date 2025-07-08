import { RequestHandler, Router } from 'express';
import { getUsers, register, getUsuarioById, updateUsers, activateUser, deactivateUser, deleteUser, searchUsers, getRoles, checkDocumentExists, checkEmailExists } from '../controllers/user.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { adminOnlyAccess } from '../middlewares/adminOnly.middleware';

const router = Router();

router.use(verifyToken as unknown as RequestHandler);
router.use(adminOnlyAccess as unknown as RequestHandler);

// Get users route ✅
router.get('/', getUsers as unknown as RequestHandler);

// Get roles route ✅
router.get('/roles', getRoles as unknown as RequestHandler);

// Search users route ✅
router.get('/search', searchUsers as unknown as RequestHandler);

// Get user by ID route ✅
router.get('/:id', getUsuarioById as unknown as RequestHandler);

// Update user route ✅
router.put('/:id', updateUsers as unknown as RequestHandler);

// Activar usuario ✅
router.post('/:id/activate', activateUser as unknown as RequestHandler);

// Desactivar usuario ✅
router.post('/:id/deactivate', deactivateUser as unknown as RequestHandler);

// Eliminar usuario permanentemente ✅
router.delete('/:id/permanent', deleteUser as unknown as RequestHandler);

// Register route ✅
router.post('/register', register as unknown as RequestHandler);

// Middleware to check if document exists
router.get('/check-document/:numero_documento', checkDocumentExists as unknown as RequestHandler);

// Middleware to check if email exists
router.get('/check-email/:email', checkEmailExists as unknown as RequestHandler);

export default router;