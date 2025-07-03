import { RequestHandler, Router } from "express";
import { ClientController } from "../controllers/client.controller";
import { verifyToken, hasPermission, hasAnyPermission } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../utils/permissions";

const router = Router();
const clientController = new ClientController();

// GET /api/clients - Get all clients
router.get("/", 
    verifyToken as unknown as RequestHandler,
    hasPermission(PERMISSIONS.VIEW_CLIENTS) as unknown as RequestHandler,
    clientController.getAll.bind(clientController) as unknown as RequestHandler
);

// GET /api/clients/check-user - Check if a user exists by document
router.get("/check-user",
    verifyToken as unknown as RequestHandler,
    hasAnyPermission([PERMISSIONS.VIEW_CLIENTS, PERMISSIONS.CREATE_CLIENTS]) as unknown as RequestHandler,
    clientController.getByDocument.bind(clientController) as unknown as RequestHandler
);

// GET /api/clients/:id - Get client by ID
router.get("/:id", 
    verifyToken as unknown as RequestHandler,
    hasPermission(PERMISSIONS.VIEW_CLIENTS) as unknown as RequestHandler,
    clientController.getById.bind(clientController) as unknown as RequestHandler
);

// POST /api/clients - Create a new client
router.post("/", 
    verifyToken as unknown as RequestHandler,
    hasPermission(PERMISSIONS.CREATE_CLIENTS) as unknown as RequestHandler,
    clientController.create.bind(clientController) as unknown as RequestHandler
);

// PUT /api/clients/:id - Update an existing client
router.put("/:id", 
    verifyToken as unknown as RequestHandler,
    hasPermission(PERMISSIONS.UPDATE_CLIENTS) as unknown as RequestHandler,
    clientController.update.bind(clientController) as unknown as RequestHandler
);

// DELETE /api/clients/:id - Delete a client
router.delete("/:id", 
    verifyToken as unknown as RequestHandler,
    hasAnyPermission([PERMISSIONS.MANAGE_CLIENTS, PERMISSIONS.DELETE_USERS]) as unknown as RequestHandler,
    clientController.delete.bind(clientController) as unknown as RequestHandler
);

// GET /api/clients/:id/beneficiaries - Get client beneficiaries
router.get("/:id/beneficiaries", 
    verifyToken as unknown as RequestHandler,
    hasPermission(PERMISSIONS.VIEW_CLIENTS) as unknown as RequestHandler,
    clientController.getBeneficiaries.bind(clientController) as unknown as RequestHandler
);

export default router;