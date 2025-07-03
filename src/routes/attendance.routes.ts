import { RequestHandler, Router } from 'express';
import { 
    registerAttendance,
    getAttendances,
    searchAttendances,
    getAttendanceDetails,
    deleteAttendances,
    getAttendanceStats
} from '../controllers/attendance.controller';
import { verifyToken, hasPermission, hasAnyPermission } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../utils/permissions';

const router = Router();

// Ruta para registrar asistencia (requiere autenticación y permiso para registrar asistencias) ✅
router.post('/register',
    verifyToken as unknown as RequestHandler,
    hasPermission(PERMISSIONS.REGISTER_ATTENDANCE) as unknown as RequestHandler,
    registerAttendance as unknown as RequestHandler
);

// Ruta para obtener todas las asistencias (requiere autenticación y permiso para ver asistencias) ✅
router.get('/',
    verifyToken as unknown as RequestHandler,
    hasPermission(PERMISSIONS.VIEW_ATTENDANCE) as unknown as RequestHandler,
    getAttendances as unknown as RequestHandler
);

// Ruta para buscar asistencias (requiere autenticación y permiso para ver asistencias) ✅
router.get('/search',
    verifyToken as unknown as RequestHandler,
    hasPermission(PERMISSIONS.VIEW_ATTENDANCE) as unknown as RequestHandler,
    searchAttendances as unknown as RequestHandler
);

// Ruta para obtener estadísticas de asistencia (requiere autenticación y permiso para ver asistencias) ✅
router.get('/stats',
    verifyToken as unknown as RequestHandler,
    hasPermission(PERMISSIONS.VIEW_ATTENDANCE) as unknown as RequestHandler,
    getAttendanceStats as unknown as RequestHandler
);

// Ruta para obtener detalles de una asistencia (requiere autenticación y permiso para ver asistencias) ✅
router.get('/:id',
    verifyToken as unknown as RequestHandler,
    hasPermission(PERMISSIONS.VIEW_ATTENDANCE) as unknown as RequestHandler,
    getAttendanceDetails as unknown as RequestHandler
);

// Ruta para eliminar registros de asistencia (requiere permiso para gestionar asistencias) ✅
router.delete('/delete/:id',
    verifyToken as unknown as RequestHandler,
    hasAnyPermission([PERMISSIONS.MANAGE_ATTENDANCE, PERMISSIONS.DELETE_USERS]) as unknown as RequestHandler,
    deleteAttendances as unknown as RequestHandler
);

export default router; 