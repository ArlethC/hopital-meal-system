/*
    Archivo: ListAlergiaIntolerancia.tsx
    Descripcion: componente que muestra la lista de alergias e intolerancias.
    Autor: Marilyn Castro
    Fecha creacion: 17/07/2025
    Version: 1.0.1
*/
import React, { useEffect, useState } from 'react';
import { AlertTriangle, Trash2, Edit2 } from 'react-feather';
import { formatearNombre } from "../utils/formatear";
import { obtenerAlergiasIntolerancias } from "../services/alergiaIntolerancia";
import { useNotifications } from '../hooks/notificacionHook';
import type { AlergiaIntolerancia, AlergiasIntoleranciasPaciente } from '@miapp/shared';

interface Props {
    patientData?: AlergiasIntoleranciasPaciente;
    expediente?: string;
    onEdit?: (alergia: AlergiaIntolerancia) => void;
    onDelete?: (alergia: AlergiaIntolerancia) => void;
}

const PatientInfoScreen: React.FC<Props> = ({
    patientData,
    expediente,
    onEdit,
    onDelete,
}) => {
    const { notify } = useNotifications();
    const [info, setInfo] = useState<AlergiasIntoleranciasPaciente | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!info && expediente) {
                try {
                    const data = await obtenerAlergiasIntolerancias(expediente);
                    setInfo(data);
                } catch (error: any) {
                    notify({
                        type: 'error',
                        content: error.response?.data?.error || 'Error al obtener alergias del paciente',
                        duration: 3000,
                    });
                }
            }
        };
        fetchData();
    }, [expediente]);

    useEffect(() => {
        if (patientData) {
            setInfo(patientData);
        }
    }, [patientData]);

    if (!info) return <p className="text-gray-500 italic">Cargando información del paciente...</p>;

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-start md:gap-x-20 gap-y-2 p-3 bg-gray-50 rounded-lg">
                <div>
                    <p className="text-sm font-medium text-gray-600">Expediente</p>
                    <p className="text-sm font-mono text-gray-800">{info.expediente}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600">Nombre</p>
                    <p className="text-sm font-semibold text-gray-800">{formatearNombre(info.nombre)}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600">Edad</p>
                    <p className="text-sm font-semibold text-gray-800">{info.edad}</p>
                </div>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h3 className="font-semibold text-red-800">Alergias e Intolerancias</h3>
                </div>

                {info.alergias.length > 0 ? (
                    <div className="space-y-2">
                        {info.alergias.map((alergia) => (
                            <div key={alergia.id} className="flex items-center space-x-2 p-2 bg-white rounded border border-red-200">
                                <span className="text-red-800 font-medium capitalize">
                                    {alergia.alergiasIntolerancias}
                                </span>
                                {!expediente && (
                                    <div className="flex space-x-2 ml-4">
                                        <button
                                            onClick={() => onEdit?.(alergia)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete?.(alergia)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}

                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600 italic">No se registran alergias</p>
                )}
            </div>
        </div>
    );
};

export default PatientInfoScreen;