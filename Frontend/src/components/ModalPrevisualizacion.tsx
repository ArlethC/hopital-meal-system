/*
    Archivo: ModalPrevisualizacion.tsx
    Descripcion: Componente para previsualizar la solicitud antes de enviarla a la base de datos.
    Autor: Marilyn Castro
    Fecha creacion: 11/07/2025
    Version: 1.0.0
*/
import { useState } from 'react';
import { Send, Edit } from 'react-feather';
import { ValidarFecha } from "../utils/validaciones";
import { useNotifications } from '../hooks/notificacionHook';

import { fechaATexto, fechaHoraActualATexto } from "../utils/formatear";
import type { Dieta } from "../types/ui";
import { type PacienteOmitido, type RespuestaEntregaDietas, type DetalleEntrega } from "../types/solicitud";
import { crearSolicitud } from "../services/solicitudDietas";


interface DatosPrevisualizacion {
    edificio: string;
    sala: string;
    usuario: string;
    fecha: string;
    idTiempoComida: string;
    tiempoComida?: string;
    pacientes: {
        expediente: number;
        cama: string;
        paciente: string;
        edadTexto: string;
        dietaSeleccionada: Dieta;
        obsEnfermeria: string;
        idRelacion?: number;
        tipoRelacion?: string;
    }[];
}

interface PropsPreviewModal {
    setShowModal: (showModal: boolean) => void;
    setShowSuccessModal: (showSuccessModal: boolean) => void;
    setBusqueda: (showSuccessModal: boolean) => void;
    datos: DatosPrevisualizacion,
    setPacienteOmitidos: React.Dispatch<React.SetStateAction<PacienteOmitido[]>>;
}

const PreviewModal: React.FC<PropsPreviewModal> = ({
    setShowModal,
    setShowSuccessModal,
    setBusqueda,
    datos,
    setPacienteOmitidos,
}) => {
    const { notify } = useNotifications();

    const [enviandoDatos, setEnviandoDatos] = useState(false);

    function convertirADetalleEntrega(datos: DatosPrevisualizacion): RespuestaEntregaDietas {
        const detalles: DetalleEntrega[] = datos.pacientes.map(p => {
            const detalle: DetalleEntrega = {
                expediente: p.expediente.toString(),
                cama: p.cama,
                idDieta: p.dietaSeleccionada.codigo,
                obsEnfermeria: p.obsEnfermeria,
                idRelacion: p.idRelacion,
                tipoRelacion: p.tipoRelacion,
            };

            return detalle;
        });

        return {
            sala: datos.sala,
            fechaEntrega: datos.fecha,
            idTiempoComida: Number(datos.idTiempoComida),
            detalles
        };
    }


    const enviarDatos = async () => {

        const datosBackend = convertirADetalleEntrega(datos);

        if (ValidarFecha(datosBackend.fechaEntrega)) {
            notify({
                type: 'warning',
                title: 'Datos  inválidos',
                content: "Selecciona una fecha igual o mayor a la fecha actual.",
                duration: 3000,
            });
            return;
        }

        setEnviandoDatos(true);

        try {
            const pacientesOmitidos = await crearSolicitud(datosBackend);

            setPacienteOmitidos(pacientesOmitidos);

            setShowSuccessModal(true);
            setBusqueda(false);
            setShowModal(false);

        } catch (error: any) {
            notify({
                type: 'error',
                content: error.response?.data?.error || 'Ocurrió un error al crear la solicitud de dietas.',
                duration: 3000,
            });
        } finally {
            setEnviandoDatos(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden mx-4">
                <div className="bg-blue-500 text-white px-6 py-4 flex just justify-center">
                    <h2 className="text-xl font-bold">Previsualización - Borrador</h2>
                </div>

                <div className="bg-gray-50 px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">{datos.tiempoComida}</h3>
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p><span className="font-medium">Sala:</span> {datos.sala}</p>
                                <p><span className="font-medium">Fecha y hora de envío:</span> {fechaHoraActualATexto()}</p>
                                <p><span className="font-medium">Solicitud generada por:</span> {datos.usuario}</p>
                            </div>
                        </div>
                        <div className="text-left">
                            <div className="text-sm text-gray-600 space-y-1 items-start">
                                <p><span className="font-medium">Fecha de entrega:</span> {fechaATexto(datos.fecha)}</p>
                                <p><span className="font-medium">Edificio:</span> {datos.edificio}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-auto max-h-[50vh]">
                    <table className="w-full">
                        <thead className="bg-gray-100 sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cama</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edad</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de dieta</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observaciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {datos.pacientes.map((paciente, index) => (
                                <tr key={paciente.expediente} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {paciente.cama}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {paciente.paciente}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {paciente.edadTexto}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {paciente.dietaSeleccionada.nombre}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-900 max-w-xs">
                                        <div className="truncate" title={paciente.obsEnfermeria}>
                                            {paciente.obsEnfermeria || '-'}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
                    <div className="text-sm text-gray-600">
                        <p className="font-medium">Resumen:</p>
                        <p>{datos.pacientes.length} pacientes listos para enviar</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowModal(false)}
                            className="flex items-center px-3 py-2 bg-gray-500 text-white rounded-md text-sm font-medium  hover:bg-gray-600 transition-colors"
                            disabled={enviandoDatos}
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Seguir Editando
                        </button>
                        <button
                            onClick={enviarDatos}
                            disabled={enviandoDatos}
                            className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {enviandoDatos ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Enviar a Cocina
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreviewModal;
