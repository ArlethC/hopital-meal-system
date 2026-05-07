/*
    Archivo: formatear.ts
    Descripcion: contiene funciones para formatear los datos.
    Autor: Marilyn Castro
    Fecha creacion: 3/07/2025
    Version: 2.0.0
*/

import type { PacientesList } from "@miapp/shared";

import type { PacienteModificar, PacienteFinalizado, PacienteUi } from "../types/ui";
import type { OrdenDieta, DetalleOrden } from "../types/solicitud";
import { type SolicitudCard } from "../components/CardSolicitud";

export function obtenerEdadYUnidad(meses: number): { valor: number; unidad: "meses" | "años" } {
  if (meses % 12 === 0) {
    return { valor: meses / 12, unidad: "años" };
  }
  return { valor: meses, unidad: "meses" };
}

export function formatearEdad(meses: number) {
  if (meses < 12) return `${meses} mes${meses === 1 ? '' : 'es'}`;

  const años = Math.floor(meses / 12);
  const restoMeses = meses % 12;

  if (restoMeses === 0) return `${años} año${años === 1 ? '' : 's'}`;
  return `${años} año${años === 1 ? '' : 's'} y ${restoMeses} mes${restoMeses === 1 ? '' : 'es'}`;
}

export function convertirHoraA_HHmm(hora: string): string {
  if (!hora || hora.length < 5) return "";
  return hora.slice(0, 5);
}


export function esHoraValida(hora: string): boolean {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(hora);
}


export function transformarPaciente(p: PacientesList): PacienteUi {
  return {
    expediente: p.expediente,
    ambiente: p.ambiente ?? '',
    paciente: p.nombre,
    edadTexto: p.edadTexto,
    dietasValidas: p.dietasValidas,
    alergia: p.alergia,
    documento: p.documento,
    estado: 'crear',
    asignado: p.asignado ?? false,
    idRelacion: p.idRelacionSis,
    tipoRelacion: p.tipoRelacion,
  };
}

export function fechaATexto(fechaISO: string): string {
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  if (!fechaISO) return '';
  const tieneHora = fechaISO.includes('T');
  const fechaStr = tieneHora ? fechaISO : `${fechaISO}T00:00`;

  const fecha = new Date(fechaStr);

  if (isNaN(fecha.getTime())) {
    return 'Fecha inválida';
  }

  const dia = fecha.getDate();
  const mes = meses[fecha.getMonth()];
  const año = fecha.getFullYear();

  if (tieneHora) {
    const horas = fecha.getUTCHours();
    const minutos = fecha.getUTCMinutes();
    const horaFormateada = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
    return `${dia} de ${mes} de ${año} a las ${horaFormateada}`;
  }

  return `${dia} de ${mes} de ${año}`;
}

export function fechaHoraActualATexto(): string {
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];


  const ahora = new Date();

  const dia = ahora.getDate();
  const mes = meses[ahora.getMonth()];
  const año = ahora.getFullYear();

  const horas = ahora.getHours().toString().padStart(2, '0');
  const minutos = ahora.getMinutes().toString().padStart(2, '0');

  return `${dia} de ${mes} de ${año} ${horas}:${minutos}`;
}

export type EstadoTabla =
   'entrega' 
  | 'reclamo' 
  | 'cerrar';

const ESTADOS_MAP: Record<number, { solicitud: EstadoSolicitud; tabla: EstadoTabla }> = {
  5958: { solicitud: 'Enviada a Cocina', tabla: 'entrega' },
  5959: { solicitud: 'Modificada y Enviada a Cocina', tabla: 'entrega' },
  5960: { solicitud: 'Enviada a Sala', tabla: 'entrega' },
  5961: { solicitud: 'Recibida en Sala', tabla: 'reclamo' },
  5962: { solicitud: 'Recibida en Sala con Reclamo', tabla: 'reclamo' },
  5963: { solicitud: 'Cerrada', tabla: 'cerrar' },
  5965: { solicitud: 'Cerrada con Reclamo', tabla: 'cerrar' },
};

export function getEstadoUIById(idEstado: number) {
  return ESTADOS_MAP[idEstado] ?? { solicitud: 'Cerrada', tabla: 'cerrar' };
}


export type EstadoSolicitud =
  | 'Enviada a Cocina'
  | 'Modificada y Enviada a Cocina'
  | 'Enviada a Sala'
  | 'Recibida en Sala'
  | 'Recibida en Sala con Reclamo'
  | 'Cerrada'
  | 'Cerrada con Reclamo';

export function mapOrdenDietaToCard(orden: OrdenDieta): SolicitudCard {
  return {
    id: orden.id,
    sala: orden.sala,
    fechaEntrega: orden.fechaEntrega,
    usuario: orden.usuario,
    fechaCreacion: orden.fechaCreacion,
    tiempoComida: orden.tiempoComida,
    estado: getEstadoUIById(orden.idEstado).solicitud,
  };
}


export function mapDetalleOrdenToPacienteModificar(detalle: DetalleOrden): PacienteModificar {

  return {
    id: detalle.idDetalle,
    expediente: detalle.expediente,
    ambiente: detalle.cama,
    paciente: detalle.nombre,
    edadTexto: detalle.edadTexto,
    alergia: detalle.alergia,
    documento: detalle.documento,
    dietaSeleccionada: detalle.dieta,
    obsEnfermeria: detalle.obsEnfermeria ?? '',
    obsNutricion: detalle.obsNutricion ?? '',
    obsCocina: detalle.obsCocina ?? '',
    modificado: detalle.modificado,
    cancelado: detalle.cancelado,
    recibido: detalle.recibido,
    reclamo: detalle.reclamo,
    estado: 'modificar',
    dietasValidas: detalle.dietasValidas ?? [],
  };
}

export function formatearNombre(nombre: string) {
  const formateado = nombre
    .toLowerCase()
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');

  return formateado;
}


export function convertirADetalleFinalizado(
  detalle: DetalleOrden,
  estadoDetalle: number,
): PacienteFinalizado {
  return {
    id: detalle.idDetalle,
    expediente: detalle.expediente,
    ambiente: detalle.cama,
    paciente: detalle.nombre,
    alergia: detalle.alergia,
    documento: detalle.documento,
    edadTexto: detalle.edadTexto,

    obsEnfermeria: detalle.obsEnfermeria ?? undefined,
    obsNutricion: detalle.obsNutricion ?? undefined,
    obsCocina: detalle.obsCocina ?? undefined,
    modificado: detalle.modificado,
    cancelado: detalle.cancelado,

    dietaSeleccionada: detalle.dieta,
    estado: getEstadoUIById(estadoDetalle).tabla,
    recibido: detalle.recibido,
    reclamo: detalle.reclamo,
  };
}

