import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

class Privilege extends Model {
    public id!: number;
    public nombre!: string;
    public descripcion!: string;
    public codigo!: string;
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
    }
}, {
    sequelize,
    modelName: 'Privilege',
    tableName: 'privilegios',
    timestamps: false
});

export default Privilege; 