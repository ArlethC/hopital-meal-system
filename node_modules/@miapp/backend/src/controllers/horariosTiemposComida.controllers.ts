/*
    Archivo: horariosTiemposComida.controllers.ts
    Descripcion: controladores que gestionan los horarios para los tiempos de comida.
    Autor: Marilyn Castro
    Fecha creacion: 7/07/2025
    Version: 1.0.0
*/
import { Request, Response, NextFunction } from 'express';
import { crear, modificar, desactivar, obtenertodos } from '../services/horariosTiempoComida.service';
import { convertirHoraA_HHmm } from '../utils/funcionesFormatear';

export const crearHorarioTiempoComida = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const datos = req.body;
    const usuario = req.user;
    const ipUsuario: string = req.ip ?? 'IP_DESCONOCIDA';

    const horariosComida = await crear(datos, usuario, ipUsuario);

    if (!horariosComida) {
      res.status(400).json({ error: 'Error al crear el horario del tiempo de comida' });
      return;
    }

    const dataModificado = horariosComida.map((item) => ({
      ...item,
      horaCierre: convertirHoraA_HHmm(item.horaCierre),
      horaModificacion: convertirHoraA_HHmm(item.horaModificacion),
    }));

    res.status(200).json(dataModificado[0]);

  } catch (error: any) {
    next(error);
  }
};

export const obtener = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const horariosComida = await obtenertodos();
    if (!horariosComida) {
      res.status(200).json([]);
      return;
    }

    const dataModificado = horariosComida.map((item) => ({
      ...item,
      horaCierre: convertirHoraA_HHmm(item.horaCierre),
      horaModificacion: convertirHoraA_HHmm(item.horaModificacion),
    }));

    res.status(200).json({ data: dataModificado });

  } catch (error: any) {
    next(error);
  }
};

export const actualizarHorarioComida = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const usuario = req.user;
    const datos = req.body;
    const ipUsuario: string = req.ip ?? 'IP_DESCONOCIDA';

    const registroModificado = await modificar(Number(id), datos, usuario, ipUsuario);

    if (!registroModificado) {
      res.status(400).json({ error: 'Error al modificar' });
      return;
    }

    const dataModificado = registroModificado.map((item) => ({
      ...item,
      horaCierre: convertirHoraA_HHmm(item.horaCierre),
      horaModificacion: convertirHoraA_HHmm(item.horaModificacion),
    }));

    res.status(200).json(dataModificado[0]);
  } catch (error: any) {
    next(error);
  }
};

export const desactivarHorarioComida = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const usuario = req.user;
    const ipUsuario: string = req.ip ?? 'IP_DESCONOCIDA';


    const eliminado = await desactivar(Number(id), usuario, ipUsuario);

    if (!eliminado) {
      res.status(404).json({ error: 'Horario de tiempo de comida no encontrado' });
      return;
    }
    res.json({ message: 'Horario de tiempo de comida eliminado correctamente' });

  } catch (error: any) {
    next(error);
  }
};