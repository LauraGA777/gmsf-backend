import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

class Membership extends Model {
    public id!: number;
    public codigo!: string;
    public nombre!: string;
    public descripcion!: string;
    public dias_acceso!: number;
    public vigencia_dias!: number;
    public precio!: number;
    public fecha_creacion!: Date;
    public estado!: boolean;
}

Membership.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    codigo: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
        validate: {
            is: {
                args: /^M\d{3}$/,
                msg: 'El código debe tener el formato M seguido de 3 números'
            }
        }
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            len: {
                args: [3, 100],
                msg: 'El nombre debe tener entre 3 y 100 caracteres'
            }
        }
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    dias_acceso: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: {
                args: [1],
                msg: 'Los días de acceso deben ser al menos 1'
            }
        }
    },
    vigencia_dias: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: {
                args: [1],
                msg: 'La vigencia debe ser al menos 1 día'
            },
            isValidVigencia(value: number) {
                if (value < (this as any).dias_acceso) {
                    throw new Error('La vigencia debe ser mayor o igual a los días de acceso');
                }
            }
        }
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: {
                args: [0.01],
                msg: 'El precio debe ser mayor a 0'
            }
        }
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'membresia',
    tableName: 'membresias',
    timestamps: false
});

export default Membership; 