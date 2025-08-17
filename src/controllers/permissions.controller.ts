import { Request, Response, NextFunction } from 'express';
import { permissionService } from '../services/permission.service';

/**
 * GET /auth/permissions/:roleId
 * Obtener permisos de un rol específico
 */
export const getPermissionsByRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { roleId } = req.params;
        
        // ✅ Validar que roleId sea un número válido
        const roleIdNum = parseInt(roleId);
        if (isNaN(roleIdNum) || roleIdNum <= 0) {
            res.status(400).json({
                success: false,
                status: 'error',
                message: 'ID de rol inválido'
            });
            return;
        }

        console.log('🔍 Obteniendo permisos para rol:', roleId);

        const permissions = await permissionService.getPermissionsByRole(parseInt(roleId));

        res.json({
            success: true,
            status: 'success',
            message: 'Permisos obtenidos exitosamente',
            data: permissions
        });

    } catch (error) {
        console.error('❌ Error al obtener permisos por rol:', error);
        next(error);
    }
};

/**
 * GET /auth/permissions/check/:roleId
 * Verificar cambios en permisos
 */
export const checkPermissionChanges = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { roleId } = req.params;
        const { lastHash } = req.query;

        console.log('🔄 Verificando cambios en permisos para rol:', roleId);

        const currentPermissions = await permissionService.getPermissionsByRole(parseInt(roleId));
        const currentHash = permissionService.generatePermissionsHash(currentPermissions);

        const hasChanged = currentHash !== lastHash;

        res.json({
            success: true,
            status: 'success',
            data: {
                hasChanged,
                currentHash,
                permissions: hasChanged ? currentPermissions : null
            }
        });

    } catch (error) {
        console.error('❌ Error al verificar cambios de permisos:', error);
        next(error);
    }
};

/**
 * GET /auth/permissions/modules/:roleId
 * Obtener módulos accesibles por rol
 */
export const getAccessibleModules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { roleId } = req.params;

        console.log('📋 Obteniendo módulos accesibles para rol:', roleId);

        const modules = await permissionService.getAccessibleModulesByRole(parseInt(roleId));

        res.json({
            success: true,
            status: 'success',
            data: modules
        });

    } catch (error) {
        console.error('❌ Error al obtener módulos accesibles:', error);
        next(error);
    }
};