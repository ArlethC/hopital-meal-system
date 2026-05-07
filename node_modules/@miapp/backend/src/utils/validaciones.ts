/*
    Archivo: validaciones.ts
    Descripcion: funciones para hacer validaciones.
    Autor: Marilyn Castro
    Fecha creacion: 7/07/2025
    Version: 1.0.0
*/

import { z } from 'zod';

const soloNumerosSchema = z.string().regex(/^\d*$/).max(20);

export function validarExpediente(input: string) {
  const resultado = soloNumerosSchema.safeParse(input);

  return resultado.success;
}

export function validarYCompararFecha(fecha: string): { fechaVal: Date | null; esHoy: boolean } {
    if (!fecha || typeof fecha !== 'string') return { fechaVal: null, esHoy: false };

    const partes = fecha.split('-');
    if (partes.length !== 3) return { fechaVal: null, esHoy: false };

    const [year, month, day] = partes.map(Number);
    if (
        isNaN(year) || isNaN(month) || isNaN(day) ||
        year < 1900 || month < 1 || month > 12 || day < 1 || day > 31
    ) return { fechaVal: null, esHoy: false };

    const fechaVal = new Date(year, month - 1, day);
    if (isNaN(fechaVal.getTime())) return { fechaVal: null, esHoy: false };

    fechaVal.setHours(0, 0, 0, 0);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaVal < hoy) return { fechaVal: null, esHoy: false };

    const esHoy = fechaVal.getTime() === hoy.getTime();

    return { fechaVal, esHoy };
}



