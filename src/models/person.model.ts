import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/db";
import User from "./user";
import Contract from "./contract";

interface PersonAttributes {
  id_persona: number;
  codigo: string;
  id_usuario?: number;
  id_titular?: number;
  relacion?: string;
  fecha_registro: Date;
  fecha_actualizacion: Date;
  estado: boolean;

  // Relationships
  usuario?: User;
  contratos?: Contract[];
}

interface PersonCreationAttributes
  extends Optional<PersonAttributes, "id_persona" | "id_usuario" | "id_titular" | "relacion"> {}

class Person
  extends Model<PersonAttributes, PersonCreationAttributes>
  implements PersonAttributes {
  public id_persona!: number;
  public codigo!: string;
  public id_usuario?: number;
  public id_titular?: number;
  public relacion?: string;
  public fecha_registro!: Date;
  public fecha_actualizacion!: Date;
  public estado!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly usuario?: User;
  public readonly titular?: Person;
  public readonly beneficiarios?: Person[];
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
    id_titular: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "personas",
        key: "id_persona",
      },
    },
    relacion: {
      type: DataTypes.STRING(50),
      allowNull: true,
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
    modelName: "Person",
    tableName: "personas",
    timestamps: false,
    underscored: true,
  },
);

export default Person; 