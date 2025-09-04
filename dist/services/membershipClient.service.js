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
exports.MembershipClientService = void 0;
const sequelize_1 = require("sequelize");
const membership_1 = __importDefault(require("../models/membership"));
const contract_1 = __importDefault(require("../models/contract"));
const person_model_1 = __importDefault(require("../models/person.model"));
const user_1 = __importDefault(require("../models/user"));
class MembershipClientService {
    static getActiveMembershipByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield contract_1.default.findOne({
                where: {
                    estado: 'Activo',
                    fecha_inicio: { [sequelize_1.Op.lte]: new Date() },
                    fecha_fin: { [sequelize_1.Op.gte]: new Date() }
                },
                include: [
                    {
                        model: membership_1.default,
                        as: 'membresia'
                    },
                    {
                        model: person_model_1.default,
                        as: 'persona',
                        include: [{
                                model: user_1.default,
                                as: 'usuario',
                                where: { id: userId }
                            }]
                    }
                ]
            });
        });
    }
    static calculateMembershipStatus(fechaInicio, fechaFin) {
        const now = new Date();
        const diasTranscurridos = Math.floor((now.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
        const diasRestantes = Math.max(0, Math.floor((fechaFin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        const totalDias = Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
        const porcentajeUso = Math.min(100, Math.max(0, (diasTranscurridos / totalDias) * 100));
        let estadoMembresia = 'Activa';
        if (diasRestantes <= 7) {
            estadoMembresia = 'Próxima a vencer';
        }
        else if (diasRestantes <= 0) {
            estadoMembresia = 'Vencida';
        }
        return {
            estado_actual: estadoMembresia,
            dias_transcurridos: diasTranscurridos,
            dias_restantes: diasRestantes,
            porcentaje_uso: Math.round(porcentajeUso),
            acceso_disponible: diasRestantes > 0
        };
    }
    static formatPrice(precio) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP'
        }).format(precio);
    }
}
exports.MembershipClientService = MembershipClientService;
