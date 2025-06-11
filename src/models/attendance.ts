import { DataTypes, Model, type Optional } from "sequelize"
import sequelize from "../config/db"
import Person from "./person.model"
import Contract from "./contract"
import User from "./user"

interface AttendanceAttributes {
    id: number
    id_persona: number
    id_contrato: number
    fecha_uso: Date
    hora_registro: string
    estado: "Activo" | "Eliminado"
    fecha_registro: Date
    fecha_actualizacion: Date
    usuario_registro?: number
    usuario_actualizacion?: number
}

interface AttendanceCreationAttributes
    extends Optional<AttendanceAttributes, "id" | "fecha_registro" | "fecha_actualizacion" | "hora_registro"> { }

class Attendance extends Model<AttendanceAttributes, AttendanceCreationAttributes> implements AttendanceAttributes {
    public id!: number
    public id_persona!: number
    public id_contrato!: number
    public fecha_uso!: Date
    public hora_registro!: string
    public estado!: "Activo" | "Eliminado"
    public fecha_registro!: Date
    public fecha_actualizacion!: Date
    public usuario_registro?: number
    public usuario_actualizacion?: number

    // Timestamps
    public readonly createdAt!: Date
    public readonly updatedAt!: Date
}

Attendance.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        id_persona: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "personas",
                key: "id_persona",
            }
        },
        id_contrato: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "contratos",
                key: "id",
            }
        },
        fecha_uso: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            validate: {
                isDate: true,
                notInFuture(value: Date) {
                    if (new Date(value) > new Date()) {
                        throw new Error('La fecha de uso no puede ser futura');
                    }
                }
            }
        },
        hora_registro: {
            type: DataTypes.TIME,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            validate: {
                isValidTime(value: string) {
                    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(value)) {
                        throw new Error('La hora debe tener un formato válido (HH:MM:SS)');
                    }
                }
            }
        },
        estado: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "Activo",
            validate: {
                isIn: {
                    args: [["Activo", "Eliminado"]],
                    msg: 'El estado debe ser "Activo" o "Eliminado"'
                }
            }
        },
        fecha_registro: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            validate: {
                isDate: true
            }
        },
        fecha_actualizacion: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            validate: {
                isDate: true
            }
        },
        usuario_registro: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "usuarios",
                key: "id",
            }
        },
        usuario_actualizacion: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "usuarios",
                key: "id",
            }
        },
    },
    {
        sequelize,
        modelName: "Asistencia",
        tableName: "asistencias",
        timestamps: false,
        underscored: true,
    },
)

// Associations
Attendance.belongsTo(Person, { 
    foreignKey: "id_persona", 
    as: "persona",
})

Attendance.belongsTo(Contract, { 
    foreignKey: "id_contrato", 
    as: "contrato",
})

Attendance.belongsTo(User, { 
    foreignKey: "usuario_registro", 
    as: "registrador" 
})

Attendance.belongsTo(User, { 
    foreignKey: "usuario_actualizacion", 
    as: "actualizador" 
})

// Reverse associations
Person.hasMany(Attendance, { 
    foreignKey: "id_persona", 
    as: "asistencias" 
})

Contract.hasMany(Attendance, { 
    foreignKey: "id_contrato", 
    as: "asistencias" 
})

export default Attendance 