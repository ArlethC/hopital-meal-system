/*
    Archivo: merienda.dto.ts
    Descripcion: Esquema ZOD para validar las meriendas de los pacientes.
    Autor: Marilyn Castro
    Fecha creacion: 31/07/2025
    Version: 1.0.0
*/
import { z } from "zod";
import { validarYCompararFecha } from "../utils/validaciones";
import type { Merienda } from "@miapp/shared";


export const crearMerienda = z.object({
    expediente: z.string({ required_error: "El paciente es obligatorio" })
    .regex(/^\d+$/, {
        message: 'El expediente debe contener solo números'
    }).max(20),

    idDieta: z.number({ required_error: "La dieta es obligatoria" }),

    idTiempoComida: z.number({ required_error: "El tipo de merienda es obligatorio" }).int()
        .min(1, { message: "El tipo de merienda no puede ser negativo" }),

    observacion: z.string().optional().refine(val => val === undefined || (val.trim() !== ''), {
        message: 'La observación no puede ser una cadena vacía',
    }),

    fechaInicioMerienda: z.string().refine(val => {
        if (!val) return true;
        const {fechaVal } = validarYCompararFecha(val)
        return fechaVal !== null;
    }, { message: 'La fecha inicial debe ser válida y no menor a hoy' }),

    fechaFinMerienda: z.string().optional().refine(val => {
        if (!val) return true;
        const {fechaVal } = validarYCompararFecha(val)
        return fechaVal !== null;
    }, { message: 'La fecha final debe ser válida y no menor a hoy' }),


}).superRefine((data, ctx) => {
    const fechaInicial = validarYCompararFecha(data.fechaInicioMerienda);
    const fechaFinal = data.fechaFinMerienda ? validarYCompararFecha(data.fechaFinMerienda) : null;

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

export function toMeriendaDto(merienda: any): Merienda {
  return {
    id: merienda.id,
    dieta: merienda.descripcion,
    observacion: merienda.obs_merienda,
    tiempoComida: merienda.comida,
    fechaInicial: merienda.fechaInicial,
    fechaFinal: merienda.fechaFinal,
    estado: merienda.vigencia,
  };
}
export type CrearMerienda = z.infer<typeof crearMerienda>;