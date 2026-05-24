/*
    Archivo: funcionesFormatear.ts
    Descripcion: contiene funciones para convertir datos al formato necesario
    Autor: Marilyn Castro
    Fecha creacion: 30/06/2025
    Version: 3.0.2
*/

import {  ESTADOS_DETALLE, TIEMPOS_COMIDA, ESTADOS_SOLICITUD } from '../config/Constantes';


export function getEstadoById(idEstado: number) {
  return Object.entries(ESTADOS_SOLICITUD).find(
    ([_, value]) => value.id === idEstado
  );
}

export function convertirAMeses(valor: number, unidad: "meses" | "años"): number {
  if (unidad === "años") return valor * 12;
  return valor;
}

export function convertirAMesesMax(valor: number, unidad: "meses" | "años"): number {
  if (unidad === "años") return (valor + 1) * 12 - 1;
  return valor;
}

export function formatearEdad(meses: number) {
  if (meses < 12) return `${meses} mes${meses === 1 ? '' : 'es'}`;

  const años = Math.floor(meses / 12);
  const restoMeses = meses % 12;

  if (restoMeses === 0) return `${años} año${años === 1 ? '' : 's'}`;
  return `${años} año${años === 1 ? '' : 's'} y ${restoMeses} mes${restoMeses === 1 ? '' : 'es'}`;
}


export function formatearEdadPDF(meses: number) {
  if (meses < 12) return `${meses} m`;

  const años = Math.floor(meses / 12);
  const restoMeses = meses % 12;

  if (restoMeses === 0) return `${años} a`;
  return `${años} a y ${restoMeses} m`;
}

export function convertirHoraAHHmm(hora: string): string {
  if (!hora || hora.length < 5) return "";
  return hora.slice(0, 5);
}

export function fechaATexto(fechaISO: string): string {
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

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

export function fechaConHora(fechaISO: string): string {
  if (!fechaISO) return '';

  const fecha = new Date(fechaISO);
  if (isNaN(fecha.getTime())) {
    return 'Fecha inválida';
  }

  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
  const año = fecha.getFullYear();

  const horas = String(fecha.getUTCHours()).padStart(2, '0');
  const minutos = String(fecha.getUTCMinutes()).padStart(2, '0');
  const segundos = String(fecha.getUTCSeconds()).padStart(2, '0');

  return `${dia}-${mes}-${año} ${horas}:${minutos}:${segundos}`;
}


export function formatearNombre(nombre: string) {
  const formateado = nombre
    .toLowerCase()
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');

  return formateado;
}

export type NotificacionBD = {
  columna_modificada: string;
  operacion: string;
  valor_anterior: string;
  nuevo_valor: string;
  sala_nombre: string;
  nombre_paciente: string;
};

export function formatearNotificacion(notif: NotificacionBD): string {
  if (notif.operacion === 'crear_reclamo') {
    return `Se creó un reclamo para ${formatearNombre(notif.nombre_paciente)} en ${notif.sala_nombre}`;
  }

  if (notif.operacion === 'cancelar_reactivar') {
    const tipoOperacion = notif.nuevo_valor === ESTADOS_DETALLE.CANCELADA.toString() ? 'Cancelada': 'Reactivada';
    return `La dieta de ${formatearNombre(notif.nombre_paciente)} fue ${tipoOperacion} en ${notif.sala_nombre}`;
  }

  if(notif.operacion === 'modificar' && notif.columna_modificada === 'id_dieta_vigente'){
    return `La dieta de ${formatearNombre(notif.nombre_paciente)} fue modificada de "${notif.valor_anterior}" a "${notif.nuevo_valor}" en ${notif.sala_nombre}`;
  }

  return `El campo "Observación nutricional" de ${formatearNombre(notif.nombre_paciente)} fue modificado en ${notif.sala_nombre}`;
}

type ReclamoBD = {
    tiempoComida: number;
    totalReclamo: number;
};

export function formatearReclamos(reclamos: ReclamoBD[]) {
    return [
        {
            Valor: 'Desayuno', totalReclamo: reclamos
                .filter((r) => r.tiempoComida === TIEMPOS_COMIDA.DESAYUNO)
                .reduce((acc, r) => acc + (r.totalReclamo || 0), 0)
        },
        { valor: 'Almuerzo', totalReclamo: reclamos.filter((r) => r.tiempoComida === TIEMPOS_COMIDA.ALMUERZO).reduce((acc, r) => acc + (r.totalReclamo || 0), 0) },
        { valor: 'Cena', totalReclamo: reclamos.filter((r) => r.tiempoComida === TIEMPOS_COMIDA.CENA).reduce((acc, r) => acc + (r.totalReclamo || 0), 0) },
        { valor: 'Merienda pm', totalReclamo: reclamos.filter((r) => r.tiempoComida === TIEMPOS_COMIDA.MERIENDA_PM).reduce((acc, r) => acc + (r.totalReclamo || 0), 0) },
        { valor: 'Merienda am', totalReclamo: reclamos.filter((r) => r.tiempoComida === TIEMPOS_COMIDA.MERIENDA_AM).reduce((acc, r) => acc + (r.totalReclamo || 0), 0) }
    ]
}