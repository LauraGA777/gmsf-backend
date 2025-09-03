import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import ApiResponse from '../utils/apiResponse';

// Middleware para validaciones estrictas de longitud
export const strictLengthValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;

    // Validaciones estrictas para campos comunes
    if (body.correo && typeof body.correo === 'string') {
      if (body.correo.length > 254) {
        return ApiResponse.error(res, 'El correo electrónico no puede exceder 254 caracteres', 400);
      }
    }

    if (body.telefono && typeof body.telefono === 'string') {
      if (body.telefono.length > 20) {
        return ApiResponse.error(res, 'El teléfono no puede exceder 20 caracteres', 400);
      }
      // Validar que solo contenga números
      if (!/^\d+$/.test(body.telefono)) {
        return ApiResponse.error(res, 'El teléfono solo puede contener números', 400);
      }
    }

    if (body.numero_documento && typeof body.numero_documento === 'string') {
      if (body.numero_documento.length > 20) {
        return ApiResponse.error(res, 'El número de documento no puede exceder 20 caracteres', 400);
      }
      if (body.numero_documento.length < 5) {
        return ApiResponse.error(res, 'El número de documento debe tener mínimo 5 caracteres', 400);
      }
    }

    if (body.nombre && typeof body.nombre === 'string') {
      if (body.nombre.length > 100) {
        return ApiResponse.error(res, 'El nombre no puede exceder 100 caracteres', 400);
      }
    }

    if (body.apellido && typeof body.apellido === 'string') {
      if (body.apellido.length > 100) {
        return ApiResponse.error(res, 'El apellido no puede exceder 100 caracteres', 400);
      }
    }

    // Validar objetos anidados como usuario
    if (body.usuario && typeof body.usuario === 'object') {
      const usuario = body.usuario;
      
      if (usuario.correo && typeof usuario.correo === 'string' && usuario.correo.length > 254) {
        return ApiResponse.error(res, 'El correo del usuario no puede exceder 254 caracteres', 400);
      }
      
      if (usuario.telefono && typeof usuario.telefono === 'string' && usuario.telefono.length > 20) {
        return ApiResponse.error(res, 'El teléfono del usuario no puede exceder 20 caracteres', 400);
      }
      
      if (usuario.numero_documento && typeof usuario.numero_documento === 'string') {
        if (usuario.numero_documento.length > 20) {
          return ApiResponse.error(res, 'El número de documento del usuario no puede exceder 20 caracteres', 400);
        }
        if (usuario.numero_documento.length < 5) {
          return ApiResponse.error(res, 'El número de documento del usuario debe tener mínimo 5 caracteres', 400);
        }
      }
      
      if (usuario.nombre && typeof usuario.nombre === 'string' && usuario.nombre.length > 100) {
        return ApiResponse.error(res, 'El nombre del usuario no puede exceder 100 caracteres', 400);
      }
      
      if (usuario.apellido && typeof usuario.apellido === 'string' && usuario.apellido.length > 100) {
        return ApiResponse.error(res, 'El apellido del usuario no puede exceder 100 caracteres', 400);
      }
    }

    // Validar arrays como beneficiarios y contactos de emergencia
    if (body.beneficiarios && Array.isArray(body.beneficiarios)) {
      for (let i = 0; i < body.beneficiarios.length; i++) {
        const beneficiario = body.beneficiarios[i];
        if (beneficiario.usuario && typeof beneficiario.usuario === 'object') {
          const usuarioBenef = beneficiario.usuario;
          
          if (usuarioBenef.correo && typeof usuarioBenef.correo === 'string' && usuarioBenef.correo.length > 254) {
            return ApiResponse.error(res, `El correo del beneficiario ${i + 1} no puede exceder 254 caracteres`, 400);
          }
          
          if (usuarioBenef.telefono && typeof usuarioBenef.telefono === 'string' && usuarioBenef.telefono.length > 20) {
            return ApiResponse.error(res, `El teléfono del beneficiario ${i + 1} no puede exceder 20 caracteres`, 400);
          }
          
          if (usuarioBenef.numero_documento && typeof usuarioBenef.numero_documento === 'string') {
            if (usuarioBenef.numero_documento.length > 20) {
              return ApiResponse.error(res, `El número de documento del beneficiario ${i + 1} no puede exceder 20 caracteres`, 400);
            }
            if (usuarioBenef.numero_documento.length < 5) {
              return ApiResponse.error(res, `El número de documento del beneficiario ${i + 1} debe tener mínimo 5 caracteres`, 400);
            }
          }
        }
      }
    }

    if (body.contactos_emergencia && Array.isArray(body.contactos_emergencia)) {
      for (let i = 0; i < body.contactos_emergencia.length; i++) {
        const contacto = body.contactos_emergencia[i];
        
        if (contacto.telefono_contacto && typeof contacto.telefono_contacto === 'string') {
          if (contacto.telefono_contacto.length > 20) {
            return ApiResponse.error(res, `El teléfono del contacto de emergencia ${i + 1} no puede exceder 20 caracteres`, 400);
          }
          if (!/^\d+$/.test(contacto.telefono_contacto)) {
            return ApiResponse.error(res, `El teléfono del contacto de emergencia ${i + 1} solo puede contener números`, 400);
          }
        }
        
        if (contacto.nombre_contacto && typeof contacto.nombre_contacto === 'string' && contacto.nombre_contacto.length > 100) {
          return ApiResponse.error(res, `El nombre del contacto de emergencia ${i + 1} no puede exceder 100 caracteres`, 400);
        }
      }
    }

    next();
  } catch (error) {
    console.error('Error en middleware de validación estricta:', error);
    return ApiResponse.error(res, 'Error interno del servidor en validación', 500);
  }
};

