import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db';
import User from './user';

interface TrainerAttributes {
    id: number;
    codigo: string;
    id_usuario: number;
    especialidad: string;
    estado: boolean;
    fecha_registro: Date;
    createdAt?: Date;
    updatedAt?: Date;
    usuario?: User; 
}

interface TrainerCreationAttributes extends Optional<TrainerAttributes, 'id' | 'createdAt' | 'updatedAt' | 'usuario' | 'fecha_registro'> {}

class Trainer extends Model<TrainerAttributes, TrainerCreationAttributes> implements TrainerAttributes {
    public id!: number;
    public codigo!: string;
    public id_usuario!: number;
    public especialidad!: string;
    public estado!: boolean;
    public fecha_registro!: Date;

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
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true, // Un usuario solo puede ser un entrenador una vez
        references: {
            model: User,
            key: 'id'
        },
        onDelete: 'CASCADE' // Si se elimina el usuario, se elimina el entrenador
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
    },
    fecha_registro: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    }
}, {
    sequelize,
    tableName: 'entrenadores',
    modelName: 'Trainer',
    timestamps: true 
});

export default Trainer; 