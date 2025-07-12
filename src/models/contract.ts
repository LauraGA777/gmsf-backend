import { DataTypes, Model, type Optional } from "sequelize"
import sequelize from "../config/db"
import Person from "./person.model"
import Membership from "./membership"
import User from "./user"

interface ContractAttributes {
    id: number
    codigo: string
    id_persona: number
    id_membresia: number
    fecha_inicio: Date
    fecha_fin: Date
    membresia_precio: number
    estado: "Activo" | "Congelado" | "Vencido" | "Cancelado" | "Por vencer"
    usuario_registro?: number
    usuario_actualizacion?: number
    fecha_congelacion?: Date | null
    motivo?: string

    // Relationships
    persona?: Person
    membresia?: Membership
    registrador?: User
    actualizador?: User
}

interface ContractCreationAttributes
    extends Optional<ContractAttributes, "id"> { }

class Contract extends Model<ContractAttributes, ContractCreationAttributes> implements ContractAttributes {
    public id!: number
    public codigo!: string
    public id_persona!: number
    public id_membresia!: number
    public fecha_inicio!: Date
    public fecha_fin!: Date
    public membresia_precio!: number
    public estado!: "Activo" | "Congelado" | "Vencido" | "Cancelado" | "Por vencer"
    public usuario_registro?: number
    public usuario_actualizacion?: number
    public fecha_congelacion?: Date | null
    public motivo?: string

    // Relationships
    public readonly persona?: Person
    public readonly membresia?: Membership
    public readonly registrador?: User
    public readonly actualizador?: User

    // Timestamps
    public readonly fecha_registro!: Date
    public readonly fecha_actualizacion!: Date
}

Contract.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        codigo: {
            type: DataTypes.STRING(10),
            allowNull: false,
            unique: true,
            validate: {
                is: {
                    args: /^C\d{4}$/,
                    msg: 'El código debe tener el formato C seguido de 4 números'
                }
            },
        },
        id_persona: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "personas",
                key: "id_persona",
            },
        },
        id_membresia: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "membresias",
                key: "id",
            },
        },
        fecha_inicio: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                isDate: true,
            }
        },
        fecha_fin: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                isDate: true
            }
        },
        membresia_precio: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: {
                    args: [0.01],
                    msg: 'El precio debe ser mayor a 0'
                }
            },
        },
        estado: {
            type: DataTypes.STRING(20),
            allowNull: false,
            validate: {
                isIn: {
                    args: [["Activo", "Congelado", "Vencido", "Cancelado", "Por vencer"]],
                    msg: 'El estado debe ser uno de los siguientes: Activo, Congelado, Vencido, Cancelado, Por vencer'
                }
            },
        },
        usuario_registro: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "usuarios",
                key: "id",
            },
        },
        usuario_actualizacion: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "usuarios",
                key: "id",
            },
        },
        fecha_congelacion: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        motivo: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: "Contract",
        tableName: "contratos",
        timestamps: true,
        underscored: true,
        createdAt: "fecha_registro",
        updatedAt: "fecha_actualizacion",
    },
)

export default Contract