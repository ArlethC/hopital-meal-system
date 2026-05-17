/*
    Archivo: rangosEdadService.tsx
    Descripcion: contiene las llamadas a la api para crear, actualizar, modificar y obtener la información relacionada a los rangos de edad.
    Autor: Marilyn Castro
    Fecha creacion: 2/07/2025
    Version: 1.0.1
*/

import api from './AxiosService';
import { type AgeRange} from  '../types/ui';

import type { CrearRangoEdadSchemaDTO } from '@miapp/shared';

export type AgeRangeResponse = {
  data: AgeRange[];
  total: number;
};

export const obtenerRangosEdad = async (): Promise<AgeRangeResponse> => {
    const response = await api.get<AgeRangeResponse>('/api/rangoEdad/obtenerTodos');
    return response.data;
};

export const actualizarRangoEdad = async (id: string, data: Partial<CrearRangoEdadSchemaDTO>) => {
    await api.put(`/api/rangoEdad/modificar/${id}`, data);
}

export const crearRangoEdad = async (data: CrearRangoEdadSchemaDTO): Promise<AgeRange> => {
    const response = await api.post<AgeRange>('/api/rangoEdad/crear', data);
    return response.data;
}

export const eliminarRangoEdad = async (id: string) => {
    await api.delete(`/api/rangoEdad/eliminar/${id}`);
}