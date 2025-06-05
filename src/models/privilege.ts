import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

class Privilege extends Model {
    public id!: number;
    public nombre!: string;
    public id_permiso!: number;
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
    id_permiso: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'permisos',
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: 'Privilege',
    tableName: 'privilegios',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['nombre', 'id_permiso'],
            name: 'unique_privilege_name_permission'
        }
    ]
});

export default Privilege; 