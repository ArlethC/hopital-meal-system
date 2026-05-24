/*
    Archivo: detallesSolicitudDietas.routes.ts
    Descripcion: Rutas para gestionar los detalles de las solicitudes de dietas.
    Autor: Marilyn Castro
    Fecha creacion: 5/08/2025
    Version: 1.0.0
*/
import { Router } from 'express';
const router = Router();
import {modificarDietasObs, modificarNutricion, modificarCocina, obtenerDetallesSolicitudParaModificar, cancelarDieta, reactivarDieta, detallesSolicitud, obtenerHistorialController  } from '../controllers/detallesSolicitud.controllers';
import { verificarPermisos, verificarSesion } from '../middlewares/autenticacion';
import { validarBody, validarIdParam } from '../middlewares/validaciones';
import { modificacionEnfermeriaShema, modificacionNutricionShema, modificacionCocinaShema } from "@miapp/shared";;

router.patch('/enfermeria', verificarPermisos(['crear solicitud']),  validarBody(modificacionEnfermeriaShema), modificarDietasObs); //

router.patch('/nutricion', verificarPermisos('nutricion'),  validarBody(modificacionNutricionShema), modificarNutricion); //

router.patch('/cocina', verificarPermisos('cocina'),  validarBody(modificacionCocinaShema), modificarCocina); //

router.get('/modificar/:id', verificarSesion, validarIdParam, obtenerDetallesSolicitudParaModificar); //

router.delete('/cancelar/:id', verificarPermisos(['crear solicitud']), validarIdParam, cancelarDieta); //

router.patch('/reactivar/:id', verificarPermisos(['crear solicitud']), validarIdParam, reactivarDieta); //

router.get('/todos/:id', verificarSesion, validarIdParam, detallesSolicitud); //

router.get('/historial/:id', verificarSesion, validarIdParam, obtenerHistorialController);


export default router;
