/*
    Archivo: CocinaSolicitudes.tsx
    Descripcion: Pantalla para que cocina visualice las solicitudes.
    Autor: Marilyn Castro
    Fecha creacion: 28/07/2025
    Version: 1.0.1
*/
import { useState, useEffect, useRef } from 'react';
import MainLayout from "../layouts/LayoutPrincipal";
import SearchBar from "../components/SearchBar";
import HospitalizationCards from "../components/CardSolicitud";
import DetalleOrdenDieta from "../components/SolicitudDietas";
import type { DetalleOrdenDietaRef } from "../components/SolicitudDietas";
import { useAuth } from "../hooks/Auth";
import { useNotifications } from '../hooks/notificacionHook';
import { useUnsavedChangesWarning } from "../hooks/advertenciaCambiosNoGuardados";

import type { ValorCatalogo, Salas, PacienteUi } from '../types/ui';
import { fetchTiemposComida, fecthSalas } from "../utils/fecthDatos";
import type { DetalleOrden, OrdenDieta } from "../types/solicitud";
import { obtenerSolicitudesTodas, pdfSolicitud } from "../services/solicitudDietas";
import { validarCamposGenerico } from "../utils/validaciones";
import { mapOrdenDietaToCard, convertirADetalleFinalizado, mapDetalleOrdenToPacienteModificar } from "../utils/formatear";
import { etiquetaSala, etiquetaIndividual } from '../services/cocina';


