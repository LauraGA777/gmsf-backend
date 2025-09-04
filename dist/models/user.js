"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class User extends sequelize_1.Model {
}
User.init({
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
                args: /^U\d{3}$/,
                msg: 'El código debe tener el formato U seguido de 3 números'
            }
        }
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        validate: {
            len: {
                args: [3, 100],
                msg: 'El nombre debe tener entre 3 y 100 caracteres'
            }
        }
    },
    apellido: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        validate: {
            len: {
                args: [3, 100],
                msg: 'El apellido debe tener entre 3 y 100 caracteres'
            }
        }
    },
    correo: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: {
                msg: 'Debe proporcionar un correo electrónico válido'
            },
            is: {
                args: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-zA-Z]{2,}$/,
                msg: 'El formato del correo electrónico no es válido'
            }
        }
    },
    contrasena_hash: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    telefono: {
        type: sequelize_1.DataTypes.STRING(15),
        allowNull: true,
        validate: {
            is: {
                args: /^\d{7,15}$/,
                msg: 'El teléfono debe contener entre 7 y 15 dígitos numéricos'
            }
        }
    },
    direccion: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    genero: {
        type: sequelize_1.DataTypes.CHAR(1),
        allowNull: true,
        validate: {
            isIn: {
                args: [['M', 'F', 'O']],
                msg: 'El género debe ser M (Masculino), F (Femenino) u O (Otro)'
            }
        }
    },
    tipo_documento: {
        type: sequelize_1.DataTypes.STRING(10),
        allowNull: false,
        validate: {
            isIn: {
                args: [['CC', 'CE', 'TI', 'PP', 'DIE']],
                msg: 'El tipo de documento debe ser CC, CE, TI, PP o DIE'
            }
        }
    },
    numero_documento: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    fecha_actualizacion: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    asistencias_totales: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: {
                args: [0],
                msg: 'Las asistencias totales no pueden ser negativas'
            }
        }
    },
    fecha_nacimiento: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: true,
            isBefore: {
                args: new Date(new Date().setFullYear(new Date().getFullYear() - 15)).toISOString(),
                msg: 'Debe ser mayor de 15 años'
            }
        }
    },
    estado: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
    },
    id_rol: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'roles',
            key: 'id'
        },
        onDelete: 'SET NULL'
    },
    primer_acceso: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
    },
    fecha_ultimo_cambio_password: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize: db_1.default,
    modelName: 'User',
    tableName: 'usuarios',
    timestamps: false
});
exports.default = User;
