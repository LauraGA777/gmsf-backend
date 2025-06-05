import { RequestHandler, Router } from "express";
import { ContractController } from "../controllers/contract.controller";
import { verifyToken, isAdmin } from "../middlewares/auth.middleware";

const router = Router();
const contractController = new ContractController();

// GET /api/contracts - Get all contracts
router.get("/", 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    contractController.getAll.bind(contractController) as unknown as RequestHandler
);

// GET /api/contracts/:id - Get contract by ID
router.get("/:id", 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    contractController.getById.bind(contractController) as unknown as RequestHandler
);

// POST /api/contracts - Create a new contract
router.post("/", 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    contractController.create.bind(contractController) as unknown as RequestHandler
);

// PUT /api/contracts/:id - Update a contract
router.put("/:id", 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    contractController.update.bind(contractController) as unknown as RequestHandler
);

// DELETE /api/contracts/:id - Delete a contract
router.delete("/:id", 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    contractController.delete.bind(contractController) as unknown as RequestHandler
);

// POST /api/contracts/renew - Renew a contract
router.post("/renew", 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    contractController.renew.bind(contractController) as unknown as RequestHandler
);

// POST /api/contracts/freeze - Freeze a contract
router.post("/freeze", 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    contractController.freeze.bind(contractController) as unknown as RequestHandler
);

// GET /api/contracts/:id/history - Get contract history
router.get("/:id/history", 
    verifyToken as unknown as RequestHandler,
    isAdmin as unknown as RequestHandler,
    contractController.getHistory.bind(contractController) as unknown as RequestHandler
);

export default router;
