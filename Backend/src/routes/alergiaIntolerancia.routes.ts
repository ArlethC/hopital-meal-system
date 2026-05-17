/*
    Archivo: alergiaIntolerancia.routes.ts
    Descripcion: rutas para gestionar las alergias.
    Autor: Marilyn Castro
    Fecha creacion: 16/07/2025
    Version: 1.0.0
*/
import { Router } from 'express';
const router = Router();

import { validarBody, validarIdParam } from '../middlewares/validaciones';
import { crearAlergiaController, modificarAlergiaController, desactivarAlergiaController, getAlergias } from "../controllers/alergiaIntolerancia.controllers";
import { crearAlergiaShema, modificarAlergiaShema } from "@miapp/shared";
import { verificarPermisos } from '../middlewares/autenticacion';


router.post('/crear', verificarPermisos("crear alergias"),  validarBody(crearAlergiaShema), crearAlergiaController);

router.patch('/modificar', verificarPermisos("crear alergias"),  validarBody(modificarAlergiaShema), modificarAlergiaController);

router.delete('/desactivar/:id', verificarPermisos("crear alergias"),  validarIdParam, desactivarAlergiaController);

router.get('/todas/:expediente', verificarPermisos(["ver alergias", "crear alergias" ]), getAlergias);

export default router;
