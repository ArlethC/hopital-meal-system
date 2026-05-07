/*
    Archivo: rangosEdad.routes.ts
    Descripcion: contiene las rutas para gestionar los rangos de edad.
    Autor: Marilyn Castro
    Fecha creacion: 2/07/2025
    Version: 1.0.1
*/

import { Router } from 'express';
const router = Router();
import { validarBody, validarIdParam } from '../middlewares/validaciones';
import { verificarPermisos } from '../middlewares/autenticacion';
import { CrearRangoEdadSchema, ActualizarRangoEdadSchema } from '../dtos/rangosEdad.dto';
import { crearRangoEdadController, obtenerRangosEdadController, actualizarRangoEdad, desactivarRangoEdad } from '../controllers/rangosEdad.controllers';

router.post('/crear', verificarPermisos("admin"), validarBody(CrearRangoEdadSchema), crearRangoEdadController);

router.get('/obtenerTodos',  verificarPermisos("admin"), obtenerRangosEdadController);

router.put('/modificar/:id', verificarPermisos("admin"), validarIdParam, validarBody(ActualizarRangoEdadSchema), actualizarRangoEdad);

router.delete('/eliminar/:id',verificarPermisos("admin"), validarIdParam, desactivarRangoEdad);

export default router;