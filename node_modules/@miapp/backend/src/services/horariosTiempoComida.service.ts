/*
    Archivo: horariosTiemposComida.service.ts
    Descripcion: logica de negocio para gestionar los horarios para los tiempos de comida.
    Autor: Marilyn Castro
    Fecha creacion: 7/07/2025
    Version: 1.0.0
*/
import { OrigenDatos } from "../config/databaseORM";
import { HorariosTiempoComida } from "../entities/HorariosTiempoComida";
import { ValorCatalogoMedico } from "../entities/ValorCatalogoAtencionMedica";
import { HttpError } from "../utils/HttpError";
import { registrarHistorial, TipoOperacion, Cambio } from "./historial.service";
import { cerrarSolicitudesPorTiempo } from './solicitudDietas.service';
import type { HorarioTiempoComida } from "@miapp/shared";
import { CATALOGO_COMIDA } from "../config/Constantes";

const repo = OrigenDatos.getRepository(HorariosTiempoComida);
const repo2 = OrigenDatos.getRepository(ValorCatalogoMedico);

async function existeDuplicado(tiempoComida: number) {
    const response = await repo.findOne({
        where: {
            idTiempoComida: tiempoComida,
            activo: true,
        }
    });

    return !!response;
}

export async function existeIdTiempoComida(tiempoComida: number) {
    const response = await repo2.findOne({
        where: {
            id: tiempoComida,
            activo: true,
            objCatalogoID: CATALOGO_COMIDA,
        }
    });

    if (!response) {
        throw new HttpError("El tiempo de comida especificado no existe", 400);
    }
    return true;
}

export async function crear(data: Partial<HorariosTiempoComida>, usuario: string, ipUsuario: string) {
    await existeIdTiempoComida(data.idTiempoComida!);

    if (await existeDuplicado(data.idTiempoComida!)) {
        throw new HttpError("Ya existe un registro para este tiempo de comida", 422);
    }

    const hora_modificacion = data.horaModificacion;
    const hora_cierre = data.horaCierre;

    if (hora_modificacion! > hora_cierre!) {
        throw new HttpError("La hora de cierre no puede ser anterior a la hora de modificación", 400);
    }

    const nuevo = repo.create({
        ...data,
        usuarioCreacion: usuario,
        ipUsuarioCreacion: ipUsuario,
    });

    const nuevoRegistro = await repo.save(nuevo);

    programarCierres();

    return await obtenerById(nuevoRegistro.id);
}


export async function obtenerById(id: number): Promise<HorarioTiempoComida[]> {

    const registro = await repo.createQueryBuilder('e')
        .innerJoin('e.ValorCatalogo', 'v')
        .select([
            'e.id AS id',
            'v.valor AS tiempoComida',
            'CAST(e.hora_limite_cierre AS varchar) AS horaCierre',
            'CAST(e.horaModificacion AS varchar) AS horaModificacion'
        ])
        .where('e.id = :id', { id: id })
        .andWhere('v.objCatalogoID = :idCatalogo', { idCatalogo: CATALOGO_COMIDA })
        .andWhere('e.activo = :activo', { activo: 1 })
        .getRawMany();

    return registro;
}

const mapeoCamposBD: Record<string, string> = {
    horaCierre: 'hora_final_cierre',
    horaModificacion: 'hora_final_modificacion',
};

export async function modificar(id: number, data: Partial<HorariosTiempoComida>, usuario: string, ipUsuario: string) {
    const entidad = await obtenerById(id);

    if (!entidad) throw new HttpError('No encontrado', 404);

    const nuevaHoraCierre = data.horaCierre != null ? data.horaCierre : entidad[0].horaCierre;
    const nuevaHoramod = data.horaModificacion != null ? data.horaModificacion : entidad[0].horaModificacion;

    if (nuevaHoramod! > nuevaHoraCierre!) {
        throw new HttpError("La hora de cierre no puede ser anterior a la hora de modificación", 400);
    }

    data.horaCierre = nuevaHoraCierre;
    data.horaModificacion = nuevaHoramod;

    await repo.update(id, {
        ...data,
        usuarioCambio: usuario,
        fechaCambio: new Date(),
    });

    const cambiosParaHistorial: Cambio[] = [];

    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const valorAnterior = entidad[0][key as keyof typeof entidad[0]];
            const nuevoValor = data[key as keyof HorariosTiempoComida];

            cambiosParaHistorial.push({
                campo: mapeoCamposBD[key] ?? key,
                valorAnterior: valorAnterior != null ? String(valorAnterior) : undefined,
                nuevoValor: nuevoValor != null ? String(nuevoValor) : undefined,
            });
        }
    }

    await registrarHistorial({
        tabla: 'Horario_comida',
        idRegistro: id,
        cambios: cambiosParaHistorial,
        operacion: TipoOperacion.MODIFICAR,
        usuario: usuario,
        ipUsuario: ipUsuario,
    });

    if(data.horaCierre != null){
        programarCierres();
    }

    return await obtenerById(id);
}

