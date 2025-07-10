import User from './user';
import Role from './role';
import Permission from './permission';
import Privilege from './privilege';
import Membership from './membership';
import Contract from './contract';
import Trainer from './trainer';
import Person from './person.model';
import Training from './training';

// Definir todas las asociaciones aquí
export const defineAssociations = () => {
    console.log('🔗 Definiendo asociaciones del sistema de roles...');

    // User - Role
    User.belongsTo(Role, {
        foreignKey: 'id_rol',
        as: 'rol'
    });

    Role.hasMany(User, {
        foreignKey: 'id_rol',
        as: 'usuarios'
    });

    // Role - Permission (Many-to-Many)
    Role.belongsToMany(Permission, {
        through: 'rol_permiso',  // ✅ SINGULAR - usar la tabla que existe
        foreignKey: 'id_rol',
        otherKey: 'id_permiso',
        as: 'permisos'
    });

    Permission.belongsToMany(Role, {
        through: 'rol_permiso',  // ✅ SINGULAR - mismo nombre
        foreignKey: 'id_permiso',
        otherKey: 'id_rol',
        as: 'roles'
    });

    // Role - Privilege (Many-to-Many)
    Role.belongsToMany(Privilege, {
        through: 'rol_privilegio',  // ✅ SINGULAR - verificar que existe
        foreignKey: 'id_rol',
        otherKey: 'id_privilegio',
        as: 'privilegios'
    });

    Privilege.belongsToMany(Role, {
        through: 'rol_privilegio',  // ✅ SINGULAR - mismo nombre
        foreignKey: 'id_privilegio',
        otherKey: 'id_rol',
        as: 'roles'
    });

    // Permission - Privilege (One-to-Many)
    Permission.hasMany(Privilege, {
        foreignKey: 'id_permiso',
        as: 'privilegios'
    });

    Privilege.belongsTo(Permission, {
        foreignKey: 'id_permiso',
        as: 'permiso'
    });

    // Membership - Contract (One-to-Many)
    Membership.hasMany(Contract, {
        foreignKey: 'id_membresia',
        as: 'contratos'
    });

    Contract.belongsTo(Membership, {
        foreignKey: 'id_membresia',
        as: 'membresia'
    });

    // User - Trainer (One-to-One)
    User.hasOne(Trainer, {
        foreignKey: 'id_usuario',
        as: 'entrenador'
    });

    Trainer.belongsTo(User, {
        foreignKey: 'id_usuario',
        as: 'usuario'
    });

    // Person - User (One-to-One)
    Person.belongsTo(User, {
        foreignKey: 'id_usuario',
        as: 'usuario'
    });

    User.hasOne(Person, {
        foreignKey: 'id_usuario',
        as: 'persona'
    });

    // Training - Trainer (Many-to-One)
    Training.belongsTo(Trainer, {
        foreignKey: 'id_entrenador',
        as: 'entrenador'
    });

    Trainer.hasMany(Training, {
        foreignKey: 'id_entrenador',
        as: 'entrenamientos'
    });

    // Training - Person (Many-to-One)
    Training.belongsTo(Person, {
        foreignKey: 'id_cliente',
        as: 'cliente'
    });

    Person.hasMany(Training, {
        foreignKey: 'id_cliente',
        as: 'entrenamientos'
    });

    // Contract - Person (Many-to-One)
    Contract.belongsTo(Person, {
        foreignKey: 'id_persona',
        as: 'persona'
    });

    Person.hasMany(Contract, {
        foreignKey: 'id_persona',
        as: 'contratos'
    });

    console.log('✅ Asociaciones definidas correctamente');
};