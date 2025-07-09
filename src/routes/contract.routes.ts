import { RequestHandler, Router } from "express";
import { ContractController } from "../controllers/contract.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { 
    canViewContracts, 
    canCreateContracts, 
    canUpdateContracts, 
    canDeleteContracts,
    canViewContractHistory,
    canViewContractStats
} from "../middlewares/contract.middleware";
import {
    createContractSchema,
    updateContractSchema,
    contractQuerySchema,
    contractIdSchema,
} from "../validators/contract.validator";

const router = Router();
const contractController = new ContractController();

// GET /api/contracts/stats - Get contract statistics
router.get("/stats", 
    verifyToken as unknown as RequestHandler,
    canViewContractStats as unknown as RequestHandler,
    contractController.getStats.bind(contractController) as unknown as RequestHandler
);

// GET /api/contracts - Get all contracts
router.get("/", 
    verifyToken as unknown as RequestHandler,
    canViewContracts as unknown as RequestHandler,
    validate(contractQuerySchema, "query"),
    contractController.getAll.bind(contractController) as unknown as RequestHandler
);

// GET /api/contracts/:id - Get contract by ID
router.get("/:id", 
    verifyToken as unknown as RequestHandler,
    canViewContracts as unknown as RequestHandler,
    validate(contractIdSchema, "params"),
    contractController.getById.bind(contractController) as unknown as RequestHandler
);

// POST /api/contracts - Create a new contract
router.post("/", 
    verifyToken as unknown as RequestHandler,
    canCreateContracts as unknown as RequestHandler,
    validate(createContractSchema, "body"),
    contractController.create.bind(contractController) as unknown as RequestHandler
);

// PUT /api/contracts/:id - Update a contract
router.put("/:id", 
    verifyToken as unknown as RequestHandler,
    canUpdateContracts as unknown as RequestHandler,
    validate(contractIdSchema, "params"),
    validate(updateContractSchema, "body"),
    contractController.update.bind(contractController) as unknown as RequestHandler
);

// DELETE /api/contracts/:id - Delete a contract
router.delete("/:id", 
    verifyToken as unknown as RequestHandler,
    canDeleteContracts as unknown as RequestHandler,
    validate(contractIdSchema, "params"),
    contractController.delete.bind(contractController) as unknown as RequestHandler
);

// GET /api/contracts/:id/history - Get contract history
router.get("/:id/history", 
    verifyToken as unknown as RequestHandler,
    canViewContractHistory as unknown as RequestHandler,
    validate(contractIdSchema, "params"),
    contractController.getHistory.bind(contractController) as unknown as RequestHandler
);

export default router;
