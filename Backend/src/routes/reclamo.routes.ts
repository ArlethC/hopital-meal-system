/*
    Archivo: reclamos.routes.ts
    Descripcion: rutas para crear, modificar, desactivar y obtener los reclamos.
    Autor: Marilyn Castro
    Fecha creacion: 23/07/2025
    Version: 2.0.0
*/
import { Router } from 'express';
const router = Router();
import { verificarPermisos, verificarSesion } from '../middlewares/autenticacion';
import { validarBody, validarIdParam } from '../middlewares/validaciones';
import { modificarRangoEdadSchema } from '@miapp/shared';
import { upload } from '../middlewares/subirArchivo';
import {reclamoObtener, reclamoResuelto, reclamoModificar, reclamoCrear, reclamoTiposObtener } from "../controllers/reclamos.controllers";


router.post('/crear/:id', verificarPermisos("crear solicitud"), validarIdParam, upload.single('archivo'), reclamoCrear);

router.patch('/modificar/:id', verificarPermisos("crear solicitud"), validarIdParam, validarBody(modificarRangoEdadSchema), reclamoModificar);

router.patch('/solucionado/:id', verificarPermisos("crear solicitud"), validarIdParam, reclamoResuelto);

router.get('/obtener/:id', verificarSesion, validarIdParam, reclamoObtener);

router.get('/tipos', verificarPermisos("crear solicitud"), reclamoTiposObtener);




export default router;
