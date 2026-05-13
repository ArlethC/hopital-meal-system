/*
    Archivo: HistorialFila.tsx
    Descripcion: componente que renderiza el historial de una fila de la tablaSolicitudDietas.
    Autor: Marilyn Castro
    Fecha creacion: 15/07/2025
    Version: 1.0.1
*/

import { Activity } from 'react-feather';
import type { PacienteUi } from '../../types/ui';
import type { Historial } from '../../types/solicitud';

import { fechaATexto } from "../../utils/formatear";

interface Props {
    paciente: PacienteUi;
    historial: Historial[];
    onCerrar: (id: string | number) => void;
    getPacienteKey: (paciente: PacienteUi) => string | number;
}

const agruparPorCampo = (historial: Historial[]) => {
    const agrupado = new Map<string, Historial[]>();

    historial.forEach(cambio => {
        if (!agrupado.has(cambio.campoModificado)) {
            agrupado.set(cambio.campoModificado, []);
        }
        agrupado.get(cambio.campoModificado)!.push(cambio);
    });

    return agrupado;
};

const HistorialRow: React.FC<Props> = ({
    paciente,
    historial,
    onCerrar,
    getPacienteKey
}) => {
    if (!historial.length) return null;

    const historialAgrupado = agruparPorCampo(historial);

    const campos = [...historialAgrupado.keys()];
    const maxCambios = Math.max(...campos.map(campo => historialAgrupado.get(campo)!.length));
    const nombresCampos: Record<string, string> = {
        obs_enfermeria: 'Observación enfermeria',
        obs_nutricion: 'Observación nutrición',
        id_dieta_vigente: 'Tipo dieta',
        estado_detalle: 'Cancelado/reactivado'
    };


    return (
        <tr key={`${paciente.expediente}-historial`} className="bg-gray-50">
            <td colSpan={20} className="px-4 py-3 border-b">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                        <Activity size={16} className="mr-2" />
                        Historial de Cambios - {paciente.paciente}
                    </h4>

                    <div className="overflow-auto max-h-64">
                        <table className="min-w-full table-auto border border-gray-200">
                            <thead>
                                <tr className="bg-blue-100">
                                    {campos.map(campo => (
                                        <th
                                            key={campo}
                                            className="border px-3 py-2 text-left text-sm font-semibold text-blue-700 capitalize"
                                        >
                                            {nombresCampos[campo] ?? campo}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {[...Array(maxCambios)].map((_, rowIndex) => (
                                    <tr key={rowIndex} className="even:bg-gray-50">
                                        {campos.map(campo => {
                                            const cambios = historialAgrupado.get(campo)!;
                                            const cambio = cambios[rowIndex];
                                            return (
                                                <td key={campo} className="border px-3 py-2 align-top text-sm text-gray-700">
                                                    {cambio ? (
                                                        <>
                                                            <div>
                                                                <strong className="text-red-600">
                                                                    {campo === 'estado_detalle' ? 'Nuevo valor:' : 'Valor anterior:'}
                                                                </strong>{" "}
                                                                {campo === 'estado_detalle'
                                                                    ? cambio.valorNuevo || 'Sin valor'
                                                                    : cambio.valorAnterior || 'Sin valor'}
                                                            </div>

                                                            <div>
                                                                Cambio por: <span className="text-blue-600">{cambio.usuarioCambio}</span>
                                                            </div>
                                                            <div className="italic text-gray-600 text-xs">
                                                                {fechaATexto(cambio.fechaCambio)}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400 italic">-</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => onCerrar(getPacienteKey(paciente))}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            Cerrar historial
                        </button>
                    </div>
                </div>
            </td>
        </tr>
    );
};

export default HistorialRow;
