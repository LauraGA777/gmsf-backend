import User from './user';
import Role from './role';
import Permission from './permission';
import Privilege from './privilege';
import Membership from './membership';
import Contract from './contract';

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

    console.log('✅ Asociaciones definidas correctamente');
};