"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainerController = void 0;
const trainer_service_1 = require("../services/trainer.service");
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
class TrainerController {
    constructor() {
        this.create = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                const trainer = yield this.trainerService.create(data);
                apiResponse_1.default.success(res, { trainer }, 'Entrenador creado exitosamente.', undefined, 201);
            }
            catch (error) {
                next(error);
            }
        });
        this.findAll = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const options = req.query;
                const result = yield this.trainerService.findAll(options);
                apiResponse_1.default.success(res, result, 'Entrenadores obtenidos correctamente.');
            }
            catch (error) {
                next(error);
            }
        });
        this.findById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id, 10);
                const trainer = yield this.trainerService.findById(id);
                apiResponse_1.default.success(res, { trainer }, 'Entrenador obtenido correctamente.');
            }
            catch (error) {
                next(error);
            }
        });
        this.update = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id, 10);
                const data = req.body;
                const trainer = yield this.trainerService.update(id, data);
                apiResponse_1.default.success(res, { trainer }, 'Entrenador actualizado exitosamente.');
            }
            catch (error) {
                next(error);
            }
        });
        this.activate = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id, 10);
                const result = yield this.trainerService.activate(id);
                apiResponse_1.default.success(res, result, result.message);
            }
            catch (error) {
                next(error);
            }
        });
        this.deactivate = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id, 10);
                const result = yield this.trainerService.deactivate(id);
                apiResponse_1.default.success(res, result, result.message);
            }
            catch (error) {
                next(error);
            }
        });
        this.delete = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id, 10);
                const result = yield this.trainerService.delete(id);
                apiResponse_1.default.success(res, result, result.message);
            }
            catch (error) {
                next(error);
            }
        });
        this.trainerService = new trainer_service_1.TrainerService();
    }
}
exports.TrainerController = TrainerController;
