/*
    Archivo: alergiaIntolerancias.service.ts
    Descripcion: lógica de negocio para gestionar las alergias.
    Autor: Marilyn Castro
    Fecha creacion: 16/07/2025
    Version: 1.0.1
*/
import { OrigenDatos } from "../config/databaseORM";
import { AlergiasIntoleranciasPaciente } from "../entities/AlergiasIntolerancias";
import { HttpError } from "../utils/HttpError";
import { toAlergiaOutputDto } from "../dtos/alergiasIntolerancias.dto";
import { registrarHistorial, TipoOperacion } from "./historial.service";
import { existePaciente } from "./paciente.service";
import { pacienteActualizaPantalla } from './solictudSocket.service';
import { actualizarPantallaSolicitudes } from '../socket/emitters/solicitudes.emitters';
import { actualizarPantallaMeriendas } from '../socket/emitters/meriendas.emitters';

const repo = OrigenDatos.getRepository(AlergiasIntoleranciasPaciente);

export async function crearAlergiaIntolerancia(expediente: string, nombre: string, usuario: string, ipUsuario: string) {
    const paciente = await existePaciente(expediente);

    if (paciente.length === 0) {
        throw new HttpError("No se encontro este paciente", 404);
    }

    const nuevo = repo.create({
        expediente: expediente,
        alergiasIntolerancias: nombre,
        usuarioCreacion: usuario,
        ipUsuarioCreacion: ipUsuario,
    });

    await repo.save(nuevo);

    const result = await pacienteActualizaPantalla(expediente);
    if (result.aplica) {
        if (result.tipo === 'MERIENDA') {
            await actualizarPantallaMeriendas();
        } else {
            if (result.tipo === 'MULTIPLE') {
                await actualizarPantallaMeriendas();
                await actualizarPantallaSolicitudes();
            } else {
                await actualizarPantallaSolicitudes();
            }
        }
    }

    return obtenerPorId(nuevo.id)
}

export async function obtenerPorId(id: number) {
    return await repo.find({
        where: { id, activo: true },
        select: ['id', 'alergiasIntolerancias'],
    });
}

export async function modificarAlergiaIntolerancia(id: number, nombre: string, usuario: string, ipUsuario: string) {
    const alergia = await obtenerPorId(id);

    if (alergia.length === 0) {
        throw new HttpError("No se encontro este recurso", 404);
    }

    await repo.update(id, {
        alergiasIntolerancias: nombre,
        usuarioCambio: usuario,
        fechaCambio: new Date(),
    });

    await registrarHistorial({
        tabla: 'Alergias_intolerancias',
        idRegistro: id,
        cambios: [{ campo: 'intolerancia_alergia', valorAnterior: alergia[0].alergiasIntolerancias, nuevoValor: nombre }],
        operacion: TipoOperacion.MODIFICAR,
        usuario: usuario,
        ipUsuario: ipUsuario,
    })

    return await obtenerPorId(id);
}

export async function desactivarAlergiaIntolerancia(id: number, usuario: string, ipUsuario: string) {
    const alergia = await obtenerPorId(id);

    if (alergia.length === 0) {
        throw new HttpError("No se encontro este recurso", 404);
    }

    await repo.update(id, {
        activo: false,
        usuarioCambio: usuario,
        fechaCambio: new Date(),
    });

    await registrarHistorial({
        tabla: 'Alergias_intolerancias',
        idRegistro: id,
        cambios: [{ campo: 'activo', valorAnterior: 'true', nuevoValor: 'false' }],
        operacion: TipoOperacion.ELIMINAR,
        usuario: usuario,
        ipUsuario: ipUsuario,
    })

    return await obtenerPorId(id);
}

export async function obtenerAlergiaIntolerancia(expediente: string) {
    const alergias = await repo.find({
        where: {
            expediente,
            activo: true,
        },
        select: ['id', 'alergiasIntolerancias'],
    });

    const resultados = await OrigenDatos
        .createQueryBuilder()
        .select('cl.id_paciente', 'expediente')
        .addSelect('cl.nombre_paciente', 'paciente')
        .addSelect('dbo.CalcularEdad(cl.fecha_nacimiento)', 'edad')
        .from('Pacientes', 'cl')
        .where('cl.id_paciente = :expediente', { expediente })
        .getRawOne();

    if (!resultados || resultados.length === 0) {
        throw new HttpError(`No se encontró información para el expediente: ${expediente}`, 404);
    }

    return toAlergiaOutputDto({
        ...resultados,
        alergias,
    });
}


