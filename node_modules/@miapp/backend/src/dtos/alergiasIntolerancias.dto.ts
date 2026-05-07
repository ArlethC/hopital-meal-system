/*
    Archivo: alergiaIntolerancias.dto.ts
    Descripcion: Dto para crear y modificar alergias.
    Autor: Marilyn Castro
    Fecha creacion: 16/07/2025
    Version: 1.0.0
*/
import { z } from "zod";
import type { AlergiasIntoleranciasPaciente } from "@miapp/shared";
import { formatearEdad } from "../utils/funcionesFormatear";

export const crearAlergiaShema = z.object({
    expediente: z.string().regex(/^\d+$/, {
            message: 'El expediente debe contener solo números'
        }).max(20),
    alergiasIntolerancias: z.string(),
});

export const modificarAlergiaShema = z.object({
    id: z.number({ required_error: "El id es obligatorio" }).min(1),
    alergiasIntolerancias: z.string(),
});

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