/*
    Archivo: horariosTiempoComida.tsx
    Descripcion: llamadas a la api para gestionar los horarios de los tiempos de comida.
    Autor: Marilyn Castro
    Fecha creacion: 7/07/2025
    Version: 1.0.0
*/

import api from './AxiosService';
import type { HorarioTiempoComida } from '@miapp/shared';

export type NewHorario = {
    idTiempoComida: number;
    horaModificacion: string;
    horaCierre: string;
}

export type HorarioResponse = {
    data: HorarioTiempoComida[];
}

export const crearHorarioTiempoComida = async (data: NewHorario): Promise<HorarioTiempoComida> => {
    const response = await api.post<HorarioTiempoComida>('/api/horarioTiempoComida/crear', data);
    return response.data;
}

export const obtenerHorariosTiempoComida = async (): Promise<HorarioResponse> => {
    const response = await api.get<HorarioResponse>('/api/horarioTiempoComida/todos');
    return response.data;
};

export const actualizarHorarioTiempoComida = async (id: string, data: Partial<NewHorario>) => {
    await api.put(`/api/horarioTiempoComida/modificar/${id}`, data);
}

export const eliminarHorarioTiempoComida = async (id: string) => {
    await api.delete(`/api/horarioTiempoComida/desactivar/${id}`);
}