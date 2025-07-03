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
import { verifyToken, hasPermission } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../utils/permissions';

const router = Router();

// Ruta para obtener todas las membresías (requiere autenticación y permiso para ver membresías)
router.get('/',
    verifyToken as unknown as RequestHandler,
    hasPermission(PERMISSIONS.VIEW_MEMBERSHIPS) as unknown as RequestHandler,
    getMemberships as unknown as RequestHandler
);

// Ruta para buscar membresías (requiere autenticación y permiso para ver membresías)
router.get('/search',
    verifyToken as unknown as RequestHandler,
    hasPermission(PERMISSIONS.VIEW_MEMBERSHIPS) as unknown as RequestHandler,
    searchMemberships as unknown as RequestHandler
);

// Ruta para obtener detalles de una membresía (requiere autenticación y permiso para ver membresías)
router.get('/:id',
    verifyToken as unknown as RequestHandler,
    hasPermission(PERMISSIONS.VIEW_MEMBERSHIPS) as unknown as RequestHandler,
    getMembershipDetails as unknown as RequestHandler
);

// Ruta para crear una nueva membresía (requiere autenticación y permiso para crear membresías)
router.post('/new-membership',
    verifyToken as unknown as RequestHandler,
    hasPermission(PERMISSIONS.CREATE_MEMBERSHIPS) as unknown as RequestHandler,
    createMembership as unknown as RequestHandler
);

// Ruta para actualizar una membresía (requiere autenticación y permiso para actualizar membresías)
router.put('/:id',
    verifyToken as unknown as RequestHandler,
    hasPermission(PERMISSIONS.UPDATE_MEMBERSHIPS) as unknown as RequestHandler,
    updateMembership as unknown as RequestHandler
);

// Ruta para desactivar una membresía (requiere autenticación y permiso para gestionar membresías)
router.delete('/:id',
    verifyToken as unknown as RequestHandler,
    hasPermission(PERMISSIONS.MANAGE_MEMBERSHIPS) as unknown as RequestHandler,
    deactivateMembership as unknown as RequestHandler
);

// Ruta para reactivar una membresía (requiere autenticación y permiso para gestionar membresías)
router.patch('/:id/reactivate',
    verifyToken as unknown as RequestHandler,
    hasPermission(PERMISSIONS.MANAGE_MEMBERSHIPS) as unknown as RequestHandler,
    reactivateMembership as unknown as RequestHandler
);

export default router; 