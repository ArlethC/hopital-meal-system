/*
    Archivo: dietas.service.ts
    Descripcion: logica de negocio y acceso a base de datos para obtener las dietas y tiempos de comida.
    Autor: Marilyn Castro
    Fecha creacion: 3/07/2025
    Version: 1.0.0
*/

import { bd } from '../config/database';
import { HttpError } from "../utils/HttpError";

export async function obtenerDietas(valorBusqueda: string, limite: number, offset: number) {
    const busqueda = `%${valorBusqueda}%`;

    let query =
        `
    SELECT A.id_dieta AS codigo, A.descripcion AS nombre
    FROM Dietas A
    WHERE A.activo = 1 AND A.descripcion LIKE @busqueda
    ORDER BY A.id_dieta
    OFFSET @offset ROWS FETCH NEXT @limite ROWS ONLY
    `;

    const parametros = [
        { nombre: 'busqueda', valor: busqueda },
        { nombre: 'offset', valor: offset },
        { nombre: 'limite', valor: limite },
    ];

    const dietas = await bd.consultaBD(query, parametros);


    let query2 = 
        `
    SELECT COUNT(*) AS total
    FROM Dietas A
    WHERE A.activo = 1 AND A.descripcion LIKE @busqueda
    `;

    const totalParametros = [{ nombre: 'busqueda', valor: busqueda }];

    const totalConsulta = await bd.consultaBD(query2, totalParametros);

    const total = parseInt(totalConsulta.recordset[0].total, 10);

    return {
        data: dietas.recordset,
        total: total,
        page: Math.floor(offset / limite) + 1,
        pageSize: limite,
        totalPages: Math.ceil(total / limite),
    };
}

export async function validarDietaExiste(idDieta: number) {
    const articulo = await bd.consultaBD(
        'SELECT 1 FROM Dietas WHERE id_dieta = @dieta',
        [ { nombre: 'dieta', valor: idDieta}]
    );
    if (articulo.recordset.length === 0) {
        throw new HttpError("El artículo especificado no existe", 400);
    }
    return true;
}

export async function obtenerTiemposComida() {
    const query = `
    SELECT id_valor_catalogo AS id, valor_catalogo valor
    FROM Valores_catalogo_medico
    WHERE id_catalogo = 3 AND activo = 1
    `;

    const tiemposComida = await bd.consultaBD(query);

    return tiemposComida.recordset;
}

export async function dietasMeriendas() {
    const dietas = await bd.consultaBD(`SELECT A.id_dieta AS codigo, A.descripcion AS nombre
    FROM Dietas A
    WHERE A.activo = 1
      AND A.descripcion LIKE 'M%'`);

    return dietas.recordset;
}

