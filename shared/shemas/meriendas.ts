import { z } from "zod";

export const crearMerienda = z.object({
    expediente: z.string({ error: "El paciente es obligatorio" })
    .regex(/^\d+$/, {
        error: 'El expediente debe contener solo números'
    }).max(20),

    idDieta: z.number({ error: "La dieta es obligatoria" }),

    idTiempoComida: z.number({ error: "El tipo de merienda es obligatorio" }).int()
        .min(1, { error: "El tipo de merienda no puede ser negativo" }),

    observacion: z.string().optional().refine(val => val === undefined || (val.trim() !== ''), {
        error: 'La observación no puede ser una cadena vacía',
    }),

    fechaInicioMerienda: z.string(),

    fechaFinMerienda: z.string().optional(),
});

export type crearMeriendaShemaDTO = z.infer<typeof crearMerienda>;
