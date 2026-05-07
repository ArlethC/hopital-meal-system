/*
    Archivo: funcionObtenerTiempoComida.ts
    Descripcion: Funciones para obtener el tiempo de comida para las pantallas de resumen de cocina.
    Autor: Marilyn Castro
    Fecha creacion: 7/08/2025
    Version: 1.0.1
*/
import { TIEMPOS_COMIDA } from '../config/Constantes';

export function obtenerTiempoComidaActual(): { id: number, nombre: string} {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 7 && hour < 13) return { id: TIEMPOS_COMIDA.ALMUERZO, nombre: 'Almuerzo'};
  if (hour >= 13 && hour < 17) return { id: TIEMPOS_COMIDA.CENA, nombre: 'Cena'};
  return { id: TIEMPOS_COMIDA.DESAYUNO, nombre: 'Desayuno'};
}


export function obtenerTiempoComidaMerienda(): { id: number, nombre: string} {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 10 && hour < 22) return { id: TIEMPOS_COMIDA.MERIENDA_PM, nombre: 'Merienda PM'};
  return { id: TIEMPOS_COMIDA.MERIENDA_AM, nombre: 'Merienda AM'};
}