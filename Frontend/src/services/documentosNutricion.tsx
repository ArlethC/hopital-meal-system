/*
    Archivo: documentosNutricion.tsx
    Descripcion: llamadas a la api para gestionar los documentos de nutrición.
    Autor: Marilyn Castro
    Fecha creacion: 21/07/2025
    Version: 1.0.0
*/
import api from './AxiosService';
import type { Documento } from '@miapp/shared';

export type ResponseBackend = {
    id: number;
    Valor: string;
}[];

export type CrearDocumento = {
    archivo: File;
    expediente: string;
    idTipoDocumento: number;
    obsDocumento?: string;
    fechaInicial: string;
    fechaFinalVigencia?: string;
};

type DocumentosPaciente = {
    data: Documento[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
};


export const crearDocumentoNutri = async (data: FormData): Promise<Documento[]> => {
    const response = await api.post<Documento[]>('/api/documentosNutri/crear', data);
    return response.data;
}

export const obtenerTiposDocumento = async (): Promise<ResponseBackend> => {
    const response = await api.get<ResponseBackend>(`/api/documentosNutri/tiposDocumento`);
    return response.data;
}

export const desactivarDocumentoNutri = async (id: string) => {
    const response = await api.delete(`/api/documentosNutri/desactivar/${id}`);
    return response.data;
}

export const obtenerDocumentoPaciente = async (expediente: string, params: string): Promise<DocumentosPaciente> => {
    const response = await api.get<DocumentosPaciente>(`/api/documentosNutri/paciente/${expediente}?${params}`);
    return response.data;
}