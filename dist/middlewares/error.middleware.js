"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    const status = err.statusCode || err.status || 500;
    const message = err.message || 'Error interno del servidor';
    res.status(status).json(Object.assign({ success: false, status,
        message }, (process.env.NODE_ENV === 'development' && { stack: err.stack })));
};
exports.errorHandler = errorHandler;
