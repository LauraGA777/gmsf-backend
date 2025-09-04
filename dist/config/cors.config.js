"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsMiddleware = exports.corsOptions = void 0;
const cors_1 = __importDefault(require("cors"));
// Lista base de orígenes permitidos (producción y entornos web conocidos)
const allowedOrigins = [
    // Web app prod
    'https://gmsf-strongfitgym.web.app',
    'https://gmsf-strongfitgym.firebaseapp.com',
    // Local dev comunes
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    // Expo/Metro dev servers
    'http://localhost:8081',
    'http://127.0.0.1:8081',
    'http://localhost:8082',
    'http://127.0.0.1:8082',
    'http://localhost:19000',
    'http://127.0.0.1:19000',
    'http://localhost:19006',
    'http://127.0.0.1:19006',
];
// Configuración CORS con validación dinámica para localhost/LAN en dev
exports.corsOptions = {
    origin: (origin, callback) => {
        // Permitir solicitudes sin origen (ej: apps nativas, curl, servidores internos)
        if (!origin)
            return callback(null, true);
        // Permitir si está en la lista explícita
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        // Permitir cualquier localhost/127.0.0.1 con cualquier puerto en desarrollo
        if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin))
            return callback(null, true);
        // Permitir IPs de red local típicas (192.168.x.x:port) para pruebas en dispositivos reales
        if (/^https?:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin))
            return callback(null, true);
        // Rechazar otros orígenes
        return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
    ],
    credentials: true,
    optionsSuccessStatus: 200,
};
// Middleware CORS preconfigurado
exports.corsMiddleware = (0, cors_1.default)(exports.corsOptions);
exports.default = exports.corsMiddleware;
