/*
    Archivo: VisualizarSolicitudes.tsx
    Descripcion: Pantalla para visualizar solicitudes de dietas.
    Autor: Marilyn Castro
    Fecha creacion: 21/08/2025
    Version: 1.0.0
*/
import { useState, useEffect, useRef } from 'react';
import MainLayout from "../layouts/LayoutPrincipal";
import SearchBar from "../components/SearchBar";
import HospitalizationCards from "../components/CardSolicitud";
import DetalleOrdenDieta from "../components/SolicitudDietas";
import type { DetalleOrdenDietaRef } from "../components/SolicitudDietas";
import { useAuth } from "../hooks/Auth";
import { useNotifications } from '../hooks/notificacionHook';

import type { ValorCatalogo, Salas } from '../types/ui';
import { fetchTiemposComida, fecthSalas } from "../utils/fecthDatos";
import type { DetalleOrden, OrdenDieta } from "../types/solicitud";
import { obtenerSolicitudesTodas, obtenerEstadosSolicitud } from "../services/solicitudDietas";
import { validarCamposGenerico } from "../utils/validaciones";
import { mapOrdenDietaToCard, convertirADetalleFinalizado, mapDetalleOrdenToPacienteModificar } from "../utils/formatear";


const VisualizarPage = () => {
    const { notify } = useNotifications();
    const [tiemposComida, setTiemposComida] = useState<ValorCatalogo[]>([]);
    const [estados, setEstados] = useState<ValorCatalogo[]>([]);
    const [salas, setSalas] = useState<Salas[]>([]);
    const [solicitudes, setSolicitudes] = useState<OrdenDieta[] | null>(null);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<number | null>(null);
    const [forzarVolver, setForzarVolver] = useState(false);

    const [search, setSearch] = useState(false);
    const [sala, setSala] = useState('');
    const [tiempoComida, setTiempoComida] = useState('');
    const [estado, setEstado] = useState('');
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

        const obtenerEstados = async () => {
            try {
                const response = await obtenerEstadosSolicitud();

                if (!response || !Array.isArray(response.estados)) {
                    console.warn("Respuesta inesperada en obtenerTiemposComida", response);
                    setEstados([]);
                }

                setEstados(response.estados);
            } catch (error) {
                if (import.meta.env.DEV) {
                    console.error('Error obteniendo los tiempos de comida:', error);
                }
                console.error('Error obteniendo los tiempos de comida');
                setEstados([]);
            }

        }

        fetchTiempos();
        obtenerSalas();
        obtenerEstados();
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
            idEstado: { valor: estado, tipo: 'number', requerido: false, min: 1, nombreCampo: "Estado de la solicitud" },
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

    const onSearchSubmit = (_query?: string, leftVal?: string, rightVal?: string, dateSelector?: string, centerValue?: string) => {
        setSala(leftVal ?? '');
        setTiempoComida(centerValue ?? '');
        setDeliveryDate(dateSelector ?? '');
        setEstado(rightVal ?? '');
        handleSearch(1);
        setSearch(true);
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
                Historial de Solicitudes de Dietas
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
                centerDropdown={{
                    options:
                        tiemposComida.map(tiempo => ({
                            label: tiempo.valor,
                            value: String(tiempo.id),
                        })),
                    value: tiempoComida,
                    onChange: setTiempoComida,
                    placeholder: "Tiempo de comida"
                }}
                rightDropdown={{
                    options:
                        estados.map(estado => ({
                            label: estado.valor,
                            value: String(estado.id),
                        })),
                    value: estado,
                    onChange: setEstado,
                    placeholder: "Estados de la solicitud"
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
                        estadoTabla={'cerrar'}
                        idTiempoComida={ordenSeleccionada.idTiempoComida}
                        onVolver={() => { setSolicitudSeleccionada(null); setForzarVolver(true); handleSearch(1) }}
                        mapPaciente={obtenerMapPaciente(ordenSeleccionada)}
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
        </MainLayout>
    );
}

export default VisualizarPage;