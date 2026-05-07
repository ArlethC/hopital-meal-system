/*
    Archivo: reclamos.dto.ts
    Descripcion: DTO para crear y modificar reclamos.
    Autor: Marilyn Castro
    Fecha creacion: 23/07/2025
    Version: 1.0.2
*/
import { z } from "zod";
import type { Reclamo } from "@miapp/shared";

export const CrearReclamoSchema = z.object({
    idReclamo: z.number({ required_error: "El tipo de reclamo es obligatorio" }).int()
        .min(1, { message: "El tipo de reclamo no puede ser negativo" }),

    observacion: z.string().optional(),
    archivo: z.string().url().optional()
});


export const ModificarReclamoSchema = z.object({
    idReclamo: z.number().int()
        .min(1, { message: "El tipo de reclamo no puede ser negativo" }).optional(),

    observacion: z.string().optional(),
}).refine(
    (data) => data.idReclamo || (data.observacion && data.observacion.trim() !== ''),
    {
        message: "Debe incluir al menos un tipo de reclamo o una observación",
    }
);

export function toReclamoDto(reclamo: any): Reclamo {
    return {
        tipoReclamo: {
            id: reclamo.id_valor_catalogo,
            nombre: reclamo.valor_catalogo
        },
        estadoReclamo: reclamo.estadoReclamo,
        observacion: reclamo.obs_reclamo,
        archivo: reclamo.reclamo_archivo_ruta,
    };
}

export type CrearReclamo = z.infer<typeof CrearReclamoSchema>;
export type ModificarReclamo = z.infer<typeof ModificarReclamoSchema>;
