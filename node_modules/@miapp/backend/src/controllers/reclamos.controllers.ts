/*
    Archivo: reclamos.controllers.ts
    Descripcion: controladores para crear, modificar, desactivar, obtener y resolver reclamos.
    Autor: Marilyn Castro
    Fecha creacion: 23/07/2025
    Version: 2.0.0
*/
import { Request, Response, NextFunction } from 'express';
import { estadoReclamo, modificarReclamo, crearReclamo, verificarExisteDetalle, obtenerReclamo, obtenerTiposReclamos } from '../services/reclamos.service';
import { CrearReclamoSchema } from '../dtos/reclamos.dto';
import path from 'path';
import fs from 'fs';

import { RUTA_UPLOADS } from '../config/Constantes';

export const reclamoCrear = async (req: Request, res: Response, next: NextFunction) => {
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
        const { id } = req.params;
        const usuario = req.user;
        const ipUsuario: string = req.ip ?? 'IP_DESCONOCIDA';


        const rutaDocumento = req.file ? path.join('uploads', req.file.filename) : undefined;

        const result = CrearReclamoSchema.safeParse({
            idReclamo: parseInt(req.body.idReclamo),
            observacion: req.body.observacion,
        });

        if (req.file && result.data) {
            result.data.archivo = rutaDocumento;
        }

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

        const existeDetalle = await verificarExisteDetalle(Number(id));

        if (!existeDetalle) {
            eliminarArchivoSubido();
            res.status(404).json({ error: 'Recurso no encontrado' });
            return;
        }

        const respuesta = await crearReclamo(Number(id), usuario, ipUsuario, result.data);

        res.json(respuesta);
    } catch (error: any) {
        eliminarArchivoSubido();
        next(error);
    }
}

export const reclamoModificar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const datos = req.body;
        const usuario = req.user;
        const ipUsuario: string = req.ip ?? 'IP_DESCONOCIDA';

        const existeDetalle = await verificarExisteDetalle(Number(id));

        if (!existeDetalle) {
            res.status(404).json({ error: 'Recurso no encontrado' });
            return;
        }

        await modificarReclamo(Number(id), usuario, ipUsuario, datos);

        res.json({ message: 'Reclamo modificado' });
    } catch (error: any) {
        next(error);
    }
}

export const reclamoResuelto = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const usuario = req.user;
        const ipUsuario: string = req.ip ?? 'IP_DESCONOCIDA';

        const existeDetalle = await verificarExisteDetalle(Number(id));

        if (!existeDetalle) {
            res.status(404).json({ error: 'Recurso no encontrado' });
            return;
        }

        await estadoReclamo(Number(id), usuario, ipUsuario);

        res.json({ message: 'Reclamo solucionado' });
    } catch (error: any) {
        next(error);
    }
}

export const reclamoObtener = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const reclamo = await obtenerReclamo(Number(id));

        if (!reclamo) {
            res.status(404).json({ error: 'Reclamo no encontrado' });
            return;
        }

        if (reclamo.archivo) {
            reclamo.archivo = '/' + reclamo.archivo.replace(/\\/g, '/');
        }

        res.json(reclamo);
    } catch (error: any) {
        next(error);
    }
}

export const reclamoTiposObtener = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tiposreclamo = await obtenerTiposReclamos();

        if (tiposreclamo.length === 0) {
            res.status(404).json({ error: 'No existen tipos de reclamo' });
            return;
        }

        res.json(tiposreclamo);
    } catch (error: any) {
        next(error);
    }
}