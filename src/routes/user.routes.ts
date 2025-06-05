import { RequestHandler, Router } from 'express';
import { getUsers, register, getUsuarioById, updateUser, deleteUser, hardDeleteUser, searchUser } from '../controllers/user.controller';
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

// Soft delete user route (desactivar) ✅
router.delete('/:id', 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    deleteUser as unknown as RequestHandler
);

// Hard delete user route (eliminación física) ✅
router.delete('/:id/permanent', 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    hardDeleteUser as unknown as RequestHandler
);

// Register route ✅
router.post('/register', 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    register as unknown as RequestHandler
);

export default router;