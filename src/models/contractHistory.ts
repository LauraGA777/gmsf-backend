import { DataTypes, Model, type Optional } from "sequelize"
import sequelize from "../config/db"
import User from "./user"

interface ContractHistoryAttributes {
  id: number
  id_contrato: number
  estado_anterior?: string
  estado_nuevo: string
  fecha_cambio: Date
  usuario_cambio?: number
  motivo?: string
}

interface ContractHistoryCreationAttributes extends Optional<ContractHistoryAttributes, "id" | "fecha_cambio"> { }

class ContractHistory
  extends Model<ContractHistoryAttributes, ContractHistoryCreationAttributes>
  implements ContractHistoryAttributes {
  public id!: number
  public id_contrato!: number
  public estado_anterior?: string
  public estado_nuevo!: string
  public fecha_cambio!: Date
  public usuario_cambio?: number
  public motivo?: string

  // Timestamps
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

ContractHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_contrato: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "contratos",
        key: "id",
      },
    },
    estado_anterior: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        isIn: {
          args: [["Activo", "Congelado", "Vencido", "Cancelado", "Por vencer"]],
          msg: 'El estado anterior debe ser uno de los siguientes: Activo, Congelado, Vencido, Cancelado, Por vencer'
        }
      }
    },
    estado_nuevo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: {
          args: [["Activo", "Congelado", "Vencido", "Cancelado", "Por vencer"]],
          msg: 'El estado nuevo debe ser uno de los siguientes: Activo, Congelado, Vencido, Cancelado, Por vencer'
        },
        notEqualToPrevious(value: string) {
          if (value === this.estado_anterior) {
            throw new Error('El estado nuevo debe ser diferente al estado anterior');
          }
        }
      }
    },
    fecha_cambio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: true
      }
    },
    usuario_cambio: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "usuarios",
        key: "id",
      },
    },
    motivo: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [10, 500],
          msg: 'El motivo debe tener entre 10 y 500 caracteres cuando se proporciona'
        }
      }
    },
  },
  {
    sequelize,
    modelName: "ContractHistory",
    tableName: "historial_contratos",
    timestamps: true,
    underscored: true,
  },
)

export default ContractHistory