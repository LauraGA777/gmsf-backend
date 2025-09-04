"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessibleModules = exports.checkPermissionChanges = exports.getPermissionsByRole = void 0;
const permission_service_1 = require("../services/permission.service");
/**
 * GET /auth/permissions/:roleId
 * Obtener permisos de un rol específico
 */
const getPermissionsByRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const permissions = yield permission_service_1.permissionService.getPermissionsByRole(parseInt(roleId));
        res.json({
            success: true,
            status: 'success',
            message: 'Permisos obtenidos exitosamente',
            data: permissions
        });
    }
    catch (error) {
        console.error('❌ Error al obtener permisos por rol:', error);
        next(error);
    }
});
exports.getPermissionsByRole = getPermissionsByRole;
/**
 * GET /auth/permissions/check/:roleId
 * Verificar cambios en permisos
 */
const checkPermissionChanges = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roleId } = req.params;
        const { lastHash } = req.query;
        console.log('🔄 Verificando cambios en permisos para rol:', roleId);
        const currentPermissions = yield permission_service_1.permissionService.getPermissionsByRole(parseInt(roleId));
        const currentHash = permission_service_1.permissionService.generatePermissionsHash(currentPermissions);
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
    }
    catch (error) {
        console.error('❌ Error al verificar cambios de permisos:', error);
        next(error);
    }
});
exports.checkPermissionChanges = checkPermissionChanges;
/**
 * GET /auth/permissions/modules/:roleId
 * Obtener módulos accesibles por rol
 */
const getAccessibleModules = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roleId } = req.params;
        console.log('📋 Obteniendo módulos accesibles para rol:', roleId);
        const modules = yield permission_service_1.permissionService.getAccessibleModulesByRole(parseInt(roleId));
        res.json({
            success: true,
            status: 'success',
            data: modules
        });
    }
    catch (error) {
        console.error('❌ Error al obtener módulos accesibles:', error);
        next(error);
    }
});
exports.getAccessibleModules = getAccessibleModules;
