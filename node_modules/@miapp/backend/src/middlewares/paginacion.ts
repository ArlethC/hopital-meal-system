/*
    Archivo: paginacion.ts
    Descripcion: middleware para agregar paginacion al obtener grandes cantidades de datos.
    Autor: Marilyn Castro
    Fecha creacion: 3/07/2025
    Version: 1.0.0
*/

import { Request, Response, NextFunction } from 'express';

declare module 'express' {
  export interface Request {
    paginacion?: {
      pag: number;
      limite: number;
      offset: number;
    };
  }
}

export function paginacion(req: Request, res: Response, next: NextFunction) {
    let pag = parseInt( req.query.pag as string, 10) || 1;
    let limite  = parseInt( req.query.limit as string, 10 ) || 10;

    if(pag < 0){
        pag = 1;
    }
    if(limite < 0){
        limite = 10;
    }
    
    const offset = (pag - 1)*limite;

    req.paginacion = {
        pag,
        limite,
        offset
    };
    next();
}