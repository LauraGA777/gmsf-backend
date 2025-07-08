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
import {
    canViewMemberships,
    canCreateMemberships,
    canSearchMemberships,
    canViewMembershipDetails,
    canUpdateMemberships,
    canDeactivateMemberships,
    canReactivateMemberships,
    canAccessMemberships,
    requireMembershipPrivileges
} from '../middlewares/membership.middleware';
import { verifyToken } from '../middlewares/auth.middleware';
import { PRIVILEGES } from '../utils/permissions';

const router = Router();

router.use(verifyToken as unknown as RequestHandler);

// ✅ Ruta para obtener todas las membresías (MEMBERSHIP_READ)
router.get('/',
    canViewMemberships as unknown as RequestHandler,
    getMemberships as unknown as RequestHandler
);

// ✅ Ruta para buscar membresías (MEMBERSHIP_SEARCH)
router.get('/search',
    canSearchMemberships as unknown as RequestHandler,
    searchMemberships as unknown as RequestHandler
);

// ✅ Ruta para obtener detalles de una membresía (MEMBERSHIP_DETAILS)
router.get('/:id',
    canViewMembershipDetails as unknown as RequestHandler,
    getMembershipDetails as unknown as RequestHandler
);

// ✅ Ruta para crear una nueva membresía (MEMBERSHIP_CREATE)
router.post('/new-membership',
    canCreateMemberships as unknown as RequestHandler,
    createMembership as unknown as RequestHandler
);

// ✅ Ruta para actualizar una membresía (MEMBERSHIP_UPDATE)
router.put('/:id',
    canUpdateMemberships as unknown as RequestHandler,
    updateMembership as unknown as RequestHandler
);

// ✅ Ruta para desactivar una membresía (MEMBERSHIP_DEACTIVATE)
router.delete('/:id',
    canDeactivateMemberships as unknown as RequestHandler,
    deactivateMembership as unknown as RequestHandler
);

// ✅ Ruta para reactivar una membresía (MEMBERSHIP_REACTIVATE)
router.patch('/:id/reactivate',
    canReactivateMemberships as unknown as RequestHandler,
    reactivateMembership as unknown as RequestHandler
);
// ✅ Ruta adicional para acciones que requieren múltiples privilegios
router.get('/admin/manage',
    requireMembershipPrivileges([
        PRIVILEGES.MEMBERSHIP_READ,
        PRIVILEGES.MEMBERSHIP_CREATE,
        PRIVILEGES.MEMBERSHIP_UPDATE
    ]) as unknown as RequestHandler,
    // Controlador para panel de administración de membresías
    (req, res) => {
        res.json({
            status: 'success',
            message: 'Acceso a panel de administración de membresías permitido'
        });
    }
);
export default router; 