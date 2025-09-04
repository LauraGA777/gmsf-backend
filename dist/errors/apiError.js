"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = "ApiError";
        // This is for better stack traces in Node.js
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApiError = ApiError;
