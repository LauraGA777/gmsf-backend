import express, { Application } from 'express';
import morgan from 'morgan';
import path from 'path';

// Importar CORS desde archivo de configuración
import corsMiddleware from './config/cors.config';

// Importar rutas
import authRoutes from './routes/auth.routes';
import attendanceRoutes from './routes/attendance.routes';
import userRoutes from './routes/user.routes';
import membershipRoutes from './routes/membership.routes';
import contractRoutes from './routes/contract.routes';
import clientRoutes from './routes/client.routes';
import scheduleRoutes from './routes/schedule.routes';
import roleRoutes from './routes/role.routes';
import trainerRoutes from './routes/trainer.routes';
import dashboardRoutes from './routes/dashboard.routes';
import dashboardMobileRoutes from './routes/dashboardmobile.routes';
import gymSettingsRoutes from './routes/gymSettings.routes';
import validationRoutes from './routes/validation.routes';
import { errorHandler } from './middlewares/error.middleware';
import { env } from './config/env';

const app: Application = express();

// Middlewares básicos
app.use(morgan('dev'));

// ✅ CORS simplificado
app.use(corsMiddleware);

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/auth', authRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/users', userRoutes);
app.use('/memberships', membershipRoutes);
app.use('/contracts', contractRoutes);
app.use('/clients', clientRoutes);
app.use('/schedules', scheduleRoutes);
app.use('/roles', roleRoutes);
app.use('/trainers', trainerRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/dashboard-mobile', dashboardMobileRoutes);
app.use('/gym-settings', gymSettingsRoutes);
app.use('/validation', validationRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'API funcionando!'
    });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Ruta no encontrada'
    });
});

// Middleware de manejo de errores
app.use(errorHandler);

export default app;