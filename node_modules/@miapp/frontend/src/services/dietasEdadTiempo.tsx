/*
    Archivo: dietasEdadTiempo.tsx
    Descripcion: llamadas a la api para gestionar los grupos de dietas, tiempos de comida y rango de edad
    Autor: Marilyn Castro
    Fecha creacion: 3/07/2025
    Version: 1.0.0
*/

import api from './AxiosService';
import { type Dieta, type ValorCatalogo} from  '../types/ui';
import type { GrupoDieComEd } from '@miapp/shared';

export type TiempoComidaResponse = {
  tiemposComida: ValorCatalogo[];
};

export type DietasResponse = {
  data: Dieta[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type NewGrupo = {
  idDieta: number;
  idTiempoComida: number;
  idRangoEdad: number;
  abrevDieta: string;
}

export type ArrayDietas = {
  codigo: number;
  abrevDieta?: string;
}

export type DataEnviar = {
  idDietas: ArrayDietas[];
  idTiempoComida: number;
  idRangoEdad: number;
}


export type GrupoDieComEdResponse = {
  data: GrupoDieComEd[];
  total: number;
	page: number;
	pageSize: number;
	totalPages: number;
};

export const obtenerTiemposComida = async (): Promise<TiempoComidaResponse> => {
  const response = await api.get<TiempoComidaResponse>('/api/dietas/tiempos-comida');
  return response.data;
};

export const obtenerDietas = async (params: string): Promise<DietasResponse> => {
  const response = await api.get<DietasResponse>('/api/dietas/todas' + params);
  return response.data;
};

export const crearDietaEdadTiempo = async (data: DataEnviar): Promise<GrupoDieComEdResponse> => {
  const response = await api.post<GrupoDieComEdResponse>('/api/dietasEdadTiempo/crear', data);
  return response.data;
}

export const obtenerDietasEdadTiempo = async (params: string): Promise<GrupoDieComEdResponse> => {
  const response = await api.get<GrupoDieComEdResponse>('/api/dietasEdadTiempo/filtrado' + params);
  return response.data;
};

export const eliminarDietaEdadTiempo = async (id: string) => {
    await api.delete(`/api/dietasEdadTiempo/eliminar/${id}`);
}

export const actualizarDietaEdadTiempo = async (id: string, data: Partial<NewGrupo>): Promise<GrupoDieComEdResponse> => {
    const response = await api.put<GrupoDieComEdResponse>(`/api/dietasEdadTiempo/modificar/${id}`, data);
    return response.data;
}
