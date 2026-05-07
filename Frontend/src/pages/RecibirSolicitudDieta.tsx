/*
    Archivo: RecibirSolicitudDieta.tsx
    Descripcion: Pantalla para recibir las solicitudes de dietas en las salas.
    Autor: Marilyn Castro
    Fecha creacion: 23/07/2025
    Version: 1.0.1
*/
import { useState, useEffect, useCallback } from 'react';
import MainLayout from "../layouts/LayoutPrincipal";
import SearchBar from "../components/SearchBar";
import HospitalizationCards from "../components/CardSolicitud";
import DetalleOrdenDieta from "../components/SolicitudDietas";
import { useAuth } from "../hooks/Auth";
import { useNotifications } from '../hooks/notificacionHook';
import { convertirADetalleFinalizado } from "../utils/formatear";
import ConfirmDialog from "../components/ConfimModal";
import { useUnsavedChangesWarning } from "../hooks/advertenciaCambiosNoGuardados";

import type { ValorCatalogo, Salas, PacienteUi, PacienteFinalizado } from '../types/ui';
import { fetchTiemposComida, fecthSalas } from "../utils/fecthDatos";
import type { OrdenDieta, DetalleOrden } from "../types/solicitud";
import { obtenerSolicitudesRecibido, recibidoParcialSolicitud, recibidoSolicitud } from "../services/solicitudDietas";
import { validarCamposGenerico } from "../utils/validaciones";
import { mapOrdenDietaToCard } from "../utils/formatear";


const RecibidoPage = () => {
    const { notify } = useNotifications();
    const [tiemposComida, setTiemposComida] = useState<ValorCatalogo[]>([]);
    const [salas, setSalas] = useState<Salas[]>([]);
    const [solicitudes, setSolicitudes] = useState<OrdenDieta[] | null>(null);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<number | null>(null);
    const [pacientesActualizados, setPacientesActualizados] = useState<PacienteUi[]>([]);
    const [forzarVolver, setForzarVolver] = useState(false);

    const [search, setSearch] = useState(false);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [sala, setSala] = useState('');
    const [tiempoComida, setTiempoComida] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
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

    const { permisos } = useAuth();

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

    useEffect(() => {
        const idsRecibidos = pacientesActualizados
            .filter((p): p is PacienteFinalizado =>
                (p.estado === 'entrega' || p.estado === 'reclamo' || p.estado === 'cerrar') && p.recibido
            )
            .map(p => p.id);

        setHasUnsavedChanges(idsRecibidos.length > 0);
    }, [pacientesActualizados]);

    useUnsavedChangesWarning(hasUnsavedChanges);

    const ConfirmarEnviarEstado = () => {
        setMostrarConfirmacion(true);
        setPacientesActualizados(prev =>
            prev.map(p =>
                p.estado === 'entrega' || p.estado === 'reclamo' || p.estado === 'cerrar'
                    ? { ...p, recibido: true }
                    : p
            )
        );
    };

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
                const response = await obtenerSolicitudesRecibido(datos, params);

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
                content: error.response?.data?.error || 'Ocurrió un error al realizar la búsqueda',
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

    const manejarRecibidosParcial = async (pacientes: PacienteUi[]) => {
        try {
            if (!solicitudSeleccionada) return;
            const idsRecibidos = pacientes
                .filter((p): p is PacienteFinalizado =>
                    (p.estado === 'entrega' || p.estado === 'reclamo' || p.estado === 'cerrar') && p.recibido
                )
                .map(p => p.id);

            if (idsRecibidos.length > 0) {
                const data = {
                    idDetalles: idsRecibidos
                }

                await recibidoParcialSolicitud(solicitudSeleccionada.toString(), data);

                notify({
                    type: 'success',
                    content: 'Raciones recibidas guardadas correctamente.',
                    duration: 3000,
                });
                setPacientesActualizados([]);
                setSolicitudSeleccionada(null);
                setForzarVolver(true);
                handleSearch(1);

            } else {
                notify({
                    type: 'warning',
                    content: 'Debe marcar como recibido como mínimo un paciente.',
                    duration: 3000,
                });
            }

        } catch (error: any) {
            notify({
                type: 'error',
                content: error.response?.data?.error || 'Ocurrió un error al guardar los pacientes recibidos.',
                duration: 3000,
            });
        }
    };

    const manejarRecibido = async () => {
        try {
            if (!solicitudSeleccionada) return;

            await recibidoSolicitud(solicitudSeleccionada.toString());

            notify({
                type: 'success',
                content: 'Raciones recibidas guardadas correctamente.',
                duration: 3000,
            });

            setPacientesActualizados([]);
            setSolicitudSeleccionada(null);
            setForzarVolver(true);
            handleSearch(1);
        } catch (error: any) {
            notify({
                type: 'error',
                content: error.response?.data?.error || 'Ocurrió un error al guardar los pacientes recibidos.',
                duration: 3000,
            });
        } finally {
            setMostrarConfirmacion(false);
        }
    };

    const obtenerMapPaciente = (orden: OrdenDieta) => {

        return (data: DetalleOrden) => convertirADetalleFinalizado(data, orden.idEstado);
    };

    const areArraysEqual = (a: PacienteUi[], b: PacienteUi[]) => {
        if (a.length !== b.length) return false;
        return a.every((item, index) => JSON.stringify(item) === JSON.stringify(b[index]));
    };

    const handlePacientesActualizados = useCallback((nuevosPacientes: PacienteUi[]) => {
        setPacientesActualizados(prev => {
            if (areArraysEqual(prev, nuevosPacientes)) return prev;
            return nuevosPacientes;
        });
    }, []);


    return (
        <MainLayout>
            <h2 className="text-2xl font-semibold text-gray-800 text-center p-4">
                Recibir la solicitud de dieta
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

            {ordenSeleccionada && (
                <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-18 mt-4">
                    <button
                        onClick={() => manejarRecibidosParcial(pacientesActualizados)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-6 rounded shadow"
                    >
                        Marcar los seleccionados como recibido
                    </button>

                    <button
                        onClick={() => ConfirmarEnviarEstado()}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                    >
                        Marcar todos como recibido
                    </button>

                </div>
            )}

            {search && (
                (!solicitudes || solicitudes.length === 0) ? (
                    <div className="text-center py-8 text-gray-500 bg-white rounded-lg mt-4">
                        No hay resultados
                    </div>
                ) : solicitudSeleccionada && ordenSeleccionada ? (

                    <DetalleOrdenDieta
                        ordenDieta={ordenSeleccionada}
                        permisos={permisos}
                        estadoTabla={'entrega'}
                        idTiempoComida={ordenSeleccionada.idTiempoComida}
                        onVolver={() => { setSolicitudSeleccionada(null); setForzarVolver(true); handleSearch(1) }}
                        mapPaciente={obtenerMapPaciente(ordenSeleccionada)}
                        onPacientesActualizados={handlePacientesActualizados}
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

            <ConfirmDialog
                isOpen={mostrarConfirmacion}
                title="Confirmar recepción de dietas"
                message="Todas las dietas serán marcadas como recibidas. ¿Confirma esta acción?"
                onConfirm={manejarRecibido}
                confirmColor={'blue'}
                onCancel={() => { setMostrarConfirmacion(false) }}
            />
        </MainLayout>
    );
}

export default RecibidoPage;