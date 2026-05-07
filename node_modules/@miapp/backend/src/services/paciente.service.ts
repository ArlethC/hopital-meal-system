/*
    Archivo: paciente.service.ts
    Descripcion: consultas a la base de datos para obtener la información de los pacientes.
    Autor: Marilyn Castro
    Fecha creacion: 7/07/2025
    Version: 1.0.0
*/

import { bd } from '../config/database';
import { validarExpediente, validarYCompararFecha } from '../utils/validaciones';
import { HttpError } from "../utils/HttpError";
import { obtenerFiltrando, } from "./dietasEdadTiempoComida.service";
import { formatearEdad } from "../utils/funcionesFormatear";
import { obtenerEdificio } from './solicitudDietas.service';
import { validarHorario } from "./horariosTiempoComida.service";
import { ESTADOS_DETALLE, TIEMPOS_COMIDA } from '../config/Constantes';
import { toPacienteDto, toPacienteListDto, toSalaDto } from "../dtos/pacientes.dto";

export async function obtenerPacientes(limite: number, offset: number, valorBusqueda?: string) {
    let query =
        `
    SELECT c.id_paciente, c.nombre_paciente, dbo.CalcularEdad(c.fecha_nacimiento) AS edad
    FROM Pacientes c 
    `;

    const parametros: { nombre: string; valor: string | number }[] = [
        { nombre: 'offset', valor: offset },
        { nombre: 'limite', valor: limite },
    ];

    const totalParametros: { nombre: string; valor: string | number }[] = [];

    let busqueda = '';
    valorBusqueda = valorBusqueda ?? '';

    if (valorBusqueda.trim() !== '') {
        if (validarExpediente(valorBusqueda)) {
            busqueda = ` AND c.id_paciente LIKE @busqueda`;
        } else {
            busqueda = ` AND c.nombre_paciente LIKE @busqueda`;
        }

        parametros.push({ nombre: 'busqueda', valor: `%${valorBusqueda.trim()}%` });
        totalParametros.push({ nombre: 'busqueda', valor: `%${valorBusqueda.trim()}%` })
    }

    query += busqueda +
        ` ORDER BY c.id_paciente
    OFFSET @offset ROWS FETCH NEXT @limite ROWS ONLY`;

    const pacientes = await bd.consultaBD(query, parametros);

    let query2 =
        `
    SELECT COUNT(*) AS total
    FROM Pacientes c
    `;

    query2 += busqueda;

    const totalConsulta = await bd.consultaBD(query2, totalParametros);

    const total = parseInt(totalConsulta.recordset[0].total, 10);

    return {
        data: pacientes.recordset.map(toPacienteDto),
        total: total,
        page: Math.floor(offset / limite) + 1,
        pageSize: limite,
        totalPages: Math.ceil(total / limite),
    };
}

export async function asignarDietasValidasEdad(pacientes: any[], idTiempoComida: number) {
    const dietas = await obtenerFiltrando({ limite: 1000, offset: 0, idTiempoComida: idTiempoComida });

    if (!dietas.data || dietas.data.length === 0) {
        throw new HttpError("No hay dietas registradas para este tiempo de comida", 404);
    }

    return pacientes.map(paciente => {
        const edadMeses = paciente.edad;
        const edadTexto = formatearEdad(edadMeses);

        const dietasValidas = dietas.data.filter(dieta =>
            dieta.edad_minima_meses != null &&
            dieta.edad_maxima_meses != null &&
            edadMeses >= dieta.edad_minima_meses &&
            edadMeses <= dieta.edad_maxima_meses
        ).map(dieta => ({
            codigo: dieta.idDieta,
            nombre: dieta.dieta,
        }));


        return {
            ...paciente,
            edadTexto,
            dietasValidas,
        };
    });
}

export async function obtenerPacientesXSala(sala: string, fecha: string, idTiempoComida: number) {

    const { fechaVal, esHoy } = validarYCompararFecha(fecha);

    if (!fechaVal) {
        throw new HttpError("La fecha no puede ser anterior a la fecha actual", 400);
    }

    let horarioModificacion;

    if (idTiempoComida === TIEMPOS_COMIDA.CENA) {
        horarioModificacion = await validarHorario(idTiempoComida);
    } else {
        horarioModificacion = await validarHorario(idTiempoComida, 'cierre');
    }

    if (!horarioModificacion && esHoy) {
        throw new HttpError('El horario para crear solicitudes de dieta para este tiempo de comida ha terminado.', 422);
    }

    const pacientes = await bd.ejecutarProcedimiento('dbo.PacientesSala', [
        { nombre: 'sala', valor: sala },
        { nombre: 'fechaEntrega', valor: fecha },
    ]);

    if (!pacientes.recordset || pacientes.recordset.length === 0) {
        return [];
    }

    const id_pacientes = pacientes.recordset.map(d => `'${d.Expediente}'`).join(',');

    const pacienteDieta = `
    SELECT det.id_paciente
    FROM Detalles_solicitud_dietas det
    INNER JOIN Solicitud_dietas sol ON sol.solicitud_id = det.solicitud_id
    WHERE sol.fecha_entrega = @fecha
      AND sol.id_comida = @idTiempo
      AND det.id_paciente IN (${id_pacientes})
    `;

    const existentes = await bd.consultaBD(pacienteDieta, [
        { nombre: 'fecha', valor: fecha },
        { nombre: 'idTiempo', valor: idTiempoComida },
    ]);

    if (existentes.recordset.length === pacientes.recordset.length) {
        throw new HttpError("Todos los pacientes de esta sala ya tienen ordenada una dieta", 422);
    }

    const existentesSet = new Set(
        (existentes.recordset ?? []).map(e => e.id_paciente)
    );

    for (const paciente of pacientes.recordset) {
        paciente.asignado = existentesSet.has(paciente.Expediente);
    }

    const resultado = await asignarDietasValidasEdad(pacientes.recordset, idTiempoComida)

    return resultado.map(toPacienteListDto);
}

