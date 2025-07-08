import { RequestHandler, Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import {
    canCreateAttendances,
    canSearchAttendances,
    canViewAttendanceDetails,
    canUpdateAttendances,
    canDeleteAttendances,
    canViewAttendanceStats,
    canViewOwnAttendances
} from '../middlewares/attendance.middleware';
import { 
    registerAttendance,
    getAttendances,
    searchAttendances,
    getAttendanceDetails,
    deleteAttendances,
    getAttendanceStats
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
    getAttendanceStats as unknown as RequestHandler
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

// ✅ Ruta para eliminar registros de asistencia (ASIST_DELETE)
router.delete('/delete/:id', 
    canDeleteAttendances as unknown as RequestHandler,
    deleteAttendances as unknown as RequestHandler
);

export default router; 