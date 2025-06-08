import User from "./user"
import Person from "./client"
import EmergencyContact from "./emergencyContact"
import Membership from "./membership"
import Contract from "./contract"
import ContractHistory from "./contractHistory"
import Training from "./training"
import Role from './role'
import Permission from './permission'
import Privilege from './privilege'
import Trainer from './trainer'

export {
  User,
  Person,
  EmergencyContact,
  Membership,
  Contract,
  ContractHistory,
  Training,
  Role,
  Permission,
  Privilege,
  Trainer
}

// Initialize all models and associations
export const initModels = () => {
  // All associations are defined in the model files
  return {
    User,
    Person,
    EmergencyContact,
    Membership,
    Contract,
    ContractHistory,
    Training,
    Role,
    Permission,
    Privilege,
    Trainer
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

// Relaciones de Contract
Contract.belongsTo(Person, { foreignKey: "id_persona", as: "persona" });
Contract.belongsTo(Membership, { foreignKey: "id_membresia", as: "membresia" });
Contract.belongsTo(User, { foreignKey: "usuario_registro", as: "registrador" });
Contract.belongsTo(User, { foreignKey: "usuario_actualizacion", as: "actualizador" });
Contract.hasMany(ContractHistory, { foreignKey: "id_contrato", as: "historial" });

// Relaciones de Person
Person.hasMany(Contract, { foreignKey: "id_persona", as: "contratos" });

// Relaciones de Membership
Membership.hasMany(Contract, { foreignKey: "id_membresia", as: "contratos" });

// Relaciones de User
User.hasMany(Contract, { foreignKey: "usuario_registro", as: "contratos_registrados" });
User.hasMany(Contract, { foreignKey: "usuario_actualizacion", as: "contratos_actualizados" });
User.hasMany(ContractHistory, { foreignKey: "usuario_cambio", as: "cambios_contratos" });

// Relaciones de ContractHistory
ContractHistory.belongsTo(Contract, { foreignKey: "id_contrato", as: "contrato" });
ContractHistory.belongsTo(User, { foreignKey: "usuario_cambio", as: "usuarioDelCambio" });

// Relaciones de Trainer y User
Trainer.belongsTo(User, { foreignKey: 'id_usuario', as: 'infoUsuario' });
User.hasOne(Trainer, { foreignKey: 'id_usuario', as: 'detalles_entrenador' });
