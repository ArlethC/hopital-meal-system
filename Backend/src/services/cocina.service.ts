/*
    Archivo: cocina.service.ts
    Descripcion: lógica de negocio de la pantalla de resumen de solicitud de dietas y meriendas para cocina.
    Autor: Marilyn Castro
    Fecha creacion: 7/08/2025
    Version: 1.0.2
*/
import { bd } from '../config/database';
import { obtenerTiempoComidaActual, obtenerTiempoComidaMerienda } from '../utils/funcionesTiempoComida';
import { formatearNotificacion, type NotificacionBD, formatearReclamos} from '../utils/funcionesFormatear';

export async function obtenerResumenCocina(): Promise<any> {
    const { id, nombre } = obtenerTiempoComidaActual();
    
    const result = await bd.ejecutarProcedimiento('dbo.ObtenerResumenCocina', [
        { nombre: 'idTiempoComida', valor: id }
    ])

    const totalDietas = (result.recordsets as any[])[0];
    const alergias = (result.recordsets as any[])[1];
    const reclamosBD = (result.recordsets as any[])[2];
    const alertas = (result.recordsets as any[])[4];

    const alertasFormateadas = alertas.map((item: NotificacionBD) =>
        formatearNotificacion(item)
    );

    const reclamos = formatearReclamos(reclamosBD);

    return {
        tiempComida: nombre,
        totalDietas,
        alergias,
        reclamos,
        alertasFormateadas,
    };
}

export async function obtenerResumenMeriendas(): Promise<any> {
    const { id, nombre } = obtenerTiempoComidaMerienda();

    const result = await bd.ejecutarProcedimiento('dbo.ObtenerResumenCocina', [
        { nombre: 'idTiempoComida', valor: id }
    ])

    const totalDietas = (result.recordsets as any[])[0];
    const alergias = (result.recordsets as any[])[1];
    const reclamosBD = (result.recordsets as any[])[2];
    const alertas = (result.recordsets as any[])[4];

    const alertasFormateadas = alertas.map((item: NotificacionBD) =>
        formatearNotificacion(item)
    );

    const reclamos = formatearReclamos(reclamosBD);

    return {
        tiempComida: nombre,
        totalDietas,
        alergias,
        reclamos,
        alertasFormateadas,
    };
}


