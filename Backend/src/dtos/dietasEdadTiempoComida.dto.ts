/*
    Archivo: dietasEdadTiempoComida.dto.ts
    Descripcion: Esquema Zod para validar los datos de los grupos de dieta, rango de edad y tiempo de comida.
    Autor: Marilyn Castro
    Fecha creacion: 3/07/2025
    Version: 1.0.0
*/
import type { GrupoDieComEd } from "@miapp/shared";


export function toDietaEdadDto(grupo: any): GrupoDieComEd {
  return {
    id: grupo.id_dieta_comida_edad,
    idDieta: grupo.id_dieta,
    dieta: grupo.descripcion,
    abrevDieta: grupo.abrev_nombre_dieta,
    idTiempoComida: grupo.id_valor_catalogo,
    tiempoComida: grupo.valor_catalogo,
    idRangoEdad: grupo.id_rango_edad,
    rangoEdad: grupo.descripcion_rango,
    edad_minima_meses: grupo.edad_minima,
    edad_maxima_meses: grupo.edad_maxima,
  };
}