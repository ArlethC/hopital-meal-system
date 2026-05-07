/*
    Archivo: ListDocumentos.tsx
    Descripcion: Componente para mostrar los documentos de nutrición.
    Autor: Marilyn Castro
    Fecha creacion: 21/07/2025
    Version: 1.0.2
*/
import { useState, useEffect } from 'react';
import { X, Eye, Calendar, Trash, } from 'react-feather';
import { obtenerDocumentoPaciente } from '../services/documentosNutricion';
import type { Documento } from '@miapp/shared';
import { useNotifications } from '../hooks/notificacionHook';
import { formatearNombre, fechaATexto } from "../utils/formatear";
import Pagination from './Pagination';

interface DocumentosProps {
    expediente: string;
    isModal?: boolean;
    onClose?: () => void;
    nombrePaciente?: string;
    onDelete?: (id: number) => void;
    refreshTable?: number;
}

const PatientDocuments: React.FC<DocumentosProps> = ({
    expediente,
    isModal = false,
    onClose,
    nombrePaciente,
    onDelete,
    refreshTable
}) => {
    const { notify } = useNotifications();

    const [documentos, setDocumentos] = useState<Documento[] | null>(null);
    const [paginacion, setPaginacion] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        pageSize: 2,
    });

    useEffect(() => {
        handleSearch(1);
    }, [expediente, refreshTable]);

    const handleSearch = async (page: number = 1) => {
        if (expediente) {
            try {
                const datos = await obtenerDocumentoPaciente(expediente, `pag=${page}&limit=${paginacion.pageSize}`);
                setDocumentos(datos.data);
                setPaginacion({
                    currentPage: page,
                    totalPages: datos.totalPages,
                    totalItems: datos.total,
                    pageSize: datos.pageSize
                });
            } catch (error: any) {
                notify({
                    type: 'error',
                    content: error.response?.data?.error || 'Error al obtener los documentos del paciente',
                    duration: 3000,
                });
            }
        }
    };

    const isMobileDevice = () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    const isIOS = () => {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    };

    const handleVerDocumento = async (rutaDocumento: string) => {
        try {
            const response = await fetch(rutaDocumento, {
                method: 'HEAD'
            });

            if (!response.ok) {
                notify({
                    type: 'error',
                    content: `El documento no se encontró o no está disponible.`,
                    duration: 3000,
                });
                return;
            }

            const contentType = response.headers.get('content-type') || '';

            if (isMobileDevice()) {
                if (contentType.includes('application/pdf')) {
                    const link = document.createElement('a');
                    link.href = rutaDocumento;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';

                    if (isIOS()) {
                        window.open(rutaDocumento, '_blank');
                    } else {
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                } else if (contentType.startsWith('image/')) {
                    window.open(rutaDocumento, '_blank');
                } else {
                    const link = document.createElement('a');
                    link.href = rutaDocumento;
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            } else {
                setTimeout(() => {
                    window.open(rutaDocumento, '_blank');
                }, 100);
            }

        } catch {
            notify({
                type: 'error',
                content: `Error al intentar abrir el documento.`,
                duration: 3000,
            });
        }
    };

    const content = (
        <div className="bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
            <div className="flex items-center justify-between p-6 border-b">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">
                        Documentos del Paciente
                    </h3>

                    {isModal && nombrePaciente && (
                        <div className="flex flex-col md:flex-row md:items-center md:justify-start md:gap-x-20 gap-y-2 p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Expediente</p>
                                <p className="text-sm font-mono text-gray-800">{expediente}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Nombre</p>
                                <p className="text-sm font-semibold text-gray-800">{formatearNombre(nombrePaciente)}</p>
                            </div>
                        </div>
                    )}
                </div>
                {isModal && (
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Cerrar modal"
                        title="Cerrar modal"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                )}
            </div>

            <div className="p-6">
                <div className="overflow-x-auto">
                    {!documentos || documentos?.length === 0 ? (
                        <p className="text-gray-600 italic">No se registran documentos de nutrición</p>
                    ) : (
                        <>
                            <table className="w-full border-collapse border border-gray-200" aria-label="Listado de documentos">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">
                                            Tipo de documento
                                        </th>
                                        <th className="border border-gray-200 px-3 py-2  text-left font-semibold text-gray-700">
                                            Archivo
                                        </th>
                                        <th className="border border-gray-200 px-3 py-2  text-left font-semibold text-gray-700">
                                            Fecha inicial vigencia
                                        </th>
                                        <th className="border border-gray-200 px-3 py-2  text-left font-semibold text-gray-700">
                                            Fecha final vigencia
                                        </th>
                                        {!isModal && (
                                            <th className="border border-gray-200 px-3 py-2  text-center font-semibold text-gray-700">
                                                Detalle para Cocina
                                            </th>
                                        )}
                                        <th className="border border-gray-200 px-3 py-2  text-center font-semibold text-gray-700">
                                            Ver archivo
                                        </th>
                                        {!isModal && (
                                            <th className="border border-gray-200 px-3 py-2  text-center font-semibold text-gray-700">
                                                Desactivar
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {documentos.map((documento: Documento) => (
                                        <tr key={documento.idDocumento} className="hover:bg-gray-50">
                                            <td className="border border-gray-200 px-3 py-2">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium">
                                                        {documento.tipoDocumento}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="border border-gray-200 px-3 py-2">
                                                <span className="text-sm text-gray-600 font-mono">
                                                    {documento.rutaDocumento.split('/').pop()}
                                                </span>
                                            </td>
                                            <td className="border border-gray-200 px-3 py-2">
                                                <div className="flex items-center space-x-1 text-sm text-gray-600">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{documento.fechaInicial ? fechaATexto(documento.fechaInicial) : '-'}</span>
                                                </div>
                                            </td>
                                            <td className="border border-gray-200 px-3 py-2">
                                                <div className="flex items-center space-x-1 text-sm text-gray-600">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{documento.fechaFinalVigencia ? fechaATexto(documento.fechaFinalVigencia) : '-'}</span>
                                                </div>
                                            </td>
                                            {!isModal && (
                                                <td className="border border-gray-200 px-3 py-2">
                                                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                                                        <span>{documento.obsDocumento ? documento.obsDocumento : '-'}</span>
                                                    </div>
                                                </td>
                                            )}
                                            <td className="border border-gray-200 px-3 py-2">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button
                                                        onClick={() => handleVerDocumento(documento.rutaDocumento)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                        title="Ver documento"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                            {!isModal && onDelete && (
                                                <td className="border border-gray-200 px-3 py-2 text-center">
                                                    <button
                                                        onClick={() => onDelete(documento.idDocumento)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                        title="Desactivar documento"
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            )}

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Pagination
                                currentPage={paginacion.currentPage}
                                totalPages={paginacion.totalPages}
                                onPageChange={handleSearch}
                                itemsPerPage={paginacion.pageSize}
                                totalItems={paginacion.totalItems}
                            />
                        </>
                    )}

                </div>
            </div>

        </div>
    );

    if (isModal) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2 sm:px-4 overflow-y-auto">
                <div className="bg-white w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl rounded-lg shadow-lg p-4 my-6 sm:my-12 overflow-y-auto max-h-[90vh]">
                    {content}
                </div>
            </div>
        );
    }

    return content;
};

export default PatientDocuments;