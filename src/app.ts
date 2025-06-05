import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';

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
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();

// Middlewares
app.use(morgan('dev'));
app.use(cors({
    origin: env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));

// Rutas
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/memberships', membershipRoutes);
app.use('/contracts', contractRoutes);
app.use('/clients', clientRoutes);
app.use('/schedules', scheduleRoutes);
app.use('/roles', roleRoutes);
app.use('/attendances', attendanceRoutes);
app.use('/trainers', trainerRoutes);

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