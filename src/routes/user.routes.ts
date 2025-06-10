import { RequestHandler, Router } from 'express';
import { getUsers, register, getUsuarioById, updateUser, activateUser, deactivateUser, deleteUser, searchUser } from '../controllers/user.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Get users route ✅
router.get('/', 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    getUsers as unknown as RequestHandler
);

// Search users route ✅
router.get('/search', 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    searchUser as unknown as RequestHandler
);

// Get user by ID route ✅
router.get('/:id', 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    getUsuarioById as unknown as RequestHandler
);

// Update user route ✅
router.put('/:id', 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    updateUser as unknown as RequestHandler
);

// Activar usuario ✅
router.post('/:id/activate', 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    activateUser as unknown as RequestHandler
);

// Desactivar usuario ✅
router.post('/:id/deactivate', 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    deactivateUser as unknown as RequestHandler
);

// Eliminar usuario permanentemente ✅
router.delete('/:id/permanent', 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    deleteUser as unknown as RequestHandler
);

// Register route ✅
router.post('/register', 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    register as unknown as RequestHandler
);

export default router;