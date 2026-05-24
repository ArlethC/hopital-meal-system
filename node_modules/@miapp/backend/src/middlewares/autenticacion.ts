/*
    Archivo: autenticacion.ts
    Descripcion: middlewares para validar los permisos de los usuarios y funciones para crear los tokens.
    Autor: Marilyn Castro
    Fecha creacion: 8/07/2025
    Version: 1.0.3
*/
import { sign, verify } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';


const SECRET_ACCESS = process.env.SECRET || 'default_secret';
const SECRET_REFRESH = process.env.SECRET || 'default_secret';


// Permisos que puede tener cada rol de usuario

export const mapaPermisos: Record<number, string> = {
  1: 'admin',
  2: 'crear alergias',
  3: 'crear solicitud',
  4: 'nutricion',
  5: 'cocina',
  6: 'ver alergias',
  7: 'meriendas',
  8: 'ver solicitudes',
  9: 'solicitud extraordinaria',
};

function obtenerPermisos(permisosBd: { permiso_usuario: number }[]): string[] {
  const permisos: string[] = [];

  for (const { permiso_usuario } of permisosBd) {
    const nombre = mapaPermisos[permiso_usuario];
    if (nombre) {
      permisos.push(nombre);
    } else {
      console.warn(`IdNodo ${permiso_usuario} no está definido en el mapa de permisos`);
    }
  }

  return permisos;
}

interface TokenPayload {
  usuario: string;
  permisos: string[];
}

export function generarTOKEN(usuario: string, permisosBd: { permiso_usuario: number }[]): { token: string; refreshToken: string; permisos: string[] } {
  const permisos = obtenerPermisos(permisosBd);

  const payload: TokenPayload = {
    usuario,
    permisos,
  };

  const token = sign(payload, SECRET_ACCESS, { expiresIn: '15m' });
  const refreshToken = sign(payload, SECRET_REFRESH, { expiresIn: '7d' });
  return { token, refreshToken, permisos };
}

export function usuarioTOKEN(token: string): string | null {
  try {
    const decodificado = verify(token, SECRET_ACCESS) as TokenPayload;
    return decodificado.usuario;
  } catch (error) {
    return null;
  }
}

export const verificarPermisos = (permisosRequeridos: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: "Acceso no autorizado. Token no proporcionado." });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodificado = verify(token, SECRET_ACCESS) as TokenPayload;

      const permisosUsuario = decodificado.permisos || [];

      const permisos = Array.isArray(permisosRequeridos)
        ? permisosRequeridos
        : [permisosRequeridos];

      const tieneAlMenosUnPermiso = permisos.some(item => permisosUsuario.includes(item));

      if (!tieneAlMenosUnPermiso) {
        if (req.session) {
          req.session.destroy?.((err: any) => {
            if (err) {
              if (process.env.NODE_ENV === 'development') {
                console.error('Error destruyendo la sesión:', err);
              }
            }
          });
        }
        res.status(403).json({
          error: "Acceso denegado: No tiene los permisos necesarios.",
        });
        return;
      }

      (req as any).user = decodificado.usuario;
      (req as any).permisos = decodificado.permisos;
      next();
    } catch (error) {
      res.status(401).json({ error: "Token inválido o expirado." });
    }
  };
};

export const verificarSesion = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Token inválido' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodificado = verify(token, SECRET_ACCESS) as TokenPayload;
    (req as any).user = decodificado.usuario;
    (req as any).permisos = decodificado.permisos;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
    return;
  }
};

export async function refrescarToken(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(401).json({ error: 'NoRefreshToken' });
    return;
  }
  verify(refreshToken, SECRET_REFRESH, (err: any, decoded: any) => {
    if (err) {
      res.status(401).json({ error: 'RefreshExpired' });
      return;
    }

    const newAccessToken = sign({ usuario: decoded.usuario, permisos: decoded.permisos }, SECRET_ACCESS, { expiresIn: '15m' });
    res.json({ accessToken: newAccessToken });
  });
}

