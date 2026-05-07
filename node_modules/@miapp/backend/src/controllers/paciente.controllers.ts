/*
    Archivo: paciente.controllers.ts
    Descripcion: controladores que obtienen informacion sobre los pacientes.
    Autor: Marilyn Castro
    Fecha creacion: 7/07/2025
    Version: 1.0.1
*/

import { Request, Response, NextFunction } from 'express';
import { obtenerPacientes, obtenerPacientesXSala, obtenerInfoPaciente, obtenerSalas } from '../services/paciente.service'
import { TIEMPOS_COMIDA } from '../config/Constantes';


export const obtenerPacientesxExpNom = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const busqueda = (_req.query.name as string) || '';

    const busquedaValida = busqueda.trim() !== " " ? busqueda : undefined;

    const { limite, offset } = _req.paginacion ?? { limite: 10, offset: 0 };
    const pacientes = await obtenerPacientes(limite, offset, busquedaValida);

    if (pacientes.total === 0) {
      res.status(200).json(pacientes)
      return;
    }

    res.json({
      data: pacientes.data,
      total: pacientes.total,
      page: pacientes.page,
      pageSize: pacientes.pageSize,
      totalPages: pacientes.totalPages
    });

  } catch (error: any) {
    next(error);
  }
};

export const obtenerPacienteSala = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sala, fecha, idTiempoComida } = req.body;
    const permisos = req.permisos

    if (idTiempoComida === TIEMPOS_COMIDA.MERIENDA_AM || idTiempoComida === TIEMPOS_COMIDA.MERIENDA_PM) {
      res.status(422).json({ error: "No puede crear solicitudes de meriendas" });
      return;
    }

    const pacientes = await obtenerPacientesXSala(sala, fecha, Number(idTiempoComida));

    res.json(pacientes);

  } catch (error: any) {
    next(error);
  }
};

export const obtenerPacienteExpediente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idTiempoComida, expediente, fechaEntrega, sala } = req.body;

    const paciente = await obtenerInfoPaciente(expediente, Number(idTiempoComida), fechaEntrega, sala);

    res.json(paciente);

  } catch (error: any) {
    next(error);
  }
};

export const obtenerSalasController = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const salas = await obtenerSalas();

    res.json(salas);

  } catch (error: any) {
    next(error);
  }
};