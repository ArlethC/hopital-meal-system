import { z } from 'zod';

export const datosSalaPacientes = z.object({
    sala: z.string({ error: "La sala es obligatoria" }),
    fecha: z.string().refine(val => !isNaN(Date.parse(val)), {
        error: 'La fecha debe ser una válida'
    }),
    idTiempoComida: z.number({ error: "El tiempo de comida es obligatorio" }).min(1),
});

export const buscarSolicitud = z.object({
    sala: z.string().optional(),
    fecha: z.string().refine(val => !isNaN(Date.parse(val)), {
        error: 'La fecha debe ser una válida'
    }).optional(),
    idTiempoComida: z.number().min(1).optional(),
    idEstado: z.number().min(1).optional(),
}).refine(data => {
    return data.sala || data.fecha || data.idTiempoComida || data.idEstado;
}, {
    error: 'Debe proporcionar al menos un filtro de búsqueda',
    path: [],
});

export const pacienteInfo = z.object({
    expediente: z.string().regex(/^\d+$/, {
        error: 'El expediente debe contener solo números'
    }).max(20),
    sala: z.string({ error: "La sala es obligatoria" }),
    fecha: z.string().refine(val => !isNaN(Date.parse(val)), {
        error: 'La fecha debe ser una válida'
    }),
    idTiempoComida: z.number({ error: "El tiempo de comida es obligatorio" }).min(1),
});



export type DatosSalaPacientesSchemaDTO = z.infer<typeof datosSalaPacientes>;
export type BuscarSolicitudSchemaDTO = z.infer<typeof buscarSolicitud>;



