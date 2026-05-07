/*
    Archivo: autenticacion.controllers.ts
    Descripcion: controladores para manejar el inicio y cierre de sesión.
    Autor: Marilyn Castro
    Fecha creacion: 8/07/2025
    Version: 1.0.3
*/

import { Request, Response, NextFunction } from 'express';
import { permisosUsuario, validarUsuario } from '../services/autenticacion.service';
import crypto from "crypto";
import { generarTOKEN } from '../middlewares/autenticacion';

const SSO_SECRET = process.env.SSO_SECRET || "clave-super-secreta";

export const inicioSesion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let usuario = req.body.usuario;
        const contrasena = req.body.contrasena;


        await validarUsuario(usuario, contrasena);

        const permisos = await permisosUsuario(usuario);

        if (!permisos) {
            res.status(401).json({ error: 'No tiene permisos para usar este módulo' });
            return;
        }

        const token = generarTOKEN(usuario, permisos);

        if (!token || !token.token) {
            res.status(500).json({ error: 'Error generando el token' });
            return;
        }

        res.cookie('refreshToken', token.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
        });

        res.status(200).json({ usuario, accessToken: token.token, permisos: token.permisos });
    } catch (err: any) {

        if (err.message === 'Usuario o contraseña incorrectos') {
            res.status(401).json({ error: err.message });
            return;
        }

        next(err);
    }
};


export const SSOLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {

        let usuario = req.headers["x-usuario-autenticado"] ?? null;
        let firma = req.headers["x-usuario-firma"] ?? null;

        if (!usuario || !firma) {
            res.status(400).json({ error: "Debe proporcionar usuario y firma" });
            return;
        }

        if (Array.isArray(usuario)) usuario = usuario[0];
        if (Array.isArray(firma)) firma = firma[0];

        const firmaEsperada = crypto
            .createHmac("sha256", SSO_SECRET)
            .update(usuario)
            .digest("hex");

        if (firma !== firmaEsperada) {
            res.status(401).json({ error: "Firma inválida" });
            return;
        }

        const permisos = await permisosUsuario(usuario);

        if (!permisos) {
            res.status(401).json({ error: 'No tiene permisos para usar este módulo' });
            return;
        }

        const token = generarTOKEN(usuario, permisos);

        if (!token || !token.token) {
            res.status(500).json({ error: 'Error generando el token' });
            return;
        }

        res.cookie('refreshToken', token.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({ usuario, accessToken: token.token, permisos: token.permisos });
    } catch (err: any) {
        next(err);
    }
};

export async function cerrarSesion(req: Request, res: Response, next: NextFunction) {
    try {
        req.session.destroy;

        res.clearCookie('connect.sid');
        res.cookie('authToken', '', {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            expires: new Date(0),
        });
        res.json({ message: 'Sesion cerrada correctamente' });

    } catch (error: any) {
        next(error);
    }
}

