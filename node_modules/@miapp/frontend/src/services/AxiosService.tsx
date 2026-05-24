/*
    Archivo: AxiosService.tsx
    Descripcion: interceptor de las solicitudes de axios a la API.
    Autor: Marilyn Castro
    Fecha creacion: 28/07/2025
    Version: 1.0.1
*/
import axios from 'axios';
import { AxiosHeaders } from 'axios';
import { refrescarToken } from './autenticacion';
import { notifyExternally } from '../services/notificacionService';

const api = axios.create({
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
        if (!config.headers) {
            config.headers = new AxiosHeaders();
        }
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let isRedirecting = false;

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const token = sessionStorage.getItem('accessToken');
        if (error.response?.status === 401 && !token) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry && !isRedirecting) {
            originalRequest._retry = true;

            try {
                const nuevoToken = await refrescarToken();
                originalRequest.headers.Authorization = `Bearer ${nuevoToken}`;
                return api(originalRequest);
            } catch{
                sessionStorage.removeItem('accessToken');

                isRedirecting = true;

                if (window.location.pathname !== '/login') {
                    notifyExternally({
                        type: 'error',
                        title: 'Sesión expirada',
                        content: 'Tu sesión ha caducado. Por favor, vuelve a iniciar sesión.',
                        duration: 4000,
                        dismissible: true
                    });

                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1500);
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;