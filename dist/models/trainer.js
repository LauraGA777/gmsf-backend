"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const user_1 = __importDefault(require("./user"));
class Trainer extends sequelize_1.Model {
}
Trainer.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    codigo: {
        type: sequelize_1.DataTypes.STRING(10),
        allowNull: false,
        unique: true,
    },
    id_usuario: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        unique: true, // Un usuario solo puede ser un entrenador una vez
        references: {
            model: user_1.default,
            key: 'id'
        },
        onDelete: 'CASCADE' // Si se elimina el usuario, se elimina el entrenador
    },
    especialidad: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        validate: {
            len: {
                args: [3, 100],
                msg: 'La especialidad debe tener entre 3 y 100 caracteres'
            }
        }
    },
    estado: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
    },
    fecha_registro: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
        allowNull: false
    }
}, {
    sequelize: db_1.default,
    tableName: 'entrenadores',
    modelName: 'Trainer',
    timestamps: true
});
exports.default = Trainer;
