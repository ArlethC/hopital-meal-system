/*
    Archivo: solicitudDietas.controllers.ts
    Descripcion: controladores para crear, obtener y cambiar los estados de las solicitudes.
    Autor: Marilyn Castro
    Fecha creacion: 11/07/2025
    Version: 3.0.2
*/
import { Request, Response, NextFunction } from 'express';
import { crearSolicitud, obtenersolicitudes, obtenerHistorial, marcarSolicitudRecibida, marcarSolicitudRecibidaParcial, estadosSolicitud } from '../services/solicitudDietas.service';
import { obtenerDetallesSolicitud } from '../services/detallesSolicitud.service';
import { validarYCompararFecha } from '../utils/validaciones';
import { TIEMPOS_COMIDA, ESTADOS_SOLICITUD } from '../config/Constantes';


export const crearSolicitudController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const permisos = req.permisos;
    const usuario = req.user;
    const { sala, idTiempoComida, detalles, fechaEntrega } = req.body;
    const { fechaVal, esHoy } = validarYCompararFecha(fechaEntrega);

    if (idTiempoComida === TIEMPOS_COMIDA.MERIENDA_AM || idTiempoComida === TIEMPOS_COMIDA.MERIENDA_PM) {
      res.status(400).json({ error: "No puede crear solicitudes de meriendas" });
      return;
    }

    if (!fechaVal) {
      res.status(400).json({ error: "La fecha no puede ser anterior a la fecha actual" });
      return;
    }

    const pacientes = await crearSolicitud(sala, Number(idTiempoComida), fechaEntrega, detalles, usuario);

    res.json(pacientes);

  } catch (error: any) {
    next(error);
  }
};

export async function obtenerSolicitudesParaModificar(req: Request, res: Response, next: NextFunction) {
  try {
    const { sala, fecha, idTiempoComida } = req.body;
    const { limite, offset, pag } = req.paginacion ?? { limite: 10, offset: 0 };


    const solicitudes = await obtenersolicitudes({
      pag: Number(pag), limite: Number(limite), offset: Number(offset), sala: sala, idTiempoComida: Number(idTiempoComida), fechaEntrega: fecha, estados: [ESTADOS_SOLICITUD.ENVIADA_COCINA, ESTADOS_SOLICITUD.MODIFICADA]
    });

    if (solicitudes.total === 0) {
      res.status(204).json({ message: "No existen solicitudes de dietas" })
      return;
    }

    if (solicitudes.total === 1) {
      let modificado = true

      if(idTiempoComida === TIEMPOS_COMIDA.MERIENDA_AM || idTiempoComida === TIEMPOS_COMIDA.MERIENDA_PM) {
        modificado = false;
      }

      const detalles = await obtenerDetallesSolicitud(solicitudes.datos[0].id, modificado);
      solicitudes.datos[0].detalles = detalles;
    }

    res.status(200).json(solicitudes);
  } catch (error) {
    next(error);
  }
}

export async function obtenerHistorialController(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const historial = await obtenerHistorial(Number(id));

    if (historial.length === 0) {
      res.status(204).json({ message: "No existe historial de cambios para este detalle" });
      return;
    }
    res.status(200).json(historial);

  } catch (error) {
    next(error);
  }
}

export async function solicitudRecibida(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const usuario = req.user;
    const ipUsuario: string = req.ip ?? 'IP_DESCONOCIDA';

    await marcarSolicitudRecibida(Number(id), usuario, ipUsuario);

    res.status(200).json({ message: "Solicitud marcada como recibida" });

  } catch (error) {
    next(error);
  }
}

export async function solicitudRecibidaParcial(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { idDetalles } = req.body;
    const usuario = req.user;
    const ipUsuario: string = req.ip ?? 'IP_DESCONOCIDA';

    await marcarSolicitudRecibidaParcial(Number(id), idDetalles, usuario, ipUsuario);

    res.status(200).json({ message: "Solicitud marcada como recibida" });

  } catch (error) {
    next(error);
  }
}

