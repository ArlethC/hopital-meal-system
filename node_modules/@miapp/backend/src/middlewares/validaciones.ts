/*
    Archivo: validaciones.ts
    Descripcion: contiene middlewares para validar los datos.
    Autor: Marilyn Castro
    Fecha creacion: 2/07/2025
    Version: 1.0.1
*/
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

// Middleware para validar el id en los parametros de la petición
export function validarIdParam(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;
  const idNum = Number(id);
  
  if (!id || isNaN(idNum) || idNum <= 0) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }

  req.params.id = idNum.toString();
  next();
}

//Midelware para validar el expediente 
export function validarExpedienteParam(req: Request, res: Response, next: NextFunction) {
  const { expediente } = req.params;

  const expedientValidar = expediente.trim();
  const soloNumeros = /^\d+$/;

  if (!soloNumeros.test(expedientValidar) || expedientValidar.length > 20) {
    res.status(400).json({ error: 'el espediente es inválido' });
    return;
  }

  next();
}

// Middleware para validar el body de la petición 
export function validarBody(schema: ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const validacion = schema.safeParse(req.body);

    if (!validacion.success) {
      const issues = validacion.error.issues
        .map(issue => `${issue.path.join('.')}: ${issue.message}`)
        .join(' | ');

      res.status(400).json({
        error: issues,
      });
      return;
    }

    req.body = validacion.data;
    next();
  };
}
