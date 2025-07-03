import User from './user';
import Role from './role';
import Permission from './permission';
import Privilege from './privilege';

// Definir todas las asociaciones aquí
export const defineAssociations = () => {
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
        through: 'rol_permiso',
        foreignKey: 'id_rol',
        otherKey: 'id_permiso',
        as: 'permisos'
    });

    Permission.belongsToMany(Role, {
        through: 'rol_permiso',
        foreignKey: 'id_permiso',
        otherKey: 'id_rol',
        as: 'roles'
    });

    // Role - Privilege (Many-to-Many)
    Role.belongsToMany(Privilege, {
        through: 'rol_privilegio',
        foreignKey: 'id_rol',
        otherKey: 'id_privilegio',
        as: 'privilegios'
    });

    Privilege.belongsToMany(Role, {
        through: 'rol_privilegio',
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
};