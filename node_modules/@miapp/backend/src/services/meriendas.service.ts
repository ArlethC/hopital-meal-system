/*
    Archivo: meriendas.service.ts
    Descripcion: Lógica de negocio para crear, desactivar y obtener meriendas.
    Autor: Marilyn Castro
    Fecha creacion: 31/07/2025
    Version: 1.0.0
*/
import { OrigenDatos } from "../config/databaseORM";
import { DetallesMerienda } from "../entities/Meriendas";
import { HttpError } from "../utils/HttpError";
import { existePaciente } from './paciente.service';
import type { crearMeriendaShemaDTO } from "@miapp/shared";
import { toMeriendaDto } from '../dtos/merienda.dto';
import { registrarHistorial, TipoOperacion } from "./historial.service";
import { existeIdTiempoComida, validarHorario } from "./horariosTiempoComida.service";
import { validarDietaExiste } from "./dietas.service";
import { validarYCompararFecha } from '../utils/validaciones';
import { TIEMPOS_COMIDA } from '../config/Constantes';

const repo = OrigenDatos.getRepository(DetallesMerienda);

export async function crearDetallesMerienda(datos: crearMeriendaShemaDTO, usuario: string, ipUsuario: string) {
    const paciente = await existePaciente(datos.expediente);

    if (!paciente || paciente.length === 0) {
        throw new HttpError("No se encontro este paciente", 404);
    }

    await existeIdTiempoComida(datos.idTiempoComida);

    await validarDietaExiste(datos.idDieta);

    const { fechaVal: fechaIni } = validarYCompararFecha(datos.fechaInicioMerienda)
    if (fechaIni == null) {
        throw new HttpError("La fecha inicial debe ser válida y no menor a hoy", 400);
    }

    if (datos.fechaFinMerienda) {
        const { fechaVal: fechaFin } = validarYCompararFecha(datos.fechaFinMerienda)
        if (fechaFin == null) {
            throw new HttpError("La fecha final debe ser válida y no menor a hoy", 400);
        } else {
            if (fechaFin < fechaIni) {
                throw new HttpError("La fecha final debe ser mayor que la fecha inicial", 400);
            }
        }
    }

    //No puede crear una merienda para la fecha actual si el tiempo de modificacion ha pasado
    const horarioModificacion = await validarHorario(datos.idTiempoComida);

    const { esHoy } = validarYCompararFecha(datos.fechaInicioMerienda);

    if (!horarioModificacion && esHoy) {
        throw new HttpError('El horario para crear meriendas ha terminado.', 422);
    }

    //No puede crear mas de dos meriendas activas para un paciente
    const fechaUsuario = datos.fechaInicioMerienda;

    const meriendasActivas = await repo.createQueryBuilder('m')
        .where('m.expediente = :expediente', { expediente: datos.expediente })
        .andWhere('m.estadoVigencia = :vigente', { vigente: true })
        .andWhere(`
    (
      (m.fechaInicioMerienda <= :fechaUsuario AND (m.fechaFinMerienda IS NULL OR m.fechaFinMerienda >= CAST(GETDATE() AS DATE)))
      OR
      (m.fechaInicioMerienda > :fechaUsuario)
    )
  `, { fechaUsuario })
        .select([
            'm.idDetalleMerienda',
            'm.expediente',
            'm.idTiempoComida',
            'm.fechaInicioMerienda',
            'm.fechaFinMerienda'
        ])
        .getMany();


    if (meriendasActivas.length >= 2) {
        throw new HttpError("No puede tener mas de dos meriendas activas por paciente", 422);
    }

    //No puede haber dos meriendas del mismo tipo para un paciente
    const mismoTipoHorario = meriendasActivas.filter(m => m.idTiempoComida == datos.idTiempoComida);
    if (mismoTipoHorario.length > 0) {
        throw new HttpError("No puede crear dos meriendas para el mismo horario de entrega", 422);
    }

    const nuevo = repo.create({
        expediente: datos.expediente,
        idDieta: datos.idDieta,
        idTiempoComida: datos.idTiempoComida,
        fechaInicioMerienda: datos.fechaInicioMerienda,
        fechaFinMerienda: datos.fechaFinMerienda ?? null,
        observacion: datos.observacion ?? null,
        usuarioCreacion: usuario,
        ipUsuarioCreacion: ipUsuario,
    });

    await repo.save(nuevo);

    if (esHoy) {
        const ahora = new Date();
        const horaAM = new Date();
        horaAM.setHours(8, 0, 0, 0);

        const horaPM = new Date();
        horaPM.setHours(14, 0, 0, 0);

        if (datos.idTiempoComida === TIEMPOS_COMIDA.MERIENDA_AM && ahora > horaAM) {
            await repo.query(`EXEC dbo.CrearMeriendas @fechaEntrega = @0, @tipoMerienda = @1, @usuarioCreacion = @2`, [
                datos.fechaInicioMerienda, // @0
                'AM',         // @1
                usuario // @2
            ]);
        };

        if (datos.idTiempoComida === TIEMPOS_COMIDA.MERIENDA_PM && ahora > horaPM) {
            await repo.query(`EXEC dbo.CrearMeriendas @fechaEntrega = @0, @tipoMerienda = @1, @usuarioCreacion = @2`, [
                datos.fechaInicioMerienda, // @0
                'PM',         // @1
                usuario // @2
            ]);
        };
    }

    return obtenerPorId(nuevo.idDetalleMerienda);
}

