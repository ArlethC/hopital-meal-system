/*
    Archivo: alergiaIntolerancia.controllers.ts
    Descripcion: controladores para gestionar las alergias.
    Autor: Marilyn Castro
    Fecha creacion: 16/07/2025
    Version: 1.0.0
*/
import { Request, Response, NextFunction } from 'express';
import { crearAlergiaIntolerancia, modificarAlergiaIntolerancia, desactivarAlergiaIntolerancia, obtenerAlergiaIntolerancia } from "../services/alergiaIntolerancia.service";


export const crearAlergiaController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { expediente, alergiasIntolerancias } = req.body;
    const usuario = req.user;
    const ipUsuario: string = req.ip ?? 'IP_DESCONOCIDA';

    const nuevaAlergia = await crearAlergiaIntolerancia(expediente, alergiasIntolerancias, usuario, ipUsuario);

    if (nuevaAlergia.length === 0) {
      res.status(400).json({ error: "Error al crear la alergia/intolerancia" });
    }

    res.status(200).json(nuevaAlergia);

  } catch (error: any) {
    next(error);
  }
};

export const modificarAlergiaController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, alergiasIntolerancias } = req.body;
    const usuario = req.user;
    const ipUsuario: string = req.ip ?? 'IP_DESCONOCIDA';

    const nuevaAlergia = await modificarAlergiaIntolerancia(Number(id), alergiasIntolerancias, usuario, ipUsuario);

    res.status(200).json(nuevaAlergia);

  } catch (error: any) {
    next(error);
  }
};

export const desactivarAlergiaController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const usuario = req.user;
    const ipUsuario: string = req.ip ?? 'IP_DESCONOCIDA';

    const nuevaAlergia = await desactivarAlergiaIntolerancia(Number(id), usuario, ipUsuario);

    res.status(200).json(nuevaAlergia);

  } catch (error: any) {
    next(error);
  }
};

export const getAlergias = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { expediente } = req.params;

    if (expediente.trim() === '' || !/^\d{1,20}$/.test(expediente)) {
      res.status(400).json({ error: 'El expediente debe ser una cadena de números.' });

    }

    const alergias = await obtenerAlergiaIntolerancia(expediente);

    res.status(200).json(alergias);

  } catch (error: any) {
    next(error);
  }
};