const CocinaPage = () => {
    const { notify } = useNotifications();
    const [tiemposComida, setTiemposComida] = useState<ValorCatalogo[]>([]);
    const [salas, setSalas] = useState<Salas[]>([]);
    const [solicitudes, setSolicitudes] = useState<OrdenDieta[] | null>(null);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<number | null>(null);
    const [forzarVolver, setForzarVolver] = useState(false);
    const [pacientesEtiqueta, setPacientesEtiqueta] = useState<PacienteUi[] | null>(null);
    const [cambiosTemporales, setCambiosTemporales] = useState(
        new Map<string | number, Partial<PacienteUi>>()
    );

    const [search, setSearch] = useState(false);
    const [sala, setSala] = useState('');
    const [tiempoComida, setTiempoComida] = useState('');
    const [deliveryDate, setDeliveryDate] = useState(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });

    const [paginacion, setPaginacion] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        pageSize: 4,
    });

    const shouldBlock = cambiosTemporales.size > 0;
    useUnsavedChangesWarning(shouldBlock);

    const { permisos } = useAuth();
    const detalleRef = useRef<DetalleOrdenDietaRef>(null);

    const ordenSeleccionada = solicitudes?.find(
        (orden) => orden.id === solicitudSeleccionada
    );

    useEffect(() => {
        const fetchTiempos = async () => {
            const tiemposComidaData = await fetchTiemposComida();
            setTiemposComida(tiemposComidaData);
        };
        const obtenerSalas = async () => {
            const salasData = await fecthSalas();
            setSalas(salasData);
        };

        fetchTiempos();
        obtenerSalas();
    }, []);

    useEffect(() => {
        if (search && solicitudes?.length === 1 && !forzarVolver) {
            setSolicitudSeleccionada(solicitudes[0].id);
        }
        if (forzarVolver) {
            setForzarVolver(false);
        }
    }, [search, solicitudes]);


    const handleSearch = async (page: number = 1) => {
        const resultado = validarCamposGenerico({
            sala: { valor: sala, tipo: 'string', requerido: false },
            idTiempoComida: { valor: tiempoComida, tipo: 'number', requerido: false, min: 1, nombreCampo: "Tiempo de comida" },
            fecha: { valor: deliveryDate, tipo: 'string', requerido: false },
        });

        if (!resultado.ok) {
            notify({
                type: 'warning',
                title: 'Datos  inválidos',
                content: resultado.mensaje || 'Los datos no son correctos.',
                duration: 3000,
            });
            return;
        }

        const datos = resultado.datos;
        try {
            if (datos) {
                const params = `pag=${page}&limit=${paginacion.pageSize}`;
                const response = await obtenerSolicitudesTodas(datos, params);

                setSolicitudSeleccionada(null);
                setSolicitudes(response.datos);
                setPaginacion({
                    currentPage: page,
                    totalPages: response.totalPaginas,
                    totalItems: response.total,
                    pageSize: 4
                });

                setSearch(true);
            } else {
                setSearch(false);
            }

        } catch (error: any) {
            notify({
                type: 'error',
                content: error.response?.data?.error || 'Ocurrió un error al realizar la búsqueda.',
                duration: 3000,
            });
            setSolicitudes(null);
            setSearch(false);
        }
    };

    const onSearchSubmit = (_query?: string, leftVal?: string, rightVal?: string, dateSelector?: string) => {
        setSala(leftVal ?? '');
        setTiempoComida(rightVal ?? '');
        setDeliveryDate(dateSelector ?? '');
        handleSearch(1);
        setSearch(true);
    };

    const imprimirEtiquetaPaciente = async (paciente: string) => {

        if (ordenSeleccionada) {
            const newWindow = window.open("", "_blank");
            if (!newWindow) {
                alert("Por favor, permite ventanas emergentes para ver el PDF.");
                return;
            }

            try {
                const response = await etiquetaIndividual(paciente);

                const blob = new Blob([response as BlobPart], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);

                newWindow.location.href = url;

                setTimeout(() => URL.revokeObjectURL(url), 10000);
            } catch (error: any) {
                newWindow.close();
                notify({
                    type: 'error',
                    content: error.response?.data?.error || 'Ocurrió un error al generar el PDF.',
                    duration: 3000,
                });
            }

        }
    }

    const imprimirTodasEtiquetasSala = async () => {
        if (ordenSeleccionada) {
            const newWindow = window.open("", "_blank");
            if (!newWindow) {
                alert("Por favor, permite ventanas emergentes para ver el PDF.");
                return;
            }

            try {
                const response = await etiquetaSala(ordenSeleccionada?.id.toString());

                const blob = new Blob([response as BlobPart], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                newWindow.location.href = url;

                setTimeout(() => URL.revokeObjectURL(url), 10000);
            } catch (error: any) {
                newWindow.close();
                notify({
                    type: 'error',
                    content: error.response?.data?.error || 'Ocurrió un error al generar el PDF.',
                    duration: 3000,
                });
            }
        }
    }

    const imprimirPdfSolicitud = async () => {
        if (!ordenSeleccionada) return null;

        const newWindow = window.open("", "_blank");
        if (!newWindow) {
            alert("Por favor, permite ventanas emergentes para ver el PDF.");
            return;
        }

        try {
            const response = await pdfSolicitud(ordenSeleccionada.id.toString());
            const blob = new Blob([response as BlobPart], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            newWindow.location.href = url;

            setTimeout(() => URL.revokeObjectURL(url), 10000);

            if (detalleRef.current) {
                await detalleRef.current.actualizarOrden();
            }

        } catch (error: any) {
            newWindow.close();
            notify({
                type: 'error',
                content: error.response?.data?.error || 'Ocurrió un error al generar el PDF.',
                duration: 3000,
            });
        }
    }


    const obtenerEstadoTabla = (orden: OrdenDieta): "modificar" | "entrega" | "reclamo" | "cerrar" => {
        switch (orden.estado) {
            case 'Enviada a Cocina':
            case 'Modificada y Enviada a Cocina':
                return 'modificar';
            case 'Enviada a Sala':
                return 'entrega';
            case 'Recibida en Sala':
            case 'Recibida en Sala con Reclamo':
                return 'reclamo';
            default:
                return 'cerrar';
        }
    };

    const obtenerMapPaciente = (orden: OrdenDieta) => {
        if (orden.estado === 'Enviada a Cocina' || orden.estado === 'Modificada y Enviada a Cocina') {
            return mapDetalleOrdenToPacienteModificar;
        } else {
            return (data: DetalleOrden) => convertirADetalleFinalizado(data, orden.idEstado);
        }
    };

    return (
        <MainLayout>
            <h2 className="text-2xl font-semibold text-gray-800 text-center p-4">
                Solicitudes de dieta
            </h2>

            <SearchBar
                leftDropdown={{
                    options:
                        salas.map(sala => ({
                            label: sala.descripcion,
                            value: sala.descripcion,
                        })),
                    value: sala,
                    onChange: setSala,
                    placeholder: "Salas"
                }}
                rightDropdown={{
                    options:
                        tiemposComida.map(tiempo => ({
                            label: tiempo.valor,
                            value: String(tiempo.id),
                        })),
                    value: tiempoComida,
                    onChange: setTiempoComida,
                    placeholder: "Tiempo de comida"
                }}
                dateSelector={{
                    onDateChange: setDeliveryDate,
                    value: deliveryDate,
                    label: "Fecha de entrega",
                }}
                showSearchBar={false}
                onSearch={onSearchSubmit}
            />

            {search && (
                (!solicitudes || solicitudes.length === 0) ? (
                    <div className="text-center py-8 text-gray-500 bg-white rounded-lg mt-4">
                        No hay resultados
                    </div>
                ) : solicitudSeleccionada && ordenSeleccionada ? (

                    <DetalleOrdenDieta
                        ref={detalleRef}
                        ordenDieta={ordenSeleccionada}
                        permisos={permisos}
                        estadoTabla={obtenerEstadoTabla(ordenSeleccionada)}
                        idTiempoComida={ordenSeleccionada.idTiempoComida}
                        onVolver={() => { setSolicitudSeleccionada(null); setForzarVolver(true); handleSearch(1) }}
                        mapPaciente={obtenerMapPaciente(ordenSeleccionada)}
                        onEtiquetaPaciente={imprimirEtiquetaPaciente}
                        onPacientesActualizados={setPacientesEtiqueta}
                        cambiosTemporales={cambiosTemporales}
                        setCambiosTemporales={setCambiosTemporales}
                    />

                ) : (
                    <HospitalizationCards
                        cards={solicitudes?.map(item => (
                            mapOrdenDietaToCard(item)
                        ))}
                        onSeleccionar={(id) => setSolicitudSeleccionada(id)}
                        paginaActual={paginacion.currentPage}
                        totalPaginas={paginacion.totalPages}
                        onCambiarPagina={handleSearch}
                        totalItems={paginacion.totalItems}
                    />
                )
            )}

            {pacientesEtiqueta && pacientesEtiqueta.length > 0 && ordenSeleccionada && (
                <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-18 mt-4">
                    <button
                        onClick={() => imprimirTodasEtiquetasSala()}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded shadow"
                    >
                        Imprimir etiquetas de todos los pacientes
                    </button>

                    <button
                        onClick={() => imprimirPdfSolicitud()}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                    >
                        Imprimir pdf de la solicitud
                    </button>
                </div>

            )}

        </MainLayout>
    );
}

export default CocinaPage;