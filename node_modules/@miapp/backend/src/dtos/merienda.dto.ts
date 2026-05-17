/*
    Archivo: merienda.dto.ts
    Descripcion: Esquema ZOD para validar las meriendas de los pacientes.
    Autor: Marilyn Castro
    Fecha creacion: 31/07/2025
    Version: 1.0.0
*/
import type { Merienda } from "@miapp/shared";

export function toMeriendaDto(merienda: any): Merienda {
  return {
    id: merienda.id,
    dieta: merienda.descripcion,
    observacion: merienda.obs_merienda,
    tiempoComida: merienda.comida,
    fechaInicial: merienda.fechaInicial,
    fechaFinal: merienda.fechaFinal,
    estado: merienda.vigencia,
  };
}
