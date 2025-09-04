"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiResponse {
    static success(res, data, message, pagination, statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            pagination,
        });
    }
    static error(res, message, statusCode = 500, errors) {
        return res.status(statusCode).json({
            success: false,
            message,
            errors,
        });
    }
}
exports.default = ApiResponse;
