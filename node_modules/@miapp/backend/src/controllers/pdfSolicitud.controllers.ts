/*
    Archivo: pdfSolicitud.controllers.tsx
    Descripcion: Controlador para crear el pdf del reporte de la solicitud.
    Autor: Marilyn Castro
    Fecha creacion: 29/07/2025
    Version: 1.0.0
*/
import { Request, Response, NextFunction } from 'express';
import { obtenersolicitudes } from '../services/solicitudDietas.service';
import { obtenerDetallesSolicitud } from '../services/detallesSolicitud.service';
import { generarPDF, obtenerCambioSala, cambiarEstadoSolicitud, OrdenDietaPDF, mapToDetalle, Detalle } from '../services/PdfSolicitud.service';

export const obtenerPDF = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const usuario = req.user;
    const ipUsuario: string = req.ip ?? 'IP_DESCONOCIDA';

    const solicitud = await obtenersolicitudes({ pag: 0, limite: 0, offset: 0, idSolicitud: Number(id) });

    if (solicitud.datos.length === 0) {
      res.status(400).json({ error: 'La solicitud de dieta no existe' });
      return;
    }

    await cambiarEstadoSolicitud(Number(id), usuario, ipUsuario);

    const detalles = await obtenerDetallesSolicitud(Number(id));

    if (detalles.length === 0) {
      res.status(400).json({ error: 'La solicitud de dieta no tiene detalles' });
      return;
    }

    const datos = solicitud.datos[0]

    const cambios = await obtenerCambioSala(datos.id, datos.sala);

    const detallesTransformados: Detalle[] = detalles.map(detalle => mapToDetalle(detalle, cambios))

    const ordenPDF: OrdenDietaPDF = {
      ...datos,
      detalles: detallesTransformados
    };

    const pdfBuffer = await generarPDF(ordenPDF);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=solicitud.pdf");
    res.send(pdfBuffer);

  } catch (error: any) {
    next(error);
  }
};