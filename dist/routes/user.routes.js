"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const strictValidation_middleware_1 = require("../middlewares/strictValidation.middleware");
const user_middleware_1 = require("../middlewares/user.middleware");
const router = (0, express_1.Router)();
const userController = new user_controller_1.UserController();
router.use(auth_middleware_1.verifyToken);
// Get users route ✅
router.get('/', user_middleware_1.canViewUsers, userController.getUsers.bind(userController));
// Get roles route ✅
router.get('/roles', user_middleware_1.canViewUserRoles, userController.getRoles.bind(userController));
// Search users route ✅
router.get('/search', user_middleware_1.canSearchUsers, userController.searchUsers.bind(userController));
// Check if user exists by document (similar to clients pattern) - DEBE IR ANTES DE /:id
router.get('/check-user/:tipo_documento/:numero_documento', user_middleware_1.canCheckDocument, userController.checkUserByDocument.bind(userController));
// Middleware to check if email exists - DEBE IR ANTES DE /:id
router.get('/check-email/:email', user_middleware_1.canCheckEmail, userController.checkEmailExists.bind(userController));
// Middleware to check if document exists (legacy - only numero_documento) - DEBE IR ANTES DE /:id
router.get('/check-document/:numero_documento', user_middleware_1.canCheckDocument, userController.checkDocumentExists.bind(userController));
// Get user by ID route ✅ - DEBE IR DESPUÉS DE LAS RUTAS ESPECÍFICAS
router.get('/:id', user_middleware_1.canViewUserDetails, userController.getUserById.bind(userController));
// Update user route ✅
router.put('/:id', strictValidation_middleware_1.sanitizeEmails, strictValidation_middleware_1.sanitizePhoneNumbers, strictValidation_middleware_1.strictLengthValidation, user_middleware_1.canUpdateUsers, userController.updateUser.bind(userController));
// Activar usuario ✅
router.post('/:id/activate', user_middleware_1.canActivateUsers, userController.activateUser.bind(userController));
// Desactivar usuario ✅
router.post('/:id/deactivate', user_middleware_1.canDeactivateUsers, userController.deactivateUser.bind(userController));
// Eliminar usuario permanentemente ✅
router.delete('/:id/permanent', user_middleware_1.canDeleteUsers, userController.deleteUser.bind(userController));
// Register route ✅
router.post('/register', strictValidation_middleware_1.sanitizeEmails, strictValidation_middleware_1.sanitizePhoneNumbers, strictValidation_middleware_1.strictLengthValidation, user_middleware_1.canCreateUsers, userController.register.bind(userController));
exports.default = router;
