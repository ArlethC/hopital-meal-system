/*
    Archivo: solicitudDietas.routes.ts
    Descripcion: rutas para gestionar las solicitudes de dietas.
    Autor: Marilyn Castro
    Fecha creacion: 11/07/2025
    Version: 2.0.0
*/
import { Router } from 'express';
const router = Router();
import { validarBody, validarIdParam } from '../middlewares/validaciones';
import { paginacion } from '../middlewares/paginacion';
import { verificarPermisos, verificarSesion } from '../middlewares/autenticacion';
import { crearSolicitudShema, buscarSolicitud, esquemaIdDetalles } from '../dtos/solictudDietas.dto';
import { crearSolicitudController, obtenerSolicitudesParaModificar, obtenerHistorialController, solicitudRecibidaParcial, solicitudRecibida, obtenerSolicitudesParaRecibir, obtenerSolicitudes, obtenerSolicitudesTodas, obtenerSolicitud, obtenerEstadosSolicitud } from '../controllers/solicitudDietas.controllers';


import { obtenerPDF } from '../controllers/pdfSolicitud.controllers';

router.post('/crear', verificarPermisos(['crear solicitud', 'admin', 'solicitud extraordinaria']),  validarBody(crearSolicitudShema), crearSolicitudController);

router.post('/modificar', verificarSesion, validarBody(buscarSolicitud), paginacion, obtenerSolicitudesParaModificar );

router.get('/detalles/historial/:id', verificarSesion, validarIdParam, obtenerHistorialController);

router.get('/encabezado/:id', verificarSesion, validarIdParam, obtenerSolicitud);

router.patch('/recibida/:id', verificarPermisos(['crear solicitud']), validarIdParam, solicitudRecibida);

router.patch('/recibidaParcial/:id', verificarPermisos(['crear solicitud']), validarIdParam, validarBody(esquemaIdDetalles),  solicitudRecibidaParcial);

router.post('/recibir', verificarPermisos(['crear solicitud']), validarBody(buscarSolicitud), paginacion, obtenerSolicitudesParaRecibir );

router.post('/cerrar', verificarSesion, validarBody(buscarSolicitud), paginacion, obtenerSolicitudes );

router.post('/todas', verificarSesion, validarBody(buscarSolicitud), paginacion, obtenerSolicitudesTodas );

router.post('/pdf/:id', verificarSesion, validarIdParam, obtenerPDF );

router.get('/estados', verificarSesion, obtenerEstadosSolicitud);


export default router;
