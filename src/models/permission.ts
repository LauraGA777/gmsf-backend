import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

class Permission extends Model {
    public id!: number;
    public nombre!: string;
    public estado!: boolean;
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
        unique: {
            name: 'unique_permission_name',
            msg: 'El nombre del permiso ya existe'
        },
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
    timestamps: false
});

export default Permission;