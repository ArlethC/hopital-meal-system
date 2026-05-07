/*
    Archivo: fecthDatos.tsx
    Descripcion: contiene funciones para obtener valores de catalogos desde la api y tranformalos.
    Autor: Marilyn Castro
    Fecha creacion: 4/07/2025
    Version: 1.0.0
*/
import { obtenerDietas } from "../services/dietasEdadTiempo";
import type { Paciente, Salas } from "@miapp/shared";
import { obtenerPacientes } from "../services/pacientes";
import { obtenerTiemposComida, } from '../services/dietasEdadTiempo';
import { obtenerRangosEdad, } from "../services/rangosEdadService";
import { obtenerSalas, } from "../services/pacientes";

import { type SearchItem } from '../components/SearchBar';

import type { Dieta, ValorCatalogo, AgeRange } from '../types/ui';

export const fetchDietas = async (query: string, page: number): Promise<{ items: SearchItem[]; hasMore: boolean }> => {
    try {
        const res = await obtenerDietas(`?q=${query}&pag=${page}&limit=10`);

        if (!res || !Array.isArray(res.data)) {
            console.warn("Respuesta inesperada en obtenerDietas:", res);
            return {
                items: [],
                hasMore: false
            };
        }

        const items = res.data.map((item: Dieta) => ({
            id: String(item.codigo),
            name: item.nombre
        }));

        return {
            items: items,
            hasMore: res.page < res.totalPages,
        };
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error("Error al obtener dietas:", error);
        }
        console.error("Error al obtener dietas");
        return {
            items: [],
            hasMore: false
        };
    }
};

export const fetchPacientes = async (query: string, page = 1): Promise<{ items: SearchItem[]; hasMore: boolean }> => {
    try {
        const res = await obtenerPacientes(`?name=${query}&pag=${page}&limit=10`);

        if (!res || !Array.isArray(res.data)) {
            console.warn("Respuesta inesperada en obtenerPacientes", res);
            return {
                items: [],
                hasMore: false
            };
        }

        const items = res.data.map((item: Paciente) => ({
            id: item.expediente,
            name: item.nombre,
            category: item.edad,
        }));

        return {
            items: items,
            hasMore: res.page < res.totalPages
        };
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error("Error al obtener pacientes:", error);
        }
        console.error("Error al obtener pacientes");
        return {
            items: [],
            hasMore: false
        };
    }
};

export const fetchTiemposComida = async (): Promise<ValorCatalogo[]> => {
    try {
        const response = await obtenerTiemposComida();

        if (!response || !Array.isArray(response.tiemposComida)) {
            console.warn("Respuesta inesperada en obtenerTiemposComida", response);
            return [];
        }

        return response.tiemposComida;
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error('Error obteniendo los tiempos de comida:', error);
        }
        console.error('Error obteniendo los tiempos de comida');
        return [];
    }
};

export const fetchRangosEdad = async (): Promise<AgeRange[]> => {
    try {
        const response = await obtenerRangosEdad();

        if (!response || !Array.isArray(response.data)) {
            console.warn("Respuesta inesperada en obtenerRangosEdad", response);
            return [];
        }

        return response.data;
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error('Error obteniendo los rangos de edad:', error);
        }
        console.error('Error obteniendo los rangos de edad');
        return [];
    }
};

export const fecthSalas = async (): Promise<Salas[]> => {
    try {
        const response = await obtenerSalas();

        if (!response || !Array.isArray(response)) {
            console.warn("Respuesta inesperada en obtenerSalas", response);
            return [];
        }

        return response;
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error('Error obteniendo las salas:', error);
        }
        console.error('Error obteniendo las salas');
        return [];
    }
};