/*
    Archivo: detallesSolicitud.tsx
    Descripcion: Llamadas a la API para gestionar los detalles de las solicitudes de dietas.
    Autor: Marilyn Castro
    Fecha creacion: 5/08/2025
    Version: 1.0.0
*/
import api from './AxiosService';
import type {
   ModificacionCocinaShemaDTO,
   ModificacionNutricionShemaDTO,
   modificacionEnfermeriaShemaDTO,
   DetalleOrden,
   Historial,
} from '../types/solicitud';

export async function obtenerDetalleSolicitud(id: string): Promise<DetalleOrden[]> {
    const response = await api.get<DetalleOrden[]>(`/api/solicitud/detalles/modificar/${id}`);
    return response.data;
}

export async function cancelarDetalle(id: string){
    const response = await api.delete(`/api/solicitud/detalles/cancelar/${id}`);
    return response.data;
}

export async function reactivarDetalle(id: string){
    const response = await api.patch(`/api/solicitud/detalles/reactivar/${id}`);
    return response.data;
}

export async function modificarEnfermeria(datos: modificacionEnfermeriaShemaDTO): Promise<DetalleOrden>{
    const response = await api.patch<DetalleOrden>(`/api/solicitud/detalles/enfermeria`, datos);
    return response.data;
}

export async function modificarNutricion(datos: ModificacionNutricionShemaDTO): Promise<DetalleOrden>{
    const response = await api.patch<DetalleOrden>(`/api/solicitud/detalles/nutricion`, datos);
    return response.data;
}

export async function modificarCocina(datos: ModificacionCocinaShemaDTO): Promise<DetalleOrden> {
    const response = await api.patch<DetalleOrden>(`/api/solicitud/detalles/cocina`, datos);
    return response.data;
}

export async function obtenerDetSolicitud(id: string): Promise<DetalleOrden[]> {
    const response = await api.get<DetalleOrden[]>(`/api/solicitud/detalles/todos/${id}`);
    return response.data;
}

export async function obtenerHistorialDetalle(id: string): Promise<Historial[]> {
    const response = await api.get<Historial[]>(`/api/solicitud/detalles/historial/${id}`);
    return response.data;
}

