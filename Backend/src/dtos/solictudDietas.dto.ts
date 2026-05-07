/*
    Archivo: solicitudDietas.dto.ts
    Descripcion: Esquema DTO para validar los datos relacionados a las solicitudes de dietas.
    Autor: Marilyn Castro
    Fecha creacion: 11/07/2025
    Version: 1.0.0
*/
import { z } from 'zod';
import type { OrdenBase, DetalleOrden, ValorCatalogo, PacienteOmitido } from "@miapp/shared";


export const pacientesSala = z.object({
    sala: z.string({ required_error: "La sala es obligatoria" }),
    fecha: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'La fecha debe ser una válida'
    }),
    idTiempoComida: z.number({ required_error: "El tiempo de comida es obligatorio" }).min(1),
});

export const buscarSolicitud = z.object({
    sala: z.string().optional(),
    fecha: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'La fecha debe ser una válida'
    }).optional(),
    idTiempoComida: z.number().min(1).optional(),
    idEstado: z.number().min(1).optional(),
}).refine(data => {
    return data.sala || data.fecha || data.idTiempoComida || data.idEstado;
}, {
    message: 'Debe proporcionar al menos un filtro de búsqueda',
    path: [],
});

export const pacienteInfo = z.object({
    expediente: z.string().regex(/^\d+$/, {
        message: 'El expediente debe contener solo números'
    }).max(20),
    sala: z.string({ required_error: "La sala es obligatoria" }),
    fecha: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'La fecha debe ser una válida'
    }),
    idTiempoComida: z.number({ required_error: "El tiempo de comida es obligatorio" }).min(1),
});

export const crearSolicitudShema = z.object({
    sala: z.string({ required_error: "La sala es obligatoria" }),
    idTiempoComida: z.number({ required_error: "El tiempo de comida es obligatorio" }).min(1),
    fechaEntrega: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'La fecha debe ser una válida'
    }).refine(val => {
        const [year, month, day] = val.split('-').map(Number);
        const fechaIngresada = new Date(year, month - 1, day);
        const hoy = new Date();

        hoy.setHours(0, 0, 0, 0);
        fechaIngresada.setHours(0, 0, 0, 0);

        return fechaIngresada >= hoy;
    }, {
        message: 'La fecha no puede ser anterior a la fecha actual'
    }),
    detalles: z.array(z.object({
        expediente: z.string().regex(/^\d+$/, {
            message: 'El expediente debe contener solo números'
        }).max(20),
        idDieta: z.number({ required_error: "La dieta es obligatoria" }),
        obsEnfermeria: z.string().optional(),
        cama: z.string().optional(),
        idRelacion: z.number().optional(),
        tipoRelacion: z.string().optional()
    })).min(1, { message: "Debe incluir al menos un paciente" })
});

export const modificacionEnfermeriaShema = z.object({
    id: z.number({ required_error: "El id es obligatorio" }).min(1),
    idDieta: z.number().optional(),
    obsEnfermeria: z.string().optional(),
}).refine(
    (data) => (data.idDieta || data.obsEnfermeria !== undefined),
    {
        message: "Debe incluir al menos una dieta o una observación de enfermería",
    }
);

export const modificacionNutricionShema = z.object({
    id: z.number({ required_error: "El id es obligatorio" }).min(1),
    obsNutricion: z.string(),
});

export const modificacionCocinaShema = z.object({
    id: z.number({ required_error: "El id es obligatorio" }).min(1),
    obsCocina: z.string(),
});

export const esquemaIdDetalles = z.object({
    idDetalles: z.array(z.number().int())
        .min(1, { message: "Debe contener al menos un ID." })
});

export interface OrdenDieta extends OrdenBase {
    idTiempoComida: number;
    idEstado: number;
    detalles?: DetalleOrden[];
}

export function toOrdenDto(orden: any): OrdenDieta {
    return {
        id: orden.solicitud_id,
        sala: orden.nombre_sala,
        fechaEntrega: orden.fechaEntrega,
        usuario: orden.creacion_usuario,
        fechaCreacion: orden.fecha_creacion,
        tiempoComida: orden.tiempoComida,
        estado: orden.estado,
        idTiempoComida: orden.idTiempoComida,
        idEstado: orden.idEstado,
        detalles: orden,
    };
}

export function toCatalogoDto(catalogo: any): ValorCatalogo {
    return {
        id: catalogo.id_valor_catalogo,
        valor: catalogo.valor_catalogo,
    };
}

export function toPacienteOmitido(paciente: any): PacienteOmitido {
    return {
        expediente: paciente.id_paciente,
        nombre: paciente.nombre_paciente,
    };
}