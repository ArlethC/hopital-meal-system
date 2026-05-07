/*
    Archivo: meriendas.tsx
    Descripcion: llamadas a la API para gestionar las meriendas.
    Autor: Marilyn Castro
    Fecha creacion: 31/07/2025
    Version: 1.0.0
*/
import api from './AxiosService';
import type { Dieta } from '../types/ui';
import type { Merienda } from "@miapp/shared";


export type DatosMerienda = {
    expediente: string;
    idDieta: number;
    idTiempoComida: number;
    fechaInicioMerienda: string;
    fechaFinMerienda?: string;
}

type ResponseMerienda = {
    data: Merienda[];
    total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export const crearMerienda = async (data: DatosMerienda) => {
    const response = await api.post('/api/merienda/crear', data);
    return response.data;
}

export const obtenerMeriendas = async (expediente: string, filtro: string): Promise<ResponseMerienda> => {
    const response = await api.get<ResponseMerienda>(`/api/merienda/paciente/${expediente}?${filtro}`);
    return response.data;
}

export const desactivarMerienda = async (idMerienda: string) => {
    const response = await api.delete(`/api/merienda/desactivar/${idMerienda}`);
    return response.data;
}

export const dietasMerienda = async (): Promise<Dieta[]> => {
    const response = await api.get<Dieta[]>(`/api/merienda/dietas`);
    return response.data;
}