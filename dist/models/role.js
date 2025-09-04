"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Role extends sequelize_1.Model {
}
Role.init({
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
                args: /^R\d{3}$/,
                msg: 'El código debe tener el formato R seguido de 3 números'
            }
        }
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            len: {
                args: [3, 50],
                msg: 'El nombre debe tener entre 3 y 50 caracteres'
            }
        }
    },
    descripcion: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    estado: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
    },
    fecha_creacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    fecha_actualizacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    }
}, {
    sequelize: db_1.default,
    modelName: 'Role',
    tableName: 'roles',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
});
exports.default = Role;
