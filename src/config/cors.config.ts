import cors from 'cors';

// Lista de orígenes permitidos
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://gmsf-strongfitgym.web.app',
    'https://gmsf-strongfitgym.firebaseapp.com'
];

// Configuración CORS simple y estable
export const corsOptions = {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin'
    ],
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware CORS preconfigurado
export const corsMiddleware = cors(corsOptions);

export default corsMiddleware;