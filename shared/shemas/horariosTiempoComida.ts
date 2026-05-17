import { z } from "zod";

export const crearTiempoComidaHorarioShema = z.object({
    idTiempoComida: z.number({ error: "El tiempo de comida es obligatorio" })
        .min(1, { error: "El tiempo de comida no puede ser negativo" }),

    horaModificacion: z.string({ error: "La hora de modificacion es obligatoria" })
                .regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
        error: "Debe tener formato HH:mm en horario de 24 horas",
    }),

    horaCierre: z.string({ error: "La hora de cierre es obligatoria" })
                .regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
        error: "Debe tener formato HH:mm en horario de 24 horas",
    }),
});


export const modificarTiempoComidaHorarioShema = z.object({
    horaModificacion: z.string({ error: "La hora de modificacion es obligatoria" })
                .regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
        error: "Debe tener formato HH:mm en horario de 24 horas",
    }).optional(),

    horaCierre: z.string({ error: "La hora de cierre es obligatoria" })
                .regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
        error: "Debe tener formato HH:mm en horario de 24 horas",
    }).optional(),
});

export type CrearTiempoComidaHorarioShemaDTO = z.infer<typeof crearTiempoComidaHorarioShema>;
export type ModificarTiempoComidaHorarioShemaDTO = z.infer<typeof modificarTiempoComidaHorarioShema>;

