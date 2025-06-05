import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db';
import Role from './role';

interface UserAttributes {
    id: number;
    codigo: string;
    nombre: string;
    apellido: string;
    correo: string;
    contrasena_hash: string;
    telefono?: string;
    direccion?: string;
    genero?: 'M' | 'F' | 'O';
    tipo_documento: 'CC' | 'CE' | 'TI' | 'PP' | 'DIE';
    numero_documento: string;
    fecha_actualizacion: Date;
    asistencias_totales: number;
    fecha_nacimiento: Date;
    estado: boolean;
    id_rol?: number;
    rol?: Role;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'fecha_actualizacion' | 'asistencias_totales' | 'estado' | 'rol'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public codigo!: string;
    public nombre!: string;
    public apellido!: string;
    public correo!: string;
    public contrasena_hash!: string;
    public telefono!: string;
    public direccion!: string;
    public genero!: 'M' | 'F' | 'O';
    public tipo_documento!: 'CC' | 'CE' | 'TI' | 'PP' | 'DIE';
    public numero_documento!: string;
    public fecha_actualizacion!: Date;
    public asistencias_totales!: number;
    public fecha_nacimiento!: Date;
    public estado!: boolean;
    public id_rol!: number;
    public rol?: Role;
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    codigo: {
        type: DataTypes.STRING(10),
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
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            len: {
                args: [3, 100],
                msg: 'El nombre debe tener entre 3 y 100 caracteres'
            }
        }
    },
    apellido: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            len: {
                args: [3, 100],
                msg: 'El apellido debe tener entre 3 y 100 caracteres'
            }
        }
    },
    correo: {
        type: DataTypes.STRING(100),
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
        type: DataTypes.STRING(255),
        allowNull: false
    },
    telefono: {
        type: DataTypes.STRING(15),
        allowNull: true,
        validate: {
            is: {
                args: /^\d{7,15}$/,
                msg: 'El teléfono debe contener entre 7 y 15 dígitos numéricos'
            }
        }
    },
    direccion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    genero: {
        type: DataTypes.CHAR(1),
        allowNull: true,
        validate: {
            isIn: {
                args: [['M', 'F', 'O']],
                msg: 'El género debe ser M (Masculino), F (Femenino) u O (Otro)'
            }
        }
    },
    tipo_documento: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
            isIn: {
                args: [['CC', 'CE', 'TI', 'PP', 'DIE']],
                msg: 'El tipo de documento debe ser CC, CE, TI, PP o DIE'
            }
        }
    },
    numero_documento: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    fecha_actualizacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    asistencias_totales: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: {
                args: [0],
                msg: 'Las asistencias totales no pueden ser negativas'
            }
        }
    },
    fecha_nacimiento: {
        type: DataTypes.DATE,
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
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    id_rol: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'roles',
            key: 'id'
        },
        onDelete: 'SET NULL'
    }
}, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios',
    timestamps: false
});

// Definir la asociación con Role
User.belongsTo(Role, {
    foreignKey: 'id_rol',
    as: 'rol'
});

export default User;