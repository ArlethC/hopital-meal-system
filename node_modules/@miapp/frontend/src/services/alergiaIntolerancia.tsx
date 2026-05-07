/*
    Archivo: alergiaIntolerancia.ts
    Descripcion: llamadas a la api para gestionar las alergias e intolerancias.
    Autor: Marilyn Castro
    Fecha creacion: 17/07/2025
    Version: 1.0.0
*/
import api from './AxiosService';
import type { AlergiaIntolerancia, AlergiasIntoleranciasPaciente } from '@miapp/shared';


type DatosPaciente = {
    expediente: string;
    alergiasIntolerancias: string;
}


export const crearAlergiaIntolerancia = async (data: DatosPaciente): Promise<AlergiaIntolerancia[]> => {
    const response = await api.post<AlergiaIntolerancia[]>('/api/alergias/crear', data);
    return response.data;
}

export const modificarAlergiaIntolerancia = async (data: AlergiaIntolerancia): Promise<AlergiaIntolerancia[]> => {
    const response = await api.patch<AlergiaIntolerancia[]>('/api/alergias/modificar', data);
    return response.data;
}

export const obtenerAlergiasIntolerancias = async (expediente: string): Promise<AlergiasIntoleranciasPaciente> => {
    const response = await api.get<AlergiasIntoleranciasPaciente>(`/api/alergias/todas/${expediente}`);
    return response.data;
}

export const desactivarAlergiaIntolerancia = async (id: string) => {
    const response = await api.delete(`/api/alergias/desactivar/${id}`);
    return response.data;
}