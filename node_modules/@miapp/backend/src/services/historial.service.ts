/*
    Archivo: historial.service.ts
    Descripcion: funciones para almacenar cambios en la tabla de historial.
    Autor: Marilyn Castro
    Fecha creacion: 23/07/2025
    Version: 1.0.1
*/
import { bd } from '../config/database';

export enum TipoOperacion {
    MODIFICAR = 'modificar',
    CANCELAR = 'cancelar',
    REACTIVAR = 'reactivar',
    ELIMINAR = 'eliminar',
    CAMBIO_ESTADO = 'cambio_estado',
    CREAR_RECLAMO = "crear_reclamo",
    MODIFICAR_RECLAMO = "modificar_reclamo",
    ESTADO_RECLAMO = "estado_reclamo",
    RECIBIDO = "recibido",
}

export type Cambio = {
    campo: string;
    valorAnterior?: string;
    nuevoValor?: string;
};

export async function registrarHistorial(data: {
    tabla: string;
    idRegistro: number;
    cambios: Cambio[]; 
    operacion: TipoOperacion;
    usuario: string;
    ipUsuario: string;
}) {
    const camposModificados = data.cambios.map(c => c.campo).join(',');

    const valoresAnteriores = data.cambios.map(c => c.valorAnterior ?? '').join('|');

    const nuevosValores = data.cambios.map(c => c.nuevoValor ?? '').join('|');

    await bd.ejecutarProcedimiento('dbo.RegistrarHistorial', [
        { nombre: 'tablaAfectada', valor: data.tabla },
        { nombre: 'idRegistroAfectado', valor: data.idRegistro },
        { nombre: 'campoModificado', valor: camposModificados },
        { nombre: 'tipoOperacion', valor: data.operacion },
        { nombre: 'valorAnterior', valor: valoresAnteriores },
        { nombre: 'nuevoValor', valor: nuevosValores },
        { nombre: 'usuarioCambio', valor: data.usuario },
        { nombre: 'ipUsuario', valor: data.ipUsuario },
    ]);
}

