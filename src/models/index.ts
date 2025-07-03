import User from "./user"
import Person from "./person.model"
import EmergencyContact from "./emergencyContact"
import Membership from "./membership"
import Contract from "./contract"
import ContractHistory from "./contractHistory"
import Training from "./training"
import Role from './role'
import Permission from './permission'
import Privilege from './privilege'
import Trainer from './trainer'
import Attendance from './attendance'
import Beneficiary from "./beneficiary.model"
import { defineAssociations } from './associations';

// Definir asociaciones de Role primero
defineAssociations();

// Resto de asociaciones (sin duplicar las de Role)
// Relaciones de Contratos
Contract.belongsTo(Person, { foreignKey: "id_persona", as: "persona" });
Person.hasMany(Contract, { foreignKey: "id_persona", as: "contratos" });

Contract.belongsTo(Membership, { foreignKey: "id_membresia", as: "membresia" });
Membership.hasMany(Contract, { foreignKey: "id_membresia", as: "contratos" });

Contract.belongsTo(User, { foreignKey: "usuario_registro", as: "registrador" });
User.hasMany(Contract, { foreignKey: "usuario_registro", as: "contratos_registrados" });

Contract.belongsTo(User, { foreignKey: "usuario_actualizacion", as: "actualizador" });
User.hasMany(Contract, { foreignKey: "usuario_actualizacion", as: "contratos_actualizados" });

// Relaciones de Person y User
Person.belongsTo(User, { foreignKey: 'id_usuario', as: 'usuario' });
User.hasOne(Person, { foreignKey: 'id_usuario', as: 'persona' });

// Relaciones de Person y EmergencyContact
Person.hasMany(EmergencyContact, { foreignKey: 'id_persona', as: 'contactos_emergencia' });
EmergencyContact.belongsTo(Person, { foreignKey: 'id_persona', as: 'persona' });

// Relaciones de Beneficiarios
Person.hasMany(Beneficiary, { foreignKey: 'id_cliente', as: 'beneficiarios' });
Beneficiary.belongsTo(Person, { foreignKey: 'id_cliente', as: 'titular' });
Beneficiary.belongsTo(Person, { foreignKey: 'id_persona', as: 'persona_beneficiaria' });

// Relaciones de Historial de Contrato
Contract.hasMany(ContractHistory, { foreignKey: "id_contrato", as: "historial" });
ContractHistory.belongsTo(Contract, { foreignKey: "id_contrato", as: "contrato" });
ContractHistory.belongsTo(User, { foreignKey: "usuario_cambio", as: "usuarioDelCambio" });
User.hasMany(ContractHistory, { foreignKey: "usuario_cambio", as: "cambios_contratos" });

// Relaciones de Trainer y User
Trainer.belongsTo(User, { foreignKey: 'id_usuario', as: 'usuario' });
User.hasOne(Trainer, { foreignKey: 'id_usuario', as: 'detalles_entrenador' });

// Relaciones de Training
Training.belongsTo(Trainer, { foreignKey: "id_entrenador", as: "entrenador" });
Training.belongsTo(Person, { foreignKey: "id_cliente", as: "cliente" });
Trainer.hasMany(Training, { foreignKey: "id_entrenador", as: "entrenamientos_asignados" });
Person.hasMany(Training, { foreignKey: "id_cliente", as: "entrenamientos" });


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
  Trainer,
  Attendance,
  Beneficiary
}