// Middleware específico para filtrar caracteres no numéricos en teléfonos
export const sanitizePhoneNumbers = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;

    // Función para limpiar números de teléfono
    const cleanPhoneNumber = (phone: string | undefined | null): string | undefined => {
      if (!phone || typeof phone !== 'string') return undefined;
      // Eliminar todo lo que no sean dígitos
      const cleaned = phone.replace(/\D/g, '');
      // Limitar a 20 caracteres
      return cleaned.slice(0, 20);
    };

    // Limpiar teléfonos en el nivel raíz
    if (body.telefono) {
      body.telefono = cleanPhoneNumber(body.telefono);
    }

    // Limpiar teléfonos en usuario
    if (body.usuario && typeof body.usuario === 'object') {
      if (body.usuario.telefono) {
        body.usuario.telefono = cleanPhoneNumber(body.usuario.telefono);
      }
    }

    // Limpiar teléfonos en beneficiarios
    if (body.beneficiarios && Array.isArray(body.beneficiarios)) {
      body.beneficiarios.forEach((beneficiario: any) => {
        if (beneficiario.usuario && beneficiario.usuario.telefono) {
          beneficiario.usuario.telefono = cleanPhoneNumber(beneficiario.usuario.telefono);
        }
      });
    }

    // Limpiar teléfonos en contactos de emergencia
    if (body.contactos_emergencia && Array.isArray(body.contactos_emergencia)) {
      body.contactos_emergencia.forEach((contacto: any) => {
        if (contacto.telefono_contacto) {
          contacto.telefono_contacto = cleanPhoneNumber(contacto.telefono_contacto);
        }
      });
    }

    next();
  } catch (error) {
    console.error('Error en middleware de sanitización de teléfonos:', error);
    return ApiResponse.error(res, 'Error interno del servidor en sanitización', 500);
  }
};

// Middleware para normalizar correos electrónicos
export const sanitizeEmails = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;

    // Función para limpiar emails
    const cleanEmail = (email: string | undefined | null): string | undefined => {
      if (!email || typeof email !== 'string') return undefined;
      // Convertir a minúsculas y remover espacios
      const cleaned = email.toLowerCase().trim();
      // Limitar a 254 caracteres
      return cleaned.slice(0, 254);
    };

    // Limpiar email en el nivel raíz
    if (body.correo) {
      body.correo = cleanEmail(body.correo);
    }

    // Limpiar email en usuario
    if (body.usuario && typeof body.usuario === 'object') {
      if (body.usuario.correo) {
        body.usuario.correo = cleanEmail(body.usuario.correo);
      }
    }

    // Limpiar emails en beneficiarios
    if (body.beneficiarios && Array.isArray(body.beneficiarios)) {
      body.beneficiarios.forEach((beneficiario: any) => {
        if (beneficiario.usuario && beneficiario.usuario.correo) {
          beneficiario.usuario.correo = cleanEmail(beneficiario.usuario.correo);
        }
      });
    }

    next();
  } catch (error) {
    console.error('Error en middleware de sanitización de emails:', error);
    return ApiResponse.error(res, 'Error interno del servidor en sanitización', 500);
  }
};

export default {
  strictLengthValidation,
  sanitizePhoneNumbers,
  sanitizeEmails
};
