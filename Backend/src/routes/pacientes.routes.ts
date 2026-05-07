/*
    Archivo: pacientes.routes.ts
    Descripcion: rutas para obtener la información de los pacientes.
    Autor: Marilyn Castro
    Fecha creacion: 7/07/2025
    Version: 1.0.0
*/
import { Router } from 'express';
const router = Router();
import { paginacion } from '../middlewares/paginacion';
import { verificarPermisos, verificarSesion } from '../middlewares/autenticacion';
import { validarBody } from '../middlewares/validaciones';
import { pacientesSala, pacienteInfo } from '../dtos/solictudDietas.dto';
import { obtenerPacientesxExpNom, obtenerPacienteSala, obtenerPacienteExpediente, obtenerSalasController} from "../controllers/paciente.controllers";

router.get('/busqueda', verificarSesion, paginacion, obtenerPacientesxExpNom);
router.post('/pacienteSala', verificarSesion, validarBody(pacientesSala), obtenerPacienteSala);

router.post('/infoPaciente', verificarPermisos(["admin", "solicitud extraordinaria"]), validarBody(pacienteInfo), obtenerPacienteExpediente);

router.get('/salas', verificarSesion, obtenerSalasController);


export default router;

