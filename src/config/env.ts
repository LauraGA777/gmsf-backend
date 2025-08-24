import path from 'path';
import { config } from 'dotenv';
config({ path: path.join(__dirname, '../../.env') });

import { cleanEnv, str, port, bool, url } from 'envalid';

export const env = cleanEnv(process.env, {
    // Entorno de ejecución
    NODE_ENV: str({
        choices: ['development', 'test', 'production'],
        default: 'development',
    }),

    // Configuración del servidor
    PORT: port({ default: 3000 }),

    // Configuración de la base de datos
    DATABASE_URL: url(),
    DB_HOST: str(),
    DB_SSL: bool({
        default: process.env.NODE_ENV === 'production' ? true : false,
        desc: 'Usar SSL para la conexión a DB',
    }),
    DB_PORT: port(),
    DB_NAME: str(),
    DB_USER: str(),
    DB_PASSWORD: str(),

    // Configuración JWT
    JWT_SECRET: str(),
    JWT_EXPIRES_IN: str({ default: '1h' }),
    JWT_REFRESH_SECRET: str(),
    JWT_REFRESH_EXPIRES_IN: str({ default: '7d' }),

    
    // Email configuration
    SMTP_HOST: str({ default: 'smtp.gmail.com' }),
    SMTP_PORT: port({ default: 587 }),
    SMTP_USER: str(),
    SMTP_PASS: str(),
    SMTP_FROM: str(),
    FRONTEND_URL: str({ default: 'https://gmsf-strongfitgym.web.app' })
});

// Exportación tipo segura 
export type EnvVariables = typeof env;