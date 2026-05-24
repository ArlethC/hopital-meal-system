/*
    Archivo: solicitudDietas.dto.ts
    Descripcion: Esquema DTO para validar los datos relacionados a las solicitudes de dietas.
    Autor: Marilyn Castro
    Fecha creacion: 11/07/2025
    Version: 1.0.1
*/
import { z } from 'zod';
import type { OrdenBase, DetalleOrden, ValorCatalogo, PacienteOmitido } from "@miapp/shared";
import { getEstadoById } from '../utils/funcionesFormatear';

export const crearSolicitudShema = z.object({
    sala: z.string({ error: "La sala es obligatoria" }),
    idTiempoComida: z.number({ error: "El tiempo de comida es obligatorio" }).min(1),
    fechaEntrega: z.string().refine(val => !isNaN(Date.parse(val)), {
        error: 'La fecha debe ser una válida'
    }).refine(val => {
        const [year, month, day] = val.split('-').map(Number);
        const fechaIngresada = new Date(year, month - 1, day);
        const hoy = new Date();

        hoy.setHours(0, 0, 0, 0);
        fechaIngresada.setHours(0, 0, 0, 0);

        return fechaIngresada >= hoy;
    }, {
        error: 'La fecha no puede ser anterior a la fecha actual'
    }),
    detalles: z.array(z.object({
        expediente: z.string().regex(/^\d+$/, {
            error: 'El expediente debe contener solo números'
        }).max(20),
        idDieta: z.number({ error: "La dieta es obligatoria" }),
        obsEnfermeria: z.string().optional(),
        cama: z.string().optional(),
        idRelacion: z.number().optional(),
        tipoRelacion: z.string().optional()
    })).min(1, { error: "Debe incluir al menos un paciente" })
});


export const esquemaIdDetalles = z.object({
    idDetalles: z.array(z.number().int())
        .min(1, { error: "Debe contener al menos un ID." })
});

export interface OrdenDieta extends OrdenBase {
    idTiempoComida: number;
    idEstado: number;
    detalles?: DetalleOrden[];
}

export function toOrdenDto(orden: any): OrdenDieta {
    const estadoEncontrado = getEstadoById(orden.idEstado);

    const estadoData = estadoEncontrado?.[1];
    return {
        id: orden.solicitud_id,
        sala: orden.sala_nombre,
        fechaEntrega: orden.fechaEntrega,
        usuario: orden.creacion_usuario,
        fechaCreacion: orden.fecha_creacion,
        tiempoComida: orden.tiempoComida,
        estado: orden.estado,
        idTiempoComida: orden.idTiempoComida,
        idEstado: orden.idEstado,
        detalles: orden.detalles,
        tabla: estadoData?.tabla ?? "entrega",
        code: estadoData?.label ?? "Enviada a Cocina",
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