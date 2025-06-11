import type { Request, Response, NextFunction } from "express";
import { ContractService } from "../services/contract.service";
import {
  createContractSchema,
  updateContractSchema,
  contractQuerySchema,
  contractIdSchema,
} from "../validators/contract.validator";
import ApiResponse from "../utils/apiResponse";

const contractService = new ContractService();

export class ContractController {
  // Get all contracts
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = contractQuerySchema.parse(req.query);
      const result = await contractService.findAll(query);

      return ApiResponse.success(
        res,
        result.data,
        "Contratos obtenidos correctamente",
        result.pagination
      );
    } catch (error) {
      next(error);
    }
  }

  // Get contract by ID
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = contractIdSchema.parse(req.params);
      const contract = await contractService.findById(id);

      return ApiResponse.success(
        res,
        contract,
        "Contrato obtenido correctamente"
      );
    } catch (error) {
      next(error);
    }
  }

  // Create a new contract
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      console.log("--- DEBUG: Received request body in controller ---", req.body);
      const data = createContractSchema.parse(req.body);
      const contract = await contractService.create(data);

      return ApiResponse.success(
        res,
        contract,
        "Contrato creado correctamente",
        undefined,
        201
      );
    } catch (error) {
      next(error);
    }
  }

  // Update an existing contract
  async update(req: Request, res: Response, next: NextFunction) {
    console.log("--- [Controller] Entering update method ---");
    try {
      console.log("--- [Controller] Update - Params ---", req.params);
      console.log("--- [Controller] Update - Body ---", req.body);

      const { id } = contractIdSchema.parse(req.params);
      console.log("--- [Controller] Update - Step 1: Parsed ID ---", { id });

      const data = updateContractSchema.parse(req.body);
      console.log("--- [Controller] Update - Step 2: Parsed body data ---", data);

      const contract = await contractService.update(id, data);
      console.log("--- [Controller] Update - Step 3: Service call successful ---");

      return ApiResponse.success(
        res,
        contract,
        "Contrato actualizado correctamente"
      );
    } catch (error) {
      console.error("--- [Controller] ERROR in update method ---", error);
      next(error);
    }
  }

  // Delete a contract
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = contractIdSchema.parse(req.params);
      // Assuming user ID is available in req.user.id from auth middleware
      const userId = (req as any).user?.id;

      const result = await contractService.delete(id, userId);

      return ApiResponse.success(
        res,
        result,
        "Contrato cancelado correctamente"
      );
    } catch (error) {
      next(error);
    }
  }

  // Get contract history
  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = contractIdSchema.parse(req.params);
      const history = await contractService.getHistory(id);

      return ApiResponse.success(
        res,
        history,
        "Historial de contrato obtenido correctamente"
      );
    } catch (error) {
      next(error);
    }
  }
}
