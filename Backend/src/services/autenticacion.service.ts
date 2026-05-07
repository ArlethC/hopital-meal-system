/*
    Archivo: autenticacion.service.ts
    Descripcion: lógica de negocio para manejar el inicio y cierre de sesión.
    Autor: Marilyn Castro
    Fecha creacion: 8/07/2025
    Version: 1.0.0
*/

import { bd } from '../config/database';
import { mapaPermisos } from '../middlewares/autenticacion';
import bcrypt from 'bcrypt';


export async function permisosUsuario(usuario: string) {
    const idsPermisos = Object.keys(mapaPermisos).join(',');

    const parametros = [{ nombre: 'usuario', valor: usuario }];

    const consulta = `SELECT permiso_usuario
        FROM Permisos_usuario
        WHERE activo = 1 AND usuario = @usuario
	    AND permiso_usuario IN (${idsPermisos});`;

    const permisos = await bd.consultaBD(consulta, parametros);
    
    return permisos.recordset.length > 0 ? permisos.recordset : null;
}

export async function validarUsuario(usuario: string, contrasena: string) {
        try {
            const parametros = [ { nombre: 'nombreUsuario', valor: usuario} ];

            const consulta = `SELECT password_hash 
FROM Usuarios
WHERE nombre_usuario = @nombreUsuario`;

            const password = await bd.consultaBD(consulta, parametros);

            if(password.recordset.length == 0){
                throw new Error('Usuario incorrecto');
            }else{

                const esValida = await bcrypt.compare(contrasena, password.recordset[0].password_hash);
                
                if(!esValida){
                    throw new Error('Contraseña incorrecta');
                }
            }

        } catch (error) {
            throw error;
        }
    }

