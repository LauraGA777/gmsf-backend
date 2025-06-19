import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/db";
import Person from "./person.model";

interface EmergencyContactAttributes {
    id: number;
    id_persona: number;
    nombre_contacto: string;
    telefono_contacto: string;
    relacion_contacto?: string;
    es_mismo_beneficiario: boolean;
}

interface EmergencyContactCreationAttributes
  extends Optional<
    EmergencyContactAttributes,
    "id" | "es_mismo_beneficiario"
  > {}

class EmergencyContact
  extends Model<EmergencyContactAttributes, EmergencyContactCreationAttributes>
  implements EmergencyContactAttributes
{
    public id!: number;
    public id_persona!: number;
    public nombre_contacto!: string;
    public telefono_contacto!: string;
    public relacion_contacto?: string;
    public es_mismo_beneficiario!: boolean;
  
    // Timestamps
    public readonly fecha_registro!: Date;
    public readonly fecha_actualizacion!: Date;
}

EmergencyContact.init(
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
          },
        },
        nombre_contacto: {
          type: DataTypes.STRING(100),
          allowNull: false,
          validate: {
            notEmpty: {
              msg: 'El nombre del contacto no puede estar vacío'
            },
            len: {
              args: [3, 100],
              msg: 'El nombre del contacto debe tener entre 3 y 100 caracteres'
            }
          }
        },
        telefono_contacto: {
          type: DataTypes.STRING(15),
          allowNull: false,
          validate: {
            is: {
              args: /^\d{7,15}$/,
              msg: 'El teléfono debe contener entre 7 y 15 dígitos numéricos'
            }
          },
        },
        relacion_contacto: {
          type: DataTypes.STRING(50),
          allowNull: true,
          validate: {
            len: {
              args: [3, 50],
              msg: 'La relación debe tener entre 3 y 50 caracteres cuando se proporciona'
            }
          }
        },
        es_mismo_beneficiario: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      },
  {
    sequelize,
    modelName: "ContactoEmergencia",
    tableName: "contactos_emergencia",
    timestamps: true,
    underscored: true,
    createdAt: "fecha_registro",
    updatedAt: "fecha_actualizacion",
  }
);

export default EmergencyContact; 