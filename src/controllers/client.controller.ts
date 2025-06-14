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
  public async getByDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log("--- [Controller] Check User: Received query params ---", req.query);
      const { tipo_documento, numero_documento } = clientDocumentSchema.parse(req.query);
      console.log("--- [Controller] Check User: Parsed params ---", { tipo_documento, numero_documento });
      const user = await this.clientService.findByDocument(tipo_documento, numero_documento);
      console.log("--- [Controller] Check User: Service response ---", user);

      ApiResponse.success(res, user, "Usuario encontrado correctamente");
    } catch (error) {
      console.error("--- [Controller] ERROR in getByDocument ---", error);
      next(error);
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
