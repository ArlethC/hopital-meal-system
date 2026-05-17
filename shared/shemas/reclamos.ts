import { z } from "zod";


export const modificarReclamoSchema = z.object({
    idReclamo: z.number().int()
        .min(1, { message: "El tipo de reclamo no puede ser negativo" }).optional(),

    observacion: z.string().optional(),
}).refine(
    (data) => data.idReclamo || (data.observacion && data.observacion.trim() !== ''),
    {
        message: "Debe incluir al menos un tipo de reclamo o una observación",
    }
);

export type ModificarReclamoSchemaDTO = z.infer<typeof modificarReclamoSchema>;