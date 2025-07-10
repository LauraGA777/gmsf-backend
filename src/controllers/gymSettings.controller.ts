import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import ApiResponse from '../utils/apiResponse';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Extender la interfaz Request para incluir file y files
declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
      files?: { [fieldname: string]: Express.Multer.File[]; } | Express.Multer.File[] | undefined;
    }
  }
}

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = path.join(__dirname, '../../uploads/gym-settings');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Configuraciones por defecto
const DEFAULT_SETTINGS = {
  name: 'Strong Fit Gym',
  tagline: 'Transforma tu vida',
  description: 'Un gimnasio familiar y acogedor donde cada miembro importa. Equipamiento de calidad, ambiente amigable y precios justos.',
  heroImage: '/api/placeholder/1920/1080',
  logoImage: '/api/placeholder/200/200',
  services: [
    {
      id: 'pesas',
      title: 'Entrenamiento con Pesas',
      description: 'Equipamiento completo para entrenamientos de fuerza.',
      icon: 'Dumbbell',
      features: ['Mancuernas y barras', 'Máquinas de fuerza', 'Rack de sentadillas']
    },
    {
      id: 'cardio',
      title: 'Cardio',
      description: 'Zona de cardio moderna para mejorar tu resistencia.',
      icon: 'Heart',
      features: ['Cintas de correr', 'Bicicletas estáticas', 'Elípticas']
    },
    {
      id: 'asesoria',
      title: 'Asesoría Personal',
      description: 'Orientación personalizada para maximizar tus resultados.',
      icon: 'Users',
      features: ['Rutinas personalizadas', 'Seguimiento de progreso', 'Planes nutricionales']
    }
  ],
  plans: [
    {
      id: 'tiquetero',
      name: 'Tiquetero',
      originalPrice: 45000,
      price: 35000,
      period: 'Acceso',
      features: ['Acceso a equipos de pesas', 'Zona de cardio', 'Horario: 6am - 10pm'],
      buttonText: 'Elegir Plan',
      isPopular: false
    },
    {
      id: 'mensual',
      name: 'Mensualidad',
      originalPrice: 85000,
      price: 65000,
      period: 'mes',
      features: ['Todo del plan básico', 'Asesoría personalizada', 'Acceso 24/7', 'Plan nutricional básico'],
      buttonText: 'Elegir Plan',
      isPopular: true
    },
    {
      id: 'trimestral',
      name: 'Trimestral',
      originalPrice: 225000,
      price: 150000,
      period: 'mes',
      features: ['Hasta 4 miembros', 'Todos los beneficios', 'Descuento del 25%'],
      buttonText: 'Elegir Plan',
      isPopular: false
    }
  ],
  contact: {
    address: 'Calle Principal 123, Ciudad',
    phone: '(555) 123-4567',
    email: 'info@strongfitgym.com',
    hours: {
      weekday: 'Lun - Vie: 6:00 AM - 10:00 PM',
      weekend: 'Sáb - Dom: 8:00 AM - 8:00 PM'
    }
  },
  colors: {
    primary: '#1f2937',
    secondary: '#374151',
    accent: '#fbbf24',
    background: '#f9fafb',
    text: '#111827'
  },
  socialMedia: {
    facebook: 'https://facebook.com/strongfitgym',
    instagram: 'https://instagram.com/strongfitgym',
    whatsapp: 'https://wa.me/5551234567'
  },
  gallery: [],
  features: [
    {
      id: 'equipamiento',
      title: 'Equipamiento Moderno',
      description: 'Última tecnología en equipos de fitness',
      icon: 'Zap'
    },
    {
      id: 'ambiente',
      title: 'Ambiente Familiar',
      description: 'Un espacio acogedor para toda la familia',
      icon: 'Home'
    }
  ],
  testimonials: [
    {
      id: 'testimonio1',
      name: 'María González',
      comment: 'La mejor inversión que he hecho en mi salud. El ambiente es increíble y los entrenadores son excelentes.',
      rating: 5,
      position: 'Miembro desde 2023'
    }
  ]
};