export async function obtenerSolicitudesParaRecibir(req: Request, res: Response, next: NextFunction) {
  try {
    const { sala, fecha, idTiempoComida } = req.body;
    const { limite, offset, pag } = req.paginacion ?? { limite: 10, offset: 0 };

    const solicitudes = await obtenersolicitudes({
      pag: Number(pag), limite: Number(limite), offset: Number(offset), sala: sala, idTiempoComida: Number(idTiempoComida), fechaEntrega: fecha, estados: [ESTADOS_SOLICITUD.ENVIADA_SALA, ESTADOS_SOLICITUD.ENVIADA_COCINA, ESTADOS_SOLICITUD.MODIFICADA, ESTADOS_SOLICITUD.RECIBIDA, ESTADOS_SOLICITUD.R_RECLAMO],
    });

    if (solicitudes.total === 0) {
      res.status(204).json({ message: "No existen solicitudes de dietas" })
      return;
    }

    if (solicitudes.total === 1) {
      const detalles = await obtenerDetallesSolicitud(solicitudes.datos[0].id);
      solicitudes.datos[0].detalles = detalles;
    }

    res.status(200).json(solicitudes);
  } catch (error) {
    next(error);
  }
}

export async function obtenerSolicitudes(req: Request, res: Response, next: NextFunction) {
  try {
    const { sala, fecha, idTiempoComida } = req.body;
    const { limite, offset, pag } = req.paginacion ?? { limite: 10, offset: 0 };

    const solicitudes = await obtenersolicitudes({
      pag: Number(pag), limite: Number(limite), offset: Number(offset), sala: sala, idTiempoComida: Number(idTiempoComida), fechaEntrega: fecha, estados: [ESTADOS_SOLICITUD.CERRADA, ESTADOS_SOLICITUD.C_RECLAMO, ESTADOS_SOLICITUD.R_RECLAMO, ESTADOS_SOLICITUD.RECIBIDA],
    });

    if (solicitudes.total === 0) {
      res.status(204).json({ message: "No existen solicitudes de dietas" })
      return;
    }

    if (solicitudes.total === 1) {
      const detalles = await obtenerDetallesSolicitud(solicitudes.datos[0].id);
      solicitudes.datos[0].detalles = detalles;
    }

    res.status(200).json(solicitudes);
  } catch (error) {
    next(error);
  }
}

export async function obtenerSolicitudesTodas(req: Request, res: Response, next: NextFunction) {
  try {
    const { sala, fecha, idTiempoComida, idEstado } = req.body;
    const { limite, offset, pag } = req.paginacion ?? { limite: 10, offset: 0 };

    const solicitudes = await obtenersolicitudes({
      pag: Number(pag), limite: Number(limite), offset: Number(offset), sala: sala, idTiempoComida: Number(idTiempoComida), fechaEntrega: fecha, estados: [ESTADOS_SOLICITUD.CERRADA, ESTADOS_SOLICITUD.C_RECLAMO, ESTADOS_SOLICITUD.R_RECLAMO, ESTADOS_SOLICITUD.RECIBIDA, ESTADOS_SOLICITUD.ENVIADA_COCINA, ESTADOS_SOLICITUD.MODIFICADA, ESTADOS_SOLICITUD.ENVIADA_SALA], idEstado: idEstado
    });

    if (solicitudes.total === 0) {
      res.status(204).json({ message: "No existen solicitudes de dietas" })
      return;
    }

    if (solicitudes.total === 1) {
      const detalles = await obtenerDetallesSolicitud(solicitudes.datos[0].id);
      solicitudes.datos[0].detalles = detalles;
    }

    res.status(200).json(solicitudes);
  } catch (error) {
    next(error);
  }
}

export async function obtenerSolicitud(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const solicitud = await obtenersolicitudes({ pag: 0, limite: 0, offset: 0, idSolicitud: Number(id) });

    if (solicitud.total === 0) {
      res.status(404).json({ message: "No existe la solicitud de dietas" })
      return;
    }

    res.status(200).json(solicitud.datos[0]);
  } catch (error) {
    next(error);
  }
}

export const obtenerEstadosSolicitud = async (_req: Request, res: Response, next: NextFunction) => {
  try {

    const estados = await estadosSolicitud( );
    
    res.json({
      estados
    });

  } catch (error: any) {
    next(error);
  }
};