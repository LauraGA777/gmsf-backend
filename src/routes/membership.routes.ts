import { RequestHandler, Router } from 'express';
import { 
    getMemberships, 
    searchMemberships, 
    createMembership,
    updateMembership,
    deactivateMembership,
    getMembershipDetails,
    reactivateMembership
} from '../controllers/membership.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Ruta para obtener todas las membresías (requiere autenticación y ser admin)
router.get('/',
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    getMemberships as unknown as RequestHandler
);

// Ruta para buscar membresías (requiere autenticación y ser admin)
router.get('/search',
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    searchMemberships as unknown as RequestHandler
);

// Ruta para obtener detalles de una membresía (requiere autenticación y ser admin)
router.get('/:id',
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    getMembershipDetails as unknown as RequestHandler
);

// Ruta para crear una nueva membresía (requiere autenticación y ser admin)
router.post('/new-membership',
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    createMembership as unknown as RequestHandler
);

// Ruta para actualizar una membresía (requiere autenticación y ser admin)
router.put('/:id',
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    updateMembership as unknown as RequestHandler
);

// Ruta para desactivar una membresía (requiere autenticación y ser admin)
router.delete('/:id',
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    deactivateMembership as unknown as RequestHandler
);

// Ruta para reactivar una membresía (requiere autenticación y ser admin)
router.patch('/:id/reactivate',
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    reactivateMembership as unknown as RequestHandler
);

export default router; 