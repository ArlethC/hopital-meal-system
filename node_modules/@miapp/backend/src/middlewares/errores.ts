/*
    Archivo: errores.ts
    Descripcion: middleware para capturar los errores.
    Autor: Marilyn Castro
    Fecha creacion: 7/07/2025
    Version: 1.0.0
*/
import { Request, Response, NextFunction } from "express";
import multer from 'multer';
import { bd } from '../config/database';

export async function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err.statusCode || 500;
  const message = err.message || "Error interno del servidor";
  const usuario = req.user || "DESCONOCIDO";
  const origen = req.originalUrl || "RUTA_DESCONOCIDA";

  if(status == 500){ 
    await registrarErrorEnBD(err, usuario, origen);
    next(err);
  };
  
  res.status(status).json({ error: message });
}


export function multerErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: 'Error de carga de archivo' });
  } else if (err) {
    return res.status(500).json({ error: 'Error inesperado al subir archivo' });
  }
  next();
}

async function registrarErrorEnBD(error: any, usuario?: string, origen?: string) {
  try {
    
    const query = `INSERT INTO HM.AlErrores (usuario, origen_error, mensaje_error)
        VALUES (@usuario, @origen_error, @mensaje_error)`;

    await bd.consultaBD(query, [
      {nombre: "usuario", valor: usuario || "DESCONOCIDO" },
      {nombre: "origen_error", valor: origen || null },
      {nombre: "mensaje_error", valor: error.message || "Error sin mensaje" },
    ]);

  } catch (err) {
    console.error("Error registrando en AlErrores:", err);
  }
}