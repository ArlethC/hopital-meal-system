/*
    Archivo: solicitud.ts
    Descripcion: tipos para enviar y recibir los datos relacionados con las solicitudes de dietas.
    Autor: Marilyn Castro
    Fecha creacion: 14/07/2025
    Version: 1.0.1
*/
import type { Salas } from '../types/ui';
import type { DetalleOrden, OrdenBase, PacienteOmitido } from "@miapp/shared";


//Datos de entrada de la api
type DatosSala = {
    sala: string;
    fecha: string;
    idTiempoComida: number;
}

type DatosFiltroSolicitud = {
    sala?: string;
    fecha?: string;
    idTiempoComida?: number;
    idEstado?: number;
}

type ModificacionCocina = {
  id: number;
  obsCocina: string;
}

type ModificacionNutricion = {
  id: number;
  obsNutricion: string;
}

type ModificacionEnfermeria = {
  id: number;
  idDieta?: number;
  obsEnfermeria?: string;
}

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

interface Historial {
  campo_modificado: string;
  valor_anterior: string;
  valor_nuevo: string;
  fecha_cambio: string;
  usuario_cambio: string;
}


export {
  type DatosSala,
  type ModificacionCocina,
  type ModificacionNutricion,
  type ModificacionEnfermeria,
  type DetalleEntrega,
  type RespuestaEntregaDietas,
  type Salas,
  type DatosFiltroSolicitud,
  type IdDetallesPayload,

  type PacienteOmitido,
  type DetalleOrden,
  type RespuestaOrdenes,
  type OrdenDieta,
  type Historial,
};
