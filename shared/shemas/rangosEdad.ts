import { z } from "zod";

export const crearRangoEdad = z.object({
  descripcion: z.string({ error: "La descripción es obligatoria" })
                .max(100, "La descripción no puede exceder 100 caracteres"), 

  edadMinima: z.number({ error: "La edad mínima es obligatoria" })
                .min(0, { error: "La edad mínima no puede ser negativa" }),

  edadMaxima: z.number({ error: "La edad máxima es obligatoria" })
              .min(0, { error: "La edad máxima no puede ser negativa" }),
  unidad: z.enum(['meses', 'años'], {
    error: "La unidad debe ser 'meses' o 'años'",
  }),
}).refine(
  (data) =>
    (!data.edadMinima && !data.edadMaxima) || !!data.unidad,
  {
    error: "La unidad es obligatoria si se especifica edad mínima o máxima",
    path: ['unidad'],
  }
);

export const modificarRangoEdadSchema = z.object({
  descripcion: z.string({ error: "La descripción es obligatoria" }).max(100, "La descripción no puede exceder 100 caracteres")
                .optional(), 

  edadMinima: z.number({ error: "La edad mínima es obligatoria" })
                .min(0, { message: "La edad mínima no puede ser negativa" }).optional(),

  edadMaxima: z.number({ error: "La edad máxima es obligatoria" })
              .min(0, { message: "La edad máxima no puede ser negativa" }).optional(),
  unidad: z
    .enum(['meses', 'años'], {
      error: () => ({ message: "La unidad debe ser 'meses' o 'años'" }),
    })
    .optional(),
}).refine(
  (data) =>
    (!data.edadMinima && !data.edadMaxima) || !!data.unidad,
  {
    error: "La unidad es obligatoria si se especifica edad mínima o máxima",
    path: ['unidad'],
  }
)
.refine(
  (data) =>
    data.edadMinima === undefined ||
    data.edadMaxima === undefined ||
    data.edadMinima <= data.edadMaxima,
  {
    error: "La edad mínima no puede ser mayor que la edad máxima",
    path: ['edadMinima'],
  }
);

export type CrearRangoEdadSchemaDTO = z.infer<typeof crearRangoEdad>;
export type ModificarRangoEdadSchemaDTO = z.infer<typeof modificarRangoEdadSchema>;

