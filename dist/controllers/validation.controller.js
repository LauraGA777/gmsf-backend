"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateContactController = exports.validatePhoneController = exports.validateEmailController = void 0;
const contact_validator_1 = require("../validators/contact.validator");
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const validateEmailController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email || typeof email !== 'string') {
            return apiResponse_1.default.error(res, 'El correo electrónico es requerido', 400);
        }
        const validation = (0, contact_validator_1.validateEmail)(email);
        return apiResponse_1.default.success(res, validation, 'Validación de correo completada');
    }
    catch (error) {
        console.error('Error en validación de email:', error);
        return apiResponse_1.default.error(res, 'Error interno del servidor', 500);
    }
});
exports.validateEmailController = validateEmailController;
const validatePhoneController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone } = req.body;
        if (!phone || typeof phone !== 'string') {
            return apiResponse_1.default.error(res, 'El número de teléfono es requerido', 400);
        }
        const validation = (0, contact_validator_1.validatePhone)(phone);
        return apiResponse_1.default.success(res, validation, 'Validación de teléfono completada');
    }
    catch (error) {
        console.error('Error en validación de teléfono:', error);
        return apiResponse_1.default.error(res, 'Error interno del servidor', 500);
    }
});
exports.validatePhoneController = validatePhoneController;
const validateContactController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, phone } = req.body;
        const validation = (0, contact_validator_1.validateContactData)({ email, phone });
        return apiResponse_1.default.success(res, validation, 'Validación de datos de contacto completada');
    }
    catch (error) {
        console.error('Error en validación de contacto:', error);
        return apiResponse_1.default.error(res, 'Error interno del servidor', 500);
    }
});
exports.validateContactController = validateContactController;
