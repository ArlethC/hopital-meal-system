/*
    Archivo: dietas.controllers.ts
    Descripcion: controladores para obtener las dietas y los tiempos de comida.
    Autor: Marilyn Castro
    Fecha creacion: 3/07/2025
    Version: 1.0.3
*/

import { Request, Response, NextFunction } from 'express';
import { obtenerDietas, obtenerTiemposComida } from '../services/dietas.service';

// Obtener las dietas usando paginacion
export const obtenerTodasDietas = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const searchTerm = (_req.query.q as string) || '';
    const { limite, offset } = _req.paginacion ?? { limite: 10, offset: 0 };

    const dietas = await obtenerDietas( searchTerm, Number(limite), Number(offset) );
    
    res.status(200).json(dietas);

  } catch (error: any) {
    next(error);
  }
};

export const obtenerTiemposComidaController = async (_req: Request, res: Response, next: NextFunction) => {
  try {

    const tiemposComida = await obtenerTiemposComida( );
    
    res.json({
      tiemposComida
    });

  } catch (error: any) {
    next(error);
  }
};