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
  const message = status == 500 ? "Error interno del servidor" : err.message ;
  const usuario = req.user || "DESCONOCIDO";
  const origen = req.originalUrl || "RUTA_DESCONOCIDA";

  if (status == 500) {
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

    const query = `INSERT INTO Errores_app_cocina (usuario, origen, error_mensaje)
        VALUES (@usuario, @origen, @error_mensaje)`;

    await bd.consultaBD(query, [
      { nombre: "usuario", valor: usuario || "DESCONOCIDO" },
      { nombre: "origen", valor: origen || null },
      { nombre: "error_mensaje", valor: error.message || "Error sin mensaje" },
    ]);

  } catch (err) {
    console.error("Error registrando en AlErrores:", err);
  }
}