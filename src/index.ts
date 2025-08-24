import app from './app';
import sequelize from './config/db';
import { env } from './config/env';
import './models'; // Importar modelos y sus relaciones

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('📡 Database connection established');
        
        if (env.NODE_ENV === 'development') {
            // En desarrollo, sincronizar con alter y force: false para ser más seguro
            await sequelize.sync({ alter: true, force: false });
            console.log('🔄 Database synchronized in development mode (alter: true)');
        } else {
            // En producción, solo verificar la conexión
            console.log('✅ Production mode - skipping database sync');
        }

        const server = app.listen(env.PORT, () => {
            // ✅ CORREGIDO: No usar localhost hardcodeado
            console.log(`🚀 Server running on port ${env.PORT}`);
            console.log(`📧 SMTP configured: ${env.SMTP_HOST}:${env.SMTP_PORT}`);
            console.log(`🌐 Frontend URL: ${env.FRONTEND_URL}`);
            console.log(`📊 Environment: ${env.NODE_ENV}`);
            
            // ✅ OPCIONAL: Mostrar URL completa basada en el entorno
            const serverUrl = env.NODE_ENV === 'production' 
                ? `https://gmsf-backend.vercel.app` 
                : `http://localhost:${env.PORT}`;
            console.log(`🔗 Server accessible at: ${serverUrl}`);
        });

        // ✅ MANEJO MEJORADO DE ERRORES
        server.on('error', (error: any) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${env.PORT} is already in use`);
                process.exit(1);
            } else {
                console.error('❌ Server error:', error);
            }
        });

        // ✅ GRACEFUL SHUTDOWN
        process.on('SIGTERM', () => {
            console.log('🛑 SIGTERM received, shutting down gracefully');
            server.close(() => {
                console.log('✅ Process terminated');
                sequelize.close();
            });
        });

        process.on('SIGINT', () => {
            console.log('🛑 SIGINT received, shutting down gracefully');
            server.close(() => {
                console.log('✅ Process terminated');
                sequelize.close();
            });
        });

    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        process.exit(1);
    }
}

startServer();