"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
// Importar CORS desde archivo de configuración
const cors_config_1 = __importDefault(require("./config/cors.config"));
// Importar rutas
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const attendance_routes_1 = __importDefault(require("./routes/attendance.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const membership_routes_1 = __importDefault(require("./routes/membership.routes"));
const contract_routes_1 = __importDefault(require("./routes/contract.routes"));
const client_routes_1 = __importDefault(require("./routes/client.routes"));
const schedule_routes_1 = __importDefault(require("./routes/schedule.routes"));
const role_routes_1 = __importDefault(require("./routes/role.routes"));
const trainer_routes_1 = __importDefault(require("./routes/trainer.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const dashboardmobile_routes_1 = __importDefault(require("./routes/dashboardmobile.routes"));
const gymSettings_routes_1 = __importDefault(require("./routes/gymSettings.routes"));
const validation_routes_1 = __importDefault(require("./routes/validation.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const app = (0, express_1.default)();
// Middlewares básicos
app.use((0, morgan_1.default)('dev'));
// ✅ CORS simplificado
app.use(cors_config_1.default);
// Parsers
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: false, limit: '10mb' }));
// Archivos estáticos
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Rutas
app.use('/auth', auth_routes_1.default);
app.use('/attendance', attendance_routes_1.default);
app.use('/users', user_routes_1.default);
app.use('/memberships', membership_routes_1.default);
app.use('/contracts', contract_routes_1.default);
app.use('/clients', client_routes_1.default);
app.use('/schedules', schedule_routes_1.default);
app.use('/roles', role_routes_1.default);
app.use('/trainers', trainer_routes_1.default);
app.use('/dashboard', dashboard_routes_1.default);
app.use('/dashboard-mobile', dashboardmobile_routes_1.default);
app.use('/gym-settings', gymSettings_routes_1.default);
app.use('/validation', validation_routes_1.default);
// Ruta de prueba - Mobile dashboard API available
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'API funcionando!',
        mobile_dashboard: 'Available at /dashboard-mobile/*'
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
app.use(error_middleware_1.errorHandler);
exports.default = app;
