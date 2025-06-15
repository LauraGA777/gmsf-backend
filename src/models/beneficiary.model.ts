import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/db";

interface BeneficiaryAttributes {
  id: number;
  codigo: string;
  id_persona: number;
  id_cliente: number;
  relacion?: string;
  es_titular: boolean;
  fecha_registro: Date;
  fecha_actualizacion: Date;
  estado: boolean;
}

interface BeneficiaryCreationAttributes
  extends Optional<BeneficiaryAttributes, "id" | "es_titular" | "relacion"> {}

class Beneficiary
  extends Model<BeneficiaryAttributes, BeneficiaryCreationAttributes>
  implements BeneficiaryAttributes {
  public id!: number;
  public codigo!: string;
  public id_persona!: number;
  public id_cliente!: number;
  public relacion?: string;
  public es_titular!: boolean;
  public fecha_registro!: Date;
  public fecha_actualizacion!: Date;
  public estado!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Beneficiary.init(
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
          args: /^B\d{3}$/,
          msg: 'El código debe tener el formato B seguido de 3 dígitos'
        }
      }
    },
    id_persona: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "personas",
        key: "id_persona",
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
    relacion: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    es_titular: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    fecha_actualizacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Beneficiary",
    tableName: "beneficiarios",
    timestamps: false,
    underscored: true,
  },
);

export default Beneficiary; 