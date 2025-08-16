import type { Request, Response, NextFunction } from "express";
import { ClientService } from "../services/client.service";
import {
  createClientSchema,
  updateClientSchema,
  clientQuerySchema,
  clientIdSchema,
  clientDocumentSchema,
} from "../validators/client.validator";
import  ApiResponse  from "../utils/apiResponse";
import { ApiError } from "../errors/apiError";
export class ClientController {
  private clientService: ClientService;

  constructor() {
    this.clientService = new ClientService();
  }

  // Get all clients
  public async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = clientQuerySchema.parse(req.query);
      const result = await this.clientService.findAll(query);

      ApiResponse.success(
        res,
        result.data,
        "Clientes obtenidos correctamente",
        result.pagination
      );
    } catch (error) {
      next(error);
    }
  }

  // Get client by ID
  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = clientIdSchema.parse(req.params);
      const client = await this.clientService.findById(id);

      ApiResponse.success(res, client, "Cliente obtenido correctamente");
    } catch (error) {
      next(error);
    }
  }

  // Get user by document
  public async checkUserByDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tipo_documento, numero_documento } = clientDocumentSchema.parse(req.params);
      const user = await this.clientService.findByDocument(tipo_documento, numero_documento);

      ApiResponse.success(res, user, "Usuario encontrado correctamente");
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        ApiResponse.error(res, error.message, 404);
      } else {
        next(error);
      }
    }
  }

  // Create a new client
  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log("--- [Controller] Create Client: Received body ---", req.body);
      const data = createClientSchema.parse(req.body);
      console.log("--- [Controller] Create Client: Parsed data ---", JSON.stringify(data, null, 2));
      const client = await this.clientService.create(data);
      console.log("--- [Controller] Create Client: Service response ---", client);

      ApiResponse.success(
        res,
        client,
        "Cliente creado correctamente",
        undefined,
        201
      );
    } catch (error) {
      console.error("--- [Controller] ERROR in create ---", error);
      next(error);
    }
  }

  // Update an existing client
  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log("--- [Controller] Update Client: Raw body ---", req.body);
      const { id } = clientIdSchema.parse(req.params);
      const data = updateClientSchema.parse(req.body);
      console.log("--- [Controller] Update Client: Parsed data ---", JSON.stringify(data, null, 2));
      const client = await this.clientService.update(id, data);
      console.log("--- [Controller] Update Client: Service response ---", client);

      ApiResponse.success(
        res,
        client,
        "Cliente actualizado correctamente"
      );
    } catch (error) {
      console.error("--- [Controller] ERROR in update ---", error);
      next(error);
    }
  }

  // Delete a client
  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = clientIdSchema.parse(req.params);
      const result = await this.clientService.delete(id);

      ApiResponse.success(
        res,
        result,
        "Cliente eliminado correctamente"
      );
    } catch (error) {
      next(error);
    }
  }

  // Get client beneficiaries
  public async getBeneficiaries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = clientIdSchema.parse(req.params);
      const beneficiaries = await this.clientService.getBeneficiaries(id);

      ApiResponse.success(
        res,
        beneficiaries,
        "Beneficiarios obtenidos correctamente"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener información propia del cliente autenticado
   */
  public async getMyInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as any)?.id;
      
      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'Usuario no autenticado'
        });
        return;
      }

      console.log("--- [Controller] Getting my info for userId:", userId);

      const client = await this.clientService.findByUserId(userId);

      res.status(200).json({
        status: 'success',
        message: 'Tu información obtenida correctamente',
        data: client
      });
    } catch (error) {
      console.error('Error en getMyInfo:', error);
      next(error);
    }
  }

  /**
   * Obtener beneficiarios propios del cliente autenticado
   */
  public async getMyBeneficiaries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as any)?.id;
      
      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'Usuario no autenticado'
        });
        return;
      }

      console.log("--- [Controller] Get My Beneficiaries: User ID ---", userId);

      const beneficiaries = await this.clientService.getBeneficiariesByUserId(userId);
      
      res.status(200).json({
        status: 'success',
        message: 'Tus beneficiarios obtenidos correctamente',
        data: beneficiaries
      });
    } catch (error) {
      console.error("--- [Controller] ERROR in getMyBeneficiaries ---", error);
      next(error);
    }
  }
}
