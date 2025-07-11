import { RequestHandler, Router } from "express";
import { ClientController } from "../controllers/client.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { 
    canViewClients, 
    canCreateClients, 
    canUpdateClients, 
    canDeleteClients, 
    canSearchClients 
} from '../middlewares/client.middleware';

const router = Router();

router.use(verifyToken as unknown as RequestHandler);


const clientController = new ClientController();

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
router.post("/", canCreateClients as unknown as RequestHandler,
    clientController.create.bind(clientController) as unknown as RequestHandler
);

// PUT /api/clients/:id - Update an existing client
router.put("/:id", canUpdateClients as unknown as RequestHandler,
    clientController.update.bind(clientController) as unknown as RequestHandler
);

// DELETE /api/clients/:id - Delete a client
router.delete("/:id", canDeleteClients as unknown as RequestHandler,
    clientController.delete.bind(clientController) as unknown as RequestHandler
);

// GET /api/clients/:id/beneficiaries - Get client beneficiaries
router.get("/:id/beneficiaries", canViewClients as unknown as RequestHandler,
    clientController.getBeneficiaries.bind(clientController) as unknown as RequestHandler
);

export default router;