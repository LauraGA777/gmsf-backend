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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicSettings = exports.resetToDefaults = exports.uploadMultipleImages = exports.deleteImage = exports.uploadImage = exports.updateSettings = exports.getSettings = exports.upload = void 0;
const express_validator_1 = require("express-validator");
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
// Configuración de multer para subida de imágenes
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../uploads/gym-settings');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${(0, uuid_1.v4)()}-${Date.now()}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes.'));
    }
};
exports.upload = (0, multer_1.default)({
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
const SETTINGS_FILE = path_1.default.join(__dirname, '../../data/gym-settings.json');
// Función para cargar configuraciones
const loadSettings = () => {
    try {
        if (fs_1.default.existsSync(SETTINGS_FILE)) {
            const data = fs_1.default.readFileSync(SETTINGS_FILE, 'utf8');
            return JSON.parse(data);
        }
        return DEFAULT_SETTINGS;
    }
    catch (error) {
        console.error('Error cargando configuraciones:', error);
        return DEFAULT_SETTINGS;
    }
};
// Función para guardar configuraciones
const saveSettings = (settings) => {
    try {
        const dataDir = path_1.default.dirname(SETTINGS_FILE);
        if (!fs_1.default.existsSync(dataDir)) {
            fs_1.default.mkdirSync(dataDir, { recursive: true });
        }
        fs_1.default.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    }
    catch (error) {
        console.error('Error guardando configuraciones:', error);
        throw error;
    }
};
// Obtener configuraciones
const getSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = loadSettings();
        apiResponse_1.default.success(res, settings, 'Configuraciones obtenidas exitosamente');
    }
    catch (error) {
        console.error('Error obteniendo configuraciones:', error);
        apiResponse_1.default.error(res, 'Error interno del servidor', 500);
    }
});
exports.getSettings = getSettings;
// Actualizar configuraciones
const updateSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            apiResponse_1.default.error(res, 'Datos inválidos', 400, errors.array());
            return;
        }
        const currentSettings = loadSettings();
        const updatedSettings = Object.assign(Object.assign({}, currentSettings), req.body);
        saveSettings(updatedSettings);
        apiResponse_1.default.success(res, updatedSettings, 'Configuraciones actualizadas exitosamente');
    }
    catch (error) {
        console.error('Error actualizando configuraciones:', error);
        apiResponse_1.default.error(res, 'Error interno del servidor', 500);
    }
});
exports.updateSettings = updateSettings;
// Subir imagen
const uploadImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            apiResponse_1.default.error(res, 'No se proporcionó ninguna imagen', 400);
            return;
        }
        const imageUrl = `/uploads/gym-settings/${req.file.filename}`;
        apiResponse_1.default.success(res, {
            url: imageUrl,
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size
        }, 'Imagen subida exitosamente');
    }
    catch (error) {
        console.error('Error subiendo imagen:', error);
        apiResponse_1.default.error(res, 'Error interno del servidor', 500);
    }
});
exports.uploadImage = uploadImage;
// Eliminar imagen
const deleteImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { filename } = req.params;
        if (!filename) {
            apiResponse_1.default.error(res, 'Nombre de archivo requerido', 400);
            return;
        }
        const filePath = path_1.default.join(__dirname, '../../uploads/gym-settings', filename);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
            apiResponse_1.default.success(res, null, 'Imagen eliminada exitosamente');
        }
        else {
            apiResponse_1.default.error(res, 'Imagen no encontrada', 404);
        }
    }
    catch (error) {
        console.error('Error eliminando imagen:', error);
        apiResponse_1.default.error(res, 'Error interno del servidor', 500);
    }
});
exports.deleteImage = deleteImage;
// Subir múltiples imágenes
const uploadMultipleImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            apiResponse_1.default.error(res, 'No se proporcionaron imágenes', 400);
            return;
        }
        const uploadedImages = req.files.map((file) => ({
            url: `/uploads/gym-settings/${file.filename}`,
            filename: file.filename,
            originalName: file.originalname,
            size: file.size
        }));
        apiResponse_1.default.success(res, uploadedImages, 'Imágenes subidas exitosamente');
    }
    catch (error) {
        console.error('Error subiendo múltiples imágenes:', error);
        apiResponse_1.default.error(res, 'Error interno del servidor', 500);
    }
});
exports.uploadMultipleImages = uploadMultipleImages;
// Resetear configuraciones a valores por defecto
const resetToDefaults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        saveSettings(DEFAULT_SETTINGS);
        apiResponse_1.default.success(res, DEFAULT_SETTINGS, 'Configuraciones restauradas a valores por defecto');
    }
    catch (error) {
        console.error('Error restaurando configuraciones:', error);
        apiResponse_1.default.error(res, 'Error interno del servidor', 500);
    }
});
exports.resetToDefaults = resetToDefaults;
// Obtener configuraciones públicas (sin información sensible)
const getPublicSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        apiResponse_1.default.success(res, publicSettings, 'Configuraciones públicas obtenidas exitosamente');
    }
    catch (error) {
        console.error('Error obteniendo configuraciones públicas:', error);
        apiResponse_1.default.error(res, 'Error interno del servidor', 500);
    }
});
exports.getPublicSettings = getPublicSettings;
