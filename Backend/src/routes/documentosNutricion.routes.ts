/*
    Archivo: documentoNutricion.routes.ts
    Descripcion: rutas para crear, modificar, desactivar y obtener documentos de nutrición.
    Autor: Marilyn Castro
    Fecha creacion: 21/07/2025
    Version: 1.0.0
*/
import { Router } from 'express';
const router = Router();
import { validarIdParam, validarExpedienteParam } from '../middlewares/validaciones';
import { crearDocumento, desactivarDocumento, obtenerTiposDocumentos, documentosPaciente } from '../controllers/documentoNutricion.controllers';
import { upload } from '../middlewares/subirArchivo';
import { verificarPermisos, verificarSesion } from '../middlewares/autenticacion';
import { paginacion } from "../middlewares/paginacion";


router.get('/tiposDocumento', verificarPermisos('nutricion'), obtenerTiposDocumentos);
router.post('/crear', verificarPermisos('nutricion'), upload.single('archivo'), crearDocumento);

router.get('/paciente/:expediente', verificarSesion, validarExpedienteParam, paginacion, documentosPaciente);

router.delete('/desactivar/:id', verificarPermisos('nutricion'), validarIdParam, desactivarDocumento);



export default router;