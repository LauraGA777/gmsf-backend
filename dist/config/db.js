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
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = void 0;
const sequelize_1 = require("sequelize");
const env_1 = require("./env");
const setupSequelize = () => {
    if (env_1.env.DATABASE_URL) {
        return new sequelize_1.Sequelize(env_1.env.DATABASE_URL, {
            dialect: 'postgres',
            dialectModule: require('pg'),
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            },
            logging: env_1.env.NODE_ENV === 'development' ? console.log : false
        });
    }
    return new sequelize_1.Sequelize(env_1.env.DB_NAME, env_1.env.DB_USER, env_1.env.DB_PASSWORD, {
        host: env_1.env.DB_HOST,
        port: env_1.env.DB_PORT,
        dialect: 'postgres',
        dialectModule: require('pg'),
        dialectOptions: {
            ssl: env_1.env.DB_SSL ? {
                require: true,
                rejectUnauthorized: false
            } : false
        },
        logging: env_1.env.NODE_ENV === 'development' ? console.log : false
    });
};
const sequelize = setupSequelize();
// Función de test de conexión
const testConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield sequelize.authenticate();
        console.log('✅ Database connection established');
        yield sequelize.sync({ alter: env_1.env.NODE_ENV === 'development' });
        console.log('🔄 Database synced');
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
});
exports.testConnection = testConnection;
exports.default = sequelize;
// Agregar verificación de DATABASE_URL
if (!env_1.env.DATABASE_URL && !env_1.env.DB_HOST) {
    throw new Error('Se requiere DATABASE_URL o DB_HOST en .env');
}
