import { z } from "zod";

export const crearDietaEdadTiempoShema = z.object({
  idTiempoComida: z.number({ error: "El tiempo de comida es obligatorio" })
    .min(1, { error: "El tiempo de comida no puede ser negativo" }),

  idRangoEdad: z.number({ error: "El rango de edad es obligatorio" })
    .min(1, { error: "El rango de edad no puede ser negativo" }),

  idDietas: z.array(z.object({
    codigo: z.number({ error: "La dieta es obligatoria" }),
    abrevDieta: z.string().max(50, { error: 'La abreviatura no puede tener más de 50 caracteres' })
      .optional().refine(val => val === undefined || (val.trim() !== ''), {
        error: 'La abreviatura no puede ser una cadena vacía',
      }),

  })).min(1, { error: "Debe incluir al menos una dieta" })
});

export const modificarDietaEdadTiempoShema = z.object({
  idTiempoComida: z.number({ error: "El tiempo de comida es obligatorio" })
    .min(1, { error: "El tiempo de comida no puede ser negativo" })
    .optional(),

  idRangoEdad: z.number({ error: "El rango de edad es obligatorio" })
    .min(1, { error: "El rango de edad no puede ser negativo" })
    .optional(),

  abrevDieta: z.string().max(50, { error: 'La abreviatura no puede tener más de 50 caracteres' })
    .optional().refine(val => val === undefined || (val.trim() !== ''), {
      error: 'La abreviatura no puede ser una cadena vacía',
    }),
});

export type CrearDietaEdadTiempoShemaDTO = z.infer<typeof crearDietaEdadTiempoShema>;
export type ModificarDietaEdadTiempoShemaDTO = z.infer<typeof modificarDietaEdadTiempoShema>;

