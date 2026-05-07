/*
    Archivo: detallesSolicitud.controllers.ts
    Descripcion: controladores para modificar, cancelar, reactivar y obtener los detalles de las solicitudes de dietas.
    Autor: Marilyn Castro
    Fecha creacion: 23/07/2025
    Version: 1.0.2
*/
import { Request, Response, NextFunction } from 'express';
import { TIEMPOS_COMIDA, ESTADOS_SOLICITUD } from '../config/Constantes';
import {verificarEstadoSolicitud} from '../services/solicitudDietas.service';
import { modificarDetalleSolicitud, obtenerDetalle, obtenerDetallesSolicitud, reactivarDetalleSolicitud, cancelarDetalleSolicitud, puedeModificarHorario } from '../services/detallesSolicitud.service';


export async function modificarDietasObs(req: Request, res: Response, next: NextFunction) {
  try {

    const { id, idDieta, obsEnfermeria } = req.body;
    const usuario = req.user;
    const ipUsuario: string = req.ip ?? 'IP_DESCONOCIDA';

    const puedeModificar = await verificarEstadoSolicitud(
      id,
      [ESTADOS_SOLICITUD.ENVIADA_COCINA, ESTADOS_SOLICITUD.MODIFICADA],
      [TIEMPOS_COMIDA.MERIENDA_AM, TIEMPOS_COMIDA.MERIENDA_PM]);

    if (!puedeModificar) {
      res.status(400).json({ error: "Ya no puede modificar esta solicitud de dietas" })
      return;
    }

    const modificarHorario = await puedeModificarHorario(id);

    if (!modificarHorario) {
      res.status(422).json({ error: "El tiempo para modificar esta solicitud ha terminado" })
      return;
    }

    await modificarDetalleSolicitud({ id, usuario, idDieta, obsEnfermeria, ipUsuario });

    const registroModificado = await obtenerDetalle(Number(id), true);

    res.status(200).json(registroModificado);

  } catch (error) {
    next(error);
  }
}

export async function modificarNutricion(req: Request, res: Response, next: NextFunction) {
  try {
    const { id, obsNutricion } = req.body;
    const usuario = req.user;
    const ipUsuario: string = req.ip ?? 'IP_DESCONOCIDA';

    const puedeModificar = await verificarEstadoSolicitud(
      id,
      [ESTADOS_SOLICITUD.ENVIADA_COCINA, ESTADOS_SOLICITUD.MODIFICADA],
      [TIEMPOS_COMIDA.MERIENDA_AM, TIEMPOS_COMIDA.MERIENDA_PM]);

    if (!puedeModificar) {
      res.status(400).json({ error: "Ya no puede modificar esta solicitud de dietas" })
      return;
    }

    const modificarHorario = await puedeModificarHorario(id);

    if (!modificarHorario) {
      res.status(422).json({ error: "El tiempo para modificar esta solicitud ha terminado" })
      return;
    }

    await modificarDetalleSolicitud({ id, usuario, obsNutricion, ipUsuario });

    const registroModificado = await obtenerDetalle(Number(id), true);

    res.status(200).json(registroModificado);

  } catch (error) {
    next(error);
  }
}

export async function modificarCocina(req: Request, res: Response, next: NextFunction) {
  try {
    const { id, obsCocina } = req.body;
    const usuario = req.user;
    const ipUsuario: string = req.ip ?? 'IP_DESCONOCIDA';

    const puedeModificar = await verificarEstadoSolicitud(id,
      [ESTADOS_SOLICITUD.ENVIADA_COCINA, ESTADOS_SOLICITUD.MODIFICADA, ESTADOS_SOLICITUD.ENVIADA_SALA],
      [TIEMPOS_COMIDA.MERIENDA_AM, TIEMPOS_COMIDA.MERIENDA_PM]);

    if (!puedeModificar) {
      res.status(400).json({ error: "Ya no puede modificar esta solicitud de dietas" })
      return;
    }

    await modificarDetalleSolicitud({ id, usuario, obsCocina, ipUsuario });

    const registroModificado = await obtenerDetalle(Number(id), true);

    res.status(200).json(registroModificado);

  } catch (error) {
    next(error);
  }
}

export async function obtenerDetallesSolicitudParaModificar(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const modificado = true
    const detalles = await obtenerDetallesSolicitud(Number(id), modificado);

    if (detalles.length === 0) {
      res.status(204).json({ message: "No existen detalles para esta solicitud" })
      return;
    }

    res.status(200).json(detalles);

  } catch (error) {
    next(error);
  }
}

export async function cancelarDieta(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const usuario = req.user;
    const ipUsuario: string = req.ip ?? 'IP_DESCONOCIDA';

    await cancelarDetalleSolicitud(Number(id), usuario, ipUsuario);

    res.status(200).json({ message: "Dieta cancelada existosamente" });

  } catch (error) {
    next(error);
  }
}

export async function reactivarDieta(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const usuario = req.user;
    const ipUsuario: string = req.ip ?? 'IP_DESCONOCIDA';

    await reactivarDetalleSolicitud(Number(id), usuario, ipUsuario);

    res.status(200).json({ message: "La dieta ha sido reactivada" });

  } catch (error) {
    next(error);
  }
}

export async function detallesSolicitud(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const detalles = await obtenerDetallesSolicitud(Number(id));

    if (detalles.length === 0) {
      res.status(204).json({ message: "No existen detalles para esta solicitud" })
      return;
    }

    res.status(200).json(detalles);

  } catch (error) {
    next(error);
  }
}