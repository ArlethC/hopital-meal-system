/*
    Archivo: funcionEnviarCorreo.ts
    Descripcion: funcion para enviar un correo cuando se crea un reclamo.
    Autor: Marilyn Castro
    Fecha creacion: 23/07/2025
    Version: 1.0.1
*/
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
        ciphers:'SSLv3'
    }
});

export async function enviarCorreo({ asunto, cuerpoHtml, tipo }: { 
  asunto: string; cuerpoHtml: string;
  tipo: 'reclamos' | 'solicitud';
}) {

  const destinatarios: Record<string, string | undefined> = {
    reclamos: process.env.DESTINATARIO_RECLAMO,
    solicitud: process.env.DESTINATARIO_NUEVA_SOLICITUD,
  };
  
  const destinatario = destinatarios[tipo];
  if (!destinatario) throw new Error(`No se definió el destinatario para tipo: ${tipo}`);

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: destinatario,
    subject: asunto,
    html: cuerpoHtml,
  });
}
