/*
    Archivo: pacientes.tsx
    Descripcion: llamadas a la api para obtener la información de los pacientes.
    Autor: Marilyn Castro
    Fecha creacion: 7/07/2025
    Version: 1.0.1
*/
import api from './AxiosService';
import type { DatosSala } from '../types/solicitud';
import type { Paciente, PacientesList, Salas } from "@miapp/shared";


export type PacienteResponse = {
    data: Paciente[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
};

type DatosExpediente = {
    expediente: string;
    fecha: string;
    idTiempoComida: number;
    sala: string;
}

export async function obtenerSalas(): Promise<Salas[]> {
    const response = await api.get<Salas[]>('/api/pacientes/salas');
    return response.data;
}

export const obtenerPacientes = async (params: string): Promise<PacienteResponse> => {
    const response = await api.get<PacienteResponse>('/api/pacientes/busqueda' + params);
    return response.data;
};

export async function obtenerPacientesSala(data: DatosSala): Promise<PacientesList[]> {
    const response = await api.post<PacientesList[]>('/api/pacientes/pacienteSala', data);
    return response.data;
}

export async function obtenerPaciente(data: DatosExpediente): Promise<PacientesList[]> {
    const response = await api.post<PacientesList[]>('/api/pacientes/infoPaciente', data);
    return response.data;
}