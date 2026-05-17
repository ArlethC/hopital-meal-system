/*
    Archivo: solicitud.ts
    Descripcion: tipos para enviar y recibir los datos relacionados con las solicitudes de dietas.
    Autor: Marilyn Castro
    Fecha creacion: 14/07/2025
    Version: 1.0.1
*/
import type { Salas } from '../types/ui';
import type { DetalleOrden, OrdenBase, PacienteOmitido, Historial, BuscarSolicitudSchemaDTO, ModificacionNutricionShemaDTO,modificacionEnfermeriaShemaDTO, ModificacionCocinaShemaDTO} from "@miapp/shared";


//Datos de entrada de la api

type DetalleEntrega = {
    expediente: string;
    idDieta: number;
    cama: string;
    obsEnfermeria?: string;
    idRelacion?: number;
    tipoRelacion?: string;
};

type RespuestaEntregaDietas = {
    sala: string;
    fechaEntrega: string;
    idTiempoComida: number;
    detalles: DetalleEntrega[];
};

type IdDetallesPayload = {
  idDetalles: number[];
};


//datos de salida de la api

interface OrdenDieta extends OrdenBase {
  idTiempoComida: number;
  idEstado: number;
  detalles?: DetalleOrden[];
}

interface RespuestaOrdenes {
  total: number;
  paginaActual: number;
  totalPaginas: number;
  datos: OrdenDieta[];
}


export {
  type ModificacionCocinaShemaDTO,
  type ModificacionNutricionShemaDTO,
  type modificacionEnfermeriaShemaDTO,
  type DetalleEntrega,
  type RespuestaEntregaDietas,
  type Salas,
  type BuscarSolicitudSchemaDTO,
  type IdDetallesPayload,

  type PacienteOmitido,
  type DetalleOrden,
  type RespuestaOrdenes,
  type OrdenDieta,
  type Historial,
};
