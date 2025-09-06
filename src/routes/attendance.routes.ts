import { RequestHandler, Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import {
    canCreateAttendances,
    canSearchAttendances,
    canViewAttendanceDetails,
    canUpdateAttendances,
    canDeleteAttendances,
    canViewAttendanceStats,
    canViewOwnAttendances,
    canViewClientInfo,
    canViewClientStats,
    canViewClientHistory,
    canViewMyAttendanceHistory,
    canViewMyAttendanceStats
} from '../middlewares/attendance.middleware';
import { 
    registerAttendance,
    getAttendances,
    searchAttendances,
    getAttendanceDetails,
    deleteAttendances,
    getStats,
    getClientAttendanceHistory,
    getClientDateRangeByPeriod,
    getClientAttendanceStats,
    getMyAttendanceHistory,
    getMyAttendanceStats
} from '../controllers/attendance.controller';

const router = Router();

router.use(verifyToken as unknown as RequestHandler);

// ✅ Ruta para registrar asistencia (ASIST_CREATE)
router.post('/register', 
    canCreateAttendances as unknown as RequestHandler,
    registerAttendance as unknown as RequestHandler
);

// ✅ Ruta para obtener todas las asistencias (ASIST_READ)
router.get('/', 
    canViewOwnAttendances as unknown as RequestHandler,  // Permite filtro por usuario para clientes
    getAttendances as unknown as RequestHandler
);

// ✅ Ruta para buscar asistencias (ASIST_SEARCH)
router.get('/search', 
    canSearchAttendances as unknown as RequestHandler,
    searchAttendances as unknown as RequestHandler
);

// ✅ Ruta para obtener estadísticas de asistencia (ASIST_STATS)
router.get('/stats', 
    canViewAttendanceStats as unknown as RequestHandler,
    getStats as unknown as RequestHandler
);

// ✅ Ruta para obtener tendencias (semanal/mensual) para dashboard
router.get('/trends',
    canViewAttendanceStats as unknown as RequestHandler,
    (require('../controllers/attendance.controller') as any).getAttendanceTrends
);

// ✅ Ruta para obtener historial de asistencias del usuario autenticado (ASIST_MY_HISTORY)
router.get('/my-attendances/me', 
    canViewMyAttendanceHistory as unknown as RequestHandler,
    getMyAttendanceHistory as unknown as RequestHandler
);

// ✅ Ruta para obtener estadísticas de asistencia del usuario autenticado (ASIST_MY_STATS)
router.get('/my-attendances/stats', 
    canViewMyAttendanceStats as unknown as RequestHandler,
    getMyAttendanceStats as unknown as RequestHandler
);

// ✅ Ruta para obtener estadísticas de asistencia por período (ASIST_CLIENT_STATS) - Para administradores
router.get('/client-attendances/stats', 
    canViewClientStats as unknown as RequestHandler,
    getClientAttendanceStats as unknown as RequestHandler
);

// ✅ Ruta para obtener estadísticas de asistencia por rango de fechas (ASIST_CLIENT_HISTORY)
router.get('/my-attendances/date-range', 
    canViewClientHistory as unknown as RequestHandler,
    getClientDateRangeByPeriod as unknown as RequestHandler
);

//✅ Ruta para obtener historial de asistencias de un cliente (ASIST_CLIENT_INFO)   
router.get('/my-attendances/:id', 
    canViewClientInfo as unknown as RequestHandler,  // Permite filtro por usuario para clientes
    getClientAttendanceHistory as unknown as RequestHandler
);
// ✅ Ruta para eliminar registros de asistencia (ASIST_DELETE)
router.delete('/delete/:id', 
    canDeleteAttendances as unknown as RequestHandler,
    deleteAttendances as unknown as RequestHandler
);
// ✅ Ruta para obtener detalles de una asistencia (ASIST_DETAILS)
router.get('/:id', 
    canViewAttendanceDetails as unknown as RequestHandler,
    getAttendanceDetails as unknown as RequestHandler
);

// ✅ Ruta para actualizar asistencia (ASIST_UPDATE)
router.put('/:id', 
    canUpdateAttendances as unknown as RequestHandler,
    // updateAttendance as unknown as RequestHandler  // Necesitarías crear este método
);

export default router; 