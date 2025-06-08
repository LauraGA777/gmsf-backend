import type { Request, Response, NextFunction } from "express";
import { ClientService } from "../services/client.service";
import {
  createClientSchema,
  updateClientSchema,
  clientQuerySchema,
  clientIdSchema,
} from "../validators/client.validator";
import  ApiResponse  from "../utils/apiResponse";

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

  // Create a new client
  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createClientSchema.parse(req.body);
      const client = await this.clientService.create(data);

      ApiResponse.success(
        res,
        client,
        "Cliente creado correctamente",
        undefined,
        201
      );
    } catch (error) {
      next(error);
    }
  }

  // Update an existing client
  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = clientIdSchema.parse(req.params);
      const data = updateClientSchema.parse(req.body);
      const client = await this.clientService.update(id, data);

      ApiResponse.success(
        res,
        client,
        "Cliente actualizado correctamente"
      );
    } catch (error) {
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
}
