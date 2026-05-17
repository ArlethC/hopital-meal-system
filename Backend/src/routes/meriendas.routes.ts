/*
    Archivo: meriendas.routes.ts
    Descripcion: rutas para gestionar las meriendas de los pacientes.
    Autor: Marilyn Castro
    Fecha creacion: 31/07/2025
    Version: 1.0.0
*/
import { Router } from 'express';
const router = Router();
import { validarIdParam, validarExpedienteParam, validarBody } from '../middlewares/validaciones';
import { desactivarMeriendaPaciente, crearMeriendaPaciente, obtenerMeriendasPaciente, getDietasMerienda } from '../controllers/meriendas.controllers';
import { verificarPermisos } from '../middlewares/autenticacion';
import { crearMerienda } from '@miapp/shared';
import { paginacion } from "../middlewares/paginacion";

router.get('/paciente/:expediente', verificarPermisos('meriendas'), validarExpedienteParam, paginacion, obtenerMeriendasPaciente);

router.get('/dietas', verificarPermisos('meriendas'), getDietasMerienda);


router.post('/crear', verificarPermisos('meriendas'), validarBody(crearMerienda), crearMeriendaPaciente);

router.delete('/desactivar/:id', verificarPermisos('meriendas'), validarIdParam, desactivarMeriendaPaciente);

export default router;