/*
    Archivo: documentoNutricion.controllers.ts
    Descripcion: controladores para crear, modificar, desactivar y obtener documentos de nutrición.
    Autor: Marilyn Castro
    Fecha creacion: 21/07/2025
    Version: 1.0.2
*/
import { Request, Response, NextFunction } from 'express';
import { obtenerListTiposDocumentos, crearDocumentoNutricion, desactivarDocumentoNutricion, obtenerDocumentosPaciente } from '../services/documentosNutricion.service';
import { existePaciente } from '../services/paciente.service';
import path from 'path';
import { CrearDocumentoShema } from '../dtos/documentosNutricion.dto';
import fs from 'fs';

import { RUTA_UPLOADS } from '../config/Constantes';

export const obtenerTiposDocumentos = async (_req: Request, res: Response, next: NextFunction) => {
    try {

        const tiposDocumento = await obtenerListTiposDocumentos();

        if (!tiposDocumento || tiposDocumento.length === 0) {
            res.status(404).json({ error: 'No existen tipos de documentos activos' });
            return;
        }
        res.json(tiposDocumento);

    } catch (error: any) {
        next(error);
    }
};

export const desactivarDocumento = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const usuario = req.user;
        const ipUsuario: string = req.ip ?? 'IP_DESCONOCIDA';

        const documento = await desactivarDocumentoNutricion(Number(id), usuario, ipUsuario);

        res.json(documento);

    } catch (error: any) {
        next(error);
    }
};

export const crearDocumento = async (req: Request, res: Response, next: NextFunction) => {
    const eliminarArchivoSubido = () => {
        if (req.file) {
            const filePath = path.join(RUTA_UPLOADS, req.file.filename);
            fs.unlink(filePath, (err) => {
                if (err) console.error('Error eliminando archivo:', err);
                else console.log('Archivo eliminado tras fallo:', req.file?.filename);
            });
        }
    };

    try {
        const result = CrearDocumentoShema.safeParse({
            expediente: req.body.expediente,
            idTipoDocumento: parseInt(req.body.idTipoDocumento),
            fechaInicial: req.body.fechaInicial,
            fechaFinalVigencia: req.body.fechaFinalVigencia,
            archivo: req.file,
            obsDocumento: req.body.obsDocumento
        });

        if (!result.success) {
            eliminarArchivoSubido();
            const issues = result.error.issues
                .map(issue => `${issue.path.join('.')}: ${issue.message}`)
                .join(' | ');
            res.status(400).json({
                error: issues,
            });
            return;
        }

        const paciente = await existePaciente(result.data.expediente);

        if (!paciente || paciente.length === 0) {
            eliminarArchivoSubido();
            res.status(404).json({ error: 'No se encontró el paciente con el expediente proporcionado' });
            return;
        }

        const usuario = req.user;
        const ipUsuario: string = req.ip ?? 'IP_DESCONOCIDA';

        const rutaDocumento = path.join('uploads', result.data.archivo.filename);

        const documento = await crearDocumentoNutricion({
            expediente: result.data.expediente,
            idTipoDocumento: result.data.idTipoDocumento,
            usuario: usuario,
            ipUsuario: ipUsuario,
            fechaInicial: result.data.fechaInicial,
            fechaFinalVigencia: result.data.fechaFinalVigencia,
            rutaDocumento: rutaDocumento,
            obsDocumento: result.data.obsDocumento,
        });

        if (!documento || documento.length === 0) {
            eliminarArchivoSubido();
            res.status(500).json({ error: 'Error al crear el documento' });
            return;
        }

        res.status(200).json(documento);

    } catch (error) {
        eliminarArchivoSubido();
        next(error);
    }
};

export const documentosPaciente = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { expediente } = req.params;
        const { limite, offset } = req.paginacion ?? { limite: 10, offset: 0 };

        const paciente = await existePaciente(expediente);

        if (paciente.length === 0) {
            res.status(404).json({ error: 'No se encontró el paciente con el expediente proporcionado' });
            return;
        }

        const documentos = await obtenerDocumentosPaciente(expediente, limite, offset);

        documentos.data.forEach(doc => {
            doc.rutaDocumento = '/' + doc.rutaDocumento.replace(/\\/g, '/');
        });

        res.json(documentos);

    } catch (error: any) {
        next(error);
    }
};

