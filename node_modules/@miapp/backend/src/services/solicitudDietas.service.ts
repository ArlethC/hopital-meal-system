/*
    Archivo: solicitudDietas.service.ts
    Descripcion: Logica de negocio para gestionar las solicitudes de dietas.
    Autor: Marilyn Castro
    Fecha creacion: 11/07/2025
    Version: 1.0.5
*/
import { ESTADOS_SOLICITUD, ESTADOS_DETALLE, TIEMPOS_COMIDA } from '../config/Constantes';
import { bd, crearTablaPacientesDieta, type PacienteDieta } from '../config/database';
import { HttpError } from "../utils/HttpError";
import { Transaction } from 'mssql';
import { registrarHistorial, TipoOperacion } from "./historial.service";
import { existeIdTiempoComida, validarHorario } from "./horariosTiempoComida.service";
import { validarYCompararFecha } from '../utils/validaciones';
import { enviarCorreo } from '../utils/funcionEnviarCorreo';
import { toOrdenDto, toCatalogoDto, toPacienteOmitido} from '../dtos/solictudDietas.dto';

export async function duplicadoSolicitud(sala: string, fecha: string, idTiempoComida: number) {

    const query = `SELECT sala_nombre FROM Solicitud_dietas 
    WHERE sala_nombre = @sala AND fecha_entrega = @fechaEntrega AND id_comida = @idTiempoComida`;

    const parametros = [
        { nombre: 'sala', valor: sala },
        { nombre: 'fechaEntrega', valor: fecha },
        { nombre: 'idTiempoComida', valor: idTiempoComida },
    ];

    const response = await bd.consultaBD(query, parametros);

    return response.recordset;
}

export async function crearSolicitud(sala: string, idTiempoComida: number, fechaEntrega: string, detalles: PacienteDieta[], usuario: string) {
    await existeIdTiempoComida(idTiempoComida);

    const clientes = detalles.map(d => `'${d.expediente}'`).join(',');

    const query = `
    SELECT det.id_paciente AS expediente
    FROM Detalles_solicitud_dietas det
    INNER JOIN Solicitud_dietas sol ON sol.solicitud_id = det.solicitud_id
    WHERE sol.fecha_entrega = @fecha
      AND sol.id_comida = @idTiempo
      AND det.id_paciente IN (${clientes})
    `;

    const existentes = await bd.consultaBD(query, [
        { nombre: 'fecha', valor: fechaEntrega },
        { nombre: 'idTiempo', valor: idTiempoComida }
    ]);

    if (existentes.recordset.length === detalles.length) {
        throw new HttpError("Todos los pacientes seleccionados ya tienen ordenada una dieta", 422);
    }

    let horarioModificacion;

    if (idTiempoComida === TIEMPOS_COMIDA.CENA) {
        horarioModificacion = await validarHorario(idTiempoComida);
    } else {
        horarioModificacion = await validarHorario(idTiempoComida, 'cierre');
    }

    const { esHoy } = validarYCompararFecha(fechaEntrega);

    if (!horarioModificacion && esHoy) {
        throw new HttpError('El horario para crear solicitudes de dieta para este tiempo de comida ha terminado.', 422);
    }

    try {
        const clavesVacias = ['cama', 'obsEnfermeria', 'idRelacion', 'tipoRelacion'];

        const detallesSinVacias = detalles.map(detalles =>
            Object.fromEntries(
                Object.entries(detalles).filter(
                    ([key, value]) => !(clavesVacias.includes(key) && value === '')
                )
            ) as PacienteDieta
        );

        const tablaPacientes = crearTablaPacientesDieta(detallesSinVacias);

        const pacientesConDieta = await bd.ejecutarProcedimiento('dbo.CrearSolicitudDietas', [
            { nombre: 'nombreSala', valor: sala },
            { nombre: 'fechaEntrega', valor: fechaEntrega },
            { nombre: 'idComida', valor: idTiempoComida },
            { nombre: 'usuarioCreacion', valor: usuario },
            { nombre: 'detalles', valor: tablaPacientes },
        ]);

        const tiempoComida = await bd.consultaBD(`
   SELECT valor_catalogo
FROM Valores_catalogo_medico
WHERE id_catalogo = 3 AND activo = 1 AND  id_valor_catalogo = @idTiempoComida
    `, [{nombre: 'idTiempoComida', valor: idTiempoComida}])

        setImmediate(async () => {
            try {
                await correoNuevaSolicitud(sala, tiempoComida.recordset[0].valor_catalogo);
            } catch (error) {
                console.error("Error enviando correo:", error);
            }
        });

        return pacientesConDieta.recordset.map(toPacienteOmitido);
    } catch (error: any) {
        if (typeof error.message === 'string') {
            if (error.message.includes('fechas pasadas')) {
                throw new HttpError('No puedes guardar una solicitud con fecha anterior a hoy.', 400);
            }
            if (error.message.includes('Ya existe una solicitud')) {
                throw new HttpError('Ya existe una solicitud para esa sala y tiempo.', 400);
            }
            if (error.message.includes('No se insertó ningún detalle')) {
                throw new HttpError(error.message, 400);
            }
        }
        throw new HttpError('Error al procesar solicitud.', 500);
    }
}

