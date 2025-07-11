import { RequestHandler, Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { canViewUsers, canSearchUsers, canViewUserDetails, canCreateUsers, canUpdateUsers, canActivateUsers, canDeactivateUsers, canDeleteUsers, canCheckDocument, canCheckEmail, canViewUserRoles } from '../middlewares/user.middleware';

const router = Router();
const userController = new UserController();

router.use(verifyToken as unknown as RequestHandler);

// Get users route ✅
router.get('/', canViewUsers as unknown as RequestHandler, userController.getUsers.bind(userController) as unknown as RequestHandler);

// Get roles route ✅
router.get('/roles', canViewUserRoles as unknown as RequestHandler, userController.getRoles.bind(userController) as unknown as RequestHandler);

// Search users route ✅
router.get('/search', canSearchUsers as unknown as RequestHandler, userController.searchUsers.bind(userController) as unknown as RequestHandler);

// Get user by ID route ✅
router.get('/:id', canViewUserDetails as unknown as RequestHandler, userController.getUserById.bind(userController) as unknown as RequestHandler);

// Update user route ✅
router.put('/:id', canUpdateUsers as unknown as RequestHandler, userController.updateUser.bind(userController) as unknown as RequestHandler);

// Activar usuario ✅
router.post('/:id/activate', canActivateUsers as unknown as RequestHandler, userController.activateUser.bind(userController) as unknown as RequestHandler);

// Desactivar usuario ✅
router.post('/:id/deactivate', canDeactivateUsers as unknown as RequestHandler, userController.deactivateUser.bind(userController) as unknown as RequestHandler);

// Eliminar usuario permanentemente ✅
router.delete('/:id/permanent', canDeleteUsers as unknown as RequestHandler, userController.deleteUser.bind(userController) as unknown as RequestHandler);

// Register route ✅
router.post('/register', canCreateUsers as unknown as RequestHandler, userController.register.bind(userController) as unknown as RequestHandler);

// Middleware to check if document exists
router.get('/check-document', canCheckDocument as unknown as RequestHandler, userController.checkDocumentExists.bind(userController) as unknown as RequestHandler);

// Middleware to check if email exists
router.get('/check-email/:email', canCheckEmail as unknown as RequestHandler, userController.checkEmailExists.bind(userController) as unknown as RequestHandler);

export default router;