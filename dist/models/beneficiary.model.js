"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Beneficiary extends sequelize_1.Model {
}
Beneficiary.init({
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
                args: /^B\d{3}$/,
                msg: 'El código debe tener el formato B seguido de 3 dígitos'
            }
        }
    },
    id_persona: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "personas",
            key: "id_persona",
        },
    },
    id_cliente: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "personas",
            key: "id_persona",
        },
    },
    relacion: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    es_titular: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    estado: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    sequelize: db_1.default,
    modelName: "Beneficiary",
    tableName: "beneficiarios",
    timestamps: true,
    underscored: true,
    createdAt: "fecha_registro",
    updatedAt: "fecha_actualizacion",
});
exports.default = Beneficiary;
