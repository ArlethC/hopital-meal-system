/*
    Archivo: horarioTiemposComida.routes.ts
    Descripcion: rutas para gestionar los horarios de los tiempos de comida.
    Autor: Marilyn Castro
    Fecha creacion: 7/07/2025
    Version: 1.0.0
*/
import { Router } from 'express';
const router = Router();
import { CrearTiempoComidaHorarioShema, ModificarTiempoComidaHorarioShema } from '../dtos/horariosTiempoComida.dto';
import { validarBody, validarIdParam } from '../middlewares/validaciones';
import { verificarPermisos } from '../middlewares/autenticacion';
import { crearHorarioTiempoComida, obtener, actualizarHorarioComida, desactivarHorarioComida } from '../controllers/horariosTiemposComida.controllers';


router.post('/crear',verificarPermisos("admin"), validarBody(CrearTiempoComidaHorarioShema), crearHorarioTiempoComida);

router.get('/todos', verificarPermisos("admin"), obtener);

router.put('/modificar/:id',verificarPermisos("admin"), validarIdParam, validarBody(ModificarTiempoComidaHorarioShema), actualizarHorarioComida);

router.delete('/desactivar/:id',verificarPermisos("admin"), validarIdParam, desactivarHorarioComida);


export default router;