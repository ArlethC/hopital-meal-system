/*
    Archivo: meriendas.controllers.ts
    Descripcion: Controlador para gestionar las meriendas de los pacientes.
    Autor: Marilyn Castro
    Fecha creacion: 31/07/2025
    Version: 1.0.0
*/
import { Request, Response, NextFunction } from 'express';
import { desactivarMerienda, meriendasPaciente, crearDetallesMerienda } from '../services/meriendas.service';
import { TIEMPOS_COMIDA } from '../config/Constantes';
import { dietasMeriendas } from '../services/dietas.service';

export const obtenerMeriendasPaciente = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { expediente } = req.params;
        const { limite, offset } = req.paginacion ?? { limite: 10, offset: 0 };
        const tipoBusqueda = (req.query.search as string) || '';

        const todasMeriendas = tipoBusqueda === 'historial' ? true : false;
        const meriendas = await meriendasPaciente(expediente, todasMeriendas, limite, offset);

        res.json(meriendas);

    } catch (error: any) {
        next(error);
    }
};

export const crearMeriendaPaciente = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const datos = req.body;
        const usuario = req.user;
        const ipUsuario: string = req.ip ?? 'IP_DESCONOCIDA';

        // EL unico tiempo de comida pueden ser Meriendas
        if (datos.idTiempoComida !== TIEMPOS_COMIDA.MERIENDA_AM && datos.idTiempoComida !== TIEMPOS_COMIDA.MERIENDA_PM) {
            res.status(422).json({ error: 'Solo puede crear meriendas AM o PM.' });
            return;
        }

        const nuevaMerienda = await crearDetallesMerienda(datos, usuario, ipUsuario);

        if (nuevaMerienda && nuevaMerienda.length === 0) {
            res.status(400).json({ error: "Error al crear la merienda" });
        }else{
            res.status(200).json({ message: 'Merienda creada' });
        }

    } catch (error: any) {
        next(error);
    }
};

export const desactivarMeriendaPaciente = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const usuario = req.user;
        const ipUsuario: string = req.ip ?? 'IP_DESCONOCIDA';

        await desactivarMerienda(Number(id), usuario, ipUsuario);

        res.status(200).json({ message: 'Merienda desactivada' });
    } catch (error: any) {
        next(error);
    }
};

export const getDietasMerienda = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const dietas = await dietasMeriendas();

        res.status(200).json(dietas);
    } catch (error: any) {
        next(error);
    }
};