import { RequestHandler, Router } from 'express';
import { login, logout, forgotPassword, resetPassword, changePassword, getProfile, updateProfile, getRoles } from '../controllers/auth.controller';
import {
    getPermissionsByRole,
    checkPermissionChanges,
    getAccessibleModules
} from '../controllers/permissions.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// Ruta de registro de usuario se movió a user.routes.ts

router.get('/roles',
    getRoles as unknown as RequestHandler
);
// Ruta de login ✅
router.post('/login', login as unknown as RequestHandler);

// Ruta de logout ✅
router.post('/logout', logout as unknown as RequestHandler);

// Ruta de recuperación de contraseña ✅
router.post('/forgot-password', forgotPassword as unknown as RequestHandler);

router.get('/permissions/:roleId', verifyToken as unknown as RequestHandler, getPermissionsByRole as unknown as RequestHandler);
router.get('/permissions/check/:roleId', verifyToken as unknown as RequestHandler, checkPermissionChanges as unknown as RequestHandler);
router.get('/permissions/modules/:roleId', verifyToken as unknown as RequestHandler, getAccessibleModules as unknown as RequestHandler);

// Ruta de cambio de contraseña del usuario autenticado ✅
router.post('/change-password', verifyToken as unknown as RequestHandler, changePassword as unknown as RequestHandler);

// Ruta de perfil del usuario autenticado ✅
router.get('/profile', verifyToken as unknown as RequestHandler, getProfile as unknown as RequestHandler);

// Ruta de actualización de perfil del usuario autenticado ✅
router.put('/profile', verifyToken as unknown as RequestHandler, updateProfile as unknown as RequestHandler);

// Ruta de cambio de contraseña ✅
router.post('/reset-password/:token', resetPassword as unknown as RequestHandler);

export default router;