/*
    Archivo: tablaUtils.ts
    Descripcion: funciones para validar acciones en la tabla de detalles de solicitud de dietas.
    Autor: Marilyn Castro
    Fecha creacion: 10/08/2025
    Version: 1.0.3
*/
import type { PacienteUi, PacienteCrear, PacienteObservaciones } from '../../../types/ui';

export function getPacienteKey(paciente: PacienteUi): string | number {
    if (paciente.estado === 'crear') return paciente.expediente;
    return paciente.id;
}

export function esPacienteNoCrear(p: PacienteUi): p is Exclude<PacienteUi, PacienteCrear> {
    return p.estado !== 'crear';
}

export function puedeVerColumna(
    columna: string,
    permisoUsuario: Record<string, boolean>,
    estado: string
) {
    switch (columna) {
        case 'obsEnfermeria':
            return (permisoUsuario && (permisoUsuario['crear solicitud'] || permisoUsuario['admin'] || permisoUsuario['ver solicitudes'] || permisoUsuario['nutricion'] || permisoUsuario['solicitud extraordinaria']));
        case 'obsNutricion':
            return (estado != 'crear' && (permisoUsuario['crear solicitud'] || permisoUsuario['admin'] || permisoUsuario['ver solicitudes'] || permisoUsuario['nutricion']));
        case 'obsCocina':
            return estado != 'crear'  && (permisoUsuario['cocina'] || permisoUsuario['nutricion'] || permisoUsuario['admin'] || permisoUsuario['ver solicitudes']);
        case 'observaciones':
            return (estado != 'crear' && permisoUsuario['cocina']);
        case 'recibido':
            return (estado === 'entrega' || estado === 'reclamo' || estado === 'cerrar') && (permisoUsuario && permisoUsuario['crear solicitud'] || permisoUsuario['cocina'] || permisoUsuario['admin'] || permisoUsuario['ver solicitudes']);
        case 'reclamo':
            return (estado === 'entrega' || estado === 'reclamo' || estado === 'cerrar') && (permisoUsuario['crear solicitud'] || permisoUsuario['cocina'] || permisoUsuario['admin'] || permisoUsuario['ver solicitudes']);
        case 'imprimir':
            return (estado != 'crear') && (permisoUsuario['cocina']);
        default:
            return true;
    }
}

export function puedeEditar(
    columna: string,
    filaId: string | number,
    filaSeleccionada: Set<string> | undefined,
    editandoFila: string | number | null,
    permisoUsuario: Record<string, boolean>,
    estado: string
) {
    const estaSeleccionada = filaSeleccionada?.has(String(filaId));
    const estaEditando = editandoFila === filaId;

    switch (columna) {
        case 'dietaSeleccionada':
            return (estado === 'crear' && estaSeleccionada && (permisoUsuario['crear solicitud'] || permisoUsuario['admin'] || permisoUsuario['solicitud extraordinaria'])) || (estado === 'modificar' && estaEditando && permisoUsuario['crear solicitud'] );
        case 'obsEnfermeria':
            return (estado === 'crear' && estaSeleccionada && (permisoUsuario['crear solicitud'] || permisoUsuario['admin'] || permisoUsuario['solicitud extraordinaria'])) || (estado === 'modificar' && estaEditando && permisoUsuario['crear solicitud'] );
        case 'obsNutricion':
            return estado === 'modificar' && estaEditando && permisoUsuario['nutricion'];
        case 'obsCocina':
            return ((estado === 'modificar' && estaEditando) || (estado === 'entrega' && estaEditando)) && permisoUsuario['cocina'];
        case 'recibido':
            return estado === 'entrega' && permisoUsuario['crear solicitud'];
        case 'reclamo':
            return estado === 'entrega' && permisoUsuario['crear solicitud'];
        default:
            return false;
    }
}

export function obtenerValorCampo(
    paciente: PacienteUi,
    campo: keyof PacienteUi | keyof PacienteObservaciones,
    cambiosTemporales: Map<string | number, Partial<PacienteUi>> | undefined,
    editandoFila: string | number | null
): any {
    const id = getPacienteKey(paciente);
    const cambios = cambiosTemporales?.get(id);

    if (editandoFila === id && cambios && (cambios as any)[campo] !== undefined) {
        return (cambios as any)[campo];
    }

    if (campo in paciente) {
        return (paciente as any)[campo];
    }
}