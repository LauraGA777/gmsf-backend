"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class UserHistory extends sequelize_1.Model {
}
UserHistory.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_usuario: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "usuarios",
            key: "id",
        },
    },
    estado_anterior: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
    },
    estado_nuevo: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
    },
    fecha_cambio: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    usuario_cambio: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "usuarios",
            key: "id",
        },
    },
    motivo: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: db_1.default,
    modelName: "UserHistory",
    tableName: "historial_usuarios",
    timestamps: true,
    underscored: true,
});
exports.default = UserHistory;
