"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contract_controller_1 = require("../controllers/contract.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const contract_middleware_1 = require("../middlewares/contract.middleware");
const contract_validator_1 = require("../validators/contract.validator");
const router = (0, express_1.Router)();
const contractController = new contract_controller_1.ContractController();
// GET /api/contracts/stats - Get contract statistics
router.get("/stats", auth_middleware_1.verifyToken, contract_middleware_1.canViewContractStats, contractController.getStats.bind(contractController));
// GET /api/contracts - Get all contracts
router.get("/", auth_middleware_1.verifyToken, contract_middleware_1.canViewOwnContracts, (0, validate_middleware_1.validate)(contract_validator_1.contractQuerySchema, "query"), contractController.getAll.bind(contractController));
// GET /api/contracts/:id - Get contract by ID
router.get("/:id", auth_middleware_1.verifyToken, contract_middleware_1.canViewContractDetails, (0, validate_middleware_1.validate)(contract_validator_1.contractIdSchema, "params"), contractController.getById.bind(contractController));
// POST /api/contracts - Create a new contract
router.post("/", auth_middleware_1.verifyToken, contract_middleware_1.canCreateContracts, (0, validate_middleware_1.validate)(contract_validator_1.createContractSchema, "body"), contractController.create.bind(contractController));
// PUT /api/contracts/:id - Update a contract
router.put("/:id", auth_middleware_1.verifyToken, contract_middleware_1.canUpdateContracts, (0, validate_middleware_1.validate)(contract_validator_1.contractIdSchema, "params"), (0, validate_middleware_1.validate)(contract_validator_1.updateContractSchema, "body"), contractController.update.bind(contractController));
// DELETE /api/contracts/:id - Delete a contract
router.delete("/:id", auth_middleware_1.verifyToken, contract_middleware_1.canDeleteContracts, (0, validate_middleware_1.validate)(contract_validator_1.contractIdSchema, "params"), contractController.delete.bind(contractController));
// GET /api/contracts/:id/history - Get contract history
router.get("/:id/history", auth_middleware_1.verifyToken, contract_middleware_1.canViewContractHistory, (0, validate_middleware_1.validate)(contract_validator_1.contractIdSchema, "params"), contractController.getHistory.bind(contractController));
exports.default = router;
