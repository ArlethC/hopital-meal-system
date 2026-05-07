/*
    Archivo: AgrupacionDietas.tsx
    Descripcion: Pantalla para gestionar los grupos de dietas, tiempos de comida y rango de edad.
    Autor: Marilyn Castro
    Fecha creacion: 3/07/2025
    Version: 1.0.0
*/

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'react-feather';
import SearchBar from "../components/SearchBar";
import MainLayout from "../layouts/LayoutPrincipal";
import DietaEdadTiempoForm from "../components/DietaEdadTiempoForm";
import ConfirmDialog from "../components/ConfimModal";
import { formatearEdad } from '../utils/formatear';
import type { GrupoDieComEd } from '@miapp/shared';
import { obtenerDietasEdadTiempo, eliminarDietaEdadTiempo } from '../services/dietasEdadTiempo';
import { fetchDietas, fetchTiemposComida, fetchRangosEdad } from "../utils/fecthDatos";
import Pagination from '../components/Pagination';
import { type ValorCatalogo, type AgeRange } from '../types/ui';
import { useNotifications } from '../hooks/notificacionHook';
import TablaDietas from '../components/TablaDIetas';

const DietasManager = () => {
    const { notify } = useNotifications();

    // Estados para los datos
    const [tiemposComida, setTiemposComida] = useState<ValorCatalogo[]>([]);
    const [rangosEdad, setRangosEdad] = useState<AgeRange[]>([]);
    const [gruposDietaEdadTiempo, setGruposDietaEdadTiempo] = useState<GrupoDieComEd[]>([]);
    const [grupoEditing, setGrupoEditing] = useState<GrupoDieComEd | null>(null);
    const [search, setSearch] = useState(false);

    // estados para los dropdowns
    const [tiempoComida, setTiempoComida] = useState('');
    const [rangoEdad, setRangoEdad] = useState('');
    const [dieta, setDieta] = useState('');
    const [shouldSearch, setShouldSearch] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showCrear, setShowCrear] = useState(false);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [idPendiente, setIdPendiente] = useState<number | null>(null);
    const [paginacion, setPaginacion] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        pageSize: 6,
    });


    useEffect(() => {
        const fetchRangos = async () => {
            const rangosEdadData = await fetchRangosEdad();
            setRangosEdad(rangosEdadData)
        };

        const fetchTiempos = async () => {
            const tiemposComidaData = await fetchTiemposComida();
            setTiemposComida(tiemposComidaData);
        };
        fetchTiempos();
        fetchRangos();
    }, []);

    useEffect(() => {
        if (shouldSearch) {
            handleSearch(1);
            setShouldSearch(false);
        }
    }, [dieta, tiempoComida, rangoEdad, shouldSearch]);

    const solicitarEliminacion = (id: number) => {
        setIdPendiente(id);
        setMostrarConfirmacion(true);
    };

    const handleDelete = async () => {
        if (idPendiente === null) return;
        try {
            await eliminarDietaEdadTiempo(idPendiente.toString())
            setGruposDietaEdadTiempo(gruposDietaEdadTiempo.filter(range => range.id !== idPendiente));
            notify({
                type: 'success',
                title: 'Éxito',
                content: 'El grupo de dieta, edad y tiempo de comida se elimino correctamente.',
                duration: 3000,
            });
        } catch (error: any) {
            notify({
                type: 'error',
                content: error.response?.data?.error || 'Ocurrió un error al eliminar el grupo',
                duration: 3000,
            });
        } finally {
            setMostrarConfirmacion(false);
            setIdPendiente(null);
        }
    };

    const handleUpdateGrupo = (grupoActualizado: GrupoDieComEd) => {
        setGruposDietaEdadTiempo(prev =>
            prev.map(g => g.id === grupoActualizado.id ? grupoActualizado : g)
        );
        setGrupoEditing(null);
        setSearch(true);
    };

    const handleCreateGrupo = (idTiempocomida: string, idRangoEdad: string) => {
        setTiempoComida(idTiempocomida);
        setRangoEdad(idRangoEdad);
        setShouldSearch(true);
    };

    const handleSearch = async (page: number = 1) => {
        const filtros: string[] = [];

        if (tiempoComida?.trim()) filtros.push(`t=${tiempoComida}`);
        if (rangoEdad?.trim()) filtros.push(`r=${rangoEdad}`);
        if (dieta?.trim()) filtros.push(`d=${dieta}`);

        let resultado = '';

        if (filtros.length > 0) {
            filtros.push(`pag=${page}`);
            filtros.push(`limit=${paginacion.pageSize}`);
            resultado = `?${filtros.join('&')}`;
        }

        if (resultado.trim().length > 0) {
            setSearch(true);
            try {
                const response = await obtenerDietasEdadTiempo(resultado.trim());
                setGruposDietaEdadTiempo(response.data);
                setPaginacion({
                    currentPage: page,
                    totalPages: response.totalPages,
                    totalItems: response.total,
                    pageSize: response.pageSize
                });
            } catch (error: any) {
                notify({
                    type: 'error',
                    content: error.response?.data?.error || 'Ocurrió un error al realizar la búsqueda',
                    duration: 3000,
                });
            }
        } else {
            notify({
                type: 'info',
                content: 'Debe seleccionar un tiempo de comida, rango de edad o dieta para iniciar la búsqueda.',
                duration: 3000,
            });
        }
    };

    const onSearchSubmit = (query?: string, leftVal?: string, rightVal?: string,) => {
        setDieta(query ?? '');
        setTiempoComida(leftVal ?? '');
        setRangoEdad(rightVal ?? '');
        setShouldSearch(true);
    };

    return (
        <MainLayout>
            <h2 className="text-2xl font-semibold text-gray-800 text-center p-4">
                Configuración de dieta por edad y tiempo de comida
            </h2>

            <SearchBar
                leftDropdown={{
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
                        rangosEdad.map(rango => ({
                            label: `${rango.descripcion} (${rango.edadMinimaTexto} - ${rango.edadMaximaTexto})`,
                            value: String(rango.id)
                        })),
                    value: rangoEdad,
                    onChange: setRangoEdad,
                    placeholder: "Rango de edad"
                }}
                liveSearch={{
                    fetchResults: fetchDietas,
                    onSelect: (item) => (item.name),
                }}
                searchPlaceholder="Buscar dieta por nombre..."
                onSearch={onSearchSubmit}
                searchButtonText="Buscar"
                automaticSearch={true}
            />

            <div className="flex flex-col items-center justify-self-end mt-4 mb-8">
                <button
                    onClick={() => { setShowCrear(true) }}
                    className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva relación dieta - tiempo de comida - edad
                </button>
            </div>


            {showForm && grupoEditing && (
                <DietaEdadTiempoForm
                    setShowForm={setShowForm}
                    dataTiemposComida={tiemposComida.map(tiempo => ({
                        value: String(tiempo.id),
                        label: tiempo.valor
                    }))}
                    dataRangos={rangosEdad.map(rango => ({
                        value: String(rango.id),
                        label: `${rango.descripcion} (${rango.edadMinimaTexto} - ${rango.edadMaximaTexto})`
                    }))}
                    showForm={showForm}
                    grupoEdit={grupoEditing}
                    onEdit={handleUpdateGrupo}
                    setGrupoEdit={setGrupoEditing}
                />
            )}

            {showCrear && (
                <TablaDietas
                    setShowForm={setShowCrear}
                    dataTiemposComida={tiemposComida.map(tiempo => ({
                        value: String(tiempo.id),
                        label: tiempo.valor
                    }))}
                    dataRangos={rangosEdad.map(rango => ({
                        value: String(rango.id),
                        label: `${rango.descripcion} (${rango.edadMinimaTexto} - ${rango.edadMaximaTexto})`
                    }))}
                    showForm={showCrear}
                    onCreate={handleCreateGrupo}
                />
            )}

            {search && (
                <div className="w-full flex flex-col items-center justify-center bg-white rounded-lg shadow-lg p-8">
                    {gruposDietaEdadTiempo.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No se encontraron resultados
                        </div>
                    ) : (
                        <>
                            <div className={`grid gap-4 w-full justify-center ${gruposDietaEdadTiempo.length === 1
                                ? 'grid-cols-1'
                                : 'grid-cols-1 md:grid-cols-2'
                                }`}>
                                {gruposDietaEdadTiempo.map((group) => (
                                    <div
                                        key={group.id}
                                        className="flex flex-col sm:flex-row justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 w-full max-w-[700px] mx-auto"
                                    >
                                        <div className="flex items-start">
                                            <div>
                                                <div className="font-medium text-gray-800">{group.dieta}</div>
                                                <div className="mt-1 text-sm text-gray-600">
                                                    Abreviatura: {group.abrevDieta}
                                                </div>
                                                <div className="mt-1 text-sm text-gray-600">
                                                    Tiempo de comida: {group.tiempoComida}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Edad máxima: {`${group.rangoEdad} (${formatearEdad(group.edad_minima_meses)} - ${formatearEdad(group.edad_maxima_meses)})`}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => { setGrupoEditing(group), setShowForm(true) }}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => solicitarEliminacion(group.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
            )}
            <ConfirmDialog
                isOpen={mostrarConfirmacion}
                title="Confirmar desactivación"
                message="¿Estás seguro de que quieres desactivar esta relación de dieta, rango de edad y tiempo de comida?"
                onConfirm={handleDelete}
                onCancel={() => { setIdPendiente(null); setMostrarConfirmacion(false); }}
            />
        </MainLayout>
    );
}


export default DietasManager;