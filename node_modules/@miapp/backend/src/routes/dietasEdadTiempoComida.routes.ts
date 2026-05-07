/*
    Archivo: dietasEdadTiempoComida.routes.ts
    Descripcion: rutas para gestionar los grupos de dietas, tiempos de comida y rangos de edad.
    Autor: Marilyn Castro
    Fecha creacion: 3/07/2025
    Version: 1.0.0
*/

import { Router } from 'express';
const router = Router();
import { paginacion } from '../middlewares/paginacion';
import { validarBody, validarIdParam } from '../middlewares/validaciones';
import { verificarPermisos } from '../middlewares/autenticacion';
import { CrearDietaEdadTiempoShema, ModificarDietaEdadTiempoShema } from '../dtos/dietasEdadTiempoComida.dto';
import { crearDietaEdadTiempo, actualizarDietaEdadTiempo, desactivarDietaEdadTiempo, obtenerDietasEdadTiempoFiltradas } from '../controllers/dietasEdadTiempoComida.controllers';

router.post('/crear', verificarPermisos("admin"),  validarBody(CrearDietaEdadTiempoShema), crearDietaEdadTiempo);

router.get('/filtrado', verificarPermisos(["admin", "crear solicitud", "solicitud extraordinaria"]),  paginacion, obtenerDietasEdadTiempoFiltradas);

router.put('/modificar/:id', verificarPermisos("admin"), validarIdParam, validarBody(ModificarDietaEdadTiempoShema), actualizarDietaEdadTiempo);

router.delete('/eliminar/:id', verificarPermisos("admin"), validarIdParam, desactivarDietaEdadTiempo);

export default router;