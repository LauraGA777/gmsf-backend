import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/db";
import User from "./user";
import Contract from "./contract";

interface PersonAttributes {
  id_persona: number;
  codigo: string;
  id_usuario?: number;
  estado: boolean;
  fecha_registro?: Date;
  fecha_actualizacion?: Date;

  // Relationships
  usuario?: User;
  contratos?: Contract[];
}

interface PersonCreationAttributes
  extends Optional<PersonAttributes, "id_persona" | "id_usuario"> {}

class Person
  extends Model<PersonAttributes, PersonCreationAttributes>
  implements PersonAttributes {
  public id_persona!: number;
  public codigo!: string;
  public id_usuario?: number;
  public estado!: boolean;

  // Timestamps
  public readonly fecha_registro!: Date;
  public readonly fecha_actualizacion!: Date;

  public readonly usuario?: User;
  public readonly contratos?: Contract[];
  public readonly entrenamientos?: any[];
  public readonly asistencias?: any[];
  public readonly contactosEmergencia?: any[];
}

Person.init(
  {
    id_persona: {
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
          args: /^P\d{3}$/,
          msg: 'El código debe tener el formato P seguido de 3 dígitos'
        }
      }
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "usuarios",
        key: "id",
      },
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Person",
    tableName: "personas",
    timestamps: true,
    underscored: true,
    createdAt: "fecha_registro",
    updatedAt: "fecha_actualizacion",
  },
);

export default Person; 