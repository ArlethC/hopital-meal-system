/*
    Archivo: documentoNutricion.dto.ts
    Descripcion: DTO para crear documentos de nutrición.
    Autor: Marilyn Castro
    Fecha creacion: 21/07/2025
    Version: 1.0.2
*/
import type { Documento } from "@miapp/shared";
import { z } from "zod";


export const crearDocumentoShema = z.object({
    idTipoDocumento: z.number({ message: "El tipo de documento es obligatorio" }).int()
        .min(1, { message: "El tipo de documento no puede ser negativo" }),
    fechaInicial: z.string(),
    fechaFinalVigencia: z.string().optional(),
    obsDocumento: z.string().optional().refine(val => val === undefined || (val.trim() !== ''), {
        message: 'La observación no puede ser una cadena vacía',
    }),

    expediente: z.string({ message: "El expediente es obligatorio" }).regex(/^\d+$/, {
        message: 'El expediente debe contener solo números'
    }).max(20),

    archivo: z.any().refine((file) => file !== undefined, {
        message: 'Debe seleccionar un archivo',
    }),
});

export function toDocumentoDto(doc: any): Documento {
  return {
    idDocumento: doc.idDocumento,
    tipoDocumento: doc.v_valor_catalogo,
    rutaDocumento: doc.rutaDocumento,
    fechaInicial: doc.fechaInicial,
    fechaFinalVigencia: doc.fechaFinalVigencia,
    obsDocumento: doc.obsDocumento,
  };
}