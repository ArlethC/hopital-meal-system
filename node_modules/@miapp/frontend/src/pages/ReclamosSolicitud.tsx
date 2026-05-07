/*
    Archivo: ReclamosSolicitud.tsx
    Descripcion: Pantalla para crear, modificar y marcar como solucionado los reclamos.
    Autor: Marilyn Castro
    Fecha creacion: 25/07/2025
    Version: 1.0.1
*/
import { useState, useEffect } from 'react';
import MainLayout from "../layouts/LayoutPrincipal";
import SearchBar from "../components/SearchBar";
import HospitalizationCards from "../components/CardSolicitud";
import DetalleOrdenDieta from "../components/SolicitudDietas";
import { useAuth } from "../hooks/Auth";
import { useNotifications } from '../hooks/notificacionHook';

import type { ValorCatalogo, Salas } from '../types/ui';
import { fetchTiemposComida, fecthSalas } from "../utils/fecthDatos";
import type { DetalleOrden, OrdenDieta } from "../types/solicitud";
import { obtenerSolicitudesCerrar } from "../services/solicitudDietas";
import { validarCamposGenerico } from "../utils/validaciones";
import { mapOrdenDietaToCard, convertirADetalleFinalizado, getEstadoUIById } from "../utils/formatear";


const ReclamosPage = () => {
    const { notify } = useNotifications();
    const [tiemposComida, setTiemposComida] = useState<ValorCatalogo[]>([]);
    const [salas, setSalas] = useState<Salas[]>([]);
    const [solicitudes, setSolicitudes] = useState<OrdenDieta[] | null>(null);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<number | null>(null);
    const [forzarVolver, setForzarVolver] = useState(false);

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
                const response = await obtenerSolicitudesCerrar(datos, params);

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

    const mapPacienteConExtra = (estado: number) => {
        return (data: DetalleOrden) => convertirADetalleFinalizado(data, estado);
    };

    return (
        <MainLayout>
            <h2 className="text-2xl font-semibold text-gray-800 text-center p-4">
                Reclamos de la solicitud de dieta
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
                        ordenDieta={ordenSeleccionada}
                        permisos={permisos}
                        estadoTabla={getEstadoUIById(ordenSeleccionada.idEstado).tabla}
                        idTiempoComida={ordenSeleccionada.idTiempoComida}
                        onVolver={() => { setSolicitudSeleccionada(null); setForzarVolver(true); handleSearch(1) }}
                        mapPaciente={mapPacienteConExtra(ordenSeleccionada.idEstado)}
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

export default ReclamosPage;