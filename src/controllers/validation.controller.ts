import { Request, Response } from 'express';
import { validateEmail, validatePhone, validateContactData } from '../validators/contact.validator';
import ApiResponse from '../utils/apiResponse';

export const validateEmailController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email || typeof email !== 'string') {
      return ApiResponse.error(res, 'El correo electrónico es requerido', 400);
    }

    const validation = validateEmail(email);
    
    return ApiResponse.success(res, validation, 'Validación de correo completada');
  } catch (error) {
    console.error('Error en validación de email:', error);
    return ApiResponse.error(res, 'Error interno del servidor', 500);
  }
};

export const validatePhoneController = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    
    if (!phone || typeof phone !== 'string') {
      return ApiResponse.error(res, 'El número de teléfono es requerido', 400);
    }

    const validation = validatePhone(phone);
    
    return ApiResponse.success(res, validation, 'Validación de teléfono completada');
  } catch (error) {
    console.error('Error en validación de teléfono:', error);
    return ApiResponse.error(res, 'Error interno del servidor', 500);
  }
};

export const validateContactController = async (req: Request, res: Response) => {
  try {
    const { email, phone } = req.body;
    
    const validation = validateContactData({ email, phone });
    
    return ApiResponse.success(res, validation, 'Validación de datos de contacto completada');
  } catch (error) {
    console.error('Error en validación de contacto:', error);
    return ApiResponse.error(res, 'Error interno del servidor', 500);
  }
};
