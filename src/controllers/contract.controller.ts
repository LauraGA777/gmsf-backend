import type { Request, Response, NextFunction } from "express";
import { ContractService } from "../services/contract.service";
import {
  createContractSchema,
  updateContractSchema,
  contractQuerySchema,
  contractIdSchema,
} from "../validators/contract.validator";
import ApiResponse from "../utils/apiResponse";
import { Op } from "sequelize";
import { z } from "zod";
import Contract from "../models/contract";
import Membership from "../models/membership";
import Person from "../models/person.model";
import User from "../models/user";

const contractService = new ContractService();

// Esquema de validación para estadísticas
const statsQuerySchema = z.object({
  period: z.enum(['daily', 'monthly', 'yearly']).optional().default('monthly'),
  date: z.string().optional(),
  month: z.string().optional(),
  year: z.string().optional()
});

export class ContractController {
  // Get all contracts
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = contractQuerySchema.parse(req.query);
      
      // Aplicar filtro de usuario si existe
      const userFilter = (req as any).userFilter;
      if (userFilter) {
        Object.assign(query, userFilter);
      }
      
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
      
      // Extract user ID from JWT token
      const userId = (req as any).user?.id;
      if (!userId) {
        return ApiResponse.error(res, "Usuario no autenticado", 401);
      }
      
      // Add user ID to data
      const contractData = {
        ...data,
        usuario_registro: userId
      };
      
      const contract = await contractService.create(contractData);

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

      // Extract user ID from JWT token
      const userId = (req as any).user?.id;
      if (!userId) {
        return ApiResponse.error(res, "Usuario no autenticado", 401);
      }
      
      // Add user ID to data
      const updateData = {
        ...data,
        usuario_actualizacion: userId
      };
      console.log("--- [Controller] Update - Step 2.5: Added user ID ---", { userId });

      const contract = await contractService.update(id, updateData);
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

  // Get contract statistics
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('🔍 Contract Stats - Request params:', req.query);
      
      const { period, date, month, year } = statsQuerySchema.parse(req.query);
      
      let startDate: Date;
      let endDate: Date;
      
      // Configurar fechas según el período
      if (period === 'daily') {
        const targetDate = date ? new Date(date) : new Date();
        startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
      } else if (period === 'monthly') {
        const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();
        const targetYear = year ? parseInt(year) : new Date().getFullYear();
        startDate = new Date(targetYear, targetMonth, 1);
        endDate = new Date(targetYear, targetMonth + 1, 0);
      } else { // yearly
        const targetYear = year ? parseInt(year) : new Date().getFullYear();
        startDate = new Date(targetYear, 0, 1);
        endDate = new Date(targetYear, 11, 31);
      }

      console.log('📅 Contract Stats - Date range:', { startDate, endDate, period });

      // Definir tipo para contratos recientes
      interface RecentContract {
        id: number;
        codigo: string;
        membresia_precio: number;
        fecha_inicio: string;
        fecha_fin: string;
        estado: string;
        persona?: {
          usuario?: {
            nombre: string;
            apellido: string;
          };
        };
        membresia?: {
          nombre: string;
          precio: number;
        };
      }

      // Obtener estadísticas básicas
      const [
        totalContracts,
        activeContracts,
        expiredContracts,
        cancelledContracts,
        newContracts
      ] = await Promise.all([
        // Total contratos
        Contract.count().catch(error => {
          console.error('Error counting total contracts:', error);
          return 0;
        }),
        
        // Contratos activos
        Contract.count({
          where: {
            estado: 'Activo',
            fecha_inicio: { [Op.lte]: new Date() },
            fecha_fin: { [Op.gte]: new Date() }
          }
        }).catch(error => {
          console.error('Error counting active contracts:', error);
          return 0;
        }),
        
        // Contratos expirados
        Contract.count({
          where: {
            estado: 'Activo',
            fecha_fin: { [Op.lt]: new Date() }
          }
        }).catch(error => {
          console.error('Error counting expired contracts:', error);
          return 0;
        }),
        
        // Contratos cancelados
        Contract.count({
          where: {
            estado: 'Cancelado'
          }
        }).catch(error => {
          console.error('Error counting cancelled contracts:', error);
          return 0;
        }),
        
        // Nuevos contratos en el período
        Contract.count({
          where: {
            fecha_inicio: {
              [Op.between]: [startDate, endDate]
            }
          }
        }).catch(error => {
          console.error('Error counting new contracts:', error);
          return 0;
        })
      ]);

      console.log('📊 Contract Stats - Basic counts:', {
        totalContracts,
        activeContracts,
        expiredContracts,
        cancelledContracts,
        newContracts
      });

      // Obtener contratos recientes de forma segura
      let recentContracts: RecentContract[] = [];
      try {
        const contractsResult = await Contract.findAll({
          limit: 10,
          order: [['fecha_inicio', 'DESC']],
          include: [
            {
              model: Person,
              as: 'persona',
              required: false,
              include: [{
                model: User,
                as: 'usuario',
                attributes: ['nombre', 'apellido'],
                required: false
              }]
            },
            {
              model: Membership,
              as: 'membresia',
              attributes: ['nombre', 'precio'],
              required: false
            }
          ]
        });
        
        recentContracts = contractsResult.map((contract: any) => ({
          id: contract.id,
          codigo: contract.codigo,
          membresia_precio: contract.membresia_precio,
          fecha_inicio: contract.fecha_inicio,
          fecha_fin: contract.fecha_fin,
          estado: contract.estado,
          persona: contract.persona ? {
            usuario: contract.persona.usuario ? {
              nombre: contract.persona.usuario.nombre,
              apellido: contract.persona.usuario.apellido
            } : undefined
          } : undefined,
          membresia: contract.membresia ? {
            nombre: contract.membresia.nombre,
            precio: contract.membresia.precio
          } : undefined
        }));
        
        console.log('📋 Contract Stats - Recent contracts found:', recentContracts.length);
      } catch (error) {
        console.error('Error fetching recent contracts:', error);
        recentContracts = [];
      }

      // Calcular ingresos de forma segura
      let totalRevenue = 0;
      let periodRevenue = 0;
      
      try {
        const totalRevenueResult = await Contract.sum('membresia_precio', {
          where: {
            estado: 'Activo'
          }
        });
        totalRevenue = totalRevenueResult || 0;
        console.log('💰 Contract Stats - Total revenue:', totalRevenue);
      } catch (error) {
        console.error('Error calculating total revenue:', error);
      }

      try {
        const periodRevenueResult = await Contract.sum('membresia_precio', {
          where: {
            fecha_inicio: {
              [Op.between]: [startDate, endDate]
            }
          }
        });
        periodRevenue = periodRevenueResult || 0;
        console.log('💰 Contract Stats - Period revenue:', periodRevenue);
      } catch (error) {
        console.error('Error calculating period revenue:', error);
      }

      const stats = {
        totalContracts,
        activeContracts,
        expiredContracts,
        cancelledContracts,
        newContracts,
        totalRevenue,
        periodRevenue,
        recentContracts,
        period: {
          type: period,
          startDate,
          endDate
        }
      };

      console.log('✅ Contract Stats - Final response:', {
        ...stats,
        recentContracts: `${stats.recentContracts.length} contracts`
      });

      return ApiResponse.success(
        res,
        stats,
        "Estadísticas de contratos obtenidas correctamente"
      );
    } catch (error) {
      console.error('❌ Contract Stats - Fatal error:', error);
      return ApiResponse.error(
        res,
        "Error al obtener estadísticas de contratos",
        500,
        process.env.NODE_ENV === 'development' ? error : undefined
      );
    }
  }
}
