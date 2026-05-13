/*
    Archivo: detallesSolicitud.service.ts
    Descripcion: lógica de negocio para modificar, cancelar, reactivar y obtener los detalles de las solicitudes de dietas.
    Autor: Marilyn Castro
    Fecha creacion: 23/07/2025
    Version: 1.0.5
*/
import { bd } from '../config/database';
import { HttpError } from "../utils/HttpError";
import { asignarDietasValidasEdad } from './paciente.service';
import { ESTADOS_DETALLE, ESTADOS_SOLICITUD, TIEMPOS_COMIDA } from '../config/Constantes';
import { obtenerEdificio } from './solicitudDietas.service';
import { validarDietaExiste } from "./dietas.service";
import { validarHorario } from "../services/horariosTiempoComida.service";
import { validarYCompararFecha } from '../utils/validaciones';
import { toDetalleOrdentDto, toHistorialDto } from "../dtos/detallesSolicitud.dto";
import type { DetalleOrden } from "@miapp/shared";

export async function verificarEstadoDetalle(idDetalle: number, idEstado: number) {

    const query = `
    SELECT 1
    FROM Detalles_solicitud_dietas 
    WHERE detalle_id = @idDetalle  AND detalle_estado = @estado
        `;

    const response = await bd.consultaBD(query, [
        { nombre: 'idDetalle', valor: idDetalle },
        { nombre: 'estado', valor: idEstado }
    ]);

    if (response.recordset.length === 0) {
        return false
    }

    return true;
}

export async function modificarDetalleSolicitud({
    id, usuario, idDieta, obsEnfermeria, obsCocina, obsNutricion, ipUsuario }:
    { id: number; usuario: string; idDieta?: number; obsEnfermeria?: string; obsCocina?: string; obsNutricion?: string; ipUsuario: string }) {

    const estaCancelada = await verificarEstadoDetalle(id, ESTADOS_DETALLE.CANCELADA);

    if (estaCancelada) {
        throw new HttpError("Esta dieta esta cancelada", 422);
    }

    const parametros = [
        { nombre: 'id_detalle', valor: id },
        { nombre: 'usuario', valor: usuario },
        { nombre: 'ip_user', valor: ipUsuario },
    ];

    if (idDieta) {
        await validarDietaExiste(idDieta);
        parametros.push({ nombre: 'id_dieta', valor: idDieta });
    }

    if (obsEnfermeria !== undefined) {
        parametros.push({ nombre: 'obs_enfermeria', valor: obsEnfermeria });
    }

    if (obsNutricion !== undefined) {
        parametros.push({ nombre: 'obs_nutricion', valor: obsNutricion });
    }

    if (obsCocina !== undefined) {
        parametros.push({ nombre: 'obs_cocina', valor: obsCocina });
    }

    await bd.ejecutarProcedimiento('dbo.ModificarSolicitudDietas', parametros);
}

export async function obtenerDetallesSolicitud(idSolicitud: number, incluirDietas: boolean = false): Promise<DetalleOrden[]> {
    const query =
        `SELECT detalle_id, cama_nombre, cl.id_paciente, cl.nombre_paciente, dbo.CalcularEdad(cl.fecha_nacimiento) AS edad, det.id_dieta_vigente, al.descripcion, obs_enfermeria, obs_nutricion, obs_cocina, estados.* , docAlergias.*
FROM Detalles_solicitud_dietas det 
	INNER JOIN Pacientes cl ON cl.id_paciente = det.id_paciente
	INNER JOIN Dietas al ON al.id_dieta = det.id_dieta_vigente
	OUTER APPLY dbo.DocumentosAlergiasPaciente(cl.id_paciente) AS docAlergias
	OUTER APPLY dbo.EstadosDetalleSolicitud(det.detalle_id) AS estados
	WHERE det.solicitud_id = @idSolicitud`;

    const detalles = await bd.consultaBD(query, [{ nombre: 'idSolicitud', valor: idSolicitud }]);

    const datosSolicitud = await bd.consultaBD(`SELECT sala_nombre, fecha_entrega , id_comida
FROM Solicitud_dietas 
WHERE solicitud_id = @idSolicitud`, [{ nombre: 'idSolicitud', valor: idSolicitud }]);

    let edificio = '';

    if (datosSolicitud.recordset.length > 0) {
        edificio = await obtenerEdificio(datosSolicitud.recordset[0].sala_nombre, datosSolicitud.recordset[0].fecha_entrega);
    }

    const detallesTransformados = detalles.recordset.map(({ ...resto }) => ({
        ...resto,
        edificio,
    }));

    if (incluirDietas && (datosSolicitud.recordset[0].id_comida !== TIEMPOS_COMIDA.MERIENDA_AM  || datosSolicitud.recordset[0].id_comida !== TIEMPOS_COMIDA.MERIENDA_PM)) {
        const pacientesConDietas = await asignarDietasValidasEdad(detallesTransformados, datosSolicitud.recordset[0].id_comida);
        return pacientesConDietas.map(toDetalleOrdentDto);
    }

    return detallesTransformados.map(toDetalleOrdentDto);
}

