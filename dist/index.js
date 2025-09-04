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
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./config/db"));
const env_1 = require("./config/env");
require("./models"); // Importar modelos y sus relaciones
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield db_1.default.authenticate();
            console.log('📡 Database connection established');
            if (env_1.env.NODE_ENV === 'development') {
                // En desarrollo, sincronizar con alter y force: false para ser más seguro
                yield db_1.default.sync({ alter: true, force: false });
                console.log('🔄 Database synchronized in development mode (alter: true)');
            }
            else {
                // En producción, solo verificar la conexión
                console.log('✅ Production mode - skipping database sync');
            }
            const server = app_1.default.listen(env_1.env.PORT, () => {
                // ✅ CORREGIDO: No usar localhost hardcodeado
                console.log(`🚀 Server running on port ${env_1.env.PORT}`);
                console.log(`📧 SMTP configured: ${env_1.env.SMTP_HOST}:${env_1.env.SMTP_PORT}`);
                console.log(`🌐 Frontend URL: ${env_1.env.FRONTEND_URL}`);
                console.log(`📊 Environment: ${env_1.env.NODE_ENV}`);
                // ✅ OPCIONAL: Mostrar URL completa basada en el entorno
                const serverUrl = env_1.env.NODE_ENV === 'production'
                    ? `https://gmsf-backend.vercel.app`
                    : `http://localhost:${env_1.env.PORT}`;
                console.log(`🔗 Server accessible at: ${serverUrl}`);
            });
            // ✅ MANEJO MEJORADO DE ERRORES
            server.on('error', (error) => {
                if (error.code === 'EADDRINUSE') {
                    console.error(`❌ Port ${env_1.env.PORT} is already in use`);
                    process.exit(1);
                }
                else {
                    console.error('❌ Server error:', error);
                }
            });
            // ✅ GRACEFUL SHUTDOWN
            process.on('SIGTERM', () => {
                console.log('🛑 SIGTERM received, shutting down gracefully');
                server.close(() => {
                    console.log('✅ Process terminated');
                    db_1.default.close();
                });
            });
            process.on('SIGINT', () => {
                console.log('🛑 SIGINT received, shutting down gracefully');
                server.close(() => {
                    console.log('✅ Process terminated');
                    db_1.default.close();
                });
            });
        }
        catch (error) {
            console.error('❌ Unable to connect to the database:', error);
            process.exit(1);
        }
    });
}
startServer();
