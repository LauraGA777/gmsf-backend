import { Request, Response, NextFunction } from 'express';
import { TrainerService } from '../services/trainer.service';
import ApiResponse from '../utils/apiResponse';
import { CreateTrainerInput, UpdateTrainerInput, SearchTrainerInput } from '../validators/trainer.validator';

export class TrainerController {
    private trainerService: TrainerService;

    constructor() {
        this.trainerService = new TrainerService();
    }

    public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = req.body as CreateTrainerInput;
            const trainer = await this.trainerService.create(data);
            ApiResponse.success(res, { trainer }, 'Entrenador creado exitosamente.', undefined, 201);
        } catch (error) {
            next(error);
        }
    };

    public findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const options = req.query as unknown as SearchTrainerInput;
            const result = await this.trainerService.findAll(options);
            ApiResponse.success(res, result, 'Entrenadores obtenidos correctamente.');
        } catch (error) {
            next(error);
        }
    };

    public findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseInt(req.params.id, 10);
            const trainer = await this.trainerService.findById(id);
            ApiResponse.success(res, { trainer }, 'Entrenador obtenido correctamente.');
        } catch (error) {
            next(error);
        }
    };

    public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseInt(req.params.id, 10);
            const data = req.body as UpdateTrainerInput;
            const trainer = await this.trainerService.update(id, data);
            ApiResponse.success(res, { trainer }, 'Entrenador actualizado exitosamente.');
        } catch (error) {
            next(error);
        }
    };

    public activate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseInt(req.params.id, 10);
            const result = await this.trainerService.activate(id);
            ApiResponse.success(res, result, result.message);
        } catch (error) {
            next(error);
        }
    };

    public deactivate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseInt(req.params.id, 10);
            const result = await this.trainerService.deactivate(id);
            ApiResponse.success(res, result, result.message);
        } catch (error) {
            next(error);
        }
    };

    public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = parseInt(req.params.id, 10);
            const result = await this.trainerService.delete(id);
            ApiResponse.success(res, result, result.message);
        } catch (error) {
            next(error);
        }
    };
} 