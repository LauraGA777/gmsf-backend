"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Beneficiary = exports.Attendance = exports.Trainer = exports.Privilege = exports.Permission = exports.Role = exports.Training = exports.ContractHistory = exports.Contract = exports.Membership = exports.EmergencyContact = exports.Person = exports.User = void 0;
const user_1 = __importDefault(require("./user"));
exports.User = user_1.default;
const person_model_1 = __importDefault(require("./person.model"));
exports.Person = person_model_1.default;
const emergencyContact_1 = __importDefault(require("./emergencyContact"));
exports.EmergencyContact = emergencyContact_1.default;
const membership_1 = __importDefault(require("./membership"));
exports.Membership = membership_1.default;
const contract_1 = __importDefault(require("./contract"));
exports.Contract = contract_1.default;
const contractHistory_1 = __importDefault(require("./contractHistory"));
exports.ContractHistory = contractHistory_1.default;
const training_1 = __importDefault(require("./training"));
exports.Training = training_1.default;
const role_1 = __importDefault(require("./role"));
exports.Role = role_1.default;
const permission_1 = __importDefault(require("./permission"));
exports.Permission = permission_1.default;
const privilege_1 = __importDefault(require("./privilege"));
exports.Privilege = privilege_1.default;
const trainer_1 = __importDefault(require("./trainer"));
exports.Trainer = trainer_1.default;
const attendance_1 = __importDefault(require("./attendance"));
exports.Attendance = attendance_1.default;
const beneficiary_model_1 = __importDefault(require("./beneficiary.model"));
exports.Beneficiary = beneficiary_model_1.default;
const associations_1 = require("./associations");
// Definir asociaciones de Role primero
(0, associations_1.defineAssociations)();
// Relaciones de Contratos - movidas a associations.ts
contract_1.default.belongsTo(user_1.default, { foreignKey: "usuario_registro", as: "registrador" });
user_1.default.hasMany(contract_1.default, { foreignKey: "usuario_registro", as: "contratos_registrados" });
contract_1.default.belongsTo(user_1.default, { foreignKey: "usuario_actualizacion", as: "actualizador" });
user_1.default.hasMany(contract_1.default, { foreignKey: "usuario_actualizacion", as: "contratos_actualizados" });
// Relaciones específicas no duplicadas en associations.ts
// Relaciones de Person y EmergencyContact
person_model_1.default.hasMany(emergencyContact_1.default, { foreignKey: 'id_persona', as: 'contactos_emergencia' });
emergencyContact_1.default.belongsTo(person_model_1.default, { foreignKey: 'id_persona', as: 'persona_contacto' });
// Relaciones de Beneficiarios
person_model_1.default.hasMany(beneficiary_model_1.default, { foreignKey: 'id_cliente', as: 'beneficiarios' });
beneficiary_model_1.default.belongsTo(person_model_1.default, { foreignKey: 'id_cliente', as: 'titular' });
beneficiary_model_1.default.belongsTo(person_model_1.default, { foreignKey: 'id_persona', as: 'persona_beneficiaria' });
// Relaciones de Historial de Contrato
contract_1.default.hasMany(contractHistory_1.default, { foreignKey: "id_contrato", as: "historial" });
contractHistory_1.default.belongsTo(contract_1.default, { foreignKey: "id_contrato", as: "contrato" });
contractHistory_1.default.belongsTo(user_1.default, { foreignKey: "usuario_cambio", as: "usuarioDelCambio" });
user_1.default.hasMany(contractHistory_1.default, { foreignKey: "usuario_cambio", as: "cambios_contratos" });
// Relaciones de Attendance
attendance_1.default.belongsTo(person_model_1.default, { foreignKey: "id_persona", as: "persona_asistencia" });
person_model_1.default.hasMany(attendance_1.default, { foreignKey: "id_persona", as: "asistencias" });
attendance_1.default.belongsTo(contract_1.default, { foreignKey: "id_contrato", as: "contrato" });
contract_1.default.hasMany(attendance_1.default, { foreignKey: "id_contrato", as: "asistencias" });
attendance_1.default.belongsTo(user_1.default, { foreignKey: "usuario_registro", as: "registrador" });
user_1.default.hasMany(attendance_1.default, { foreignKey: "usuario_registro", as: "asistencias_registradas" });
attendance_1.default.belongsTo(user_1.default, { foreignKey: "usuario_actualizacion", as: "actualizador" });
user_1.default.hasMany(attendance_1.default, { foreignKey: "usuario_actualizacion", as: "asistencias_actualizadas" });
