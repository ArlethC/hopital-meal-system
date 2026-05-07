/*
    Archivo: rangosEdad.dto.ts
    Descripcion: contiene las definiciones de los DTOs para crear, actualizar y desactivar rangos de edad.
    Autor: Marilyn Castro
    Fecha creacion: 30/06/2025
    Version: 1.0.2
*/

import { z } from "zod";

export const CrearRangoEdadSchema = z.object({
  descripcion: z.string({ required_error: "La descripción es obligatoria" })
                .max(100, "La descripción no puede exceder 100 caracteres"), 

  edadMinima: z.number({ required_error: "La edad mínima es obligatoria" })
                .min(0, { message: "La edad mínima no puede ser negativa" }),

  edadMaxima: z.number({ required_error: "La edad máxima es obligatoria" })
              .min(0, { message: "La edad máxima no puede ser negativa" }),
  unidad: z.enum(['meses', 'años'], {
    errorMap: () => ({ message: "La unidad debe ser 'meses' o 'años'" }),
  }),
}).refine(
  (data) =>
    (!data.edadMinima && !data.edadMaxima) || !!data.unidad,
  {
    message: "La unidad es obligatoria si se especifica edad mínima o máxima",
    path: ['unidad'],
  }
);

export const ActualizarRangoEdadSchema = z.object({
  descripcion: z.string({ required_error: "La descripción es obligatoria" }).max(100, "La descripción no puede exceder 100 caracteres")
                .optional(), 

  edadMinima: z.number({ required_error: "La edad mínima es obligatoria" })
                .min(0, { message: "La edad mínima no puede ser negativa" }).optional(),

  edadMaxima: z.number({ required_error: "La edad máxima es obligatoria" })
              .min(0, { message: "La edad máxima no puede ser negativa" }).optional(),
  unidad: z
    .enum(['meses', 'años'], {
      errorMap: () => ({ message: "La unidad debe ser 'meses' o 'años'" }),
    })
    .optional(),
}).refine(
  (data) =>
    (!data.edadMinima && !data.edadMaxima) || !!data.unidad,
  {
    message: "La unidad es obligatoria si se especifica edad mínima o máxima",
    path: ['unidad'],
  }
)
.refine(
  (data) =>
    data.edadMinima === undefined ||
    data.edadMaxima === undefined ||
    data.edadMinima <= data.edadMaxima,
  {
    message: "La edad mínima no puede ser mayor que la edad máxima",
    path: ['edadMinima'],
  }
);


