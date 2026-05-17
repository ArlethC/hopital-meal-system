import { z } from "zod";

export const crearAlergiaShema = z.object({
    expediente: z.string().regex(/^\d+$/, {
            error: 'El expediente debe contener solo números'
        }).max(20),
    alergiasIntolerancias: z.string(),
});

export const modificarAlergiaShema = z.object({
    id: z.number({ error: "El id es obligatorio" }).min(1),
    alergiasIntolerancias: z.string(),
});

export type CrearAlergiaDTO = z.infer<typeof crearAlergiaShema>;
export type ModificarAlergiaDTO = z.infer<typeof modificarAlergiaShema>;