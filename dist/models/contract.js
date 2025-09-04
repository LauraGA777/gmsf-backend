"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Contract extends sequelize_1.Model {
}
Contract.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    codigo: {
        type: sequelize_1.DataTypes.STRING(10),
        allowNull: false,
        unique: true,
        validate: {
            is: {
                args: /^C\d{4}$/,
                msg: 'El código debe tener el formato C seguido de 4 números'
            }
        },
    },
    id_persona: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "personas",
            key: "id_persona",
        },
    },
    id_membresia: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "membresias",
            key: "id",
        },
    },
    fecha_inicio: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: true,
        }
    },
    fecha_fin: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: true
        }
    },
    membresia_precio: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: {
                args: [0.01],
                msg: 'El precio debe ser mayor a 0'
            }
        },
    },
    estado: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        validate: {
            isIn: {
                args: [["Activo", "Congelado", "Vencido", "Cancelado", "Por vencer"]],
                msg: 'El estado debe ser uno de los siguientes: Activo, Congelado, Vencido, Cancelado, Por vencer'
            }
        },
    },
    usuario_registro: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "usuarios",
            key: "id",
        },
    },
    usuario_actualizacion: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "usuarios",
            key: "id",
        },
    },
    fecha_congelacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    motivo: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: db_1.default,
    modelName: "Contract",
    tableName: "contratos",
    timestamps: true,
    underscored: true,
    createdAt: "fecha_registro",
    updatedAt: "fecha_actualizacion",
});
exports.default = Contract;
