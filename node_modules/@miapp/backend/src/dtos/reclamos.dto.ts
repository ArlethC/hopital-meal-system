/*
    Archivo: reclamos.dto.ts
    Descripcion: DTO para crear y modificar reclamos.
    Autor: Marilyn Castro
    Fecha creacion: 23/07/2025
    Version: 1.0.2
*/
import type { Reclamo } from "@miapp/shared";
import { z } from "zod";

export const crearReclamoSchema = z.object({
    idReclamo: z.number({ error: "El tipo de reclamo es obligatorio" }).int()
        .min(1, { message: "El tipo de reclamo no puede ser negativo" }),

    observacion: z.string().optional(),
    archivo: z.string().url().optional()
});



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


