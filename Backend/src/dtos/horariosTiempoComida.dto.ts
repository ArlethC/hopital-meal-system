/*
    Archivo: horariosTiempoComida.dto.ts
    Descripcion: esquemas de ZOD para validar datos de los horarios.
    Autor: Marilyn Castro
    Fecha creacion: 7/07/2025
    Version: 1.0.0
*/
import { z } from "zod";
import type { HorarioTiempoComida } from '@miapp/shared';
import { convertirHoraAHHmm } from '../utils/funcionesFormatear';


export const CrearTiempoComidaHorarioShema = z.object({
    idTiempoComida: z.number({ required_error: "El tiempo de comida es obligatorio" })
        .min(1, { message: "El tiempo de comida no puede ser negativo" }),

    horaModificacion: z.string({ required_error: "La hora de modificacion es obligatoria" })
                .regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
        message: "Debe tener formato HH:mm en horario de 24 horas",
    }),

    horaCierre: z.string({ required_error: "La hora de cierre es obligatoria" })
                .regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
        message: "Debe tener formato HH:mm en horario de 24 horas",
    }),
});


export const ModificarTiempoComidaHorarioShema = z.object({
    horaModificacion: z.string({ required_error: "La hora de modificacion es obligatoria" })
                .regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
        message: "Debe tener formato HH:mm en horario de 24 horas",
    }).optional(),

    horaCierre: z.string({ required_error: "La hora de cierre es obligatoria" })
                .regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
        message: "Debe tener formato HH:mm en horario de 24 horas",
    }).optional(),
});

export function toHorarioDto(horario: any): HorarioTiempoComida {
  return {
    id: horario.id_horario_comida,
    tiempoComida: horario.v_valor_catalogo,
    horaCierre: convertirHoraAHHmm(horario.horaCierre),
    horaModificacion: convertirHoraAHHmm(horario.horaModificacion),
  };
}