export async function desactivar(id: number, usuario: string, ipUsuario: string) {
    await repo.update(id, {
        activo: false,
        usuarioCambio: usuario,
        fechaCambio: new Date(),
    });

    await registrarHistorial({
        tabla: 'Horario_comida',
        idRegistro: id,
        cambios: [{ campo: 'activo', valorAnterior: 'true', nuevoValor: 'false' }],
        operacion: TipoOperacion.ELIMINAR,
        usuario: usuario,
        ipUsuario: ipUsuario,
    })

    return await obtenerById(id);
}

export async function obtenertodos(): Promise<HorarioTiempoComida[]> {

    const registros = await repo.createQueryBuilder('e')
        .innerJoin('e.ValorCatalogo', 'v')
        .select([
            'e.id AS id',
            'v.valor AS tiempoComida',
            'CAST(e.horaCierre AS varchar) AS horaCierre',
            'CAST(e.horaModificacion AS varchar) AS horaModificacion'
        ])
        .andWhere('v.objCatalogoID = :idCatalogo', { idCatalogo: CATALOGO_COMIDA })
        .andWhere('e.activo = :activo', { activo: 1 })
        .getRawMany();
    return registros;
}


export async function obtenerHorariosXTiempoComida(idTiempoComida: number) {

    const registros = await repo.createQueryBuilder('e')
        .select([
            'e.id AS id',
            'CAST(e.horaCierre AS varchar) AS horaCierre',
            'CAST(e.horaModificacion AS varchar) AS horaModificacion'
        ])
        .andWhere('e.idTiempoComida = :idTiempoComida', { idTiempoComida: idTiempoComida })
        .andWhere('e.activo = :activo', { activo: 1 })
        .getRawMany();

    return registros;
}

export async function validarHorario(idTiempoComida: number, accion = 'modificacion'): Promise<boolean> {
    const horarios = await obtenerHorariosXTiempoComida(idTiempoComida);
    const ahora = new Date();
    const horaActual = ahora.toTimeString().slice(0, 5);

    if (!horarios || horarios.length == 0) {
        throw new HttpError("No existen horarios activos para ese tiempo de comida", 400);
    }

    if (accion === 'modificacion') {
        return horarios.some(h => {
            const inicio = h.horaModificacion;
            return horaActual <= inicio;
        });
    }

    if (accion === 'cierre') {
        return horarios.some(h => {
            const fin = h.horaCierre;
            return horaActual <= fin;
        });
    }

    if (accion === 'rango') {
        return horarios.some(h => {
            return horaActual >= h.horaModificacion && horaActual <= h.horaCierre;
        });
    }

    return false;
}

export async function programarCierres() {
    const horarios = await repo.query(`
    SELECT id_tiempo_comida, CAST(hora_final_cierre AS varchar) AS hora_final_cierre
    FROM Horario_comida
    WHERE activo = 1
  `);

    interface HorarioCierre {
        id_comida: number;
        hora_final_cierre: string;
    }

    const horariosTyped: HorarioCierre[] = (horarios as HorarioCierre[]);
    horariosTyped.forEach((h: HorarioCierre) => {
        programarCierreParaHorario(h.id_comida, h.hora_final_cierre);
    });
}

export function programarCierreParaHorario(idTiempoComida: number, horaLimite: string) {
    const [h, m, s] = horaLimite.split(':').map(Number);
    const ahora = new Date();
    const proximaEjecucion = new Date();
    proximaEjecucion.setHours(h, m, s || 0, 0);

    if (proximaEjecucion <= ahora) {
        proximaEjecucion.setDate(proximaEjecucion.getDate() + 1);
    }

    const msHastaEjecucion = proximaEjecucion.getTime() - ahora.getTime() + 60000;

    setTimeout(() => {
        cerrarSolicitudesPorTiempo(idTiempoComida);
        programarCierreParaHorario(idTiempoComida, horaLimite);
    }, msHastaEjecucion);
}


