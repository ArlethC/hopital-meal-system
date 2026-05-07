/*
    Archivo: dietasEdadTiempoComida.service.ts
    Descripcion: lógica de negocio de los grupos de dietas, rango de edad y tiempos de comida.
    Autor: Marilyn Castro
    Fecha creacion: 3/07/2025
    Version: 1.0.0
*/
import { OrigenDatos } from "../config/databaseORM";
import { bd } from '../config/database';
import { DietaTiempoComidaEdad } from '../entities/DietaEdadTiempoComida';
import { HttpError } from "../utils/HttpError";
import { registrarHistorial, TipoOperacion, Cambio } from "./historial.service";
import { existeIdTiempoComida } from "./horariosTiempoComida.service";
import { toDietaEdadDto } from "../dtos/dietasEdadTiempoComida.dto";

const repo = OrigenDatos.getRepository(DietaTiempoComidaEdad);

export async function obtenerPorId(id: number) {
  return await repo.findOne({
    where: { id },
    select: ['id', 'idDieta', 'idTiempoComida', 'idRangoEdad'],
  });
}

const mapeoCamposBD: Record<string, string> = {
  idRangoEdad: 'rango_edad_id',
  idTiempoComida: 'id_comida',
  abrevDieta: 'abrev_nombre_dieta',
};

export async function actualizar(id: number, cambios: Partial<DietaTiempoComidaEdad>, usuario: string, ipUsuario: string) {
  const entidad = await obtenerPorId(id);

  if (!entidad) throw new HttpError('No encontrado', 404);

  await repo.update(id, {
    ...cambios,
    usuarioCambio: usuario,
    fechaCambio: new Date(),
  });

  const cambiosParaHistorial: Cambio[] = [];

  for (const key in cambios) {
    if (cambios.hasOwnProperty(key)) {
      const valorAnterior = entidad[key as keyof DietaTiempoComidaEdad];
      const nuevoValor = cambios[key as keyof DietaTiempoComidaEdad];

      cambiosParaHistorial.push({
        campo: mapeoCamposBD[key] ?? key,
        valorAnterior: valorAnterior != null ? String(valorAnterior) : undefined,
        nuevoValor: nuevoValor != null ? String(nuevoValor) : undefined,
      });
    }
  }

  await registrarHistorial({
    tabla: 'Dieta_comida_edad',
    idRegistro: id,
    cambios: cambiosParaHistorial,
    operacion: TipoOperacion.MODIFICAR,
    usuario: usuario,
    ipUsuario: ipUsuario,
  })


  return await obtenerFiltrando({ limite: 10, offset: 0, id });
}

export async function desactivar(id: number, usuario: string, ipUsuario: string) {
  await repo.update(id, {
    activo: false,
    usuarioCambio: usuario,
    fechaCambio: new Date(),
  });

  await registrarHistorial({
    tabla: 'Dieta_comida_edad',
    idRegistro: id,
    cambios: [{ campo: 'activo', valorAnterior: 'true', nuevoValor: 'false' }],
    operacion: TipoOperacion.ELIMINAR,
    usuario: usuario,
    ipUsuario: ipUsuario,
  })


  return await obtenerPorId(id);
}

