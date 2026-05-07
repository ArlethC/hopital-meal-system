/*
    Archivo: dietasEdadTiempoComida.controllers.ts
    Descripcion: controladores para gestionar los grupos de dietas, rango de edad y tiempo de comida aqui se obtienen las dietas para las solicitudes.
    Autor: Marilyn Castro
    Fecha creacion: 3/07/2025
    Version: 1.0.1
*/

import { Request, Response, NextFunction } from 'express';
import { crear, actualizar, desactivar, obtenerFiltrando } from '../services/dietasEdadTiempoComida.service';

// Crear un nuevo grupo de dieta, rango de edad y tiempo de comida
export const crearDietaEdadTiempo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const datos = req.body;

    const usuario = req.user;
    const ipUsuario: string = req.ip ?? 'IP_DESCONOCIDA';

    const nuevoRegistro = await crear(datos, usuario, ipUsuario);

    if (!nuevoRegistro || nuevoRegistro.length === 0) {
      res.status(400).json({ error: 'Error al crear la asociación de dieta, tiempo de comida y rango de edad' });
      return;
    }

    res.status(200).json(nuevoRegistro);

  } catch (error: any) {
    next(error);
  }
};

export const actualizarDietaEdadTiempo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const usuario = req.user;
    const datos = req.body;
    const ipUsuario: string = req.ip ?? 'IP_DESCONOCIDA';


    const registroActualizado = await actualizar(Number(id), datos, usuario, ipUsuario);
    if (registroActualizado?.data.length == 0) {
      res.status(404).json({ error: 'Asociación de dieta, tiempo de comida y rango de edad no encontrado' });
      return;
    }

    res.status(200).json(registroActualizado);
  } catch (error: any) {
    next(error);
  }
};

export const desactivarDietaEdadTiempo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const usuario = req.user;
    const ipUsuario: string = req.ip ?? 'IP_DESCONOCIDA';

    const eliminado = await desactivar(Number(id), usuario, ipUsuario);

    if (!eliminado) {
      res.status(404).json({ error: 'Asociación de dieta, tiempo de comida y rango de edad no encontrado' });
      return;
    }
    res.json({ message: 'Asociación de dieta, tiempo de comida y rango de edad eliminado correctamente' });

  } catch (error: any) {
    next(error);
  }
};

export const obtenerDietasEdadTiempoFiltradas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rangoParam = (req.query.r as string) || '';
    const tiempoParam = (req.query.t as string) || '';
    const dietaParam = (req.query.d as string) || '';

    const rango = rangoParam !== undefined ? Number(rangoParam) : undefined;
    const tiempo = tiempoParam !== undefined ? Number(tiempoParam) : undefined;

    const rangoValido = rango !== undefined && !isNaN(rango) && rango > 0 ? rango : undefined;
    const tiempoValido = tiempo !== undefined && !isNaN(tiempo) && tiempo > 0 ? tiempo : undefined;
    const dietaValida = dietaParam.trim() !== " " ? dietaParam : undefined;

    const { limite, offset } = req.paginacion ?? { limite: 10, offset: 0 };
    const registros = await obtenerFiltrando({ limite: Number(limite), offset: Number(offset), idTiempoComida: tiempoValido, idRangoEdad: rangoValido, dieta: dietaValida });

    res.json(registros);

  } catch (error: any) {
    next(error);
  }
};