export async function obtenerInfoPaciente(expediente: string, idTiempoComida: number, fecha: string, sala: string) {
    const pacienteDieta = `
    SELECT 1
    FROM Detalles_solicitud_dietas det
    INNER JOIN Solicitud_dietas sol ON sol.solicitud_id = det.solicitud_id
    WHERE sol.fecha_entrega = @fecha
      AND sol.id_comida = @idTiempo
      AND det.id_paciente = @expediente
    `;

    const existentes = await bd.consultaBD(pacienteDieta, [
        { nombre: 'fecha', valor: fecha },
        { nombre: 'idTiempo', valor: idTiempoComida },
        { nombre: 'expediente', valor: expediente }
    ]);

    if (existentes.recordset.length > 0) {
        throw new HttpError("El paciente seleccionado ya tienen ordenada una dieta", 422);
    }

    const query = `SELECT  ' ' AS ambiente, cl.id_paciente, cl.nombre_paciente, dbo.CalcularEdad(cl.fecha_nacimiento) AS edad, estado.*
FROM Pacientes cl 
	OUTER APPLY dbo.DocumentosAlergiasPaciente(cl.id_paciente) AS estado
WHERE cl.id_paciente = @expediente`;

    const paciente = await bd.consultaBD(query, [
        { nombre: 'expediente', valor: expediente },
    ]);

    if (paciente.recordset.length === 0) {
        throw new HttpError("No se encontro la informacion de este paciente", 404);
    }

    const edificio = await obtenerEdificio(sala, fecha);

    paciente.recordset[0].edificio = edificio;

    const resultado = await asignarDietasValidasEdad(paciente.recordset, idTiempoComida);

    return resultado.map(toPacienteListDto);
}

export async function obtenerInfoPacienteEtiqueta(idDetalleSolicitud: number) {
    const detalle = `
    SELECT 1
    FROM Detalles_solicitud_dietas det
    WHERE det.detalle_id = @idDetalleSolicitud
    `;

    const existentes = await bd.consultaBD(detalle, [
        { nombre: 'idDetalleSolicitud', valor: idDetalleSolicitud },
    ]);

    if (existentes.recordset.length == 0) {
        throw new HttpError("El detalle de la solictud no existe", 404);
    }

    const query = `SELECT cl.nombre_paciente AS paciente, dbo.CalcularEdad(Convert(Datetime, cl.fecha_nacimiento, 112)) AS edad, d.descripcion, dtc.abrev_nombre_articulo AS abrev, sol.sala_nombre AS sala
    FROM Detalles_solicitud_dietas det
    INNER JOIN Solicitud_dietas sol ON sol.solicitud_id = det.solicitud_id
    INNER JOIN Pacientes cl ON cl.id_paciente = det.id_paciente
    INNER JOIN Dietas d ON d.id_dieta = det.id_dieta_vigente
    LEFT JOIN Dieta_comida_edad dtc ON dtc.id_dieta = det.id_dieta_vigente AND dtc.activo = 1
    WHERE det.detalle_id = @idDetalleSolicitud`;

    const paciente = await bd.consultaBD(query, [
        { nombre: 'idDetalleSolicitud', valor: idDetalleSolicitud },
    ]);

    if (paciente.recordset.length === 0) {
        throw new HttpError("No se encontro la informacion de este paciente", 404);
    }

    return paciente.recordset[0];
}

export async function obtenerSalas() {
    const salas = await bd.consultaBD('SELECT id_sala, nombre_sala FROM Salas WHERE activo = 1');

    return salas.recordset.map(toSalaDto);
}


export async function infoPacientesSalaEtiqueta(idSolicitud: number) {
    const solicitud = `
    SELECT 1
    FROM Solicitud_dietas
    WHERE solicitud_id = @idSolicitud
    `;

    const existentes = await bd.consultaBD(solicitud, [
        { nombre: 'idSolicitud', valor: idSolicitud },
    ]);

    if (existentes.recordset.length == 0) {
        throw new HttpError("La solictud de dieta no existe", 404);
    }

    const query = `SELECT cl.nombre_paciente AS paciente, dbo.CalcularEdad(Convert(Datetime, cl.fecha_nacimiento, 112)) AS edad, d.descripcion, dtc.abrev_nombre_dieta AS abrev, sol.sala_nombre AS sala
    FROM Detalles_solicitud_dietas det
    INNER JOIN Solicitud_dietas sol ON sol.solicitud_id = det.solicitud_id
    INNER JOIN Pacientes cl ON cl.id_paciente = det.id_paciente
    INNER JOIN Dietas d ON d.id_dieta = det.id_dieta_vigente
    LEFT JOIN Dieta_comida_edad dtc ON dtc.id_dieta = det.id_dieta_vigente AND dtc.activo = 1
    WHERE sol.solicitud_id = @idSolicitud AND det.detalle_estado <> @estadoDetalle`;

    const paciente = await bd.consultaBD(query, [
        { nombre: 'idSolicitud', valor: idSolicitud },
        { nombre: 'estadoDetalle', valor: ESTADOS_DETALLE.CANCELADA },
    ]);

    if (paciente.recordset.length === 0) {
        throw new HttpError("No se encontro la informacion de los detalles de esta solicitud", 404);
    }

    return paciente.recordset;
}

export async function existePaciente(expediente: string) {
    const paciente = await bd.consultaBD(`SELECT 1
    FROM Pacientes cl
    WHERE cl.id_paciente = @expediente `, [
        { nombre: 'expediente', valor: expediente },]);

    return paciente.recordset;
}