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
exports.ClientController = void 0;
const client_service_1 = require("../services/client.service");
const client_validator_1 = require("../validators/client.validator");
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const apiError_1 = require("../errors/apiError");
class ClientController {
    constructor() {
        this.clientService = new client_service_1.ClientService();
    }
    // Get all clients
    getAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = client_validator_1.clientQuerySchema.parse(req.query);
                const result = yield this.clientService.findAll(query);
                apiResponse_1.default.success(res, result.data, "Clientes obtenidos correctamente", result.pagination);
            }
            catch (error) {
                next(error);
            }
        });
    }
    // Get client by ID
    getById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = client_validator_1.clientIdSchema.parse(req.params);
                const client = yield this.clientService.findById(id);
                apiResponse_1.default.success(res, client, "Cliente obtenido correctamente");
            }
            catch (error) {
                next(error);
            }
        });
    }
    // Get user by document
    checkUserByDocument(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { tipo_documento, numero_documento } = client_validator_1.clientDocumentSchema.parse(req.params);
                try {
                    const user = yield this.clientService.findByDocument(tipo_documento, numero_documento);
                    // Usuario encontrado
                    apiResponse_1.default.success(res, {
                        userExists: true,
                        userData: user
                    }, "Usuario encontrado correctamente");
                }
                catch (error) {
                    if (error instanceof apiError_1.ApiError && error.statusCode === 404) {
                        // Usuario no encontrado - esto es válido, no es un error
                        apiResponse_1.default.success(res, {
                            userExists: false,
                            userData: null
                        }, "Usuario no encontrado");
                    }
                    else {
                        throw error;
                    }
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    // Create a new client
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("--- [Controller] Create Client: Received body ---", req.body);
                const data = client_validator_1.createClientSchema.parse(req.body);
                console.log("--- [Controller] Create Client: Parsed data ---", JSON.stringify(data, null, 2));
                const client = yield this.clientService.create(data);
                console.log("--- [Controller] Create Client: Service response ---", client);
                apiResponse_1.default.success(res, client, "Cliente creado correctamente", undefined, 201);
            }
            catch (error) {
                console.error("--- [Controller] ERROR in create ---", error);
                next(error);
            }
        });
    }
    // Update an existing client
    update(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("--- [Controller] Update Client: Raw body ---", req.body);
                const { id } = client_validator_1.clientIdSchema.parse(req.params);
                const data = client_validator_1.updateClientSchema.parse(req.body);
                console.log("--- [Controller] Update Client: Parsed data ---", JSON.stringify(data, null, 2));
                const client = yield this.clientService.update(id, data);
                console.log("--- [Controller] Update Client: Service response ---", client);
                apiResponse_1.default.success(res, client, "Cliente actualizado correctamente");
            }
            catch (error) {
                console.error("--- [Controller] ERROR in update ---", error);
                next(error);
            }
        });
    }
    // Delete a client
    delete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = client_validator_1.clientIdSchema.parse(req.params);
                const result = yield this.clientService.delete(id);
                apiResponse_1.default.success(res, result, "Cliente eliminado correctamente");
            }
            catch (error) {
                next(error);
            }
        });
    }
    // Get client beneficiaries
    getBeneficiaries(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = client_validator_1.clientIdSchema.parse(req.params);
                const beneficiaries = yield this.clientService.getBeneficiaries(id);
                apiResponse_1.default.success(res, beneficiaries, "Beneficiarios obtenidos correctamente");
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Obtener información propia del cliente autenticado
     */
    getMyInfo(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({
                        status: 'error',
                        message: 'Usuario no autenticado'
                    });
                    return;
                }
                console.log("--- [Controller] Getting my info for userId:", userId);
                const client = yield this.clientService.findByUserId(userId);
                res.status(200).json({
                    status: 'success',
                    message: 'Tu información obtenida correctamente',
                    data: client
                });
            }
            catch (error) {
                console.error('Error en getMyInfo:', error);
                next(error);
            }
        });
    }
    /**
     * Obtener beneficiarios propios del cliente autenticado
     */
    getMyBeneficiaries(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({
                        status: 'error',
                        message: 'Usuario no autenticado'
                    });
                    return;
                }
                console.log("--- [Controller] Get My Beneficiaries: User ID ---", userId);
                const beneficiaries = yield this.clientService.getBeneficiariesByUserId(userId);
                res.status(200).json({
                    status: 'success',
                    message: 'Tus beneficiarios obtenidos correctamente',
                    data: beneficiaries
                });
            }
            catch (error) {
                console.error("--- [Controller] ERROR in getMyBeneficiaries ---", error);
                next(error);
            }
        });
    }
}
exports.ClientController = ClientController;
