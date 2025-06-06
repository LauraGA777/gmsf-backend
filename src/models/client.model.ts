import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/db";
import User from "./user";
import EmergencyContact from "./emergencyContact";

interface ClientAttributes {
  id_persona: number;
  id_usuario?: number;
  codigo: string;
  id_titular?: number;
  relacion?: string;
  fecha_registro: Date;
  fecha_actualizacion: Date;
  estado: boolean;
}

interface ClientCreationAttributes
  extends Optional<
    ClientAttributes,
    "id_persona" | "fecha_actualizacion" | "estado"
  > {}

class Client
  extends Model<ClientAttributes, ClientCreationAttributes>
  implements ClientAttributes {
  public id_persona!: number;
  public id_usuario?: number;
  public codigo!: string;
  public id_titular?: number;
  public relacion?: string;
  public fecha_registro!: Date;
  public fecha_actualizacion!: Date;
  public estado!: boolean;

  // Add association properties for TypeScript
  public usuario?: User; // Association with User
  public titularCliente?: Client; // Association with titular Client
  public clientesBeneficiarios?: Client[]; // Association with beneficiary Clients
  public contactosEmergencia?: EmergencyContact[]; // Association with EmergencyContact

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Client.init(
  {
    id_persona: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "usuarios",
        key: "id",
      },
    },
    codigo: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: {
        name: 'unique_client_code',
        msg: 'El código de cliente ya existe'
      },
      validate: {
        is: {
          args: /^P\d{3}$/,
          msg: 'El código debe tener el formato P seguido de 3 dígitos'
        }
      }
    },
    id_titular: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "personas",
        key: "id_persona",
      },
      validate: {
        notSelfReference(value: number) {
          if (value === this.id_persona) {
            throw new Error('Un cliente no puede ser su propio titular');
          }
        },
        async validTitularBeneficiario(value: number) {
          if (value) {
            // If this client has a titular, it can't be a titular itself
            const titular = await Client.findByPk(value);
            if (titular?.id_titular) {
              throw new Error('Un beneficiario no puede ser titular de otro beneficiario');
            }
          }
        }
      }
    },
    relacion: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: {
          args: [3, 50],
          msg: 'La relación debe tener entre 3 y 50 caracteres cuando se proporciona'
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
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        isBoolean: {
          msg: 'El estado debe ser verdadero o falso'
        }
      }
    },
  },
  {
    sequelize,
    modelName: "Client",
    tableName: "personas",
    timestamps: false,
  }
);

console.log('Client model initialized with codigo regex:', /^P\d{3}$/.toString());

// Associations - Removed association definitions to handle circular dependency in index.ts
/*
Client.belongsTo(User, { foreignKey: "id_usuario", as: "usuario" });
Client.belongsTo(Client, { foreignKey: "id_titular", as: "titularCliente" });
Client.hasMany(Client, { foreignKey: "id_titular", as: "clientesBeneficiarios" });
Client.hasMany(EmergencyContact, { foreignKey: "id_persona", as: "contactos_emergencia" });
*/

export default Client; 