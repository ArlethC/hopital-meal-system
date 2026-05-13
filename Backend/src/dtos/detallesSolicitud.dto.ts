/*
    Archivo: detallesSOlicitud.dto.ts
    Descripcion: Dto para enviar datos de los detalles de una solicitud.
    Autor: Marilyn Castro
    Fecha creacion: 1/05/2026
    Version: 1.0.0
*/

import type { DetalleOrden, Historial } from "@miapp/shared";
import { formatearEdad } from "../utils/funcionesFormatear";

export function toDetalleOrdentDto(detalle: any): DetalleOrden {
    return {
        idDetalle: detalle.detalle_id,
        cama: detalle.cama_nombre,
        nombre: detalle.nombre_paciente,
        expediente: detalle.id_paciente,
        edad: detalle.edad,
        dieta: {
            codigo: detalle.id_dieta_vigente,
            nombre: detalle.descripcion,
        },
        obsEnfermeria: detalle.obs_enfermeria,
        obsNutricion: detalle.obs_nutricion,
        obsCocina: detalle.obs_cocina,
        alergia: detalle.alergia,
        documento: detalle.documento,
        cancelado: detalle.cancelado,
        recibido: detalle.recibido,
        reclamo: detalle.reclamo,
        modificado: detalle.modificado,
        edificio: detalle.edificio,
        edadTexto: formatearEdad(detalle.edad),
        dietasValidas: detalle.dietasValidas,
    }
}

export function toHistorialDto(historial: any): Historial {
    return {
        campoModificado: historial.columna_modificada,
        valorAnterior: historial.valor_anterior,
        valorNuevo: historial.valor_nuevo,
        fechaCambio: historial.cambio_fecha,
        usuarioCambio: historial.cambio_usuario,
    }
}



