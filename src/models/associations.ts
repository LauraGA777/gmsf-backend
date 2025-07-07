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
        through: 'rol_permisos', // Nombre corregido
        foreignKey: 'rol_id',    // Nombre corregido
        otherKey: 'permiso_id',  // Nombre corregido
        as: 'permisos'
    });

    Permission.belongsToMany(Role, {
        through: 'rol_permisos', // Nombre corregido
        foreignKey: 'permiso_id', // Nombre corregido
        otherKey: 'rol_id',      // Nombre corregido
        as: 'roles'
    });

    // Role - Privilege (Many-to-Many)
    Role.belongsToMany(Privilege, {
        through: 'rol_privilegios', // Nombre corregido
        foreignKey: 'rol_id',       // Nombre corregido
        otherKey: 'privilegio_id',  // Nombre corregido
        as: 'privilegios'
    });

    Privilege.belongsToMany(Role, {
        through: 'rol_privilegios', // Nombre corregido
        foreignKey: 'privilegio_id', // Nombre corregido
        otherKey: 'rol_id',         // Nombre corregido
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