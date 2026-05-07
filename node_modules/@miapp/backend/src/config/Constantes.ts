/*
    Archivo: Constantes.ts
    Descripcion: constantes de los codigos de los cátalogos de tiempos de comida, estados de las solicitudes y sus detalles.
    Autor: Marilyn Castro
    Fecha creacion: 17/07/2025
    Version: 1.0.1
*/

import path from 'path';

export const RUTA_UPLOADS = path.join(process.cwd(), 'uploads');

export const TIEMPOS_COMIDA = {
    DESAYUNO: 1,
    ALMUERZO: 2,
    CENA: 3,
    MERIENDA_AM: 4,
    MERIENDA_PM: 5,
} as const

export const ESTADO_RECLAMO = {
    REPORTADO: 6,
    SOLUCIONADO: 7,
} as const

export const ESTADOS_SOLICITUD = {
  ENVIADA_COCINA: 8,
  MODIFICADA: 9,
  ENVIADA_SALA: 10,
  RECIBIDA: 11,
  R_RECLAMO: 12,
  CERRADA: 13,
  C_RECLAMO: 14,
} as const;

export const ESTADOS_DETALLE = {
  SOLICITADA: 15,
  MODIFICADA: 16,
  RECIBIDA: 17,
  RECLAMO: 18,
  CANCELADA: 19,
} as const;

export const CATALOGO_COMIDA = 3;
export const CATALOGO_TIPO_DOCUMENTO = 2;
export const CATALOGO_TIPO_RECLAMO = 1;
export const CATALOGO_ESTADO_SOLICITUD = 4;
export const CATALOGO_ESTADOS_DETALLE = 5;


export type EstadoSolicitud = keyof typeof ESTADOS_SOLICITUD;
export type EstadoDetalle = keyof typeof ESTADOS_DETALLE;
export type Comida = keyof typeof TIEMPOS_COMIDA;
export type EstadoReclamo = keyof typeof ESTADO_RECLAMO;


