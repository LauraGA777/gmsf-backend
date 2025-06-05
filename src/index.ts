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

        app.listen(env.PORT, () => {
            console.log(`🚀 Server running on http://localhost:${env.PORT}`);
        });
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        process.exit(1);
    }
}

startServer(); 