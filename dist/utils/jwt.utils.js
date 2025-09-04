"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
/**
 * Genera un token de acceso JWT
 * @param userId - ID del usuario
 * @param expiresIn - Duración de la expiración del token
 * @returns Token de acceso
 */
const generateAccessToken = (userId, expiresIn = '1h') => {
    const payload = { userId };
    const secret = env_1.env.JWT_SECRET;
    const options = { expiresIn };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
exports.generateAccessToken = generateAccessToken;
/**
 * Genera un token de refresco JWT
 * @param userId - ID del usuario
 * @returns Token de refresco
 */
const generateRefreshToken = (userId) => {
    const payload = { userId };
    const secret = env_1.env.JWT_REFRESH_SECRET;
    const options = { expiresIn: '7d' };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
exports.generateRefreshToken = generateRefreshToken;
