/*
    Archivo: cocina.tsx
    Descripcion: llamadas a la API de la pantalla de resumen de solicitud de dietas y meriendas para cocina.
    Autor: Marilyn Castro
    Fecha creacion: 7/08/2025
    Version: 1.0.0
*/
import api from './AxiosService';


type TotalDietas = {
    totalDietas: number;
    dieta: string;
}

type Alergias = {
    Paciente: string;
    Observacion: string;
}

type Reclamo = {
    totalReclamo: number;
    Valor: string;
}

export type ResumenResponse = {
    tiempComida: string;
    totalDietas: TotalDietas[] | [];
    alergias: Alergias[] | [];
    reclamos: Reclamo[] ;
    alertasFormateadas: string[] | [];
}

export async function obtenerResumen(): Promise<ResumenResponse> {
    const response = await api.get<ResumenResponse>(`/api/cocina/resumen`);
    return response.data;
}

export async function obtenerResumenMerienda(): Promise<ResumenResponse> {
    const response = await api.get<ResumenResponse>(`/api/cocina/meriendas`);
    return response.data;
}

export async function etiquetaIndividual(id: string) {
    const response = await api.post(`/api/cocina/etiquetaIndividual/${id}`,  null, {
        responseType: 'arraybuffer'
    });
    return response.data;
}

export async function etiquetaSala(id: string) {
    const response = await api.post(`/api/cocina/etiquetasSala/${id}`,  null, {
        responseType: 'arraybuffer'
    });
    return response.data;
}