// Archivo para almacenar configuraciones (en producción usar base de datos)
const SETTINGS_FILE = path.join(__dirname, '../../data/gym-settings.json');

// Función para cargar configuraciones
const loadSettings = () => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      return JSON.parse(data);
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error cargando configuraciones:', error);
    return DEFAULT_SETTINGS;
  }
};

// Función para guardar configuraciones
const saveSettings = (settings: any) => {
  try {
    const dataDir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Error guardando configuraciones:', error);
    throw error;
  }
};

// Obtener configuraciones
export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = loadSettings();
    ApiResponse.success(res, settings, 'Configuraciones obtenidas exitosamente');
  } catch (error) {
    console.error('Error obteniendo configuraciones:', error);
    ApiResponse.error(res, 'Error interno del servidor', 500);
  }
};

// Actualizar configuraciones
export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      ApiResponse.error(res, 'Datos inválidos', 400, errors.array());
      return;
    }

    const currentSettings = loadSettings();
    const updatedSettings = { ...currentSettings, ...req.body };
    
    saveSettings(updatedSettings);
    
    ApiResponse.success(res, updatedSettings, 'Configuraciones actualizadas exitosamente');
  } catch (error) {
    console.error('Error actualizando configuraciones:', error);
    ApiResponse.error(res, 'Error interno del servidor', 500);
  }
};

// Subir imagen
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      ApiResponse.error(res, 'No se proporcionó ninguna imagen', 400);
      return;
    }

    const imageUrl = `/uploads/gym-settings/${req.file.filename}`;
    
    ApiResponse.success(res, { 
      url: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    }, 'Imagen subida exitosamente');
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    ApiResponse.error(res, 'Error interno del servidor', 500);
  }
};

// Eliminar imagen
export const deleteImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      ApiResponse.error(res, 'Nombre de archivo requerido', 400);
      return;
    }

    const filePath = path.join(__dirname, '../../uploads/gym-settings', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      ApiResponse.success(res, null, 'Imagen eliminada exitosamente');
    } else {
      ApiResponse.error(res, 'Imagen no encontrada', 404);
    }
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    ApiResponse.error(res, 'Error interno del servidor', 500);
  }
};

// Subir múltiples imágenes
export const uploadMultipleImages = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      ApiResponse.error(res, 'No se proporcionaron imágenes', 400);
      return;
    }

    const uploadedImages = req.files.map((file: Express.Multer.File) => ({
      url: `/uploads/gym-settings/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size
    }));
    
    ApiResponse.success(res, uploadedImages, 'Imágenes subidas exitosamente');
  } catch (error) {
    console.error('Error subiendo múltiples imágenes:', error);
    ApiResponse.error(res, 'Error interno del servidor', 500);
  }
};

// Resetear configuraciones a valores por defecto
export const resetToDefaults = async (req: Request, res: Response): Promise<void> => {
  try {
    saveSettings(DEFAULT_SETTINGS);
    ApiResponse.success(res, DEFAULT_SETTINGS, 'Configuraciones restauradas a valores por defecto');
  } catch (error) {
    console.error('Error restaurando configuraciones:', error);
    ApiResponse.error(res, 'Error interno del servidor', 500);
  }
};

// Obtener configuraciones públicas (sin información sensible)
export const getPublicSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = loadSettings();
    
    // Remover información sensible para acceso público
    const publicSettings = {
      name: settings.name,
      tagline: settings.tagline,
      description: settings.description,
      heroImage: settings.heroImage,
      logoImage: settings.logoImage,
      services: settings.services,
      plans: settings.plans,
      contact: settings.contact,
      colors: settings.colors,
      socialMedia: settings.socialMedia,
      gallery: settings.gallery,
      features: settings.features,
      testimonials: settings.testimonials
    };
    
    ApiResponse.success(res, publicSettings, 'Configuraciones públicas obtenidas exitosamente');
  } catch (error) {
    console.error('Error obteniendo configuraciones públicas:', error);
    ApiResponse.error(res, 'Error interno del servidor', 500);
  }
}; 