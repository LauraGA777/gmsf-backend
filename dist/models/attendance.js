"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Attendance extends sequelize_1.Model {
}
Attendance.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_persona: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "personas",
            key: "id_persona",
        }
    },
    id_contrato: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "contratos",
            key: "id",
        }
    },
    fecha_uso: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
        validate: {
            isDate: true,
            notInFuture(value) {
                if (new Date(value) > new Date()) {
                    throw new Error('La fecha de uso no puede ser futura');
                }
            }
        }
    },
    hora_registro: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
        validate: {
            isValidTime(value) {
                if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(value)) {
                    throw new Error('La hora debe tener un formato válido (HH:MM:SS)');
                }
            }
        }
    },
    estado: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "Activo",
        validate: {
            isIn: {
                args: [["Activo", "Eliminado"]],
                msg: 'El estado debe ser "Activo" o "Eliminado"'
            }
        }
    },
    fecha_registro: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
        validate: {
            isDate: true
        }
    },
    fecha_actualizacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
        validate: {
            isDate: true
        }
    },
    usuario_registro: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "usuarios",
            key: "id",
        }
    },
    usuario_actualizacion: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "usuarios",
            key: "id",
        }
    },
}, {
    sequelize: db_1.default,
    modelName: "Asistencia",
    tableName: "asistencias",
    timestamps: false,
    underscored: true,
});
exports.default = Attendance;
