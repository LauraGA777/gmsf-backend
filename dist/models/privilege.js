"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Privilege extends sequelize_1.Model {
}
Privilege.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El nombre del privilegio no puede estar vacío'
            },
            len: {
                args: [3, 50],
                msg: 'El nombre del privilegio debe tener entre 3 y 50 caracteres'
            }
        }
    },
    descripcion: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        validate: {
            len: {
                args: [0, 255],
                msg: 'La descripción no puede exceder 255 caracteres'
            }
        }
    },
    codigo: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        unique: {
            name: 'unique_privilege_code',
            msg: 'El código del privilegio ya existe'
        },
        validate: {
            notEmpty: {
                msg: 'El código del privilegio no puede estar vacío'
            },
            len: {
                args: [3, 100],
                msg: 'El código del privilegio debe tener entre 3 y 100 caracteres'
            }
        }
    },
    id_permiso: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'permisos',
            key: 'id'
        }
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
    modelName: 'Privilege',
    tableName: 'privilegios',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
});
exports.default = Privilege;
