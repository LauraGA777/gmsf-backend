"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const membership_controller_1 = require("../controllers/membership.controller");
const membership_middleware_1 = require("../middlewares/membership.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const permissions_1 = require("../utils/permissions");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.verifyToken);
// ✅ Ruta para obtener estadísticas de membresías (MEMBERSHIP_READ)
router.get('/stats', membership_middleware_1.canViewMemberships, membership_controller_1.getMembershipStats);
router.get('/my-membership/active', membership_middleware_1.canViewMyMembership, membership_controller_1.getMyActiveMembership);
// Ruta para obtener historial de membresías del cliente autenticado
router.get('/my-membership/history', membership_middleware_1.canViewMyMembershipHistory, membership_controller_1.getMyMembershipHistory);
// Ruta para obtener beneficios de la membresía activa del cliente
router.get('/my-membership/benefits', membership_middleware_1.canViewMyMembershipBenefits, membership_controller_1.getMyMembershipBenefits);
// ✅ Ruta para obtener todas las membresías (MEMBERSHIP_READ)
router.get('/', membership_middleware_1.canViewMemberships, membership_controller_1.getMemberships);
// ✅ Ruta para buscar membresías (MEMBERSHIP_SEARCH)
router.get('/search', membership_middleware_1.canSearchMemberships, membership_controller_1.searchMemberships);
// ✅ Ruta para obtener detalles de una membresía (MEMBERSHIP_DETAILS)
router.get('/:id', membership_middleware_1.canViewMembershipDetails, membership_controller_1.getMembershipDetails);
// ✅ Ruta para crear una nueva membresía (MEMBERSHIP_CREATE)
router.post('/new-membership', membership_middleware_1.canCreateMemberships, membership_controller_1.createMembership);
// ✅ Ruta para actualizar una membresía (MEMBERSHIP_UPDATE)
router.put('/:id', membership_middleware_1.canUpdateMemberships, membership_controller_1.updateMembership);
// ✅ Ruta para desactivar una membresía (MEMBERSHIP_DEACTIVATE)
router.delete('/:id', membership_middleware_1.canDeactivateMemberships, membership_controller_1.deactivateMembership);
// ✅ Ruta para reactivar una membresía (MEMBERSHIP_REACTIVATE)
router.patch('/:id/reactivate', membership_middleware_1.canReactivateMemberships, membership_controller_1.reactivateMembership);
// ✅ Ruta adicional para acciones que requieren múltiples privilegios
router.get('/admin/manage', (0, membership_middleware_1.requireMembershipPrivileges)([
    permissions_1.PRIVILEGES.MEMBERSHIP_READ,
    permissions_1.PRIVILEGES.MEMBERSHIP_CREATE,
    permissions_1.PRIVILEGES.MEMBERSHIP_UPDATE
]), 
// Controlador para panel de administración de membresías
(req, res) => {
    res.json({
        status: 'success',
        message: 'Acceso a panel de administración de membresías permitido'
    });
});
exports.default = router;