export async function cancelarDetalleSolicitud(id: number, usuario: string, userIp: string) {

    const estaCancelada = await verificarEstadoDetalle(id, ESTADOS_DETALLE.CANCELADA);

    if (estaCancelada) {
        throw new HttpError("Esta dieta ya esta cancelada", 422);
    }

    const puedeModificar = await puedeModificarHorario(id);

    if (!puedeModificar) {
        throw new HttpError("El tiempo para modificar esta solicitud ha terminado", 422);
    }

    await bd.ejecutarProcedimiento('dbo.ModificarSolicitudDietas', [
        { nombre: 'id_detalle', valor: id },
        { nombre: 'estado_nuevo', valor: ESTADOS_DETALLE.CANCELADA },
        { nombre: 'usuario', valor: usuario },
        { nombre: 'ip_user', valor: userIp },
    ]);

    await bd.consultaBD(`UPDATE Solicitud_dietas
SET estado_solicitud = @estado
WHERE solicitud_id = (
	SELECT solicitud_id 
	FROM Detalles_solicitud_dietas 
	WHERE detalle_id = @idDetalle )`, [
        { nombre: 'estado', valor: ESTADOS_SOLICITUD.MODIFICADA.id },
        { nombre: 'idDetalle', valor: id },
    ])

    return
}

export async function reactivarDetalleSolicitud(id: number, usuario: string, userIp: string) {

    const estaCancelada = await verificarEstadoDetalle(id, ESTADOS_DETALLE.CANCELADA);

    if (!estaCancelada) {
        throw new HttpError("Esta dieta no esta cancelada", 422);
    }

    const puedeModificar = await puedeModificarHorario(id);

    if (!puedeModificar) {
        throw new HttpError("El tiempo para modificar esta solicitud ha terminado", 422);
    }

    const valorAnterior = await bd.consultaBD(`SELECT TOP(1) valor_anterior
    FROM Historial_app_cocina 
    WHERE tabla_afectada = 'Detalles_solicitud_dietas' AND columna_modificada = 'detalle_estado' 
	    AND id_registro = @idDetalle
    ORDER BY cambio_fecha DESC`, [{ nombre: 'idDetalle', valor: id }])

    const estadoAnterior = Number(valorAnterior.recordset[0].valor_anterior)

    return await bd.ejecutarProcedimiento('dbo.ModificarSolicitudDietas', [
        { nombre: 'id_detalle', valor: id },
        { nombre: 'estado_nuevo', valor: estadoAnterior },
        { nombre: 'usuario', valor: usuario },
        { nombre: 'ip_user', valor: userIp },
    ]);
}

