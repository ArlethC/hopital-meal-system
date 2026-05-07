/*
    Archivo: rangosEdad.service.ts
    Descripcion: contiene la logica de negocio para crear, actualizar y desactivar rangos de edad.
    Autor: Marilyn Castro
    Fecha creacion: 30/06/2025
    Version: 1.0.2
*/

import { OrigenDatos } from "../config/databaseORM";
import { RangoEdadDietaMes } from "../entities/RangosEdadDietaMes";
import { convertirAMeses, convertirAMesesMax } from "../utils/funcionesFormatear";
import { Not } from "typeorm";
import { HttpError } from "../utils/HttpError";
import { registrarHistorial, TipoOperacion, Cambio } from "./historial.service";


const repo = OrigenDatos.getRepository(RangoEdadDietaMes);

async function existeSolapamiento(nuevoMin: number, nuevoMax: number) {
  const rangos = await repo.find({
    where: { activo: true }
  });

  return rangos.some(rango => {
    return (
      (nuevoMin < rango.edadMaxima && nuevoMax > rango.edadMinima)
    );
  });
}

async function existeSolapamientoModificacion(idActual: number, nuevaEdad: number) {
  const rangos = await repo.find({
    where: { activo: true, id: Not(idActual) }
  });

  return rangos.some(rango => {
    return (
      (nuevaEdad < rango.edadMaxima && nuevaEdad > rango.edadMinima)
    );
  });
}

async function existeDuplicado(nuevoMin: number, nuevoMax: number) {
  const rango = await repo.findOne({
    where: {
      edadMinima: nuevoMin,
      edadMaxima: nuevoMax,
      activo: true
    }
  });
  return !!rango;
}

export async function crearRangoEdad(data: Partial<RangoEdadDietaMes> & { unidad: "meses" | "años" }, usuario: string, ipUsuario: string) {

  const edad_min = convertirAMeses(data.edadMinima!, data.unidad);
  const edad_max = convertirAMesesMax(data.edadMaxima!, data.unidad);

  if (await existeDuplicado(edad_min, edad_max)) {
    throw new HttpError("Ya existe un rango con estos valores", 422);
  }

  if (await existeSolapamiento(edad_min, edad_max)) {
    throw new HttpError("El rango se solapa con uno existente", 422);
  }

  if (edad_min > edad_max) throw new HttpError("La edad mínima no puede ser mayor que la edad máxima", 400);

  const nuevo = repo.create({
    ...data,
    edadMinima: edad_min,
    edadMaxima: edad_max,
    usuarioCreacion: usuario,
    ipUsuarioCreacion: ipUsuario
  });
  return await repo.save(nuevo);
}

export async function obtenerTodos() {
  const data = await repo.findAndCount({
    where: { activo: true },
    select: ['id', 'descripcion', 'edadMinima', 'edadMaxima'],
  });

  return {
    data
  };
}

export async function obtenerPorId(id: number) {
  return await repo.findOne({
    where: { id },
    select: ['id', 'descripcion', 'edadMinima', 'edadMaxima'],
  });
}

export async function actualizar(id: number, cambios: Partial<RangoEdadDietaMes> & ({ unidad: "meses" | "años" } | undefined), usuario: string, ipUsuario: string) {
  const entidad = await obtenerPorId(id);

  if (!entidad) throw new HttpError('No encontrado', 404);

  if (cambios.edadMinima || cambios.edadMaxima) {
    let edad_min = entidad.edadMinima;
    let edad_max = entidad.edadMaxima;

    if (cambios.edadMinima) {
      edad_min = convertirAMeses(cambios.edadMinima, cambios.unidad!);
    }

    if (cambios.edadMaxima) {
      edad_max = convertirAMeses(cambios.edadMaxima, cambios.unidad!);
    }

    if (edad_min > edad_max) throw new HttpError("La edad mínima no puede ser mayor que la edad máxima", 400);

    if (await existeDuplicado(edad_min, edad_max)) {
      throw new HttpError("Ya existe un rango con estos valores", 422);
    }

    if (cambios.edadMinima && cambios.edadMaxima) {
      if (await existeSolapamiento(edad_min, edad_max)) {
        throw new HttpError("El rango se solapa con uno existente", 422);
      }
    } else {
      if (cambios.edadMinima) {
        if (await existeSolapamientoModificacion(id, edad_min)) {
          throw new HttpError("El rango se solapa con uno existente", 422);
        }
      }

      if (cambios.edadMaxima) {
        if (await existeSolapamientoModificacion(id, edad_max)) {
          throw new HttpError("El rango se solapa con uno existente", 422);
        }
      }
    }

    cambios.edadMinima = edad_min;
    cambios.edadMaxima = edad_max;
  }

  const { unidad, ...cambiosSinUnidad } = cambios;

  await repo.update(id, {
    ...cambiosSinUnidad,
    usuarioCambio: usuario,
    fechaCambio: new Date(),
  });

  const cambiosParaHistorial: Cambio[] = [];

  if (cambios.edadMinima != null) {
    cambiosParaHistorial.push({
      campo: 'edad_minima',
      valorAnterior: String(entidad.edadMinima),
      nuevoValor: String(cambios.edadMinima),
    });
  }

  if (cambios.edadMaxima != null) {
    cambiosParaHistorial.push({
      campo: 'edad_maxima',
      valorAnterior: String(entidad.edadMaxima),
      nuevoValor: String(cambios.edadMaxima),
    });
  }

  await registrarHistorial({
    tabla: 'Rangos_edad_dietas_meses',
    idRegistro: id,
    cambios: cambiosParaHistorial,
    operacion: TipoOperacion.MODIFICAR,
    usuario: usuario,
    ipUsuario: ipUsuario,
  })


  return await obtenerPorId(id);
}

export async function desactivar(id: number, usuario: string, ipUsuario: string) {
  await repo.update(id, {
    activo: false,
    usuarioCambio: usuario,
    fechaCambio: new Date(),
  });

  await registrarHistorial({
        tabla: 'Rangos_edad_dietas_meses',
        idRegistro: id,
        cambios: [{ campo: 'activo', valorAnterior: 'true', nuevoValor: 'false' }],
        operacion: TipoOperacion.ELIMINAR,
        usuario: usuario,
        ipUsuario: ipUsuario,
    })


  return await obtenerPorId(id);
}



