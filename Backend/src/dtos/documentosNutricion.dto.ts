/*
    Archivo: documentoNutricion.dto.ts
    Descripcion: DTO para crear documentos de nutrición.
    Autor: Marilyn Castro
    Fecha creacion: 21/07/2025
    Version: 1.0.0
*/
import { z } from "zod";
import { validarYCompararFecha } from "../utils/validaciones";
import type { Documento } from "@miapp/shared";

export const CrearDocumentoShema = z.object({
    idTipoDocumento: z.number({ required_error: "El tipo de documento es obligatorio" }).int()
        .min(1, { message: "El tipo de documento no puede ser negativo" }),

    fechaInicial: z.string().refine(val => {
        if (!val) return true;
        const { fechaVal } = validarYCompararFecha(val)
        return fechaVal !== null;
    }, { message: 'La fecha inicial debe ser válida y no menor a hoy' }),

    fechaFinalVigencia: z.string().optional().refine(val => {
        if (!val) return true;
        const { fechaVal } = validarYCompararFecha(val)
        return fechaVal !== null;
    }, { message: 'La fecha final debe ser válida y no menor a hoy' }),

    obsDocumento: z.string().optional().refine(val => val === undefined || (val.trim() !== ''), {
        message: 'La observación no puede ser una cadena vacía',
    }),

    expediente: z.string({ required_error: "El expediente es obligatorio" }).regex(/^\d+$/, {
        message: 'El expediente debe contener solo números'
    }).max(20),

    archivo: z.any().refine((file) => file !== undefined, {
        message: 'Debe seleccionar un archivo',
    }),
}).superRefine((data, ctx) => {

    const fechaInicial = validarYCompararFecha(data.fechaInicial);
    const fechaFinal = data.fechaFinalVigencia ? validarYCompararFecha(data.fechaFinalVigencia) : null;

    if (fechaFinal?.fechaVal && !fechaInicial.fechaVal) {
        ctx.addIssue({
            path: ['fechaInicial'],
            message: 'Debe proporcionar la fecha inicial si indica una fecha final',
            code: z.ZodIssueCode.custom,
        });
    }

    if (fechaInicial.fechaVal && fechaFinal?.fechaVal && fechaFinal.fechaVal < fechaInicial.fechaVal) {
        ctx.addIssue({
            path: ['fechaFinalVigencia'],
            message: 'La fecha final debe ser mayor que la fecha inicial',
            code: z.ZodIssueCode.custom,
        });
    }
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