import { Op } from 'sequelize';
import Membership from '../models/membership';
import Contract from '../models/contract';
import Person from '../models/person.model';
import User from '../models/user';

export class MembershipClientService {
    
    static async getActiveMembershipByUserId(userId: number) {
        return await Contract.findOne({
            where: {
                estado: 'Activo',
                fecha_inicio: { [Op.lte]: new Date() },
                fecha_fin: { [Op.gte]: new Date() }
            },
            include: [
                {
                    model: Membership,
                    as: 'membresia'
                },
                {
                    model: Person,
                    as: 'persona',
                    include: [{
                        model: User,
                        as: 'usuario',
                        where: { id: userId }
                    }]
                }
            ]
        });
    }

    static calculateMembershipStatus(fechaInicio: Date, fechaFin: Date) {
        const now = new Date();
        const diasTranscurridos = Math.floor((now.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
        const diasRestantes = Math.max(0, Math.floor((fechaFin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        const totalDias = Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
        const porcentajeUso = Math.min(100, Math.max(0, (diasTranscurridos / totalDias) * 100));

        let estadoMembresia = 'Activa';
        if (diasRestantes <= 7) {
            estadoMembresia = 'Próxima a vencer';
        } else if (diasRestantes <= 0) {
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

    static formatPrice(precio: number): string {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP'
        }).format(precio);
    }
}