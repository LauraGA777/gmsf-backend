"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_controller_1 = require("../controllers/client.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const strictValidation_middleware_1 = require("../middlewares/strictValidation.middleware");
const client_middleware_1 = require("../middlewares/client.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.verifyToken);
const clientController = new client_controller_1.ClientController();
router.get('/me', client_middleware_1.canViewClientDetails, clientController.getMyInfo.bind(clientController));
router.get('/me/beneficiaries', client_middleware_1.canViewBeneficiaries, clientController.getMyBeneficiaries.bind(clientController));
// GET /api/clients - Get all clients
router.get("/", client_middleware_1.canViewClients, clientController.getAll.bind(clientController));
// GET /api/clients/check-user/:tipo_documento/:numero_documento - Check if a user exists by document
router.get("/check-user/:tipo_documento/:numero_documento", client_middleware_1.canSearchClients, clientController.checkUserByDocument.bind(clientController));
// GET /api/clients/:id - Get client by ID
router.get("/:id", client_middleware_1.canViewClients, clientController.getById.bind(clientController));
// POST /api/clients - Create a new client
router.post("/", strictValidation_middleware_1.sanitizeEmails, strictValidation_middleware_1.sanitizePhoneNumbers, strictValidation_middleware_1.strictLengthValidation, client_middleware_1.canCreateClients, clientController.create.bind(clientController));
// PUT /api/clients/:id - Update an existing client     
router.put("/:id", strictValidation_middleware_1.sanitizeEmails, strictValidation_middleware_1.sanitizePhoneNumbers, strictValidation_middleware_1.strictLengthValidation, client_middleware_1.canUpdateClients, clientController.update.bind(clientController));
// DELETE /api/clients/:id - Delete a client
router.delete("/:id", client_middleware_1.canDeleteClients, clientController.delete.bind(clientController));
// GET /api/clients/:id/beneficiaries - Get client beneficiaries
router.get("/:id/beneficiaries", client_middleware_1.canViewClients, clientController.getBeneficiaries.bind(clientController));
exports.default = router;
