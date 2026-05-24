/*
    Archivo: solicitudSocket.service.ts
    Descripcion: lógica de negocio para saber si  la creación o modificación de algún elemento debe emitir un mensaje al socket
    Autor: Marilyn Castro
    Fecha creacion: 20/05/2026
    Version: 1.0.0
*/

import { bd } from '../config/database';
import { obtenerTiempoComidaActual, obtenerTiempoComidaMerienda } from '../utils/funcionesTiempoComida';
import { validarYCompararFecha } from '../utils/validaciones';

export function solicitudActualizaPantalla(fechaSolicitud: string, tiempoComidaSolicitud: number, tipo?: string): boolean {
    let idTiempo;
    if (tipo === 'm') {
        const { id } = obtenerTiempoComidaMerienda();
        idTiempo = id;
    } else {
        const { id } = obtenerTiempoComidaActual();
        idTiempo = id;
    }
    const { esHoy } = validarYCompararFecha(fechaSolicitud);

    return (idTiempo === tiempoComidaSolicitud && esHoy)
}

export async function detalleActualizaPantalla(idDetalle: number) {
    try {
        const resultado = await bd.consultaBD(`SELECT sol.id_comida, sol.fecha_entrega
FROM Detalles_solicitud_dietas det INNER JOIN 
Solicitud_dietas sol ON sol.solicitud_id = det.solicitud_id
WHERE det.detalle_id = @idDetalle AND sol.fecha_entrega = CONVERT( DATE,  GETDATE())`, [
            { nombre: 'idDetalle', valor: idDetalle },
        ]);

        if (resultado.recordset.length > 0) {
            const datos = resultado.recordset[0]
            const { id } = obtenerTiempoComidaActual();
            const { id: idMerienda } = obtenerTiempoComidaMerienda();

            const esMerienda = datos.id_comida === idMerienda;

            const aplica = (datos.id_comida === id || datos.id_comida === idMerienda);

            return {
                aplica,
                tipo: esMerienda ? 'MERIENDA' : 'TIEMPO_COMIDA',
            };
        } else {
            return {
                aplica: false,
                tipo: 'NINGUNO',
            };
        }
    } catch (error) {
        throw error;
    }
}

//Función para ver si el paciente tiene una solicitud en el tiempo de comida y fecha actual
export async function pacienteActualizaPantalla(idPaciente: string) {
    try {

        const { id } = obtenerTiempoComidaActual();
        const { id: idMerienda } = obtenerTiempoComidaMerienda();

        const resultado = await bd.consultaBD(`SELECT sol.id_comida
FROM Detalles_solicitud_dietas det INNER JOIN 
Solicitud_dietas sol ON sol.solicitud_id = det.solicitud_id 
WHERE id_paciente = @idPaciente AND sol.fecha_entrega = CONVERT( DATE,  GETDATE())
AND (sol.id_comida = @idTiempo OR  sol.id_comida = @idMerienda) `, [
            { nombre: 'idPaciente', valor: idPaciente },
            { nombre: 'idTiempo', valor: id },
            { nombre: 'idMerienda', valor: idMerienda },
        ]);

        if (resultado.recordset.length > 1) {
            return {
                aplica: true,
                tipo: 'MULTIPLE',
            };
        }

        if (resultado.recordset.length > 0) {
            const datos = resultado.recordset[0];

            const esMerienda = datos.id_comida === idMerienda;

            const aplica = true;
            return {
                aplica,
                tipo: esMerienda ? 'MERIENDA' : 'TIEMPO_COMIDA',
            };
        } else {
            return {
                aplica: false,
                tipo: 'NINGUNO',
            };
        }
    } catch (error) {
        throw error;
    }
}