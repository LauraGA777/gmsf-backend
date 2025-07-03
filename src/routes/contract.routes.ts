import { RequestHandler, Router } from "express";
import { ContractController } from "../controllers/contract.controller";
import { verifyToken, hasPermission, hasAnyPermission } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "../utils/permissions";

const router = Router();
const contractController = new ContractController();

// GET /api/contracts - Get all contracts
router.get("/", 
    verifyToken as unknown as RequestHandler,
    hasPermission(PERMISSIONS.VIEW_CONTRACTS) as unknown as RequestHandler,
    contractController.getAll.bind(contractController) as unknown as RequestHandler
);

// GET /api/contracts/:id - Get contract by ID
router.get("/:id", 
    verifyToken as unknown as RequestHandler,
    hasPermission(PERMISSIONS.VIEW_CONTRACTS) as unknown as RequestHandler,
    contractController.getById.bind(contractController) as unknown as RequestHandler
);

// POST /api/contracts - Create a new contract
router.post("/", 
    verifyToken as unknown as RequestHandler,
    hasPermission(PERMISSIONS.CREATE_CONTRACTS) as unknown as RequestHandler,
    contractController.create.bind(contractController) as unknown as RequestHandler
);

// PUT /api/contracts/:id - Update a contract
router.put("/:id", 
    verifyToken as unknown as RequestHandler,
    hasPermission(PERMISSIONS.UPDATE_CONTRACTS) as unknown as RequestHandler,
    contractController.update.bind(contractController) as unknown as RequestHandler
);

// DELETE /api/contracts/:id - Delete a contract
router.delete("/:id", 
    verifyToken as unknown as RequestHandler,
    hasPermission(PERMISSIONS.CANCEL_CONTRACTS) as unknown as RequestHandler,
    contractController.delete.bind(contractController) as unknown as RequestHandler
);

// GET /api/contracts/:id/history - Get contract history
router.get("/:id/history", 
    verifyToken as unknown as RequestHandler,
    hasAnyPermission([PERMISSIONS.VIEW_CONTRACTS, PERMISSIONS.MANAGE_CONTRACTS]) as unknown as RequestHandler,
    contractController.getHistory.bind(contractController) as unknown as RequestHandler
);

export default router;
