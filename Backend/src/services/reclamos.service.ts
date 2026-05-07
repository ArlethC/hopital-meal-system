/*
    Archivo: reclamos.service.ts
    Descripcion: logica de negocio para gestionar los reclamos.
    Autor: Marilyn Castro
    Fecha creacion: 23/07/2025
    Version: 1.0.3
*/
import { bd } from '../config/database';
import { registrarHistorial, TipoOperacion, Cambio } from "./historial.service";
import { Transaction } from 'mssql';
import { HttpError } from "../utils/HttpError";
import { CrearReclamo, ModificarReclamo, toReclamoDto } from '../dtos/reclamos.dto';
import { ESTADOS_DETALLE, ESTADOS_SOLICITUD, ESTADO_RECLAMO } from '../config/Constantes';
import { verificarEstadoDetalle, tiempoComidaDetalle } from './detallesSolicitud.service';
import { validarHorario } from './horariosTiempoComida.service';
import { enviarCorreo } from '../utils/funcionEnviarCorreo';
import { fechaATexto } from '../utils/funcionesFormatear';

type CambiosReclamo = {
    detalle_estado?: number;
    reclamo_estado?: number;
    reclamo_tipo_id?: number;
    obs_reclamo?: string;
    reclamo_archivo_ruta?: string;
}

export async function gestionarReclamo({
    idDetalle,
    cambiosReclamo,
    usuario,
    usuarioIP,
    operacion,
    cambiosHistorial,
}: {
    idDetalle: number; cambiosReclamo: CambiosReclamo; usuario: string; operacion: TipoOperacion; cambiosHistorial: Cambio[]; usuarioIP: string;
}) {

    const fecha = await bd.consultaBD(`SELECT 1
FROM Solicitud_dietas sol
INNER JOIN Detalles_solicitud_dietas det ON sol.solicitud_id = det.solicitud_id
WHERE det.detalle_id = @idDetalle
AND sol.fecha_entrega = CAST(GETDATE() AS DATE)`,
        [{ nombre: 'idDetalle', valor: idDetalle }])

    if (fecha.rowsAffected[0] === 0) {
        let accion = 'modificar';

        if (operacion === 'crear_reclamo') {
            accion = 'crear';
        } else if (operacion === 'estado_reclamo') {
            accion = 'cambiar el estado de';
        }

        throw new HttpError(`No puede ${accion} el reclamo porque la fecha de entrega no es hoy`, 422);
    }

    const setClauses = Object.keys(cambiosReclamo)
        .map((campo, i) => `${campo} = @campo${i}`)
        .join(', ');

    await bd.realizarTransaccion(async (tx: Transaction) => {
        const request = tx.request();

        request.input('idDetalle', idDetalle);

        Object.values(cambiosReclamo).forEach((valor, i) => {
            request.input(`campo${i}`, valor);
        });

        await request.query(`
            UPDATE Detalles_solicitud_dietas
             SET ${setClauses}
            WHERE detalle_id = @idDetalle
        `);

        if (operacion == TipoOperacion.CREAR_RECLAMO) {
            const detalles = await tx.request()
                .input('idDetalle', idDetalle)
                .query(`
            SELECT detalle_estado, estado_solicitud
            FROM Detalles_solicitud_dietas det
            INNER JOIN Solicitud_dietas sol ON sol.solicitud_id = det.solicitud_id
            WHERE det.solicitud_id = (
                SELECT solicitud_id 
                FROM Detalles_solicitud_dietas 
                WHERE detalle_id = @idDetalle
            )
        `);

            const estados = detalles.recordset.map(d => d.detalle_estado);
            let nuevoEstadoSolicitud = detalles.recordset[0].estado_solicitud;

            const todosRecibidosOReclamo = estados.every(e => e === ESTADOS_DETALLE.RECIBIDA || e === ESTADOS_DETALLE.RECLAMO);
            const hayReclamo = estados.includes(ESTADOS_DETALLE.RECLAMO);
            const hayRecibido = estados.includes(ESTADOS_DETALLE.RECIBIDA);

            if (todosRecibidosOReclamo && hayRecibido) {
                if (hayReclamo) {
                    nuevoEstadoSolicitud = ESTADOS_SOLICITUD.R_RECLAMO;
                } else {
                    nuevoEstadoSolicitud = ESTADOS_SOLICITUD.RECIBIDA;
                }
            }

            //cambiar el estado si ya estaba en RECIBIDA y ahora hay reclamo
            if (nuevoEstadoSolicitud === ESTADOS_SOLICITUD.RECIBIDA && hayReclamo) {
                nuevoEstadoSolicitud = ESTADOS_SOLICITUD.R_RECLAMO;
            }

            await tx.request()
                .input('estadoSolicitud', nuevoEstadoSolicitud)
                .input('idDetalle', idDetalle)
                .query(`
            UPDATE Solicitud_dietas
            SET estado_solicitud = @estadoSolicitud
            WHERE solicitud_id = (
                SELECT solicitud_id 
                FROM Detalles_solicitud_dietas 
                WHERE detalle_id = @idDetalle
            )
        `);
        }

        await registrarHistorial({
            tabla: 'Detalles_solicitud_dietas',
            idRegistro: idDetalle,
            cambios: cambiosHistorial,
            operacion: operacion,
            usuario: usuario,
            ipUsuario: usuarioIP,
        });
    });
}

