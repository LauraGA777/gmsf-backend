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
import { verifyToken } from '../middlewares/auth.middleware';
import { adminOnlyAccess } from '../middlewares/adminOnly.middleware';

const router = Router();

router.use(verifyToken as unknown as RequestHandler);
router.use(adminOnlyAccess as unknown as RequestHandler);

// Ruta para obtener todas las membresías (requiere autenticación y permiso para ver membresías)
router.get('/', getMemberships as unknown as RequestHandler);

// Ruta para buscar membresías (requiere autenticación y permiso para ver membresías)
router.get('/search', searchMemberships as unknown as RequestHandler);

// Ruta para obtener detalles de una membresía (requiere autenticación y permiso para ver membresías)
router.get('/:id', getMembershipDetails as unknown as RequestHandler);

// Ruta para crear una nueva membresía (requiere autenticación y permiso para crear membresías)
router.post('/new-membership', createMembership as unknown as RequestHandler);

// Ruta para actualizar una membresía (requiere autenticación y permiso para actualizar membresías)
router.put('/:id', updateMembership as unknown as RequestHandler);

// Ruta para desactivar una membresía (requiere autenticación y permiso para gestionar membresías)
router.delete('/:id', deactivateMembership as unknown as RequestHandler);

// Ruta para reactivar una membresía (requiere autenticación y permiso para gestionar membresías)
router.patch('/:id/reactivate',reactivateMembership as unknown as RequestHandler);

export default router; 