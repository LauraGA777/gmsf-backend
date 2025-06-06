import User from "./user"
import Client from "./client.model"
import EmergencyContact from "./emergencyContact"
import Membership from "./membership"
import Contract from "./contract"
import ContractHistory from "./contractHistory"
import Training from "./training"
import Role from './role'
import Permission from './permission'
import Privilege from './privilege'

export {
  User,
  Client,
  EmergencyContact,
  Membership,
  Contract,
  ContractHistory,
  Training,
  Role,
  Permission,
  Privilege
}

// Initialize all models and associations
export const initModels = () => {
  // All associations are defined in the model files
  return {
    User,
    Client,
    EmergencyContact,
    Membership,
    Contract,
    ContractHistory,
    Training,
    Role,
    Permission,
    Privilege
  }
}

// Definir relaciones después de que todos los modelos estén cargados

// Relaciones de Role
Role.hasMany(User, {
    foreignKey: 'id_rol',
    as: 'usuarios'
});

Role.belongsToMany(Permission, {
    through: 'rol_permiso',
    foreignKey: 'id_rol',
    otherKey: 'id_permiso',
    as: 'permisos'
});

Role.belongsToMany(Privilege, {
    through: 'rol_privilegio',
    foreignKey: 'id_rol',
    otherKey: 'id_privilegio',
    as: 'privilegios'
});

// Relaciones de Permission
Permission.hasMany(Privilege, {
    foreignKey: 'id_permiso',
    as: 'privilegios'
});

// Relaciones de Privilege
Privilege.belongsTo(Permission, {
    foreignKey: 'id_permiso',
    as: 'permiso'
});

// Relaciones de Client
Client.belongsTo(User, { foreignKey: "id_usuario", as: "usuario" });
Client.belongsTo(Client, { foreignKey: "id_titular", as: "titularCliente" });
Client.hasMany(Client, { foreignKey: "id_titular", as: "clientesBeneficiarios" });
Client.hasMany(EmergencyContact, { foreignKey: "id_persona", as: "contactos_emergencia" });

// Relaciones de EmergencyContact
EmergencyContact.belongsTo(Client, { foreignKey: "id_persona", as: "persona" });
