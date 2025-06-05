import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db';
import User from './user';

interface TrainerAttributes {
    id: number;
    codigo: string;
    id_usuario: number;
    fecha_registro: Date;
    especialidad: string;
    estado: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    usuario?: User;
}

interface TrainerCreationAttributes extends Optional<TrainerAttributes, 'id' | 'createdAt' | 'updatedAt' | 'usuario'> {}

class Trainer extends Model<TrainerAttributes, TrainerCreationAttributes> {
    public id!: number;
    public codigo!: string;
    public id_usuario!: number;
    public fecha_registro!: Date;
    public especialidad!: string;
    public estado!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public usuario?: User;
}

Trainer.init({
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
                args: /^E\d{3}$/,
                msg: 'El código debe tener el formato E seguido de 3 números'
            }
        }
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },
    fecha_registro: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    especialidad: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            len: {
                args: [3, 100],
                msg: 'La especialidad debe tener entre 3 y 100 caracteres'
            }
        }
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'Trainer',
    tableName: 'entrenadores',
    timestamps: true
});

// Definir relaciones
Trainer.belongsTo(User, {
    foreignKey: 'id_usuario',
    as: 'usuario'
});

export default Trainer; 