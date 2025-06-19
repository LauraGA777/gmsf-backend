import nodemailer from "nodemailer";
import { env } from "../config/env";

// Configurar el transportador de correo
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: true, // true para 465, false para otros puertos
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Necesario en algunos casos para desarrollo local
  },
  debug: env.NODE_ENV === "development", // Habilitar logs en desarrollo
});

// Verificar la conexión al iniciar
transporter
  .verify()
  .then(() => {
    console.log("✉️ Servidor SMTP listo para enviar correos");
  })
  .catch((error) => {
    console.error("❌ Error al configurar el servidor SMTP:", error);
  });

export const enviarCorreoRecuperacion = async (
  correo: string,
  token: string
): Promise<void> => {
  try {
    const resetUrl = `${env.FRONTEND_URL}/auth/reset-password/${token}`;

    const mailOptions = {
      from: {
        name: "GMSF - Sistema de Gestión",
        address: env.SMTP_FROM,
      },
      to: correo,
      subject: "Recuperación de Contraseña - GMSF",
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #333; text-align: center;">Recuperación de Contraseña</h1>
                    <p>Has solicitado restablecer tu contraseña en el sistema GMSF.</p>
                    <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #4CAF50; 
                                  color: white; 
                                  padding: 12px 25px; 
                                  text-decoration: none; 
                                  border-radius: 5px;
                                  display: inline-block;">
                            Restablecer Contraseña
                        </a>
                    </div>
                    <p><strong>Este enlace expirará en 15 minutos.</strong></p>
                    <p style="color: #666;">Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña actual seguirá siendo válida.</p>
                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        Este es un correo automático, por favor no respondas a este mensaje.
                    </p>
                </div>
            `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✉️ Correo de recuperación enviado a:", correo);
  } catch (error) {
    console.error("❌ Error al enviar correo de recuperación:", error);
    throw new Error("Error al enviar el correo de recuperación");
  }
};

export const enviarNotificacionEntrenamiento = async (
  correoCliente: string,
  nombreCliente: string,
  trainingDetails: {
    titulo: string;
    descripcion?: string;
    fecha_inicio: Date;
    fecha_fin: Date;
    nombreEntrenador: string;
  }
): Promise<void> => {
  try {
    const { titulo, descripcion, fecha_inicio, fecha_fin, nombreEntrenador } =
      trainingDetails;

    const mailOptions = {
      from: {
        name: "GMSF - Sistema de Gestión",
        address: env.SMTP_FROM,
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
                        <p><strong>Descripción:</strong> ${
                          descripcion || "No se proporcionó una descripción."
                        }</p>
                        <p><strong>Fecha:</strong> ${new Date(
                          fecha_inicio
                        ).toLocaleDateString("es-CO", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}</p>
                        <p><strong>Hora:</strong> ${new Date(
                          fecha_inicio
                        ).toLocaleTimeString("es-CO", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })} - ${new Date(fecha_fin).toLocaleTimeString(
        "es-CO",
        { hour: "2-digit", minute: "2-digit" }
      )}</p>
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

    await transporter.sendMail(mailOptions);
    console.log(
      "✉️ Correo de notificación de entrenamiento enviado a:",
      correoCliente
    );
  } catch (error) {
    console.error(
      "❌ Error al enviar correo de notificación de entrenamiento:",
      error
    );
    // No relanzamos el error para no afectar la transacción principal si el correo falla
  }
};
