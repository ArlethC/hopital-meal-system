/*
    Archivo: dietas.routes.ts
    Descripcion: rutas para obtener las dietas y los tiempos de comida.
    Autor: Marilyn Castro
    Fecha creacion: 3/07/2025
    Version: 1.0.0
*/

import { Router } from 'express';
const router = Router();
import { paginacion } from '../middlewares/paginacion';
import { verificarPermisos, verificarSesion } from '../middlewares/autenticacion';
import { obtenerTodasDietas, obtenerTiemposComidaController } from '../controllers/dietas.controllers';



router.get('/todas', verificarPermisos(["admin", "crear solicitud"]), paginacion, obtenerTodasDietas);

router.get('/tiempos-comida', verificarSesion, obtenerTiemposComidaController);



export default router;