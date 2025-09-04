"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const permissions_controller_1 = require("../controllers/permissions.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Ruta de registro de usuario se movió a user.routes.ts
router.get('/roles', auth_controller_1.getRoles);
// Ruta de login ✅
router.post('/login', auth_controller_1.login);
// Ruta de logout ✅
router.post('/logout', auth_controller_1.logout);
// Ruta de recuperación de contraseña ✅
router.post('/forgot-password', auth_controller_1.forgotPassword);
router.get('/permissions/:roleId', auth_middleware_1.verifyToken, permissions_controller_1.getPermissionsByRole);
router.get('/permissions/check/:roleId', auth_middleware_1.verifyToken, permissions_controller_1.checkPermissionChanges);
router.get('/permissions/modules/:roleId', auth_middleware_1.verifyToken, permissions_controller_1.getAccessibleModules);
// Ruta de cambio de contraseña del usuario autenticado ✅
router.post('/change-password', auth_middleware_1.verifyToken, auth_controller_1.changePassword);
// Ruta de perfil del usuario autenticado ✅
router.get('/profile', auth_middleware_1.verifyToken, auth_controller_1.getProfile);
// Ruta de actualización de perfil del usuario autenticado ✅
router.put('/profile', auth_middleware_1.verifyToken, auth_controller_1.updateProfile);
// Ruta de cambio de contraseña ✅
router.post('/reset-password/:token', auth_controller_1.resetPassword);
exports.default = router;
