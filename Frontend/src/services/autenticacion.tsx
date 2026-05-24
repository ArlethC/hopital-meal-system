/*
    Archivo: autenticacion.tsx
    Descripcion: llamadas a la api para gestionar las sesiones del usuario.
    Autor: Marilyn Castro
    Fecha creacion: 8/07/2025
    Version: 1.0.1
*/
import axios from 'axios';
import api from './AxiosService';
import { initSocket, disconnectSocket } from './socket';

type Usuario = {
  usuario: string | null;
  permisos: string[];
  accessToken: string
}


export const inicioSesion = async (data: any): Promise<Usuario> => {
  const response = await axios.post<Usuario>('/api/inicio-sesion', data, {
    withCredentials: true
  });
  sessionStorage.setItem('accessToken', response.data.accessToken);
  initSocket(response.data.accessToken);
  return response.data;
};


export const inicioSesionEmbedido = async (usuario: string, firma: string): Promise<Usuario> => {
  const response = await axios.post<Usuario>('/api/sso-login', {}, {
    headers: {
      'x-usuario-autenticado': usuario,
      'x-usuario-firma': firma,
    }
  });
  sessionStorage.setItem('accessToken', response.data.accessToken);
  initSocket(response.data.accessToken);
  return response.data;
};

export const verificarSesionUsuario = async (): Promise<Usuario> => {
  const response = await api.get<Usuario>('/api/verificar');
  return response.data;
}

export const cerrarSesionUsuario = async (): Promise<void> => {
  await api.post('/api/cerrar-sesion');
  sessionStorage.removeItem('accessToken');
  disconnectSocket();
};


export const refrescarToken = async (): Promise<Partial<Usuario>> => {
  const response = await axios.post<Partial<Usuario>>('/api/refresh', {}, { withCredentials: true });
  const nuevoAccessToken = response.data.accessToken;
  if (nuevoAccessToken !== undefined) {
    sessionStorage.setItem('accessToken', nuevoAccessToken);
  }
  return response.data;
};





