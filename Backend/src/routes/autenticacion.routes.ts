/*
    Archivo: autenticacion.routes.ts
    Descripcion: rutas para manejar el inicio y cierre de sesión.
    Autor: Marilyn Castro
    Fecha creacion: 8/07/2025
    Version: 1.0.1
*/
import { Router } from 'express';
const router = Router();
import { z } from 'zod';
import { validarBody } from '../middlewares/validaciones';
import { verificarSesion, refrescarToken } from '../middlewares/autenticacion';
import { inicioSesion, SSOLogin, cerrarSesion } from '../controllers/autenticacion.controllers';

declare module 'express-serve-static-core' {
  interface Request {
    user?: any;
    permisos?: any;
  }
}

const loginSchema = z.object({
  usuario: z.string({ required_error: "El nombre de usuario es obligatorio" }).min(1),
  contrasena: z.string({ required_error: "La contraseña es obligatoria" }).min(1),
});

router.post('/inicio-sesion', validarBody(loginSchema), inicioSesion);

router.post('/sso-login', SSOLogin);

router.get('/verificar', verificarSesion, (req, res) => {
  res.json({
    usuario: req.user,
    permisos: req.permisos, 
  });
});

router.post('/cerrar-sesion', verificarSesion, cerrarSesion);

router.post('/refresh', refrescarToken);



export default router;