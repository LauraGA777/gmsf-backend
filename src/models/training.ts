import { DataTypes, Model, type Optional } from "sequelize"
import sequelize from "../config/db"
import User from "./user"
import Person from "./person.model"

interface TrainingAttributes {
    id: number
    titulo: string
    descripcion?: string
    fecha_inicio: Date
    fecha_fin: Date
    id_entrenador: number
    id_cliente: number
    estado: "Programado" | "En proceso" | "Completado" | "Cancelado"
    notas?: string
    fecha_creacion: Date | null
    // Relationships
    entrenador?: User
    cliente?: Person
}

interface TrainingCreationAttributes
    extends Optional<TrainingAttributes, "id" | "descripcion" | "notas" | "fecha_creacion"> { }

class Training
    extends Model<TrainingAttributes, TrainingCreationAttributes>
    implements TrainingAttributes {
    public id!: number
    public titulo!: string
    public descripcion?: string
    public fecha_inicio!: Date
    public fecha_fin!: Date
    public id_entrenador!: number
    public id_cliente!: number
    public estado!: "Programado" | "En proceso" | "Completado" | "Cancelado"
    public notas?: string
    public fecha_creacion!: Date | null

    // Relationships
    public readonly entrenador?: User
    public readonly cliente?: Person

    // Timestamps
    public readonly createdAt!: Date
    public readonly updatedAt!: Date
}

Training.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        titulo: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'El título no puede estar vacío'
                },
                len: {
                    args: [3, 100],
                    msg: 'El título debe tener entre 3 y 100 caracteres'
                }
            }
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true,
            validate: {
                len: {
                    args: [10, 1000],
                    msg: 'La descripción debe tener entre 10 y 1000 caracteres cuando se proporciona'
                }
            }
        },
        fecha_inicio: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                isDate: true
            }
        },
        fecha_fin: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                isDate: true,
                isAfterStartDate(value: string | Date) {
                    if (!(this as any).fecha_inicio) {
                        throw new Error('La fecha de inicio es requerida');
                    }
                    const endDate = new Date(value);
                    const startDate = new Date((this as any).fecha_inicio);
                    if (endDate <= startDate) {
                        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
                    }
                }
            }
        },
        id_entrenador: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "entrenadores",
                key: "id",
            },
        },
        id_cliente: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "personas",
                key: "id_persona",
            },
        },
        estado: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "Programado",
            validate: {
                isIn: {
                    args: [["Programado", "En proceso", "Completado", "Cancelado"]],
                    msg: 'El estado debe ser uno de los siguientes: Programado, En proceso, Completado, Cancelado'
                }
            },
        },
        notas: {
            type: DataTypes.TEXT,
            allowNull: true,
            validate: {
                len: {
                    args: [5, 500],
                    msg: 'Las notas deben tener entre 5 y 500 caracteres cuando se proporcionan'
                }
            }
        },
        fecha_creacion: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: "Entrenamiento",
        tableName: "entrenamientos",
        timestamps: true,
        underscored: true,
    },
)

export default Training