export async function obtenerDetalle(idDetalle: number, modificado: boolean = false) {
    const query =
        `SELECT detalle_id, cama_nombre, cl.id_paciente, cl.nombre_paciente, dbo.CalcularEdad(cl.fecha_nacimiento) AS edad, det.id_dieta_vigente, al.descripcion, obs_enfermeria, obs_nutricion, obs_cocina, CASE 
    WHEN detalle_estado = @estadoModificado THEN CAST(1 AS BIT) 
    ELSE CAST(0 AS BIT) 
  END AS modificado,
   CASE 
    WHEN detalle_estado = @estadoCancelado THEN CAST(1 AS BIT) 
    ELSE CAST(0 AS BIT) 
  END AS cancelado, estado.*
FROM Detalles_solicitud_dietas det 
	INNER JOIN Pacientes cl ON cl.id_paciente = det.id_paciente
	INNER JOIN Dietas al ON al.id_dieta = det.id_dieta_vigente
	OUTER APPLY dbo.DocumentosAlergiasPaciente(cl.id_paciente) AS estado
	WHERE det.detalle_id = @idDetalle`;

    const detalles = await bd.consultaBD(query, [{ nombre: 'idDetalle', valor: idDetalle },
        {nombre: 'estadoCancelado', valor: ESTADOS_DETALLE.CANCELADA},
        {nombre: 'estadoModificado', valor: ESTADOS_DETALLE.MODIFICADA},
    ]);

    if (detalles.recordset.length === 0) {
        throw new HttpError("Recurso no encontrado", 404);
    }

    if (modificado) {
        const tiempoComida = await tiempoComidaDetalle(idDetalle);

        const pacientesConDietas = await asignarDietasValidasEdad(detalles.recordset, tiempoComida);

        return toDetalleOrdentDto(pacientesConDietas[0]);
    }

    return toDetalleOrdentDto(detalles.recordset[0]);
}

export async function puedeModificarHorario(idDetalle: number): Promise<boolean> {
    const datosDetalles = await bd.consultaBD(`SELECT sl.id_comida , CONVERT(VARCHAR(10), sl.fecha_entrega, 120) as fechaEntrega
FROM Detalles_solicitud_dietas det
	INNER JOIN Solicitud_dietas sl ON det.solicitud_id = sl.solicitud_id
WHERE det.detalle_id = @idDetalle`, [{ nombre: 'idDetalle', valor: idDetalle }]);

    const datos = datosDetalles.recordset[0];

    const horarioModificacion = await validarHorario(datos.id_comida);

    const { fechaVal, esHoy } = validarYCompararFecha(datos.fechaEntrega);

    if (!horarioModificacion && esHoy) {
        return false;
    }

    return true;
}

export async function tiempoComidaDetalle(idDetalle: number) {
    const tiempoComida = await bd.consultaBD(`SELECT sl.id_comida 
FROM Detalles_solicitud_dietas det
	INNER JOIN Solicitud_dietas sl ON det.solicitud_id = sl.solicitud_id
WHERE det.detalle_id = @idDetalle`, [{ nombre: 'idDetalle', valor: idDetalle }]);

    return tiempoComida.recordset[0].id_comida;
}

export async function obtenerHistorial(id: number) {
    const query = `SELECT h.columna_modificada,
    CASE 
        WHEN h.columna_modificada = 'id_dieta_vigente' THEN a.descripcion
        WHEN h.columna_modificada = 'detalle_estado' AND h.operacion = 'cancelar_reactivar' THEN 
            CASE 
                WHEN h.valor_anterior = @estadoCancelado THEN 'Cancelada'
                ELSE 'Reactivada'
            END
        ELSE h.valor_anterior
    END AS valor_anterior,
    CASE 
        WHEN h.columna_modificada = 'detalle_estado' AND h.operacion = 'cancelar_reactivar' THEN
            CASE 
                WHEN h.nuevo_valor = @estadoCancelado THEN 'Cancelada'
                ELSE 'Reactivada'
            END
        ELSE h.valor_anterior
    END AS valor_nuevo,
    h.cambio_fecha,
    h.cambio_usuario
FROM Historial_app_cocina h
LEFT JOIN Dietas a ON h.columna_modificada = 'id_dieta_vigente' 
    AND h.valor_anterior = a.id_dieta
WHERE h.tabla_afectada = 'Detalles_solicitud_dietas'
  AND ( h.columna_modificada IN ( 'obs_enfermeria', 'obs_nutricion', 'id_dieta_vigente')
      OR (h.columna_modificada = 'detalle_estado' AND h.operacion = 'cancelar_reactivar'))
  AND h.id_registro = @idDetalle
ORDER BY h.cambio_fecha DESC;`;

    const historial = await bd.consultaBD(query, [
        { nombre: 'idDetalle', valor: id },
        { nombre: 'estadoCancelado', valor: ESTADOS_DETALLE.CANCELADA}
    ]);

    const datosLimpios = historial.recordset.map(obj =>
        Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, value === null ? "" : value])
        )
    );

    return datosLimpios.map(toHistorialDto);
}
