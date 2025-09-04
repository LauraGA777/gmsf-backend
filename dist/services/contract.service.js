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
exports.ContractService = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const models_1 = require("../models");
const apiError_1 = require("../errors/apiError");
class ContractService {
    _calculateNewEndDateOnUnfreeze(contract) {
        if (!contract.fecha_congelacion) {
            // Devuelve la fecha de fin actual si no hay fecha de congelación (no debería pasar si la lógica es correcta)
            return contract.fecha_fin;
        }
        const frozenFrom = new Date(contract.fecha_congelacion);
        const frozenUntil = new Date(); // Ahora
        const frozenDuration = frozenUntil.getTime() - frozenFrom.getTime();
        const currentEndDate = new Date(contract.fecha_fin);
        const newEndDate = new Date(currentEndDate.getTime() + frozenDuration);
        return newEndDate;
    }
    // Get all contracts with pagination and filters
    findAll(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page = 1, limit = 10, search = "", estado, id_persona, fecha_inicio, fecha_fin, } = options;
            console.log("🔍 DEBUG ContractService.findAll: Opciones recibidas:", options);
            const offset = (page - 1) * limit;
            const whereClause = {};
            if (estado) {
                whereClause.estado = estado;
            }
            if (id_persona) {
                whereClause.id_persona = id_persona;
                console.log("✅ DEBUG ContractService.findAll: Filtro id_persona aplicado:", id_persona);
            }
            if (fecha_inicio) {
                whereClause.fecha_inicio = { [sequelize_1.Op.gte]: new Date(fecha_inicio) };
            }
            if (fecha_fin) {
                whereClause.fecha_fin = { [sequelize_1.Op.lte]: new Date(fecha_fin) };
            }
            if (search) {
                whereClause.codigo = { [sequelize_1.Op.iLike]: `%${search}%` };
            }
            console.log("🔍 DEBUG ContractService.findAll: Cláusula WHERE final:", whereClause);
            const { count, rows } = yield models_1.Contract.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: models_1.Person,
                        as: "persona",
                        required: false,
                        include: [
                            {
                                model: models_1.User,
                                as: "usuario",
                                required: false,
                                attributes: [
                                    "id",
                                    "nombre",
                                    "apellido",
                                    "correo",
                                    "telefono",
                                    "tipo_documento",
                                    "numero_documento",
                                ],
                            },
                        ],
                    },
                    {
                        model: models_1.Membership,
                        as: "membresia",
                        required: false,
                    },
                    {
                        model: models_1.User,
                        as: "registrador",
                        required: false,
                        attributes: ["id", "nombre", "apellido"],
                    },
                    {
                        model: models_1.User,
                        as: "actualizador",
                        required: false,
                        attributes: ["id", "nombre", "apellido"],
                    },
                ],
                limit,
                offset,
                order: [["fecha_registro", "DESC"]],
            });
            console.log(`--- [Service - findAll] Found ${rows.length} contracts ---`);
            // Debug: Log first contract with all relations
            if (rows.length > 0) {
                const firstContract = rows[0];
                console.log(`--- [Service - findAll] First contract debug ---`, {
                    id: firstContract.id,
                    codigo: firstContract.codigo,
                    id_persona: firstContract.id_persona,
                    id_membresia: firstContract.id_membresia,
                    membresia_precio: firstContract.membresia_precio,
                    estado: firstContract.estado,
                    persona: firstContract.persona ? {
                        id_persona: firstContract.persona.id_persona,
                        usuario: firstContract.persona.usuario ? {
                            nombre: firstContract.persona.usuario.nombre,
                            apellido: firstContract.persona.usuario.apellido,
                            numero_documento: firstContract.persona.usuario.numero_documento,
                        } : null
                    } : null,
                    membresia: firstContract.membresia ? {
                        id: firstContract.membresia.id,
                        nombre: firstContract.membresia.nombre,
                        precio: firstContract.membresia.precio,
                    } : null
                });
            }
            return {
                data: rows,
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit),
                },
            };
        });
    }
    // Get contract by ID
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = yield models_1.Contract.findByPk(id, {
                include: [
                    {
                        model: models_1.Person,
                        as: "persona",
                        required: false,
                        include: [
                            {
                                model: models_1.User,
                                as: "usuario",
                                required: false,
                                attributes: [
                                    "id",
                                    "nombre",
                                    "apellido",
                                    "correo",
                                    "telefono",
                                    "numero_documento",
                                    "tipo_documento",
                                ],
                            },
                        ],
                    },
                    {
                        model: models_1.Membership,
                        as: "membresia",
                        required: false,
                    },
                    {
                        model: models_1.User,
                        as: "registrador",
                        required: false,
                        attributes: ["id", "nombre", "apellido"],
                    },
                    {
                        model: models_1.User,
                        as: "actualizador",
                        required: false,
                        attributes: ["id", "nombre", "apellido"],
                    },
                    {
                        model: models_1.ContractHistory,
                        as: "historial",
                        required: false,
                        include: [
                            {
                                model: models_1.User,
                                as: "usuarioDelCambio",
                                required: false,
                                attributes: ["id", "nombre", "apellido"],
                            },
                        ],
                    },
                ],
            });
            if (!contract) {
                throw new apiError_1.ApiError("Contrato no encontrado", 404);
            }
            return contract;
        });
    }
    // Create a new contract
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("--- [Service] Entering create method ---", { data });
            const transaction = yield db_1.default.transaction();
            try {
                // Validate client exists
                const client = yield models_1.Person.findByPk(data.id_persona, { transaction });
                if (!client) {
                    yield transaction.rollback();
                    throw new apiError_1.ApiError("Cliente no encontrado", 404);
                }
                console.log("--- [Service] Step 1: Client found ---", { id: client.id_persona });
                // Validate membership exists
                const membership = yield models_1.Membership.findByPk(data.id_membresia, {
                    transaction,
                });
                if (!membership) {
                    yield transaction.rollback();
                    throw new apiError_1.ApiError("Membresía no encontrada", 404);
                }
                console.log("--- [Service] Step 2: Membership found ---", { id: membership.id, precio: membership.precio });
                // Use string comparison for dates to avoid timezone issues.
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                const todayString = `${year}-${month}-${day}`;
                if (data.fecha_inicio < todayString) {
                    yield transaction.rollback();
                    throw new apiError_1.ApiError("La fecha de inicio no puede ser anterior a la fecha actual", 400);
                }
                console.log("--- [Service] Step 3: Start date validated ---");
                // Calculate end date based on membership vigencia_dias
                const startDate = new Date(`${data.fecha_inicio}T00:00:00`);
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + membership.vigencia_dias);
                // Generate contract code
                const lastContract = yield models_1.Contract.findOne({
                    order: [["id", "DESC"]],
                    transaction,
                });
                let nextId = 1;
                if (lastContract) {
                    const lastCodeNumber = parseInt(lastContract.codigo.substring(1), 10);
                    if (!isNaN(lastCodeNumber)) {
                        nextId = lastCodeNumber + 1;
                    }
                    else {
                        // Fallback if the last code is not a number (e.g., 'C-TEMP')
                        // Use the last ID + 1 as a safe bet.
                        nextId = lastContract.id + 1;
                    }
                }
                const contractCode = `C${String(nextId).padStart(4, "0")}`;
                console.log("--- [Service] Step 4: Generated contract code ---", { contractCode });
                const contractToCreate = {
                    codigo: contractCode,
                    id_persona: data.id_persona,
                    id_membresia: data.id_membresia,
                    fecha_inicio: startDate,
                    fecha_fin: endDate,
                    membresia_precio: membership.precio, // Always use the price from the DB
                    estado: "Activo",
                    usuario_registro: data.usuario_registro,
                };
                console.log("--- [Service] Step 5: Attempting to create contract with this data ---", contractToCreate);
                // Create contract
                const contract = yield models_1.Contract.create(contractToCreate, { transaction });
                console.log("--- [Service] Step 6: Contract created successfully in DB ---", { contractId: contract.id });
                // Create contract history
                yield models_1.ContractHistory.create({
                    id_contrato: contract.id,
                    estado_anterior: undefined,
                    estado_nuevo: "Activo",
                    fecha_cambio: new Date(),
                    usuario_cambio: data.usuario_registro,
                    motivo: "Creación de contrato"
                }, { transaction });
                console.log("--- [Service] Step 7: Contract history created ---");
                yield transaction.commit();
                console.log("--- [Service] Step 8: Transaction committed ---");
                // Return the created contract with all relations
                return this.findById(contract.id);
            }
            catch (error) {
                yield transaction.rollback();
                console.error("--- [Service] ERROR in create method, transaction rolled back ---", error);
                if (error instanceof apiError_1.ApiError) {
                    throw error;
                }
                throw new apiError_1.ApiError(`Error al crear el contrato: ${error.message}`, 500);
            }
        });
    }
    // Update an existing contract
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`--- [Service] Entering update method for contract ID: ${id} ---`, { data });
            const transaction = yield db_1.default.transaction();
            try {
                const contract = yield models_1.Contract.findByPk(id, { transaction });
                if (!contract) {
                    yield transaction.rollback();
                    throw new apiError_1.ApiError("Contrato no encontrado", 404);
                }
                console.log("--- [Service] Update - Step 1: Found contract ---", { id: contract.id, estado: contract.estado });
                const oldState = contract.estado;
                const updates = {
                    usuario_actualizacion: data.usuario_actualizacion,
                };
                // Handle freezing logic
                if (data.estado === "Congelado" && oldState !== "Congelado") {
                    updates.fecha_congelacion = new Date();
                }
                // Handle unfreezing logic
                if (data.estado === "Activo" && oldState === "Congelado") {
                    updates.fecha_fin = this._calculateNewEndDateOnUnfreeze(contract);
                    updates.fecha_congelacion = null; // Clear the freeze date
                }
                console.log("--- [Service] Update - Received data ---", data);
                const hasMembershipChanged = data.id_membresia && data.id_membresia !== contract.id_membresia;
                const hasStartDateChanged = data.fecha_inicio && new Date(data.fecha_inicio).getTime() !== new Date(contract.fecha_inicio).getTime();
                console.log("--- [Service] Update - Change detection ---", { hasMembershipChanged, hasStartDateChanged });
                // If membership or start date changes, recalculate price and end date
                if (hasMembershipChanged || hasStartDateChanged) {
                    console.log("--- [Service] Update - Membership or Start Date change detected ---");
                    const newMembershipId = data.id_membresia || contract.id_membresia;
                    const newStartDate = data.fecha_inicio ? new Date(`${data.fecha_inicio}T00:00:00`) : new Date(contract.fecha_inicio);
                    const newMembership = yield models_1.Membership.findByPk(newMembershipId, { transaction });
                    if (!newMembership) {
                        throw new apiError_1.ApiError("Nueva membresía no encontrada", 404);
                    }
                    console.log("--- [Service] Update - Step 2: Found new membership ---", { id: newMembership.id, precio: newMembership.precio, vigencia: newMembership.vigencia_dias });
                    updates.id_membresia = newMembership.id;
                    updates.membresia_precio = newMembership.precio;
                    updates.fecha_inicio = newStartDate;
                    // Recalculate end date
                    const endDate = new Date(newStartDate);
                    endDate.setDate(endDate.getDate() + newMembership.vigencia_dias);
                    updates.fecha_fin = endDate;
                    console.log("--- [Service] Update - Step 3: Recalculated dates and price ---", { newPrice: updates.membresia_precio, newEndDate: updates.fecha_fin });
                }
                // If state is being changed
                if (data.estado && data.estado !== oldState) {
                    updates.estado = data.estado;
                    console.log("--- [Service] Update - State change detected ---", { oldState, newState: updates.estado });
                }
                // If only reason is provided (for state changes)
                if (data.motivo) {
                    updates.motivo = data.motivo;
                    console.log("--- [Service] Update - Reason provided ---", { motivo: data.motivo });
                }
                console.log("--- [Service] Update - Step 4: Applying updates to contract ---", updates);
                // Update contract data
                yield contract.update(updates, { transaction });
                console.log("--- [Service] Update - Step 5: Contract updated in DB ---");
                // Create contract history if state changed
                if (updates.estado) {
                    console.log("--- [Service] Update - Creating history for state change ---");
                    yield models_1.ContractHistory.create({
                        id_contrato: id,
                        estado_anterior: oldState,
                        estado_nuevo: updates.estado,
                        usuario_cambio: data.usuario_actualizacion,
                        motivo: data.motivo || "Actualización de contrato",
                    }, { transaction });
                    console.log("--- [Service] Update - Step 6: History created for state change ---");
                }
                yield transaction.commit();
                console.log("--- [Service] Update - Step 7: Transaction committed ---");
                // Return the updated contract with all relations
                return this.findById(id);
            }
            catch (error) {
                yield transaction.rollback();
                console.error(`--- [Service] ERROR in update method for contract ID: ${id} ---`, error);
                if (error instanceof apiError_1.ApiError) {
                    throw error;
                }
                throw new apiError_1.ApiError(`Error al actualizar el contrato: ${error.message}`, 500);
            }
        });
    }
    // Delete a contract (soft delete by changing state to 'Cancelado')
    delete(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield db_1.default.transaction();
            try {
                const contract = yield models_1.Contract.findByPk(id, { transaction });
                if (!contract) {
                    yield transaction.rollback();
                    throw new apiError_1.ApiError("Contrato no encontrado", 404);
                }
                const oldState = contract.estado;
                // Soft delete - change state to 'Cancelado'
                yield contract.update({
                    estado: "Cancelado",
                    usuario_actualizacion: userId,
                }, { transaction });
                // Create contract history
                yield models_1.ContractHistory.create({
                    id_contrato: id,
                    estado_anterior: oldState,
                    estado_nuevo: "Cancelado",
                    usuario_cambio: userId,
                    motivo: "Cancelación de contrato",
                }, { transaction });
                yield transaction.commit();
                return { success: true, message: "Contrato cancelado correctamente" };
            }
            catch (error) {
                yield transaction.rollback();
                console.error(`--- [Service] ERROR in delete method for contract ID: ${id} ---`, error);
                if (error instanceof apiError_1.ApiError) {
                    throw error;
                }
                throw new apiError_1.ApiError(`Error al cancelar el contrato: ${error.message}`, 500);
            }
        });
    }
    // Get contract history
    getHistory(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const history = yield models_1.ContractHistory.findAll({
                where: { id_contrato: id },
                include: [
                    {
                        model: models_1.Contract,
                        as: "contrato",
                    },
                    {
                        model: models_1.User,
                        as: "usuarioDelCambio",
                        attributes: ["id", "nombre", "apellido"],
                    },
                ],
                order: [["fecha_cambio", "DESC"]],
            });
            return history;
        });
    }
}
exports.ContractService = ContractService;
