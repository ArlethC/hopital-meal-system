/*
    Archivo: dietasEdadTiempoComida.dto.ts
    Descripcion: Esquema Zod para validar los datos de los grupos de dieta, rango de edad y tiempo de comida.
    Autor: Marilyn Castro
    Fecha creacion: 3/07/2025
    Version: 1.0.0
*/

import { z } from "zod";
import type { GrupoDieComEd } from "@miapp/shared";


export const CrearDietaEdadTiempoShema = z.object({
  idTiempoComida: z.number({ required_error: "El tiempo de comida es obligatorio" })
    .min(1, { message: "El tiempo de comida no puede ser negativo" }),

  idRangoEdad: z.number({ required_error: "El rango de edad es obligatorio" })
    .min(1, { message: "El rango de edad no puede ser negativo" }),

  idDietas: z.array(z.object({
    codigo: z.number({ required_error: "La dieta es obligatoria" }),
    abrevDieta: z.string().max(50, { message: 'La abreviatura no puede tener más de 50 caracteres' })
      .optional().refine(val => val === undefined || (val.trim() !== ''), {
        message: 'La abreviatura no puede ser una cadena vacía',
      }),

  })).min(1, { message: "Debe incluir al menos una dieta" })
});

export const ModificarDietaEdadTiempoShema = z.object({
  idTiempoComida: z.number({ required_error: "El tiempo de comida es obligatorio" })
    .min(1, { message: "El tiempo de comida no puede ser negativo" })
    .optional(),

  idRangoEdad: z.number({ required_error: "El rango de edad es obligatorio" })
    .min(1, { message: "El rango de edad no puede ser negativo" })
    .optional(),

  abrevDieta: z.string().max(50, { message: 'La abreviatura no puede tener más de 50 caracteres' })
    .optional().refine(val => val === undefined || (val.trim() !== ''), {
      message: 'La abreviatura no puede ser una cadena vacía',
    }),
});

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