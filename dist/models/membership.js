"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Membership extends sequelize_1.Model {
}
Membership.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    codigo: {
        type: sequelize_1.DataTypes.STRING(10),
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
        type: sequelize_1.DataTypes.STRING(100),
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
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    dias_acceso: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: {
                args: [1],
                msg: 'Los días de acceso deben ser al menos 1'
            }
        }
    },
    vigencia_dias: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: {
                args: [1],
                msg: 'La vigencia debe ser al menos 1 día'
            },
            isValidVigencia(value) {
                if (value < this.dias_acceso) {
                    throw new Error('La vigencia debe ser mayor o igual a los días de acceso');
                }
            }
        }
    },
    precio: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: {
                args: [0.01],
                msg: 'El precio debe ser mayor a 0'
            }
        }
    },
    fecha_creacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    estado: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    sequelize: db_1.default,
    modelName: 'membresia',
    tableName: 'membresias',
    timestamps: false
});
exports.default = Membership;
