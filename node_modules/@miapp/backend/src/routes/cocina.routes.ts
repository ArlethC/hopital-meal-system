/*
    Archivo: cocina.routes.ts
    Descripcion: rutas de la pantalla de resumen de solicitud de dietas y meriendas para cocina.
    Autor: Marilyn Castro
    Fecha creacion: 7/08/2025
    Version: 1.0.1
*/
import { Router } from 'express';
const router = Router();
import { verificarSesion } from '../middlewares/autenticacion';
import { validarIdParam } from '../middlewares/validaciones';
import { resumenCocina, resumenMeriendas, etiquetaIndividualPaciente, etiquetasPacienteSala } from '../controllers/cocina.controllers';


router.get('/resumen', verificarSesion, resumenCocina);

router.get('/meriendas', verificarSesion, resumenMeriendas);

router.post('/etiquetaIndividual/:id', verificarSesion, validarIdParam, etiquetaIndividualPaciente );

router.post('/etiquetasSala/:id', verificarSesion, validarIdParam, etiquetasPacienteSala );


export default router;