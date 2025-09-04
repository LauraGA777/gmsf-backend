"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validation_controller_1 = require("../controllers/validation.controller");
const router = (0, express_1.Router)();
// Validar correo electrónico
router.post('/email', validation_controller_1.validateEmailController);
// Validar teléfono
router.post('/phone', validation_controller_1.validatePhoneController);
// Validar datos de contacto completos
router.post('/contact', validation_controller_1.validateContactController);
exports.default = router;
