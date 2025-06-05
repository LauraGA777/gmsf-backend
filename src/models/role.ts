import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db';
import User from './user';
import Permission from './permission';
import Privilege from './privilege';

interface RoleAttributes {
    id: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    estado: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    usuarios?: User[];
    permisos?: Permission[];
    privilegios?: Privilege[];
}

interface RoleCreationAttributes extends Optional<RoleAttributes, 'id' | 'createdAt' | 'updatedAt' | 'usuarios' | 'permisos' | 'privilegios'> {}

class Role extends Model<RoleAttributes, RoleCreationAttributes> {
    public id!: number;
    public codigo!: string;
    public nombre!: string;
    public descripcion?: string;
    public estado!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public usuarios?: User[];
    public permisos?: Permission[];
    public privilegios?: Privilege[];

    public setPermisos!: (permisos: Permission[], options?: any) => Promise<void>;
    public setPrivilegios!: (privilegios: Privilege[], options?: any) => Promise<void>;
}

Role.init({
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
                args: /^R\d{3}$/,
                msg: 'El código debe tener el formato R seguido de 3 números'
            }
        }
    },
    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            len: {
                args: [3, 50],
                msg: 'El nombre debe tener entre 3 y 50 caracteres'
            }
        }
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'Role',
    tableName: 'roles',
    timestamps: true
});

export default Role; 