export async function obtenerFiltrando({ limite, offset, idTiempoComida, idRangoEdad, dieta, id }: { limite: number, offset: number, idTiempoComida?: number, idRangoEdad?: number, dieta?: string, id?: number, }) {

  let query =
    `
    SELECT id_dieta_comida_edad, d.id_dieta, d.descripcion, tc.id_valor_catalogo, valor_catalogo, re.id_rango_edad, re.descripcion_rango, re.edad_minima, re.edad_maxima, dte.abrev_nombre_dieta
    FROM Dieta_comida_edad dte INNER JOIN 
	  Rangos_edad_dietas_meses re ON dte.rango_edad_id = re.id_rango_edad
	  INNER JOIN Valores_catalogo_medico tc ON tc.id_valor_catalogo = dte.id_comida
	  INNER JOIN Dietas d ON dte.id_dieta = d.id_dieta
    `;

  const parametros: { nombre: string; valor: string | number }[] = [
    { nombre: 'offset', valor: offset },
    { nombre: 'limite', valor: limite },
  ];

  const condiciones: string[] = ['dte.activo = 1', `d.activo = 1`, 're.activo = 1'];

  if (idTiempoComida) {
    condiciones.push('dte.id_comida = @idTiempoComida');
    parametros.push({ nombre: 'idTiempoComida', valor: idTiempoComida });
  }

  if (idRangoEdad) {
    condiciones.push('dte.rango_edad_id = @idRangoEdad');
    parametros.push({ nombre: 'idRangoEdad', valor: idRangoEdad });
  }

  if (id) {
    condiciones.push('dte.id_dieta_comida_edad = @id');
    parametros.push({ nombre: 'id', valor: id });
  }

  if (dieta && dieta.trim() !== '') {
    condiciones.push('d.descripcion LIKE @dieta');
    parametros.push({ nombre: 'dieta', valor: `%${dieta.trim()}%` });
  }

  if (condiciones.length > 0) {
    query += 'WHERE ' + condiciones.join(' AND ');
  }
  
  query += `
    ORDER BY dte.id_dieta_comida_edad
    OFFSET @offset ROWS FETCH NEXT @limite ROWS ONLY
  `;

  const data = await bd.consultaBD(query, parametros);

  let query2 =
    `
    SELECT COUNT(*) AS total
    FROM Dieta_comida_edad dte INNER JOIN 
	  Rangos_edad_dietas_meses re ON dte.rango_edad_id = re.id_rango_edad
	  INNER JOIN Valores_catalogo_medico tc ON tc.id_valor_catalogo = dte.id_comida
	  INNER JOIN Dietas d ON dte.id_dieta = d.id_dieta
    `;

  if (condiciones.length > 0) {
    query2 += 'WHERE ' + condiciones.join(' AND ');
  }
  
  const parametrosCount = parametros.filter(p => p.nombre !== 'offset' && p.nombre !== 'limite');

  const totalConsulta = await bd.consultaBD(query2, parametrosCount);

  const total = parseInt(totalConsulta.recordset[0].total, 10);

  return {
    data: data.recordset.map(toDietaEdadDto),
    total: total,
    page: Math.floor(offset / limite) + 1,
    pageSize: limite,
    totalPages: Math.ceil(total / limite),
  };
}

export async function crear(data: { idDietas: { codigo: number, abrevDieta: string | null }[], idTiempoComida: number, idRangoEdad: number }, usuario: string, ipUsuario: string) {
  await existeIdTiempoComida(data.idTiempoComida!);

  const codigosDietas = data.idDietas.map(d => d.codigo);

  // Validar que todas las dietas existen
  const placeholders = codigosDietas.map((_, i) => `@dieta${i}`).join(",");
  const params = codigosDietas.map((valor, i) => ({ nombre: `dieta${i}`, valor: valor }));

  const articulos = await bd.consultaBD(
    `SELECT A.id_dieta
    FROM Dietas A
    WHERE A.activo = 1 AND
    A.id_dieta IN (${placeholders})`,
    params
  );

  const dietasEncontradas = articulos.recordset.map((row: any) => row.id_dieta);
  
  const dietasValidas = data.idDietas.filter(d => dietasEncontradas.includes(d.codigo));

  if (dietasValidas.length === 0) {
    throw new HttpError(`Las dietas seleccionadas no existen.`, 404);
  }

  // Verificar duplicados
  const duplicados = await repo.find({
    where: dietasValidas.map(d => ({
      idDieta: d.codigo,
      idTiempoComida: data.idTiempoComida,
      idRangoEdad: data.idRangoEdad,
      activo: true
    }))
  });

  const codigosDuplicados = duplicados.map(d => d.idDieta);

  // Filtrar solo los que no están duplicados
  const dietasParaInsertar = dietasValidas.filter(d => !codigosDuplicados.includes(d.codigo));

  if (dietasParaInsertar.length === 0) {
    throw new HttpError(`Todas las dietas ya estan relacionadas a ese tiempo de comida y rango de edad`, 400);
  }

  const nuevosRegistros = dietasParaInsertar.map(d => ({
    idDieta: d.codigo,
    abreviatura: d.abrevDieta ?? null,
    idTiempoComida: data.idTiempoComida,
    idRangoEdad: data.idRangoEdad,
    usuarioCreacion: usuario,
    ipUsuarioCreacion: ipUsuario,
  }));

  const guardados = await repo.save(nuevosRegistros); 

  return guardados;
}


