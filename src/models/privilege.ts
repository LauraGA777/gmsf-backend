import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

class Privilege extends Model {
    public id!: number;
    public nombre!: string;
    public descripcion!: string;
    public codigo!: string;
    public id_permiso!: number;
    public fecha_creacion!: Date;
    public fecha_actualizacion!: Date;
    
    // Asociaciones
    public permiso?: any;
    public roles?: any[];
}

Privilege.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING(50),
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
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            len: {
                args: [0, 255],
                msg: 'La descripción no puede exceder 255 caracteres'
            }
        }
    },
    codigo: {
        type: DataTypes.STRING(100),
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
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'permisos',
            key: 'id'
        }
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    fecha_actualizacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'Privilege',
    tableName: 'privilegios',
    timestamps: true
});

export default Privilege;