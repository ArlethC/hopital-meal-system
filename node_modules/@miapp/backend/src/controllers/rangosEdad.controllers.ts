/*
    Archivo: rangosEdad.controllers.ts
    Descripcion: contiene los controladores para crear, actualizar y desactivar rangos de edad.
    Autor: Marilyn Castro
    Fecha creacion: 2/07/2025
    Version: 1.0.1
*/

import { Request, Response, NextFunction } from 'express';
import { crearRangoEdad, obtenerTodos, actualizar, desactivar } from '../services/rangoEdad.service';
import { formatearEdad } from '../utils/funcionesFormatear'

// Crear un nuevo rango de edad
export const crearRangoEdadController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const datos = req.body;
    const usuario = req.user;
    const ipUsuario: string = req.ip ?? 'IP_DESCONOCIDA';

    const nuevoRango = await crearRangoEdad(datos, usuario, ipUsuario);

    if (!nuevoRango) {
      res.status(400).json({ error: 'Error al crear el rango de edad' });
      return;
    }
    const rangoConTexto = {
      ...nuevoRango,
      edadMinimaTexto: formatearEdad(nuevoRango.edadMinima),
      edadMaximaTexto: formatearEdad(nuevoRango.edadMaxima),
    };

    res.status(200).json(rangoConTexto);

  } catch (error: any) {
    next(error);
  }
};

// Obtener todos los rangos de edad
export const obtenerRangosEdadController = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rangos = await obtenerTodos();

    if (rangos.data[0].length === 0) {
      res.status(200).json({
        data: rangos.data[0],
        total: 0,
      })
      return;
    }

    const dataConTexto = rangos.data[0].map(rango => ({
      ...rango,
      edadMinimaTexto: formatearEdad(rango.edadMinima),
      edadMaximaTexto: formatearEdad(rango.edadMaxima),
    }));
    res.json({
      data: dataConTexto,
      total: rangos.data[1],
    });

  } catch (error: any) {
    next(error);
  }
};

// Actualizar un rango de edad
export const actualizarRangoEdad = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const usuario = req.user;
    const datos = req.body;
    const ipUsuario: string = req.ip ?? 'IP_DESCONOCIDA';

    const rangoActualizado = await actualizar(Number(id), datos, usuario, ipUsuario);
    if (!rangoActualizado) {
      res.status(404).json({ error: 'Rango de edad no encontrado' });
      return;
    }

    res.status(200).send();
  } catch (error: any) {
    next(error);
  }
};

// Desactivar un rango de edad
export const desactivarRangoEdad = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const usuario = req.user;
    const ipUsuario: string = req.ip ?? 'IP_DESCONOCIDA';

    const eliminado = await desactivar(Number(id), usuario, ipUsuario);

    if (!eliminado) {
      res.status(404).json({ error: 'Rango de edad no encontrado' });
      return;
    }
    res.json({ message: 'Rango de edad eliminado correctamente' });

  } catch (error: any) {
    next(error);
  }
};