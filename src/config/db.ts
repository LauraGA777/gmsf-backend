import { Sequelize } from 'sequelize';
import { env } from './env';

const setupSequelize = () => {
    if (env.DATABASE_URL) {
        return new Sequelize(env.DATABASE_URL, {
            dialect: 'postgres',
            dialectModule: require('pg'),
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            },
            logging: env.NODE_ENV === 'development' ? console.log : false
        });
    }

    return new Sequelize(
        env.DB_NAME,
        env.DB_USER,
        env.DB_PASSWORD,
        {
            host: env.DB_HOST,
            port: env.DB_PORT,
            dialect: 'postgres',
            dialectModule: require('pg'),
            dialectOptions: {
                ssl: env.DB_SSL ? {
                    require: true,
                    rejectUnauthorized: false
                } : false
            },
            logging: env.NODE_ENV === 'development' ? console.log : false
        }
    );
};

const sequelize = setupSequelize();

// Función de test de conexión
export const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established');
        await sequelize.sync({ alter: env.NODE_ENV === 'development' });
        console.log('🔄 Database synced');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
};

export default sequelize;

// Agregar verificación de DATABASE_URL
if (!env.DATABASE_URL && !env.DB_HOST) {
    throw new Error('Se requiere DATABASE_URL o DB_HOST en .env');
}