export async function obtenerPorId(idDetalleMerienda: number) {
    return await repo.find({
        where: { idDetalleMerienda, estadoVigencia: true },
        select: ['idDetalleMerienda', 'expediente'],
    });
}

export async function meriendasPaciente(expediente: string, mostrarTodas: boolean = false, limite: number, offset: number) {

    const queryTotal = repo
        .createQueryBuilder('m')
        .where('m.expediente = :expediente', { expediente })

    const query = repo
        .createQueryBuilder('m')
        .innerJoin('m.ValorCatalogoMedico', 'v')
        .innerJoin(
            qb => qb.select('*').from('Dietas', 'a'),
            'a',
            'a.id_dieta = m.idDieta'
        )
        .where('m.expediente = :expediente', { expediente })
        .select([
            'm.idDetalleMerienda AS id',
            'a.descripcion ',
            'v.valor AS comida',
            'm.observacion ',
            `FORMAT(m.fechaInicioMerienda, 'dd-MM-yyyy') AS fechaInicial`,
            `FORMAT(m.fechaFinMerienda, 'dd-MM-yyyy') AS fechaFinal`,
            'm.estadoVigencia '
        ]);

    if (!mostrarTodas) {
        query.andWhere('m.estadoVigencia = :vigente', { vigente: true })
            .andWhere('(m.fechaFinMerienda IS NULL OR m.fechaFinMerienda >= CAST(GETDATE() AS DATE))');

        queryTotal.andWhere('m.estadoVigencia = :vigente', { vigente: true })
            .andWhere('(m.fechaFinMerienda IS NULL OR m.fechaFinMerienda >= CAST(GETDATE() AS DATE))');
    }

    query.orderBy('m.fechaInicioMerienda', 'DESC')
    query.offset(offset)
    query.limit(limite);

    const data = await query.getRawMany();

    const total = await queryTotal.getCount();

    return {
        data: data.map(toMeriendaDto),
        total: total,
        page: Math.floor(offset / limite) + 1,
        pageSize: limite,
        totalPages: Math.ceil(total / limite),
    };
}

export async function desactivarMerienda(idDetalleMerienda: number, usuario: string, ipUsuario: string) {
    const merienda = await obtenerPorId(idDetalleMerienda);

    if (!merienda || merienda.length === 0) {
        throw new HttpError("No se encontro este recurso", 404);
    }

    await repo.update(idDetalleMerienda, {
        estadoVigencia: false,
    });

    await registrarHistorial({
        tabla: 'Detalle_meriendaa',
        idRegistro: idDetalleMerienda,
        cambios: [{ campo: 'estadoVigencia', valorAnterior: 'true', nuevoValor: 'false' }],
        operacion: TipoOperacion.ELIMINAR,
        usuario: usuario,
        ipUsuario: ipUsuario,
    })
}

