import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

class Permission extends Model {
    public id!: number;
    public nombre!: string;
    public descripcion!: string;
    public codigo!: string;
    public estado!: boolean;
    
    // Asociaciones
    public privilegios?: any[];
    public roles?: any[];
}

Permission.init({
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
                msg: 'El nombre del permiso no puede estar vacío'
            },
            len: {
                args: [3, 50],
                msg: 'El nombre del permiso debe tener entre 3 y 50 caracteres'
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
            name: 'unique_permission_code',
            msg: 'El código del permiso ya existe'
        },
        validate: {
            notEmpty: {
                msg: 'El código del permiso no puede estar vacío'
            },
            len: {
                args: [3, 100],
                msg: 'El código del permiso debe tener entre 3 y 100 caracteres'
            }
        }
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        validate: {
            isBoolean: {
                msg: 'El estado debe ser verdadero o falso'
            }
        }
    }
}, {
    sequelize,
    modelName: 'Permission',
    tableName: 'permisos',
    timestamps: false // ⚠️ IMPORTANTE: Sin timestamps
});

export default Permission;