import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db';

interface RoleAttributes {
    id: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    estado: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface RoleCreationAttributes extends Optional<RoleAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Role extends Model<RoleAttributes, RoleCreationAttributes> {
    public id!: number;
    public codigo!: string;
    public nombre!: string;
    public descripcion?: string;
    public estado!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Asociaciones (sin importar los tipos)
    public usuarios?: any[];
    public permisos?: any[];
    public privilegios?: any[];

    // Métodos de asociación
    public setPermisos!: (permisos: any[], options?: any) => Promise<void>;
    public setPrivilegios!: (privilegios: any[], options?: any) => Promise<void>;
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