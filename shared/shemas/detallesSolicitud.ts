import { z } from 'zod';

export const modificacionEnfermeriaShema = z.object({
    id: z.number({ error: "El id es obligatorio" }).min(1),
    idDieta: z.number().optional(),
    obsEnfermeria: z.string().optional(),
}).refine(
    (data) => (data.idDieta || data.obsEnfermeria !== undefined),
    {
        error: "Debe incluir al menos una dieta o una observación de enfermería",
    }
);

export const modificacionNutricionShema = z.object({
    id: z.number({ error: "El id es obligatorio" }).min(1),
    obsNutricion: z.string(),
});

export const modificacionCocinaShema = z.object({
    id: z.number({ error: "El id es obligatorio" }).min(1),
    obsCocina: z.string(),
});

export type ModificacionNutricionShemaDTO = z.infer<typeof modificacionNutricionShema>;
export type ModificacionCocinaShemaDTO = z.infer<typeof modificacionCocinaShema>;
export type modificacionEnfermeriaShemaDTO = z.infer<typeof modificacionEnfermeriaShema>;