export async function correoNuevaSolicitud(sala: string, tiempoComida: string) {
    const asunto = `Nueva Solicitud de dieta`;

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
          <p>Buen día estimado/a:</p>
          <p>Le informamos que se ha generado una nueva solicitud de dieta en <strong>${sala}</strong> para <strong>${tiempoComida}</strong>.</p>
          <p>Por favor, revise el sistema para visualizar la solicitud.</p>
        </body>
        </html>
        `;

    try {
        await enviarCorreo({ asunto, cuerpoHtml, tipo: 'solicitud' });
    } catch (error) {
        console.error("Error enviando correo:", error);
    }
}

export async function verificarEstadoSolicitud(idDetalle: number, estadosPermitidos: number[], tiemposProhibidos?: number[],) {
    const estados = estadosPermitidos.map(e => `'${e}'`).join(',');

    let query = `
    SELECT 1
    FROM Solicitud_dietas s 
    INNER JOIN Detalles_solicitud_dietas d ON s.solicitud_id = d.solicitud_id
    WHERE d.id_detalle = @idDetalle
      AND s.estado_solicitud IN (${estados})
  `;

    if (tiemposProhibidos && tiemposProhibidos.length > 0) {
        const tiempos = tiemposProhibidos.join(',');
        query += ` AND s.id_comida NOT IN (${tiempos})`;
    }

    const response = await bd.consultaBD(query, [
        { nombre: 'idDetalle', valor: idDetalle }
    ]);

    if (response.recordset.length === 0) {
        return false;
    }

    return true;
}

export async function obtenersolicitudes({ pag, limite, offset, sala, idTiempoComida, fechaEntrega, estados, idSolicitud, tiemposComida, idEstado }: {
    pag: number, limite: number, offset: number, sala?: string, idTiempoComida?: number, fechaEntrega?: string, estados?: number[], idSolicitud?: number, tiemposComida?: number[], idEstado?: number,
}) {
    const condiciones: string[] = [];
    const parametros: any[] = [];

    if (idSolicitud) {
        condiciones.push('s.solicitud_id = @idSolicitud');
        parametros.push({ nombre: 'idSolicitud', valor: idSolicitud });
    }
    if (sala) {
        condiciones.push('s.nombre_sala = @sala');
        parametros.push({ nombre: 'sala', valor: sala });
    }
    if (idTiempoComida) {
        condiciones.push('s.id_comida = @idTiempoComida');
        parametros.push({ nombre: 'idTiempoComida', valor: idTiempoComida });
    }
    if (fechaEntrega) {
        condiciones.push('s.fecha_entrega = @fechaEntrega');
        parametros.push({ nombre: 'fechaEntrega', valor: fechaEntrega });
    }
    if (estados?.length) {
        const estadospermitidos = idEstado ? idEstado : estados.join(',');
        condiciones.push(`s.estado_solicitud IN (${estadospermitidos})`);
    }
    if (tiemposComida?.length) {
        const tiemposNoPermitidos = tiemposComida.join(',');
        condiciones.push(`s.id_comida NOT IN (${tiemposNoPermitidos})`);
    }

    const where = `
    FROM Solicitud_dietas s 
    INNER JOIN Valores_catalogo_medico tiempo ON s.id_comida = tiempo.id_valor_catalogo
    INNER JOIN Valores_catalogo_medico estado ON s.estado_solicitud = estado.id_valor_catalogo
    WHERE tiempo.id_catalogo = 3 AND estado.id_catalogo = 4
    ${condiciones.length ? ' AND ' + condiciones.join(' AND ') : ''}
    `;

    const queryDatos = `
    SELECT solicitud_id, nombre_sala, CONVERT(VARCHAR(10), fecha_entrega, 120) as fechaEntrega, 
           creacion_usuario, fecha_creacion, tiempo.id_valor_catalogo AS idTiempoComida,
           tiempo.valor_catalogo AS tiempoComida, estado.id_valor_catalogo AS idEstado, estado.valor_catalogo AS estado
    ${where}
    ORDER BY s.fecha_creacion DESC
    ${!idSolicitud ? 'OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY' : ''}
    `;

    const queryTotal = `SELECT COUNT(*) as total ${where}`;

    const parametrosPaginados = idSolicitud
        ? parametros
        : [...parametros, { nombre: 'offset', valor: offset }, { nombre: 'pageSize', valor: limite }];

    const [solicitudes, total] = await Promise.all([
        bd.consultaBD(queryDatos, parametrosPaginados),
        bd.consultaBD(queryTotal, parametros),
    ]);

    return {
        total: total.recordset[0].total,
        paginaActual: pag,
        totalPaginas: Math.ceil(total.recordset[0].total / limite),
        datos: solicitudes.recordset.map(toOrdenDto),
    };
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
    AND h.valor_anterior = a.dieta
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

    return datosLimpios;
}

export async function obtenerEdificio(sala: String, fecha: string) {

    const datos = await bd.ejecutarProcedimiento('dbo.PacientesSala', [
        { nombre: 'sala', valor: sala },
        { nombre: 'fechaEntrega', valor: fecha },
    ])

    if (datos.recordset.length > 0) {
        return datos.recordset[0]?.Edificio;
    }

    return '';
}

export async function solicitudParaRecibir(idSolicitud: number) {
    const resultado = await bd.consultaBD(`SELECT 1
        FROM Solicitud_dietas
        WHERE solicitud_id = @idSolicitud`, [
        { nombre: 'idSolicitud', valor: idSolicitud },
    ]);

    if (resultado.recordset.length === 0) {
        throw new HttpError('Solicitud no encontrada', 404);
    }

    const estadoSolicitud = await bd.consultaBD(`SELECT 1
FROM Solicitud_dietas 
WHERE solicitud_id = @idSolicitud
AND estado_solicitud = @estado`, [
        { nombre: 'idSolicitud', valor: idSolicitud },
        { nombre: 'estado', valor: ESTADOS_SOLICITUD.ENVIADA_SALA },
    ]);

    if (estadoSolicitud.recordset.length === 0) {
        return false;
    }

    return true;
}

export async function marcarSolicitudRecibida(idSolicitud: number, usuario: string, ipUsuario: string) {
    await bd.realizarTransaccion(async (tx: Transaction) => {
        const request = tx.request();

        const result = await request
            .input('idSolicitud', idSolicitud)
            .input('nuevoEstado', ESTADOS_SOLICITUD.RECIBIDA)
            .query(`
        UPDATE Solicitud_dietas
        SET estado_solicitud = @nuevoEstado
        WHERE solicitud_id = @idSolicitud
         AND CAST(fecha_entrega AS DATE) = CAST(GETDATE() AS DATE)
      `);

        if (result.rowsAffected[0] === 0) {
            throw new HttpError("No se puede marcar como recibida porque la fecha de entrega no es hoy", 422);
        }

        await request
            .input('id', idSolicitud)
            .input('nuevoEstadoDetalle', ESTADOS_DETALLE.RECIBIDA)
            .input('estadoCancelado', ESTADOS_DETALLE.CANCELADA)
            .input('detalleReclamo', ESTADOS_DETALLE.RECLAMO)
            .query(`
        UPDATE Detalles_solicitud_dietas
        SET detalle_estado = @nuevoEstadoDetalle
        WHERE solicitud_id = @id AND detalle_estado NOT IN (@estadoCancelado, @detalleReclamo)
      `);

        await registrarHistorial({
            tabla: 'Solicitud_dietas',
            idRegistro: idSolicitud,
            cambios: [{ campo: 'estado_solicitud', valorAnterior: '', nuevoValor: `${ESTADOS_SOLICITUD.RECIBIDA}` }],
            operacion: TipoOperacion.CAMBIO_ESTADO,
            usuario: usuario,
            ipUsuario: ipUsuario,
        });

        const detalles = await request
            .query(`
            SELECT detalle_id, detalle_estado
            FROM Detalles_solicitud_dietas
            WHERE solicitud_id = @id AND detalle_estado NOT IN (@estadoCancelado, @detalleReclamo)
        `);

        for (const detalle of detalles.recordset) {
            await registrarHistorial({
                tabla: 'Detalles_solicitud_dietas',
                idRegistro: detalle.detalle_id,
                cambios: [{
                    campo: 'detalle_estado',
                    valorAnterior: detalle.detalle_estado,
                    nuevoValor: `${ESTADOS_DETALLE.RECIBIDA}`
                }],
                operacion: TipoOperacion.RECIBIDO,
                usuario: usuario,
                ipUsuario: ipUsuario,
            });
        }
    });
}

export async function marcarSolicitudRecibidaParcial(idSolicitud: number, idDetalles: number[], usuario: string, ipUsuario: string) {
    await bd.realizarTransaccion(async (tx: Transaction) => {
        const request = tx.request();

        const result = await request
            .input('idSolicitud', idSolicitud)
            .input('nuevoEstado', ESTADOS_SOLICITUD.RECIBIDA)
            .query(`
        UPDATE Solicitud_dietas
        SET estado_solicitud = @nuevoEstado
        WHERE solicitud_id = @idSolicitud
         AND CAST(fecha_entrega AS DATE) = CAST(GETDATE() AS DATE)
      `);

        if (result.rowsAffected[0] === 0) {
            throw new HttpError("No se puede marcar como recibida porque la fecha de entrega no es hoy", 422);
        }

        const placeholders = idDetalles.map((_, i) => `@id${i}`).join(', ');

        request.input('nuevoEstadoDetalle', ESTADOS_DETALLE.RECIBIDA);
        request.input('estadoCancelado', ESTADOS_DETALLE.CANCELADA);
        request.input('detalleReclamo', ESTADOS_DETALLE.RECLAMO)


        idDetalles.forEach((id, i) => {
            request.input(`id${i}`, id);
        });

        await request.query(`
        UPDATE Detalles_solicitud_dietas
        SET detalle_estado = @nuevoEstadoDetalle
        WHERE detalle_id IN (${placeholders}) AND detalle_estado NOT IN (@estadoCancelado, @detalleReclamo)
    `);
        await registrarHistorial({
            tabla: 'Solicitud_dietas',
            idRegistro: idSolicitud,
            cambios: [{ campo: 'estado_solicitud', valorAnterior: '', nuevoValor: `${ESTADOS_SOLICITUD.RECIBIDA}` }],
            operacion: TipoOperacion.CAMBIO_ESTADO,
            usuario: usuario,
            ipUsuario: ipUsuario,
        });

        const detallesValidos = await request.query(`
        SELECT detalle_id
        FROM Detalles_solicitud_dietas
        WHERE detalle_id IN (${placeholders})
          AND detalle_estado NOT IN (@estadoCancelado, @detalleReclamo)
    `);

        const idsNoCancelados = detallesValidos.recordset.map(r => r.detalle_id);

        for (const detalle of idsNoCancelados) {
            await registrarHistorial({
                tabla: 'Detalles_solicitud_dietas',
                idRegistro: detalle,
                cambios: [{
                    campo: 'detalle_estado',
                    valorAnterior: undefined,
                    nuevoValor: `${ESTADOS_DETALLE.RECIBIDA}`
                }],
                operacion: TipoOperacion.RECIBIDO,
                usuario: usuario,
                ipUsuario: ipUsuario,
            });
        }
    });
}

export async function tiempoComidaSolicitud(idSolicitud: number) {
    const tiempoComida = await bd.consultaBD(`SELECT sl.id_comida AS idTiempoComida
FROM Solicitud_dietas sl
WHERE  sl.solicitud_id = @idSolicitud`, [{ nombre: 'idSolicitud', valor: idSolicitud }]);

    return tiempoComida.recordset[0].idTiempoComida;
}

export async function estadosSolicitud() {
    const estados = await bd.consultaBD(`SELECT id_valor_catalogo, valor_catalogo
    FROM Valores_catalogo_medico
    WHERE id_catalogo = 4 AND activo = 1`);

    return estados.recordset.map(toCatalogoDto);
}

export async function cerrarSolicitudesPorTiempo(idTiempoComida: number) {
    try {
        const query = `
      UPDATE Solicitud_dietas
SET estado_solicitud = CASE 
    WHEN EXISTS (
        SELECT 1
        FROM Detalles_solicitud_dietas d
        WHERE d.solicitud_id = Solicitud_dietas.solicitud_id
          AND d.detalle_estado = @estadoDetalleReclamo
    )
    THEN @cerradaReclamo
    ELSE @cerrada
END
WHERE solicitud_id IN (
SELECT solicitud_id
FROM Solicitud_dietas s
JOIN Horario_comida h
    ON s.id_comida = h.id_comida
WHERE 
    CAST(s.fecha_entrega AS DATE) = CAST(GETDATE() AS DATE)
    AND s.id_comida = @idTiempoComida
    AND CONVERT(TIME, GETDATE()) > h.hora_final_cierre)
    `;

        const result = await bd.consultaBD(query, [
            { nombre: 'idTiempoComida', valor: idTiempoComida },
            { nombre: 'recibidaReclamo', valor: ESTADOS_SOLICITUD.R_RECLAMO },
            { nombre: 'cerrada', valor: ESTADOS_SOLICITUD.CERRADA },
            { nombre: 'cerradaReclamo', valor: ESTADOS_SOLICITUD.C_RECLAMO },
            { nombre: 'estadoDetalleReclamo', valor: ESTADOS_DETALLE.RECLAMO },
        ])

        console.log(`Solicitudes cerradas automáticamente para tiempo ${idTiempoComida}: ${result.rowsAffected}`);
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Error cerrando solicitudes:', err);
        }
    }
}