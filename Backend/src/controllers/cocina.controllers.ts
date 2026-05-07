/*
    Archivo: cocina.controllers.ts
    Descripcion: controlador de la pantalla de resumen de solicitud de dietas y meriendas para cocina.
    Autor: Marilyn Castro
    Fecha creacion: 7/08/2025
    Version: 1.0.1
*/
import { Request, Response, NextFunction } from 'express';
import { obtenerResumenCocina, obtenerResumenMeriendas } from '../services/cocina.service';
import { infoPacientesSalaEtiqueta, obtenerInfoPacienteEtiqueta } from '../services/paciente.service';
import { generarEtiquetaPaciente } from '../utils/etiquetasPrint';

export const resumenCocina = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const resumen = await obtenerResumenCocina();

        res.json(resumen);

    } catch (error: any) {
        next(error);
    }
};

export const resumenMeriendas = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const resumen = await obtenerResumenMeriendas();

        res.json(resumen);

    } catch (error: any) {
        next(error);
    }
};

export const etiquetaIndividualPaciente = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const infoPaciente = await obtenerInfoPacienteEtiqueta(Number(id));

        const pdfBuffer = await generarEtiquetaPaciente(infoPaciente);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline; filename=etiquetaIndividual.pdf");
        res.send(pdfBuffer);

    } catch (error: any) {
        next(error);
    }
};

export const etiquetasPacienteSala = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const infoPaciente = await infoPacientesSalaEtiqueta(Number(id));

        const pdfBuffer = await generarEtiquetaPaciente(infoPaciente);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline; filename=etiquetasSala.pdf");
        res.send(pdfBuffer);

    } catch (error: any) {
        next(error);
    }
};