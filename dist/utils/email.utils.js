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
exports.enviarNotificacionEntrenamiento = exports.enviarCorreoRecuperacion = exports.enviarCorreoBienvenida = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
// Configurar el transportador de correo
const transporter = nodemailer_1.default.createTransport({
    host: env_1.env.SMTP_HOST,
    port: env_1.env.SMTP_PORT,
    secure: true, // true para 465, false para otros puertos
    auth: {
        user: env_1.env.SMTP_USER,
        pass: env_1.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false, // Necesario en algunos casos para desarrollo local
    },
    debug: false, // ✅ Deshabilitado para producción
});
transporter
    .verify()
    .then(() => {
    console.log("✉️ Servidor SMTP listo para enviar correos");
})
    .catch((error) => {
    console.error("❌ Error al configurar el servidor SMTP:", error);
});
const enviarCorreoBienvenida = (correoUsuario, datosUsuario) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nombre, apellido, numeroDocumento } = datosUsuario;
        const nombreCompleto = `${nombre} ${apellido}`;
        const loginUrl = `${env_1.env.FRONTEND_URL}/login`;
        const mailOptions = {
            from: {
                name: "GMSF - Sistema de Gestión",
                address: env_1.env.SMTP_FROM,
            },
            to: correoUsuario,
            subject: "¡Bienvenido a GMSF! - Credenciales de Acceso",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                    <h1 style="color: #333; text-align: center;">¡Bienvenido a Strong Fit GYM!</h1>
                    <p>Hola <strong>${nombreCompleto}</strong>,</p>
                    <p>Tu cuenta ha sido creada exitosamente en nuestro sistema de gestión. ¡Estamos emocionados de tenerte como parte de nuestra comunidad!</p>
                    
                    <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                        <h3 style="color: #555; margin-top: 0;">🔐 Tus Credenciales de Acceso</h3>
                        <p><strong>📧 Email:</strong> ${correoUsuario}</p>
                        <p><strong>🔑 Contraseña temporal:</strong> ${numeroDocumento}</p>
                    </div>

                    <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                        <h4 style="color: #856404; margin-top: 0;">⚠️ IMPORTANTE - Seguridad</h4>
                        <p style="color: #856404; margin-bottom: 0;">
                            <strong>Debes cambiar tu contraseña en el primer acceso</strong> por motivos de seguridad. 
                            Tu contraseña temporal es tu número de documento.
                        </p>
                    </div>

                    <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
                        <h4 style="color: #0c5460; margin-top: 0;">💡 Recomendaciones para tu nueva contraseña:</h4>
                        <ul style="color: #0c5460; margin-bottom: 0;">
                            <li>Mínimo 8 caracteres</li>
                            <li>Incluye mayúsculas y minúsculas</li>
                            <li>Incluye números</li>
                            <li>No uses información personal</li>
                        </ul>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${loginUrl}" 
                          style="background-color: #4CAF50; 
                                  color: white; 
                                  padding: 15px 30px; 
                                  text-decoration: none; 
                                  border-radius: 8px;
                                  display: inline-block;
                                  font-weight: bold;">
                            🚀 Acceder al Sistema
                        </a>
                    </div>
                    
                    <p style="color: #666;">Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
                    
                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        Este es un correo automático, por favor no respondas a este mensaje.<br>
                        Si no solicitaste esta cuenta, por favor contacta a nuestro equipo de soporte.
                    </p>
                </div>
            `,
        };
        yield transporter.sendMail(mailOptions);
        console.log("✅ Correo de bienvenida enviado exitosamente a:", correoUsuario);
    }
    catch (error) {
        console.error("❌ Error al enviar correo de bienvenida:", error);
    }
});
exports.enviarCorreoBienvenida = enviarCorreoBienvenida;
const enviarCorreoRecuperacion = (correo, token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resetUrl = `${env_1.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
        const mailOptions = {
            from: {
                name: "GMSF - Sistema de Gestión",
                address: env_1.env.SMTP_FROM,
            },
            to: correo,
            subject: "Recuperación de Contraseña - GMSF",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                    
                    <h1 style="color: #333; text-align: center;">🔐 Recuperación de Contraseña</h1>
                    <p style="text-align: center; color: #666; margin-bottom: 30px;">Strong Fit GYM - Sistema de Gestión</p>
                    
                    <p>Hola,</p>
                    <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>Strong Fit GYM</strong>.</p>

                    <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                        <h3 style="color: #555; margin-top: 0;">🛡️ Por tu seguridad</h3>
                        <ul style="color: #555; margin-bottom: 0; padding-left: 20px;">
                            <li>Este enlace es válido por <strong>15 minutos solamente</strong></li>
                            <li>Solo puedes usarlo una vez</li>
                            <li>Si no solicitaste este cambio, ignora este correo</li>
                        </ul>
                    </div>

                    <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                        <h4 style="color: #856404; margin-top: 0;">⚠️ IMPORTANTE - Seguridad</h4>
                        <p style="color: #856404; margin-bottom: 0;">
                            <strong>Este enlace expirará en 15 minutos</strong> por motivos de seguridad. 
                            Si no lo usas a tiempo, deberás solicitar uno nuevo.
                        </p>
                    </div>

                    <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
                        <h4 style="color: #0c5460; margin-top: 0;">💡 Consejos para tu nueva contraseña:</h4>
                        <ul style="color: #0c5460; margin-bottom: 0;">
                            <li>Mínimo 8 caracteres</li>
                            <li>Combina mayúsculas, minúsculas y números</li>
                            <li>Incluye símbolos especiales (@, #, $, etc.)</li>
                            <li>Evita información personal</li>
                        </ul>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                          style="background-color: #4CAF50; 
                                  color: white; 
                                  padding: 15px 30px; 
                                  text-decoration: none; 
                                  border-radius: 8px;
                                  display: inline-block;
                                  font-weight: bold;">
                            🔑 Restablecer mi Contraseña
                        </a>
                    </div>

                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <p style="color: #666; font-size: 14px; margin-bottom: 10px; text-align: center;">
                            <strong>¿El botón no funciona?</strong> Copia y pega este enlace en tu navegador:
                        </p>
                        <p style="word-break: break-all; color: #0066cc; font-size: 12px; text-align: center; background-color: white; padding: 10px; border-radius: 4px; border: 1px solid #ddd;">
                            ${resetUrl}
                        </p>
                    </div>
                    
                    <p style="color: #666;">
                        Si tienes problemas o no solicitaste este cambio, 
                        <a href="mailto:${env_1.env.SMTP_FROM}" style="color: #4CAF50; text-decoration: none;">contáctanos inmediatamente</a>.
                    </p>
                    
                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        Este es un correo automático, por favor no respondas a este mensaje.<br>
                        Si no solicitaste este cambio, por favor contacta a nuestro equipo de soporte.
                    </p>
                </div>
            `,
        };
        yield transporter.sendMail(mailOptions);
        console.log("✅ Correo de recuperación enviado exitosamente a:", correo);
    }
    catch (error) {
        console.error("❌ Error al enviar correo de recuperación:", error);
        throw error;
    }
});
exports.enviarCorreoRecuperacion = enviarCorreoRecuperacion;
const enviarNotificacionEntrenamiento = (correoCliente, nombreCliente, trainingDetails) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { titulo, descripcion, fecha_inicio, fecha_fin, nombreEntrenador } = trainingDetails;
        const mailOptions = {
            from: {
                name: "GMSF - Sistema de Gestión",
                address: env_1.env.SMTP_FROM,
            },
            to: correoCliente,
            subject: "Confirmación de Agendamiento - GMSF",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                    <h1 style="color: #333; text-align: center;">¡Entrenamiento Agendado!</h1>
                    <p>Hola <strong>${nombreCliente}</strong>,</p>
                    <p>Te confirmamos que tu sesión de entrenamiento ha sido agendada con éxito. Aquí están los detalles:</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #555; margin-top: 0;">${titulo}</h3>
                        <p><strong>Descripción:</strong> ${descripcion || "No se proporcionó una descripción."}</p>
                        <p><strong>Fecha:</strong> ${new Date(fecha_inicio).toLocaleDateString("es-CO", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            })}</p>
                        <p><strong>Hora:</strong> ${new Date(fecha_inicio).toLocaleTimeString("es-CO", {
                hour: "2-digit",
                minute: "2-digit",
            })} - ${new Date(fecha_fin).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</p>
                        <p><strong>Entrenador:</strong> ${nombreEntrenador}</p>
                    </div>

                    <p>¡Prepárate para dar lo mejor de ti!</p>
                    <p style="color: #666;">Si tienes alguna pregunta o necesitas reagendar, por favor contáctanos.</p>
                    
                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        Este es un correo automático, por favor no respondas a este mensaje.
                    </p>
                </div>
            `,
        };
        yield transporter.sendMail(mailOptions);
        console.log("✉️ Correo de notificación de entrenamiento enviado a:", correoCliente);
    }
    catch (error) {
        console.error("❌ Error al enviar correo de notificación de entrenamiento:", error);
        // No relanzamos el error para no afectar la transacción principal si el correo falla
    }
});
exports.enviarNotificacionEntrenamiento = enviarNotificacionEntrenamiento;
