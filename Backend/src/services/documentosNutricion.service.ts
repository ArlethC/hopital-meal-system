/*
    Archivo: documentoNutricion.service.ts
    Descripcion: lógica de negocio para crear, modificar, desactivar y obtener documentos de nutrición.
    Autor: Marilyn Castro
    Fecha creacion: 21/07/2025
    Version: 1.0.0
*/
import { OrigenDatos } from "../config/databaseORM";
import { DocumentoNutricion } from "../entities/DocumentosNutricion";
import { ValorCatalogoMedico } from "../entities/DocumentosNutricion";
import { HttpError } from "../utils/HttpError";
import { registrarHistorial, TipoOperacion } from "./historial.service";
import { toDocumentoDto } from "../dtos/documentosNutricion.dto";
import type { Documento } from "@miapp/shared";
import { CATALOGO_TIPO_DOCUMENTO } from "../config/Constantes";

const repo = OrigenDatos.getRepository(DocumentoNutricion);
const repo2 = OrigenDatos.getRepository(ValorCatalogoMedico);


export async function obtenerListTiposDocumentos() {
    const datos = await repo2.find({
        where: {
            objCatalogoID: CATALOGO_TIPO_DOCUMENTO,
            activo: true,
        },
        select: ['id', 'valor'],
    });

    return datos;
}

export async function crearDocumentoNutricion({
    expediente, idTipoDocumento, usuario, ipUsuario, rutaDocumento, obsDocumento, fechaInicial, fechaFinalVigencia }:
    {
        expediente: string; idTipoDocumento: number; usuario: string; ipUsuario: string; obsDocumento?: string, rutaDocumento: string; fechaInicial: string; fechaFinalVigencia?: string;
    }) {

    const nuevo = repo.create({
        expediente,
        idTipoDocumento,
        usuarioCreacion: usuario,
        ipUsuarioCreacion: ipUsuario,
        rutaDocumento,
        obsDocumento: obsDocumento ? obsDocumento : undefined,
        fechaInicial: fechaInicial,
        fechaFinalVigencia: fechaFinalVigencia ? fechaFinalVigencia : undefined
    });

    await repo.save(nuevo);

    return obtenerDocumentoId(nuevo.idDocumento)
}

export async function obtenerDocumentoId(idDocumento: number): Promise<Documento[]> {
    const registro = await repo
        .createQueryBuilder("doc")
        .innerJoin("doc.ValorCatalogoMedico", "c")
        .select([
            "doc.idDocumento",
            "c.valor",
            "doc.rutaDocumento",
            'doc.obsDocumento',
            'CONVERT(VARCHAR(10), doc.fechaInicial, 120) AS fechaInicial',
            'CONVERT(VARCHAR(10), doc.fechaFinalVigencia, 120) AS fechaFinalVigencia'
        ])
        .where('doc.idDocumento = :id', { id: idDocumento })
        .andWhere('c.objCatalogoID = :idCatalogo', { idCatalogo: CATALOGO_TIPO_DOCUMENTO })
        .andWhere('doc.activo = :activo', { activo: 1 })
        .getMany();

    return registro.map(toDocumentoDto);
}

export async function desactivarDocumentoNutricion(idDocumento: number, usuario: string, ipUsuario: string) {
    const documento = await obtenerDocumentoId(idDocumento);

    if (documento.length == 0) {
        throw new HttpError("No se encontro este recurso", 404);
    }

    await repo.update(idDocumento, {
        activo: false,
        usuarioActualizacion: usuario,
        fechaUltimaModificacion: new Date(),
    });

    await registrarHistorial({
        tabla: 'Documentos_nutricion',
        idRegistro: idDocumento,
        cambios: [{ campo: 'activo', valorAnterior: 'true', nuevoValor: 'false' }],
        operacion: TipoOperacion.ELIMINAR,
        usuario: usuario,
        ipUsuario: ipUsuario,
    })


    return await obtenerDocumentoId(idDocumento);
}

export async function obtenerDocumentosPaciente(expediente: string, limite: number, offset: number) {
    const hoy = new Date().toISOString().split('T')[0];

    const whereParams = {
        activo: true,
        expediente: expediente,
        hoy: hoy
    };

    const total = await repo
        .createQueryBuilder('doc')
        .innerJoin('doc.ValorCatalogoMedico', 'v')
        .where('doc.activo = :activo', whereParams)
        .andWhere('doc.expediente = :expediente', whereParams)
        .andWhere('(doc.fechaFinalVigencia IS NULL OR doc.fechaFinalVigencia >= :hoy)', whereParams)
        .getCount();

    const data = await repo
        .createQueryBuilder('doc')
        .innerJoin('doc.ValorCatalogoMedico', 'v')
        .where('doc.activo = :activo', whereParams)
        .andWhere('doc.expediente = :expediente', whereParams)
        .andWhere('(doc.fechaFinalVigencia IS NULL OR doc.fechaFinalVigencia >= :hoy)', whereParams)
        .select([
            'doc.idDocumento AS idDocumento',
            'v.valor',
            'doc.rutaDocumento AS rutaDocumento',
            'doc.obsDocumento AS obsDocumento',
            'CONVERT(VARCHAR(10), doc.fechaInicial, 120) AS fechaInicial',
            'CONVERT(VARCHAR(10), doc.fechaFinalVigencia, 120) AS fechaFinalVigencia',
        ])
        .orderBy('doc.fechaInicial', 'DESC')
        .offset(offset)
        .limit(limite)
        .getRawMany();

    return {
        data: data.map(toDocumentoDto),
        total: total,
        page: Math.floor(offset / limite) + 1,
        pageSize: limite,
        totalPages: Math.ceil(total / limite),
    };
}
