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
    permisoUsuario: string[],
    estado: string
) {
    switch (columna) {
        case 'obsEnfermeria':
            return (permisoUsuario && (permisoUsuario.includes('crear solicitud') || permisoUsuario.includes('admin') || permisoUsuario.includes('ver solicitudes') || permisoUsuario.includes('nutricion') || permisoUsuario.includes('solicitud extraordinaria')));
        case 'obsNutricion':
            return (estado != 'crear' && (permisoUsuario.includes('crear solicitud') || permisoUsuario.includes('admin') || permisoUsuario.includes('ver solicitudes') || permisoUsuario.includes('nutricion')));
        case 'obsCocina':
            return estado != 'crear'  && (permisoUsuario.includes('cocina') || permisoUsuario.includes('nutricion') || permisoUsuario.includes('admin') || permisoUsuario.includes('ver solicitudes'));
        case 'observaciones':
            return (estado != 'crear' && permisoUsuario.includes('cocina'));
        case 'recibido':
            return (estado === 'entrega' || estado === 'reclamo' || estado === 'cerrar') && (permisoUsuario && permisoUsuario.includes('crear solicitud') || permisoUsuario.includes('cocina') || permisoUsuario.includes('admin') || permisoUsuario.includes('ver solicitudes'));
        case 'reclamo':
            return (estado === 'entrega' || estado === 'reclamo' || estado === 'cerrar') && (permisoUsuario.includes('crear solicitud') || permisoUsuario.includes('cocina') || permisoUsuario.includes('admin') || permisoUsuario.includes('ver solicitudes'));
        case 'imprimir':
            return (estado != 'crear') && (permisoUsuario.includes('cocina'));
        default:
            return true;
    }
}

export function puedeEditar(
    columna: string,
    filaId: string | number,
    filaSeleccionada: Set<string> | undefined,
    editandoFila: string | number | null,
    permisoUsuario: string[],
    estado: string
) {
    const estaSeleccionada = filaSeleccionada?.has(String(filaId));
    const estaEditando = editandoFila === filaId;

    switch (columna) {
        case 'dietaSeleccionada':
            return (estado === 'crear' && estaSeleccionada && (permisoUsuario.includes('crear solicitud') || permisoUsuario.includes('admin') || permisoUsuario.includes('solicitud extraordinaria')) || (estado === 'modificar' && estaEditando && permisoUsuario.includes('crear solicitud') ));
        case 'obsEnfermeria':
            return (estado === 'crear' && estaSeleccionada && (permisoUsuario.includes('crear solicitud') || permisoUsuario.includes('admin') || permisoUsuario.includes('solicitud extraordinaria'))) || (estado === 'modificar' && estaEditando && permisoUsuario.includes('crear solicitud') );
        case 'obsNutricion':
            return estado === 'modificar' && estaEditando && permisoUsuario.includes('nutricion');
        case 'obsCocina':
            return (estado === 'modificar' || estado === 'entrega')  && estaEditando && permisoUsuario.includes('cocina');
        case 'recibido':
            return estado === 'entrega' && permisoUsuario.includes('crear solicitud');
        case 'reclamo':
            return estado === 'entrega' && permisoUsuario.includes('crear solicitud');
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