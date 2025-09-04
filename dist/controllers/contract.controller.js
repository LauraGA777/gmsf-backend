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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractController = void 0;
const contract_service_1 = require("../services/contract.service");
const contract_validator_1 = require("../validators/contract.validator");
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const contract_1 = __importDefault(require("../models/contract"));
const membership_1 = __importDefault(require("../models/membership"));
const person_model_1 = __importDefault(require("../models/person.model"));
const user_1 = __importDefault(require("../models/user"));
const contractService = new contract_service_1.ContractService();
// Esquema de validación para estadísticas
const statsQuerySchema = zod_1.z.object({
    period: zod_1.z.enum(['daily', 'monthly', 'yearly']).optional().default('monthly'),
    date: zod_1.z.string().optional(),
    month: zod_1.z.string().optional(),
    year: zod_1.z.string().optional()
});
class ContractController {
    // Get all contracts
    getAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("🔍 DEBUG ContractController.getAll: Query original:", req.query);
                const query = contract_validator_1.contractQuerySchema.parse(req.query);
                console.log("🔍 DEBUG ContractController.getAll: Query parseado:", query);
                // Aplicar filtro de usuario si existe
                const userFilter = req.userFilter;
                console.log("🔍 DEBUG ContractController.getAll: UserFilter:", userFilter);
                if (userFilter) {
                    Object.assign(query, userFilter);
                    console.log("✅ DEBUG ContractController.getAll: Query con filtro aplicado:", query);
                }
                const result = yield contractService.findAll(query);
                console.log("✅ DEBUG ContractController.getAll: Resultado del servicio:", {
                    dataLength: result.data.length,
                    pagination: result.pagination
                });
                return apiResponse_1.default.success(res, result.data, "Contratos obtenidos correctamente", result.pagination);
            }
            catch (error) {
                console.error("❌ DEBUG ContractController.getAll: Error:", error);
                next(error);
            }
        });
    }
    // Get contract by ID
    getById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = contract_validator_1.contractIdSchema.parse(req.params);
                const contract = yield contractService.findById(id);
                return apiResponse_1.default.success(res, contract, "Contrato obtenido correctamente");
            }
            catch (error) {
                next(error);
            }
        });
    }
    // Create a new contract
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                console.log("--- DEBUG: Received request body in controller ---", req.body);
                const data = contract_validator_1.createContractSchema.parse(req.body);
                // Extract user ID from JWT token
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return apiResponse_1.default.error(res, "Usuario no autenticado", 401);
                }
                // Add user ID to data
                const contractData = Object.assign(Object.assign({}, data), { usuario_registro: userId });
                const contract = yield contractService.create(contractData);
                return apiResponse_1.default.success(res, contract, "Contrato creado correctamente", undefined, 201);
            }
            catch (error) {
                next(error);
            }
        });
    }
    // Update an existing contract
    update(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            console.log("--- [Controller] Entering update method ---");
            try {
                console.log("--- [Controller] Update - Params ---", req.params);
                console.log("--- [Controller] Update - Body ---", req.body);
                const { id } = contract_validator_1.contractIdSchema.parse(req.params);
                console.log("--- [Controller] Update - Step 1: Parsed ID ---", { id });
                const data = contract_validator_1.updateContractSchema.parse(req.body);
                console.log("--- [Controller] Update - Step 2: Parsed body data ---", data);
                // Extract user ID from JWT token
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return apiResponse_1.default.error(res, "Usuario no autenticado", 401);
                }
                // Add user ID to data
                const updateData = Object.assign(Object.assign({}, data), { usuario_actualizacion: userId });
                console.log("--- [Controller] Update - Step 2.5: Added user ID ---", { userId });
                const contract = yield contractService.update(id, updateData);
                console.log("--- [Controller] Update - Step 3: Service call successful ---");
                return apiResponse_1.default.success(res, contract, "Contrato actualizado correctamente");
            }
            catch (error) {
                console.error("--- [Controller] ERROR in update method ---", error);
                next(error);
            }
        });
    }
    // Delete a contract
    delete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = contract_validator_1.contractIdSchema.parse(req.params);
                // Assuming user ID is available in req.user.id from auth middleware
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const result = yield contractService.delete(id, userId);
                return apiResponse_1.default.success(res, result, "Contrato cancelado correctamente");
            }
            catch (error) {
                next(error);
            }
        });
    }
    // Get contract history
    getHistory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = contract_validator_1.contractIdSchema.parse(req.params);
                const history = yield contractService.getHistory(id);
                return apiResponse_1.default.success(res, history, "Historial de contrato obtenido correctamente");
            }
            catch (error) {
                next(error);
            }
        });
    }
    // Get contract statistics
    getStats(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🔍 Contract Stats - Request params:', req.query);
                const { period, date, month, year } = statsQuerySchema.parse(req.query);
                let startDate;
                let endDate;
                // Configurar fechas según el período
                if (period === 'daily') {
                    const targetDate = date ? new Date(date) : new Date();
                    startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
                    endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
                }
                else if (period === 'monthly') {
                    const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();
                    const targetYear = year ? parseInt(year) : new Date().getFullYear();
                    startDate = new Date(targetYear, targetMonth, 1);
                    endDate = new Date(targetYear, targetMonth + 1, 0);
                }
                else { // yearly
                    const targetYear = year ? parseInt(year) : new Date().getFullYear();
                    startDate = new Date(targetYear, 0, 1);
                    endDate = new Date(targetYear, 11, 31);
                }
                console.log('📅 Contract Stats - Date range:', { startDate, endDate, period });
                // Obtener estadísticas básicas
                const [totalContracts, activeContracts, expiredContracts, cancelledContracts, newContracts] = yield Promise.all([
                    // Total contratos
                    contract_1.default.count().catch(error => {
                        console.error('Error counting total contracts:', error);
                        return 0;
                    }),
                    // Contratos activos
                    contract_1.default.count({
                        where: {
                            estado: 'Activo',
                            fecha_inicio: { [sequelize_1.Op.lte]: new Date() },
                            fecha_fin: { [sequelize_1.Op.gte]: new Date() }
                        }
                    }).catch(error => {
                        console.error('Error counting active contracts:', error);
                        return 0;
                    }),
                    // Contratos expirados
                    contract_1.default.count({
                        where: {
                            estado: 'Activo',
                            fecha_fin: { [sequelize_1.Op.lt]: new Date() }
                        }
                    }).catch(error => {
                        console.error('Error counting expired contracts:', error);
                        return 0;
                    }),
                    // Contratos cancelados
                    contract_1.default.count({
                        where: {
                            estado: 'Cancelado'
                        }
                    }).catch(error => {
                        console.error('Error counting cancelled contracts:', error);
                        return 0;
                    }),
                    // Nuevos contratos en el período
                    contract_1.default.count({
                        where: {
                            fecha_inicio: {
                                [sequelize_1.Op.between]: [startDate, endDate]
                            }
                        }
                    }).catch(error => {
                        console.error('Error counting new contracts:', error);
                        return 0;
                    })
                ]);
                console.log('📊 Contract Stats - Basic counts:', {
                    totalContracts,
                    activeContracts,
                    expiredContracts,
                    cancelledContracts,
                    newContracts
                });
                // Obtener contratos recientes de forma segura
                let recentContracts = [];
                try {
                    const contractsResult = yield contract_1.default.findAll({
                        limit: 10,
                        order: [['fecha_inicio', 'DESC']],
                        include: [
                            {
                                model: person_model_1.default,
                                as: 'persona',
                                required: false,
                                include: [{
                                        model: user_1.default,
                                        as: 'usuario',
                                        attributes: ['nombre', 'apellido'],
                                        required: false
                                    }]
                            },
                            {
                                model: membership_1.default,
                                as: 'membresia',
                                attributes: ['nombre', 'precio'],
                                required: false
                            }
                        ]
                    });
                    recentContracts = contractsResult.map((contract) => ({
                        id: contract.id,
                        codigo: contract.codigo,
                        membresia_precio: contract.membresia_precio,
                        fecha_inicio: contract.fecha_inicio,
                        fecha_fin: contract.fecha_fin,
                        estado: contract.estado,
                        persona: contract.persona ? {
                            usuario: contract.persona.usuario ? {
                                nombre: contract.persona.usuario.nombre,
                                apellido: contract.persona.usuario.apellido
                            } : undefined
                        } : undefined,
                        membresia: contract.membresia ? {
                            nombre: contract.membresia.nombre,
                            precio: contract.membresia.precio
                        } : undefined
                    }));
                    console.log('📋 Contract Stats - Recent contracts found:', recentContracts.length);
                }
                catch (error) {
                    console.error('Error fetching recent contracts:', error);
                    recentContracts = [];
                }
                // Calcular ingresos de forma segura
                let totalRevenue = 0;
                let periodRevenue = 0;
                try {
                    const totalRevenueResult = yield contract_1.default.sum('membresia_precio', {
                        where: {
                            estado: 'Activo'
                        }
                    });
                    totalRevenue = totalRevenueResult || 0;
                    console.log('💰 Contract Stats - Total revenue:', totalRevenue);
                }
                catch (error) {
                    console.error('Error calculating total revenue:', error);
                }
                try {
                    const periodRevenueResult = yield contract_1.default.sum('membresia_precio', {
                        where: {
                            fecha_inicio: {
                                [sequelize_1.Op.between]: [startDate, endDate]
                            }
                        }
                    });
                    periodRevenue = periodRevenueResult || 0;
                    console.log('💰 Contract Stats - Period revenue:', periodRevenue);
                }
                catch (error) {
                    console.error('Error calculating period revenue:', error);
                }
                const stats = {
                    totalContracts,
                    activeContracts,
                    expiredContracts,
                    cancelledContracts,
                    newContracts,
                    totalRevenue,
                    periodRevenue,
                    recentContracts,
                    period: {
                        type: period,
                        startDate,
                        endDate
                    }
                };
                console.log('✅ Contract Stats - Final response:', Object.assign(Object.assign({}, stats), { recentContracts: `${stats.recentContracts.length} contracts` }));
                return apiResponse_1.default.success(res, stats, "Estadísticas de contratos obtenidas correctamente");
            }
            catch (error) {
                console.error('❌ Contract Stats - Fatal error:', error);
                return apiResponse_1.default.error(res, "Error al obtener estadísticas de contratos", 500, process.env.NODE_ENV === 'development' ? error : undefined);
            }
        });
    }
}
exports.ContractController = ContractController;
