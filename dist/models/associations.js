"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineAssociations = void 0;
const user_1 = __importDefault(require("./user"));
const role_1 = __importDefault(require("./role"));
const permission_1 = __importDefault(require("./permission"));
const privilege_1 = __importDefault(require("./privilege"));
const membership_1 = __importDefault(require("./membership"));
const contract_1 = __importDefault(require("./contract"));
const trainer_1 = __importDefault(require("./trainer"));
const person_model_1 = __importDefault(require("./person.model"));
const training_1 = __importDefault(require("./training"));
// Definir todas las asociaciones aquí
const defineAssociations = () => {
    console.log('🔗 Definiendo asociaciones del sistema de roles...');
    // User - Role
    user_1.default.belongsTo(role_1.default, {
        foreignKey: 'id_rol',
        as: 'rol'
    });
    role_1.default.hasMany(user_1.default, {
        foreignKey: 'id_rol',
        as: 'usuarios'
    });
    // Role - Permission (Many-to-Many)
    role_1.default.belongsToMany(permission_1.default, {
        through: 'rol_permiso', // ✅ SINGULAR - usar la tabla que existe
        foreignKey: 'id_rol',
        otherKey: 'id_permiso',
        as: 'permisos'
    });
    permission_1.default.belongsToMany(role_1.default, {
        through: 'rol_permiso', // ✅ SINGULAR - mismo nombre
        foreignKey: 'id_permiso',
        otherKey: 'id_rol',
        as: 'roles'
    });
    // Role - Privilege (Many-to-Many)
    role_1.default.belongsToMany(privilege_1.default, {
        through: 'rol_privilegio', // ✅ SINGULAR - verificar que existe
        foreignKey: 'id_rol',
        otherKey: 'id_privilegio',
        as: 'privilegios'
    });
    privilege_1.default.belongsToMany(role_1.default, {
        through: 'rol_privilegio', // ✅ SINGULAR - mismo nombre
        foreignKey: 'id_privilegio',
        otherKey: 'id_rol',
        as: 'roles'
    });
    // Permission - Privilege (One-to-Many)
    permission_1.default.hasMany(privilege_1.default, {
        foreignKey: 'id_permiso',
        as: 'privilegios'
    });
    privilege_1.default.belongsTo(permission_1.default, {
        foreignKey: 'id_permiso',
        as: 'permiso'
    });
    // Membership - Contract (One-to-Many)
    membership_1.default.hasMany(contract_1.default, {
        foreignKey: 'id_membresia',
        as: 'contratos'
    });
    contract_1.default.belongsTo(membership_1.default, {
        foreignKey: 'id_membresia',
        as: 'membresia'
    });
    // User - Trainer (One-to-One)
    user_1.default.hasOne(trainer_1.default, {
        foreignKey: 'id_usuario',
        as: 'entrenador',
        onDelete: 'CASCADE'
    });
    trainer_1.default.belongsTo(user_1.default, {
        foreignKey: 'id_usuario',
        as: 'usuario'
    });
    // Person - User (One-to-One)
    person_model_1.default.belongsTo(user_1.default, {
        foreignKey: 'id_usuario',
        as: 'usuario'
    });
    user_1.default.hasOne(person_model_1.default, {
        foreignKey: 'id_usuario',
        as: 'datosPersona'
    });
    // Training - Trainer (Many-to-One)
    training_1.default.belongsTo(trainer_1.default, {
        foreignKey: 'id_entrenador',
        as: 'entrenador'
    });
    trainer_1.default.hasMany(training_1.default, {
        foreignKey: 'id_entrenador',
        as: 'entrenamientos'
    });
    // Training - Person (Many-to-One)
    training_1.default.belongsTo(person_model_1.default, {
        foreignKey: 'id_cliente',
        as: 'cliente'
    });
    person_model_1.default.hasMany(training_1.default, {
        foreignKey: 'id_cliente',
        as: 'entrenamientos'
    });
    // Contract - Person (Many-to-One)
    contract_1.default.belongsTo(person_model_1.default, {
        foreignKey: 'id_persona',
        as: 'persona'
    });
    person_model_1.default.hasMany(contract_1.default, {
        foreignKey: 'id_persona',
        as: 'contratos'
    });
    console.log('✅ Asociaciones definidas correctamente');
};
exports.defineAssociations = defineAssociations;
