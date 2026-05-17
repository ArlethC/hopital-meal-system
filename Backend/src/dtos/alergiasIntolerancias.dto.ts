/*
    Archivo: alergiaIntolerancias.dto.ts
    Descripcion: Dto para crear y modificar alergias.
    Autor: Marilyn Castro
    Fecha creacion: 16/07/2025
    Version: 1.0.0
*/

import type { AlergiasIntoleranciasPaciente } from "@miapp/shared";
import { formatearEdad } from "../utils/funcionesFormatear";

export function toAlergiaOutputDto(alergia: any): AlergiasIntoleranciasPaciente {
  return {
    expediente: alergia.expediente,
    nombre: alergia.paciente,
    edad: formatearEdad(alergia.edad),
    alergias: alergia.alergias.map((a: any) => ({
      id: a.id,
      alergiasIntolerancias: a.alergiasIntolerancias,
    })),
  };
}