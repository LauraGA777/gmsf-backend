"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Person extends sequelize_1.Model {
}
Person.init({
    id_persona: {
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
                args: /^P\d{3}$/,
                msg: 'El código debe tener el formato P seguido de 3 dígitos'
            }
        }
    },
    id_usuario: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "usuarios",
            key: "id",
        },
    },
    estado: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    sequelize: db_1.default,
    modelName: "Person",
    tableName: "personas",
    timestamps: true,
    underscored: true,
    createdAt: "fecha_registro",
    updatedAt: "fecha_actualizacion",
});
exports.default = Person;
