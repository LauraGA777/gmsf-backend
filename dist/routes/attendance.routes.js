"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const attendance_middleware_1 = require("../middlewares/attendance.middleware");
const attendance_controller_1 = require("../controllers/attendance.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.verifyToken);
// ✅ Ruta para registrar asistencia (ASIST_CREATE)
router.post('/register', attendance_middleware_1.canCreateAttendances, attendance_controller_1.registerAttendance);
// ✅ Ruta para obtener todas las asistencias (ASIST_READ)
router.get('/', attendance_middleware_1.canViewOwnAttendances, // Permite filtro por usuario para clientes
attendance_controller_1.getAttendances);
// ✅ Ruta para buscar asistencias (ASIST_SEARCH)
router.get('/search', attendance_middleware_1.canSearchAttendances, attendance_controller_1.searchAttendances);
// ✅ Ruta para obtener estadísticas de asistencia (ASIST_STATS)
router.get('/stats', attendance_middleware_1.canViewAttendanceStats, attendance_controller_1.getStats);
// ✅ Ruta para obtener historial de asistencias del usuario autenticado (ASIST_MY_HISTORY)
router.get('/my-attendances/me', attendance_middleware_1.canViewMyAttendanceHistory, attendance_controller_1.getMyAttendanceHistory);
// ✅ Ruta para obtener estadísticas de asistencia del usuario autenticado (ASIST_MY_STATS)
router.get('/my-attendances/stats', attendance_middleware_1.canViewMyAttendanceStats, attendance_controller_1.getMyAttendanceStats);
// ✅ Ruta para obtener estadísticas de asistencia por período (ASIST_CLIENT_STATS) - Para administradores
router.get('/client-attendances/stats', attendance_middleware_1.canViewClientStats, attendance_controller_1.getClientAttendanceStats);
// ✅ Ruta para obtener estadísticas de asistencia por rango de fechas (ASIST_CLIENT_HISTORY)
router.get('/my-attendances/date-range', attendance_middleware_1.canViewClientHistory, attendance_controller_1.getClientDateRangeByPeriod);
//✅ Ruta para obtener historial de asistencias de un cliente (ASIST_CLIENT_INFO)   
router.get('/my-attendances/:id', attendance_middleware_1.canViewClientInfo, // Permite filtro por usuario para clientes
attendance_controller_1.getClientAttendanceHistory);
// ✅ Ruta para eliminar registros de asistencia (ASIST_DELETE)
router.delete('/delete/:id', attendance_middleware_1.canDeleteAttendances, attendance_controller_1.deleteAttendances);
// ✅ Ruta para obtener detalles de una asistencia (ASIST_DETAILS)
router.get('/:id', attendance_middleware_1.canViewAttendanceDetails, attendance_controller_1.getAttendanceDetails);
// ✅ Ruta para actualizar asistencia (ASIST_UPDATE)
router.put('/:id', attendance_middleware_1.canUpdateAttendances);
exports.default = router;
