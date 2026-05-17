/*
    Archivo: reclamos.tsx
    Descripcion: llamadas a la api para gestionar los reclamos.
    Autor: Marilyn Castro
    Fecha creacion: 23/07/2025
    Version: 2.0.1
*/
import api from './AxiosService';
import type { Reclamo, TipoReclamo, ModificarReclamoSchemaDTO } from "@miapp/shared";

type CrearReclamoResponse = {
  mensaje: string;
  correoEnviado: boolean;
  errorCorreo: string | null;
};


export const obtenerTiposReclamo = async (): Promise<TipoReclamo[]> => {
    const response = await api.get<TipoReclamo[]>(`/api/reclamos/tipos`);
    return response.data;
};

export const obtenerReclamo = async (id: string): Promise<Reclamo> => {
    const response = await api.get<Reclamo>(`/api/reclamos/obtener/${id}`);
    return response.data;
};

export const crearReclamo = async (id: string, data: FormData): Promise<CrearReclamoResponse> => {
    const response = await api.post<CrearReclamoResponse>(`/api/reclamos/crear/${id}`, data);
    return response.data;
};

export const modificarReclamo = async (id: string, data: ModificarReclamoSchemaDTO) => {
    const response = await api.patch(`/api/reclamos/modificar/${id}`, data);
    return response.data;
};

export const estadoReclamo = async (id: string) => {
    const response = await api.patch(`/api/reclamos/solucionado/${id}`);
    return response.data;
};