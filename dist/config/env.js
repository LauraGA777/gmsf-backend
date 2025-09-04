"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const path_1 = __importDefault(require("path"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: path_1.default.join(__dirname, '../../.env') });
const envalid_1 = require("envalid");
exports.env = (0, envalid_1.cleanEnv)(process.env, {
    // Entorno de ejecución
    NODE_ENV: (0, envalid_1.str)({
        choices: ['development', 'test', 'production'],
        default: 'development',
    }),
    // Configuración del servidor
    PORT: (0, envalid_1.port)({ default: 3000 }),
    // Configuración de la base de datos
    DATABASE_URL: (0, envalid_1.url)(),
    DB_HOST: (0, envalid_1.str)(),
    DB_SSL: (0, envalid_1.bool)({
        default: process.env.NODE_ENV === 'production' ? true : false,
        desc: 'Usar SSL para la conexión a DB',
    }),
    DB_PORT: (0, envalid_1.port)(),
    DB_NAME: (0, envalid_1.str)(),
    DB_USER: (0, envalid_1.str)(),
    DB_PASSWORD: (0, envalid_1.str)(),
    // Configuración JWT
    JWT_SECRET: (0, envalid_1.str)(),
    JWT_EXPIRES_IN: (0, envalid_1.str)({ default: '1h' }),
    JWT_REFRESH_SECRET: (0, envalid_1.str)(),
    JWT_REFRESH_EXPIRES_IN: (0, envalid_1.str)({ default: '7d' }),
    // Email configuration
    SMTP_HOST: (0, envalid_1.str)({ default: 'smtp.gmail.com' }),
    SMTP_PORT: (0, envalid_1.port)({ default: 587 }),
    SMTP_USER: (0, envalid_1.str)(),
    SMTP_PASS: (0, envalid_1.str)(),
    SMTP_FROM: (0, envalid_1.str)(),
    FRONTEND_URL: (0, envalid_1.str)({ default: 'https://gmsf-strongfitgym.web.app' })
});
