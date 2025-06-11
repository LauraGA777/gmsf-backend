import { RequestHandler, Router } from 'express';
import { 
    registerAttendance,
    getAttendances,
    searchAttendances,
    getAttendanceDetails,
    deleteAttendances,
    getAttendanceStats
} from '../controllers/attendance.controller';
import { verifyToken, isAdmin, isTrainerOrAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Ruta para registrar asistencia (requiere autenticación y ser admin o entrenador) ✅
router.post('/register',
    verifyToken as unknown as RequestHandler,
    isTrainerOrAdmin as unknown as RequestHandler,
    registerAttendance as unknown as RequestHandler
);

// Ruta para obtener todas las asistencias (requiere autenticación y ser admin o entrenador) ✅
router.get('/',
    verifyToken as unknown as RequestHandler,
    isTrainerOrAdmin as unknown as RequestHandler,
    getAttendances as unknown as RequestHandler
);

// Ruta para buscar asistencias (requiere autenticación y ser admin o entrenador) ✅
router.get('/search',
    verifyToken as unknown as RequestHandler,
    isTrainerOrAdmin as unknown as RequestHandler,
    searchAttendances as unknown as RequestHandler
);

// Ruta para obtener estadísticas de asistencia (requiere autenticación y ser admin o entrenador) ✅
router.get('/stats',
    verifyToken as unknown as RequestHandler,
    isTrainerOrAdmin as unknown as RequestHandler,
    getAttendanceStats as unknown as RequestHandler
);

// Ruta para obtener detalles de una asistencia (requiere autenticación y ser admin o entrenador) ✅
router.get('/:id',
    verifyToken as unknown as RequestHandler,
    isTrainerOrAdmin as unknown as RequestHandler,
    getAttendanceDetails as unknown as RequestHandler
);

// Ruta para eliminar registros de asistencia (solo admin) ✅
router.delete('/delete/:id',
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    deleteAttendances as unknown as RequestHandler
);

export default router; 