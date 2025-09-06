import { RequestHandler, Router } from "express";
import { ClientController } from "../controllers/client.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { 
    strictLengthValidation, 
    sanitizePhoneNumbers, 
    sanitizeEmails 
} from "../middlewares/strictValidation.middleware";
import { 
    canViewClients, 
    canCreateClients, 
    canUpdateClients, 
    canDeleteClients,
    canSearchClients,
    canAccessClientData,
    canViewClientDetails,
    canUpdateOwnClientData,
    canViewBeneficiaries
} from '../middlewares/client.middleware';

const router = Router();

router.use(verifyToken as unknown as RequestHandler);


const clientController = new ClientController();
router.get('/me', canViewClientDetails as unknown as RequestHandler, 
    clientController.getMyInfo.bind(clientController) as unknown as RequestHandler);

router.get('/me/beneficiaries', canViewBeneficiaries as unknown as RequestHandler, 
    clientController.getMyBeneficiaries.bind(clientController) as unknown as RequestHandler);

// GET /api/clients - Get all clients
router.get("/", canViewClients as unknown as RequestHandler,
    clientController.getAll.bind(clientController) as unknown as RequestHandler
);

// GET /api/clients/check-user/:tipo_documento/:numero_documento - Check if a user exists by document
router.get("/check-user/:tipo_documento/:numero_documento", canSearchClients as unknown as RequestHandler,
    clientController.checkUserByDocument.bind(clientController) as unknown as RequestHandler
);

// GET /api/clients/:id - Get client by ID
router.get("/:id", canViewClients as unknown as RequestHandler,
    clientController.getById.bind(clientController) as unknown as RequestHandler
);

// POST /api/clients - Create a new client
router.post("/", 
    sanitizeEmails as unknown as RequestHandler,
    sanitizePhoneNumbers as unknown as RequestHandler,
    strictLengthValidation as unknown as RequestHandler,
    canCreateClients as unknown as RequestHandler,
    clientController.create.bind(clientController) as unknown as RequestHandler
);

// PUT /api/clients/:id - Update an existing client     
router.put("/:id", 
    sanitizeEmails as unknown as RequestHandler,
    sanitizePhoneNumbers as unknown as RequestHandler,
    strictLengthValidation as unknown as RequestHandler,
    canUpdateClients as unknown as RequestHandler,
    clientController.update.bind(clientController) as unknown as RequestHandler
);

// DELETE /api/clients/:id - Delete a client
router.delete("/:id", canDeleteClients as unknown as RequestHandler,
    clientController.delete.bind(clientController) as unknown as RequestHandler
);

// PATCH /api/clients/:id/activate - Activate client
router.patch('/:id/activate', canUpdateClients as unknown as RequestHandler,
    clientController.activate.bind(clientController) as unknown as RequestHandler);

// PATCH /api/clients/:id/deactivate - Deactivate client
router.patch('/:id/deactivate', canUpdateClients as unknown as RequestHandler,
    clientController.deactivate.bind(clientController) as unknown as RequestHandler);

// GET /api/clients/:id/beneficiaries - Get client beneficiaries
router.get("/:id/beneficiaries", canViewClients as unknown as RequestHandler,
    clientController.getBeneficiaries.bind(clientController) as unknown as RequestHandler
);

export default router;