/*
    Archivo: PacienteMeriendas.tsx
    Descripcion: Componente con el formulario para crear meriendas.
    Autor: Marilyn Castro
    Fecha creacion: 31/07/2025
    Version: 1.0.0
*/
import { useEffect, useState } from 'react';
import { Plus, Trash } from 'react-feather';
import { obtenerMeriendas, crearMerienda, dietasMerienda, desactivarMerienda } from '../services/meriendas';
import type { crearMeriendaShemaDTO } from "@miapp/shared";
import { fetchTiemposComida } from '../utils/fecthDatos';
import { type ValorCatalogo } from '../types/ui';
import { formatearNombre, } from "../utils/formatear";
import { validarCamposGenerico, ValidarFecha } from "../utils/validaciones";
import { useAuth } from '../hooks/Auth';
import { useNotifications } from '../hooks/notificacionHook';
import { ModalForm } from './ModalForm';
import Dropdown from './Dropdown';
import Pagination from './Pagination';
import ConfirmDialog from "../components/ConfimModal";

interface PacienteMeriendasProps {
    expediente: string;
    nombrePaciente: string;
    edad: string;
    hasUnsavedChanges: boolean;
    setHasUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PacienteMeriendas = ({ 
    expediente, 
    nombrePaciente,
    edad,
    hasUnsavedChanges,
    setHasUnsavedChanges,
}: PacienteMeriendasProps) => {
    const { tienePermiso } = useAuth();
    const { notify } = useNotifications();

    const [meriendas, setMeriendas] = useState<any[]>([]);
    const [tiemposComida, setTiemposComida] = useState<ValorCatalogo[]>([]);
    const [dietas, setDietas] = useState<any[]>([]);
    const [filtro, setFiltro] = useState<'activas' | 'historial'>('activas');
    const [showModal, setShowModal] = useState(false);
    const [idPendiente, setIdPendiente] = useState<number | null>(null);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const hoy = (() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    })();
    const [formData, setFormData] = useState({
        idDieta: '',
        idTiempoComida: '',
        fechaInicioMerienda: hoy,
        fechaFinMerienda: '',
        observacion: '',
    });
    const [paginacion, setPaginacion] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        pageSize: 2,
    });

    useEffect(() => {
        getMeriendas(1);
    }, [expediente, filtro]);

    useEffect(() => {
        const esDiferente = formData.idDieta != '' || formData.idTiempoComida != '';
        setHasUnsavedChanges(esDiferente);
    }, [formData]);


    const getMeriendas = async (page: number = 1) => {
        try {
            const filtros = `search=${filtro}&pag=${page}&limit=${paginacion.pageSize}`
            const datos = await obtenerMeriendas(expediente, filtros);
            setMeriendas(datos.data);
            setPaginacion({
                currentPage: page,
                totalPages: datos.totalPages,
                totalItems: datos.total,
                pageSize: datos.pageSize
            });
        } catch (error: any) {
            notify({ type: 'error', content: error.response?.data?.error || 'Error al cargar meriendas', duration: 3000 });
        }
    };

    const cargarDatos = async () => {
        try {
            const datos = await dietasMerienda();
            setDietas(datos);

            const tiemposComida = await fetchTiemposComida();

            setTiemposComida(tiemposComida);
        } catch (error: any) {
            notify({
                type: 'error',
                content: error.response?.data?.error || 'Error al obtener las dietas y tiempos de comida',
                duration: 3000
            });
        }
    };

    const handleSave = async () => {
        const resultado = validarCamposGenerico({
            expediente: { valor: expediente, tipo: 'string', requerido: true, },
            idDieta: { valor: formData.idDieta, tipo: 'number', requerido: true, min: 1, nombreCampo: "Dieta" },
            idTiempoComida: { valor: formData.idTiempoComida, tipo: 'number', requerido: true, min: 1, nombreCampo: "Tiempo de comida" },
            fechaInicioMerienda: { valor: formData.fechaInicioMerienda, tipo: 'string', requerido: true, nombreCampo: "Fecha inicial" },
            fechaFinMerienda: { valor: formData.fechaFinMerienda, tipo: 'string', requerido: false, nombreCampo: "Fecha final de vigencia" },
            observacion: { valor: formData.observacion, tipo: 'string', requerido: false, nombreCampo: "Observacion" },
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

        if ((formData.fechaInicioMerienda && ValidarFecha(formData.fechaInicioMerienda)) || (formData.fechaFinMerienda && ValidarFecha(formData.fechaFinMerienda))) {
            notify({ type: 'warning', title: 'Datos inválidos', content: "Selecciona una fecha igual o mayor a la fecha actual.", duration: 3000, });
            return;
        }

        if (formData.fechaFinMerienda) {
            if (!formData.fechaInicioMerienda) {
                notify({ type: 'warning', title: 'Datos inválidos', content: "Si hay fecha final de vigencia, también debe haber una fecha inicial.", duration: 3000, });
                return;
            }

            const [y1, m1, d1] = formData.fechaInicioMerienda.split('-').map(Number);
            const [y2, m2, d2] = formData.fechaFinMerienda.split('-').map(Number);

            const fechaInicial = new Date(y1, m1 - 1, d1);
            const fechaFinal = new Date(y2, m2 - 1, d2);


            if (fechaFinal < fechaInicial) {
                notify({ type: 'warning', title: 'Datos inválidos', content: "La fecha final de vigencia debe ser mayor que la fecha inicial.", duration: 3000, });
                return;
            }
        }

        const datos = resultado.datos as crearMeriendaShemaDTO;

        if (datos) {
            try {
                await crearMerienda(datos);
                notify({ type: 'success', content: 'Merienda creada correctamente', duration: 3000 });
                handleCancel(true);
            } catch (error: any) {
                notify({ type: 'error', content: error.response?.data?.error || 'Error al crear la merienda', duration: 3000 });
                setHasUnsavedChanges(false);
            }
        }
    };

    const handleCancel = (force = false) => {
        if (force || !hasUnsavedChanges || window.confirm("¿Descartar los cambios?")) {
            setHasUnsavedChanges(false);
            setShowModal(false);
            setFiltro('activas');
            getMeriendas(1);
            setFormData({
                idDieta: '',
                idTiempoComida: '',
                fechaInicioMerienda: hoy,
                fechaFinMerienda: '',
                observacion: '',
            })
        }
    };

    const solicitarEliminacion = (id: number) => {
        setIdPendiente(id);
        setMostrarConfirmacion(true);
    };

    const handleDelete = async () => {
        if (idPendiente === null) return;
        try {
            await desactivarMerienda(idPendiente.toString())
            handleCancel(true);
        } catch (error: any) {
            notify({
                type: 'error',
                content: error.response?.data?.error || 'Ocurrió un error al desactivar la merienda.',
                duration: 3000,
            });
        } finally {
            setIdPendiente(null);
            setMostrarConfirmacion(false);
        }
    };

    const nombreSinExpediente = nombrePaciente.includes('-')
        ? nombrePaciente.split('-').slice(1).join('-').trim()
        : nombrePaciente;


    return (
        <div className="mt-6 bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-xl font-bold text-gray-900">
                Meriendas del Paciente
            </h3>
            <div className="flex flex-col md:flex-row md:items-center md:justify-start md:gap-x-20 gap-y-2 p-3 bg-gray-50 rounded-lg">
                <div>
                    <p className="text-sm font-medium text-gray-600">Expediente</p>
                    <p className="text-sm font-mono text-gray-800">{expediente}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600">Nombre</p>
                    <p className="text-sm font-semibold text-gray-800">{formatearNombre(nombreSinExpediente)}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600">Edad</p>
                    <p className="text-sm font-semibold text-gray-800">{edad}</p>
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={() => setFiltro('activas')}
                    className={`px-3 py-1 rounded ${filtro === 'activas' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    aria-label="Filtro meriendas activas"
                >
                    Activas
                </button>
                <button
                    onClick={() => setFiltro('historial')}
                    className={`px-3 py-1 rounded ${filtro === 'historial' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    aria-label='Filtro meriendas historial'
                >
                    Historial
                </button>
            </div>

            <div className="p-6">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">Dieta</th>
                                <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">Tiempo Comida</th>
                                <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">Observación</th>
                                <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">Fecha Inicial</th>
                                <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">Fecha final vigencia</th>
                                <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">Desactivar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {meriendas.length > 0 ? meriendas.map((m) => (
                                <tr key={m.id}>
                                    <td className="border border-gray-200 px-3 py-2">{m.dieta}</td>
                                    <td className="border border-gray-200 px-3 py-2">{m.tiempoComida}</td>
                                    <td className="border border-gray-200 px-3 py-2">{m.observacion || '-'}</td>
                                    <td className="border border-gray-200 px-3 py-2">{m.fechaInicial}</td>
                                    <td className="border border-gray-200 px-3 py-2">{m.fechaFinal || '-'}</td>
                                    <td className="border border-gray-200 px-3 py-2">
                                        {m.estado ? (
                                            <button
                                                onClick={() => solicitarEliminacion(m.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                title="Desactivar merienda"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        ) : null}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} className="text-center p-3">No hay meriendas {filtro}.</td></tr>
                            )}
                        </tbody>
                    </table>
                    <Pagination
                        currentPage={paginacion.currentPage}
                        totalPages={paginacion.totalPages}
                        onPageChange={getMeriendas}
                        itemsPerPage={paginacion.pageSize}
                        totalItems={paginacion.totalItems}
                    />
                </div>
            </div>

            {tienePermiso('meriendas') && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => { setShowModal(true); cargarDatos() }}
                        className="flex items-center px-4 py-2 bg-emerald-300 hover:bg-emerald-400 text-black rounded-md"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Agregar Merienda
                    </button>
                </div>
            )}

            <ModalForm
                isOpen={showModal}
                onClose={() => handleCancel()}
                onSave={handleSave}
                title="Nueva Merienda"
                saveText="Guardar"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de dieta
                        </label>
                        <Dropdown
                            options={dietas.map((item) => ({
                                value: item.codigo,
                                label: item.nombre
                            })) || []}
                            value={formData.idDieta}
                            placeholder="Seleccione dieta"
                            onChange={(val) => setFormData(prev => ({ ...prev, idDieta: val }))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tiempo de comida
                        </label>
                        <Dropdown
                            options={tiemposComida
                                .filter(item => item.valor?.toLowerCase().startsWith('merienda'))
                                .map(item => ({
                                    value: item.id.toString(),
                                    label: item.valor
                                }))}
                            value={formData.idTiempoComida}
                            placeholder="Seleccione tiempo de comida"
                            onChange={(val) => setFormData(prev => ({ ...prev, idTiempoComida: val }))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha inicial
                        </label>
                        <input
                            type="date"
                            value={formData.fechaInicioMerienda}
                            onChange={(e) => setFormData(prev => ({ ...prev, fechaInicioMerienda: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha final vigencia
                        </label>
                        <input
                            type="date"
                            value={formData.fechaFinMerienda}
                            onChange={(e) => setFormData(prev => ({ ...prev, fechaFinMerienda: e.target.value }))}
                        />
                    </div>
                                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Observación:
                        </label>
                        <textarea
                            value={formData.observacion || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, observacion: e.target.value }))}
                            placeholder="Ingrese una observación para la merienda"
                            className="w-full border px-3 py-2 rounded"
                            aria-label="Observación de la merienda"
                        />
                    </div>
                </div>
            </ModalForm>

            <ConfirmDialog
                isOpen={mostrarConfirmacion}
                title="Confirmar desactivación"
                message="¿Esta seguro de que quiere desactivar esta merienda?"
                onConfirm={handleDelete}
                onCancel={() => { setIdPendiente(null); setMostrarConfirmacion(false); }}
            />
        </div>
    );
};
