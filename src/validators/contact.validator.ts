import { z } from 'zod';

// Validador para correo electrónico
export const emailValidator = z.string()
  .min(5, "El correo electrónico debe tener mínimo 5 caracteres")
  .max(64, "El correo electrónico debe tener máximo 64 caracteres")
  .email("Formato de correo electrónico inválido")
  .refine(
    (email) => {
      // Verificar que no tenga espacios en blanco
      if (/\s/.test(email)) return false;
      return true;
    },
    { message: "El correo no puede contener espacios en blanco" }
  )
  .refine(
    (email) => {
      // Verificar que no tenga múltiples @
      const atCount = (email.match(/@/g) || []).length;
      return atCount === 1;
    },
    { message: "El correo debe contener exactamente un @" }
  )
  .refine(
    (email) => {
      // Verificar que la parte local no exceda 80 caracteres
      const [localPart] = email.split('@');
      return localPart && localPart.length <= 80;
    },
    { message: "La parte antes del @ debe tener máximo 80 caracteres" }
  )
  .refine(
    (email) => {
      // Verificar que la parte local no empiece o termine con punto
      const [localPart] = email.split('@');
      if (!localPart) return false;
      return !localPart.startsWith('.') && !localPart.endsWith('.');
    },
    { message: "La parte antes del @ no puede empezar o terminar con punto" }
  )
  .refine(
    (email) => {
      // Verificar que no tenga puntos consecutivos
      const [localPart] = email.split('@');
      if (!localPart) return false;
      return !/\.{2,}/.test(localPart);
    },
    { message: "No se permiten puntos consecutivos antes del @" }
  )
  .refine(
    (email) => {
      // Verificar caracteres permitidos en parte local
      const [localPart] = email.split('@');
      if (!localPart) return false;
      return /^[a-zA-Z0-9._-]+$/.test(localPart);
    },
    { message: "Solo se permiten letras, números, puntos, guiones y guion bajo antes del @" }
  );

// Validador para teléfono
export const phoneValidator = z.string()
  .min(5, "El teléfono debe tener mínimo 5 caracteres")
  .max(20, "El teléfono debe tener máximo 20 caracteres")
  .regex(/^\d+$/, "El teléfono solo puede contener números");

// Esquemas completos para validación
export const contactValidationSchema = z.object({
  email: emailValidator.optional(),
  phone: phoneValidator.optional()
});

// Funciones de validación individuales
export const validateEmail = (email: string) => {
  try {
    const result = emailValidator.parse(email);
    return {
      isValid: true,
      error: null,
      value: result
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.errors[0]?.message || 'Error de validación',
        value: null
      };
    }
    return {
      isValid: false,
      error: 'Error inesperado en la validación',
      value: null
    };
  }
};

export const validatePhone = (phone: string) => {
  try {
    const result = phoneValidator.parse(phone);
    return {
      isValid: true,
      error: null,
      value: result
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.errors[0]?.message || 'Error de validación',
        value: null
      };
    }
    return {
      isValid: false,
      error: 'Error inesperado en la validación',
      value: null
    };
  }
};

// Validación combinada para datos de contacto
export const validateContactData = (data: { email?: string; phone?: string }) => {
  try {
    const result = contactValidationSchema.parse(data);
    return {
      isValid: true,
      errors: {},
      value: result
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: { email?: string; phone?: string } = {};
      
      error.errors.forEach((err) => {
        const field = err.path[0] as 'email' | 'phone';
        if (field) {
          errors[field] = err.message;
        }
      });
      
      return {
        isValid: false,
        errors,
        value: null
      };
    }
    
    return {
      isValid: false,
      errors: { general: 'Error inesperado en la validación' },
      value: null
    };
  }
};
