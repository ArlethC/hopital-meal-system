/*
    Archivo: solicitudDietas.tsx
    Descripcion: llamadas a la API para gestionar las solicitudes de dietas.
    Autor: Marilyn Castro
    Fecha creacion: 11/07/2025
    Version: 1.0.5
*/
import api from './AxiosService';
import type {
   RespuestaEntregaDietas,
   PacienteOmitido,
   RespuestaOrdenes,
   Historial,
   DatosFiltroSolicitud,
   IdDetallesPayload,
   OrdenDieta,
} from '../types/solicitud';
import { type ValorCatalogo} from  '../types/ui';


export type ResponseEstadosSolicitud = {
    estados: ValorCatalogo[];
}

export async function crearSolicitud(data: RespuestaEntregaDietas): Promise<PacienteOmitido[]> {
    const response = await api.post<PacienteOmitido[]>('/api/solicitudDietas/crear', data);
    return response.data;
}

export async function obtenerSolicitudesMod(data: DatosFiltroSolicitud, params: string): Promise<RespuestaOrdenes> {
    const response = await api.post<RespuestaOrdenes>(`/api/solicitudDietas/modificar?${params}`, data);
    return response.data;
}

export async function obtenerSolicitud(id: string): Promise<OrdenDieta> {
    const response = await api.get<OrdenDieta>(`/api/solicitudDietas/encabezado/${id}`);
    return response.data;
}

export async function obtenerHistorialDetalle(id: string): Promise<Historial[]> {
    const response = await api.get<Historial[]>(`/api/solicitudDietas/detalles/historial/${id}`);
    return response.data;
}

export async function obtenerSolicitudesRecibido(data: DatosFiltroSolicitud, params: string): Promise<RespuestaOrdenes> {
    const response = await api.post<RespuestaOrdenes>(`/api/solicitudDietas/recibir?${params}`, data);
    return response.data;
}

export async function recibidoSolicitud(id: string){
    const response = await api.patch(`/api/solicitudDietas/recibida/${id}`,);
    return response.data;
}

export async function recibidoParcialSolicitud(id: string, data: IdDetallesPayload){
    const response = await api.patch(`/api/solicitudDietas/recibidaParcial/${id}`, data);
    return response.data;
}

export async function obtenerSolicitudesCerrar(data: DatosFiltroSolicitud, params: string): Promise<RespuestaOrdenes> {
    const response = await api.post<RespuestaOrdenes>(`/api/solicitudDietas/cerrar?${params}`, data);
    return response.data;
}

export async function obtenerSolicitudesTodas(data: DatosFiltroSolicitud, params: string): Promise<RespuestaOrdenes> {
    const response = await api.post<RespuestaOrdenes>(`/api/solicitudDietas/todas?${params}`, data);
    return response.data;
}

export async function pdfSolicitud(id: string) {
    const response = await api.post(`/api/solicitudDietas/pdf/${id}`,  null, {
        responseType: 'arraybuffer'
    });
    return response.data;
}

export async function obtenerEstadosSolicitud(): Promise<ResponseEstadosSolicitud> {
    const response = await api.get<ResponseEstadosSolicitud>(`/api/solicitudDietas/estados`);
    return response.data;
}