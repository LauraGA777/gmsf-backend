import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/db";
import User from "./user";

interface UserHistoryAttributes {
    id: number;
    id_usuario: number;
    estado_anterior: boolean;
    estado_nuevo: boolean;
    fecha_cambio: Date;
    usuario_cambio: number;
    motivo?: string;
}

interface UserHistoryCreationAttributes extends Optional<UserHistoryAttributes, "id" | "fecha_cambio"> {}

class UserHistory extends Model<UserHistoryAttributes, UserHistoryCreationAttributes> implements UserHistoryAttributes {
    public id!: number;
    public id_usuario!: number;
    public estado_anterior!: boolean;
    public estado_nuevo!: boolean;
    public fecha_cambio!: Date;
    public usuario_cambio!: number;
    public motivo?: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

UserHistory.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "usuarios",
                key: "id",
            },
        },
        estado_anterior: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        estado_nuevo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        fecha_cambio: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        usuario_cambio: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "usuarios",
                key: "id",
            },
        },
        motivo: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: "UserHistory",
        tableName: "historial_usuarios",
        timestamps: true,
        underscored: true,
    }
);

export default UserHistory; 