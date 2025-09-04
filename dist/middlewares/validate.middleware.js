"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const apiError_1 = require("../errors/apiError");
const validate = (schema, source) => (req, res, next) => {
    console.log(`Middleware: Validando [${source}]...`);
    try {
        const dataToValidate = req[source];
        console.log(`Middleware: Datos a validar:`, dataToValidate);
        schema.parse(dataToValidate);
        console.log(`Middleware: Validación exitosa.`);
        next();
    }
    catch (error) {
        console.error("Middleware: Error de validación Zod:", error);
        const messages = error.errors.map((err) => err.message);
        const apiError = new apiError_1.ApiError(`Validation error: ${messages.join(", ")}`, 400);
        next(apiError);
    }
};
exports.validate = validate;
