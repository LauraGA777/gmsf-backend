"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class ContractHistory extends sequelize_1.Model {
}
ContractHistory.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_contrato: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "contratos",
            key: "id",
        },
    },
    estado_anterior: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true,
        validate: {
            isIn: {
                args: [["Activo", "Congelado", "Vencido", "Cancelado", "Por vencer"]],
                msg: 'El estado anterior debe ser uno de los siguientes: Activo, Congelado, Vencido, Cancelado, Por vencer'
            }
        }
    },
    estado_nuevo: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        validate: {
            isIn: {
                args: [["Activo", "Congelado", "Vencido", "Cancelado", "Por vencer"]],
                msg: 'El estado nuevo debe ser uno de los siguientes: Activo, Congelado, Vencido, Cancelado, Por vencer'
            },
            notEqualToPrevious(value) {
                if (value === this.estado_anterior) {
                    throw new Error('El estado nuevo debe ser diferente al estado anterior');
                }
            }
        }
    },
    fecha_cambio: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
        validate: {
            isDate: true
        }
    },
    usuario_cambio: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "usuarios",
            key: "id",
        },
    },
    motivo: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        validate: {
            len: {
                args: [10, 500],
                msg: 'El motivo debe tener entre 10 y 500 caracteres cuando se proporciona'
            }
        }
    },
}, {
    sequelize: db_1.default,
    modelName: "ContractHistory",
    tableName: "historial_contratos",
    timestamps: true,
    underscored: true,
});
exports.default = ContractHistory;
