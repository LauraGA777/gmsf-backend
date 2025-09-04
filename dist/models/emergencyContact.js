"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class EmergencyContact extends sequelize_1.Model {
}
EmergencyContact.init({
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
        },
    },
    nombre_contacto: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El nombre del contacto no puede estar vacío'
            },
            len: {
                args: [3, 100],
                msg: 'El nombre del contacto debe tener entre 3 y 100 caracteres'
            }
        }
    },
    telefono_contacto: {
        type: sequelize_1.DataTypes.STRING(15),
        allowNull: false,
        validate: {
            is: {
                args: /^\d{7,15}$/,
                msg: 'El teléfono debe contener entre 7 y 15 dígitos numéricos'
            }
        },
    },
    relacion_contacto: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
        validate: {
            len: {
                args: [3, 50],
                msg: 'La relación debe tener entre 3 y 50 caracteres cuando se proporciona'
            }
        }
    },
    es_mismo_beneficiario: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    sequelize: db_1.default,
    modelName: "ContactoEmergencia",
    tableName: "contactos_emergencia",
    timestamps: true,
    underscored: true,
    createdAt: "fecha_registro",
    updatedAt: "fecha_actualizacion",
});
exports.default = EmergencyContact;