export async function verificarExisteDetalle(idDetalle: number) {
    const detalle = await bd.consultaBD(`SELECT 1 FROM Detalles_solicitud_dietas WHERE detalle_id = @idDetalle`, [
        { nombre: 'idDetalle', valor: idDetalle }
    ]);

    if (detalle.recordset.length === 0) {
        return false;
    }

    return true;
}

export async function crearReclamo(idDetalle: number, usuario: string, usuarioIP: string, data: CrearReclamo) {
    //No se pueden crear reclamos de detalles cancelados
    const cancelado = await verificarEstadoDetalle(idDetalle, ESTADOS_DETALLE.CANCELADA);

    if (cancelado) {
        throw new HttpError('No puede crear un reclamo para una dieta que ha sido cancelada', 422);
    }

    const tiempoComida = await tiempoComidaDetalle(idDetalle);

    const horarioModificacion = await validarHorario(tiempoComida, 'cierre');

    if (!horarioModificacion) {
        throw new HttpError("El tiempo para crear reclamos en esta solicitud ha terminado", 422);
    }

    const cambios: CambiosReclamo = {
        reclamo_tipo_id: data.idReclamo,
        reclamo_estado: ESTADO_RECLAMO.REPORTADO,
        detalle_estado: ESTADOS_DETALLE.RECLAMO
    };

    const cambiosHistorial: Cambio[] = [
        { campo: 'reclamo_tipo_id', valorAnterior: undefined, nuevoValor: data.idReclamo.toString() }
    ]

    if (data.observacion && data.observacion.trim() != '') {
        cambios.obs_reclamo = data.observacion.trim();
        cambiosHistorial.push({ campo: 'obs_reclamo', valorAnterior: undefined, nuevoValor: data.observacion.trim() })
    }

    if (data.archivo && data.archivo.trim() != '') {
        cambios.reclamo_archivo_ruta = data.archivo.trim();
        cambiosHistorial.push({ campo: 'reclamo_archivo_ruta', valorAnterior: undefined, nuevoValor: data.archivo.trim() })
    }

    await gestionarReclamo({
        idDetalle,
        cambiosReclamo: cambios,
        usuario,
        usuarioIP,
        operacion: TipoOperacion.CREAR_RECLAMO,
        cambiosHistorial,
    })

    //Enviar el correo de notificacion
    const datos = await bd.consultaBD(`SELECT sol.nombre_sala, CONVERT(VARCHAR(10), fecha_entrega, 120) AS fechaEntrega, tc.valor_catalogo AS tiempoComida, cl.nombre_paciente, cl.id_paciente, dieta.descripcion, cat.valor_catalogo AS reclamo, det.obs_reclamo
FROM Solicitud_dietas sol 
INNER JOIN Detalles_solicitud_dietas det ON sol.solicitud_id = det.solicitud_id
INNER JOIN Pacientes cl ON cl.id_paciente = det.id_paciente
INNER JOIN Valores_catalogo_medico cat ON cat.id_valor_catalogo = det.reclamo_tipo_id
INNER JOIN Dietas dieta ON dieta.dieta = det.id_dieta_vigente
INNER JOIN Valores_catalogo_medico tc ON tc.id_valor_catalogo = sol.id_comida
WHERE cat.id_catalogo = 1 AND tc.id_catalogo = 3 AND det.detalle_id = @idDetalle`, [
        { nombre: 'idDetalle', valor: idDetalle },
    ])

    const informacion = datos.recordset[0];

    const asunto = `Nuevo reclamo en Solicitud de dieta`;

    const cuerpoHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; }
    .detalle { background: #f7f7f7; padding: 10px; border-radius: 5px; }
  </style>
</head>
<body>
  <p>Estimado/a,</p>
  <p>Se ha generado un nuevo reclamo relacionado con una solicitud de dieta.</p>

  <div class="detalle">
    <p><strong>Información del reclamo:</strong></p>
    <ul>
      <li><strong>Sala:</strong> ${informacion.nombre_sala}</li>
      <li><strong>Tiempo de comida:</strong> ${informacion.tiempoComida}</li>
      <li><strong>Fecha de entrega:</strong> ${fechaATexto(informacion.fechaEntrega)}</li>
      <li><strong>Paciente:</strong> ${informacion.id_paciente} - ${informacion.nombre_paciente}</li>
      <li><strong>Dieta:</strong> ${informacion.DESCRIPCION}</li>
      <li><strong>Tipo de reclamo:</strong> ${informacion.reclamo}</li>
      <li><strong>Observación:</strong> ${informacion.obs_reclamo ?? 'Sin observación'}</li>
    </ul>
  </div>

  <p>Por favor, revise el reclamo y proceda con el seguimiento correspondiente.</p>
</body>
</html>
`;

    setImmediate(async () => {
        try {
            await enviarCorreo({ asunto, cuerpoHtml, tipo: 'reclamos' });
        } catch (error) {
            console.error("Error enviando correo:", error);
        }
    });

    return {
        mensaje: "Reclamo creado correctamente",
        correoEnviado: true, 
        errorCorreo: null,
    };
}

async function verificarEstadoReclamo(idDetalle: number) {
    const estadoDetalle = await bd.consultaBD(`SELECT 1 
    FROM Detalles_solicitud_dietas d
	  INNER JOIN Solicitud_dietas s  ON s.solicitud_id = d.solicitud_id
    WHERE detalle_id = @idDetalle AND reclamo_estado = @estado AND estado_solicitud IN (@d1, @d2, @d3, @d4)
    AND s.fecha_entrega = CAST(GETDATE() AS DATE)`, [
        { nombre: 'idDetalle', valor: idDetalle },
        { nombre: 'estado', valor: ESTADO_RECLAMO.REPORTADO },
        { nombre: 'd1', valor: ESTADOS_SOLICITUD.RECIBIDA },
        { nombre: 'd2', valor: ESTADOS_SOLICITUD.R_RECLAMO },
        { nombre: 'd3', valor: ESTADOS_SOLICITUD.ENVIADA_SALA },
        { nombre: 'd4', valor: ESTADOS_SOLICITUD.MODIFICADA },
    ]);

    if (estadoDetalle.recordset.length === 0) {
        return false;
    };

    return true;
}

export async function modificarReclamo(idDetalle: number, usuario: string, usuarioIP: string, data: ModificarReclamo) {
    const estadoDetalle = await verificarEstadoReclamo(idDetalle);

    if (!estadoDetalle) {
        throw new HttpError('No puede modificar el reclamo', 422);
    }

    const tiempoComida = await tiempoComidaDetalle(idDetalle);

    const horarioModificacion = await validarHorario(tiempoComida, 'cierre');

    if (!horarioModificacion) {
        throw new HttpError("El tiempo para modificar los reclamos ha terminado", 422);
    };

    const cambios: CambiosReclamo = {};

    const cambiosHistorial: Cambio[] = [];

    if (data.observacion && data.observacion.trim() != '') {
        cambios.obs_reclamo = data.observacion.trim();
        cambiosHistorial.push({ campo: 'obs_reclamo', valorAnterior: undefined, nuevoValor: data.observacion.trim()})
    };

    if (data.idReclamo) {
        cambios.reclamo_tipo_id = data.idReclamo,
            { campo: 'reclamo_tipo_id', valorAnterior: undefined, nuevoValor: data.idReclamo.toString() }
    };

    await gestionarReclamo({
        idDetalle,
        cambiosReclamo: cambios,
        usuario,
        usuarioIP,
        operacion: TipoOperacion.MODIFICAR_RECLAMO,
        cambiosHistorial,
    });
}

export async function estadoReclamo(idDetalle: number, usuario: string, usuarioIP: string) {
    const estadoDetalle = await verificarEstadoReclamo(idDetalle);

    if (!estadoDetalle) {
        throw new HttpError('No puede cambiar el estado de el reclamo', 422);
    };

    const cambios: CambiosReclamo = {
        reclamo_estado: ESTADO_RECLAMO.SOLUCIONADO,
    };

    const cambiosHistorial: Cambio[] = [
        { campo: 'reclamo_estado', valorAnterior: undefined, nuevoValor: `${ESTADO_RECLAMO.SOLUCIONADO}` }
    ];

    await gestionarReclamo({
        idDetalle,
        cambiosReclamo: cambios,
        usuario,
        usuarioIP,
        operacion: TipoOperacion.ESTADO_RECLAMO,
        cambiosHistorial,
    });
}

export async function obtenerReclamo(idDetalle: number) {
    const reclamo = await bd.consultaBD(`SELECT tipoR.id_valor_catalogo,  tipoR.valor_catalogo, er.valor_catalogo AS estadoReclamo, obs_reclamo, reclamo_archivo_ruta
FROM Detalles_solicitud_dietas det
INNER JOIN Valores_catalogo_medico er ON det.reclamo_estado = er.id_valor_catalogo
INNER JOIN Valores_catalogo_medico tipoR ON det.reclamo_tipo_id = tipoR.id_valor_catalogo
WHERE detalle_id = @idDetalle AND er.id_catalogo = 6 AND tipoR.id_catalogo = 1`, [
        { nombre: 'idDetalle', valor: idDetalle },
    ]);

    return reclamo.recordset[0].map(toReclamoDto);
}

export async function obtenerTiposReclamos() {
    const tiposReclamo = await bd.consultaBD(`
        SELECT id_valor_catalogo AS id, valor_catalogo AS nombre
FROM Valores_catalogo_medico 
WHERE id_catalogo = 1`);

    return tiposReclamo.recordset;
}