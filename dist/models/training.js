"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Training extends sequelize_1.Model {
}
Training.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    titulo: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El título no puede estar vacío'
            },
            len: {
                args: [3, 100],
                msg: 'El título debe tener entre 3 y 100 caracteres'
            }
        }
    },
    descripcion: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        validate: {
            len: {
                args: [10, 1000],
                msg: 'La descripción debe tener entre 10 y 1000 caracteres cuando se proporciona'
            }
        }
    },
    fecha_inicio: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: true
        }
    },
    fecha_fin: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: true,
            isAfterStartDate(value) {
                if (!this.fecha_inicio) {
                    throw new Error('La fecha de inicio es requerida');
                }
                const endDate = new Date(value);
                const startDate = new Date(this.fecha_inicio);
                if (endDate <= startDate) {
                    throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
                }
            }
        }
    },
    id_entrenador: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "entrenadores",
            key: "id",
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
    estado: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "Programado",
        validate: {
            isIn: {
                args: [["Programado", "En proceso", "Completado", "Cancelado"]],
                msg: 'El estado debe ser uno de los siguientes: Programado, En proceso, Completado, Cancelado'
            }
        },
    },
    notas: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        validate: {
            len: {
                args: [5, 500],
                msg: 'Las notas deben tener entre 5 y 500 caracteres cuando se proporcionan'
            }
        }
    },
    fecha_creacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: db_1.default,
    modelName: "Entrenamiento",
    tableName: "entrenamientos",
    timestamps: true,
    underscored: true,
});
exports.default = Training;
