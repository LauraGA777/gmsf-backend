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

// Relaciones de Contratos - movidas a associations.ts
Contract.belongsTo(User, { foreignKey: "usuario_registro", as: "registrador" });
User.hasMany(Contract, { foreignKey: "usuario_registro", as: "contratos_registrados" });

Contract.belongsTo(User, { foreignKey: "usuario_actualizacion", as: "actualizador" });
User.hasMany(Contract, { foreignKey: "usuario_actualizacion", as: "contratos_actualizados" });

// Relaciones específicas no duplicadas en associations.ts
// Relaciones de Person y EmergencyContact
Person.hasMany(EmergencyContact, { foreignKey: 'id_persona', as: 'contactos_emergencia' });
EmergencyContact.belongsTo(Person, { foreignKey: 'id_persona', as: 'persona_contacto' });

// Relaciones de Beneficiarios
Person.hasMany(Beneficiary, { foreignKey: 'id_cliente', as: 'beneficiarios' });
Beneficiary.belongsTo(Person, { foreignKey: 'id_cliente', as: 'titular' });
Beneficiary.belongsTo(Person, { foreignKey: 'id_persona', as: 'persona_beneficiaria' });

// Relaciones de Historial de Contrato
Contract.hasMany(ContractHistory, { foreignKey: "id_contrato", as: "historial" });
ContractHistory.belongsTo(Contract, { foreignKey: "id_contrato", as: "contrato" });
ContractHistory.belongsTo(User, { foreignKey: "usuario_cambio", as: "usuarioDelCambio" });
User.hasMany(ContractHistory, { foreignKey: "usuario_cambio", as: "cambios_contratos" });

// Relaciones de Attendance
Attendance.belongsTo(Person, { foreignKey: "id_persona", as: "persona_asistencia" });
Person.hasMany(Attendance, { foreignKey: "id_persona", as: "asistencias" });

Attendance.belongsTo(Contract, { foreignKey: "id_contrato", as: "contrato" });
Contract.hasMany(Attendance, { foreignKey: "id_contrato", as: "asistencias" });

Attendance.belongsTo(User, { foreignKey: "usuario_registro", as: "registrador" });
User.hasMany(Attendance, { foreignKey: "usuario_registro", as: "asistencias_registradas" });

Attendance.belongsTo(User, { foreignKey: "usuario_actualizacion", as: "actualizador" });
User.hasMany(Attendance, { foreignKey: "usuario_actualizacion", as: "asistencias_actualizadas" });


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
