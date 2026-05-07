/*
    Archivo: HorariosTiempoComida.tsx
    Descripcion: Pantalla para gestionar los horarios de los tiempos de comida.
    Autor: Marilyn Castro
    Fecha creacion: 7/07/2025
    Version: 1.0.0
*/

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'react-feather';
import MainLayout from "../layouts/LayoutPrincipal";
import { ModalForm } from '../components/ModalForm';
import Dropdown from '../components/Dropdown';
import TimePicker from "react-time-picker";
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import ConfirmDialog from "../components/ConfimModal";
import type { HorarioTiempoComida } from '@miapp/shared';
import { obtenerHorariosTiempoComida, actualizarHorarioTiempoComida, crearHorarioTiempoComida, eliminarHorarioTiempoComida, type NewHorario } from '../services/horariosTiempoComida'
import { fetchTiemposComida } from "../utils/fecthDatos";
import { esHoraValida } from "../utils/formatear";
import { useUnsavedChangesWarning } from "../hooks/advertenciaCambiosNoGuardados";
import { type ValorCatalogo } from '../types/ui';
import { validarCamposGenerico } from "../utils/validaciones";
import { useNotifications } from '../hooks/notificacionHook';

const HorarioComidaPage = () => {
    const { notify } = useNotifications();

    // Estados para los datos
    const [tiemposComida, setTiemposComida] = useState<ValorCatalogo[]>([]);
    const [horariosTiempoComidad, setHorariosTiempoComidad] = useState<HorarioTiempoComida[]>([]);

    // estados para el formulario
    const [idTiempoComida, setIdTiempoComida] = useState('');
    const [horaModificacion, setHoraModificacion] = useState('');
    const [horaCierre, setHoraCierre] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [grupoEditing, setGrupoEditing] = useState<HorarioTiempoComida | null>(null);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [idPendiente, setIdPendiente] = useState<number | null>(null);


    useEffect(() => {
        const fetchTiempos = async () => {
            const tiemposComidaData = await fetchTiemposComida();
            setTiemposComida(tiemposComidaData);
        };

        fetchTiempos();
        fetchHorariosTiempoComida();
    }, []);

    const fetchHorariosTiempoComida = async () => {
        const horariosTiempoComidaData = await obtenerHorariosTiempoComida();

        setHorariosTiempoComidad(horariosTiempoComidaData.data ?? []);
    };

    useEffect(() => {
        if (!grupoEditing) {
            setHasUnsavedChanges(idTiempoComida !== '' || horaModificacion !== '' || horaCierre !== '');
        } else if (grupoEditing) {
            const cambios =
                horaModificacion !== grupoEditing.horaModificacion ||
                horaCierre !== grupoEditing.horaCierre;

            setHasUnsavedChanges(cambios);
        }
    }, [idTiempoComida, horaModificacion, horaCierre, grupoEditing]);

    useUnsavedChangesWarning(hasUnsavedChanges);

    const handleAdd = () => {
        setGrupoEditing(null);
        setIdTiempoComida('');
        setHoraModificacion('');
        setHoraCierre('');
        setShowForm(true);
    };

    const handleEdit = (grupo: HorarioTiempoComida) => {
        setGrupoEditing(grupo);
        setIdTiempoComida('');
        setHoraModificacion(grupo.horaModificacion);
        setHoraCierre(grupo.horaCierre);
        setShowForm(true);
    };

    const handleCancel = (force = false) => {
        if (force || !hasUnsavedChanges || window.confirm("¿Descartar los cambios?")) {
            setHasUnsavedChanges(false);
            setShowForm(false);
            setGrupoEditing(null);
            setIdTiempoComida('');
            setHoraModificacion('');
            setHoraCierre('');
        }
    };

    const handleSave = async () => {
        const oblig = grupoEditing == null ? true : false;
        const resultado = validarCamposGenerico({
            horaModificacion: { valor: horaModificacion, tipo: 'string', requerido: true, nombreCampo: "Hora de modificación" },
            idTiempoComida: { valor: idTiempoComida, tipo: 'number', requerido: oblig, min: 1, nombreCampo: "Tiempo de comida" },
            horaCierre: { valor: horaCierre, tipo: 'string', requerido: true, nombreCampo: "Hora de cierre" },
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

        const datos = resultado.datos as NewHorario;

        if (!esHoraValida(horaModificacion)) {
            notify({
                type: 'warning',
                content: "Selecciona una hora de modificación válida.",
                duration: 3000,
            });
            return;
        }

        if (!esHoraValida(horaCierre)) {
            notify({
                type: 'warning',
                title: 'Datos  inválidos',
                content: "Selecciona una hora de cierre válida.",
                duration: 3000,
            });
            return;
        }

        try {
            if (grupoEditing == null) {
                await crearHorarioTiempoComida(datos);
                fetchHorariosTiempoComida();
            } else {
                const cambios: Partial<HorarioTiempoComida> = {}

                if (datos.horaModificacion !== grupoEditing.horaModificacion) cambios.horaModificacion = datos.horaModificacion;
                if (datos.horaCierre !== grupoEditing.horaCierre) cambios.horaCierre = datos.horaCierre;

                if (Object.keys(cambios).length === 0) {
                    alert('No hay cambios');
                    return;
                }

                await actualizarHorarioTiempoComida(String(grupoEditing.id), cambios);

                fetchHorariosTiempoComida();
            }
            handleCancel(true);
        } catch (error: any) {
            notify({
                type: 'error',
                content: error.response?.data?.error || 'Ocurrió un error al crear o modificar el tiempo de comida',
                duration: 3000,
            });
        } finally {
            setHasUnsavedChanges(false);
        }
    }

    const solicitarEliminacion = (id: number) => {
        setIdPendiente(id);
        setMostrarConfirmacion(true);
    };

    const handleDelete = async () => {
        if (idPendiente === null) return;
        try {
            await eliminarHorarioTiempoComida(idPendiente.toString())

            fetchHorariosTiempoComida();
        } catch (error: any) {
            notify({
                type: 'error',
                content: error.response?.data?.error || 'Ocurrió un error al eliminar el horario del tiempo de comida.',
                duration: 3000,
            });
        } finally {
            setMostrarConfirmacion(false);
            setIdPendiente(null);
        }

    };

    return (
        <MainLayout>
            <h2 className="text-2xl font-semibold text-gray-800 text-center p-4">
                Configuración de Horarios para tiempos de comida
            </h2>
            <div className="mt-2 text-sm text-gray-700 space-y-1">
                <p>
                    <span className="font-semibold">Hora límite de modificación:</span>{' '}
                    Límite para hacer cambios a las solicitudes de dieta existentes en ese tiempo de comida.
                </p>
                <p>
                    <span className="font-semibold">Hora de cierre:</span>{' '}
                    Hora máxima para registrar reclamos de las solicitudes de dieta en ese tiempo de comida.
                </p>
            </div>

            <div className="w-full flex flex-col items-center justify-center bg-white rounded-lg shadow-lg p-8">
                {horariosTiempoComidad.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No se encontraron resultados
                    </div>
                ) : (
                    <div className="space-y-3">
                        {horariosTiempoComidad.map((group) => (
                            <div
                                key={group.id}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 md:w-[600px] lg:w-[700px]"
                            >
                                <div className="flex items-start">
                                    <div>
                                        <div className="font-medium text-gray-800">{group.tiempoComida}</div>
                                        <div className="mt-1 text-sm text-gray-600">
                                            Hora límite de modificación: {group.horaModificacion}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Hora de cierre: {group.horaCierre}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => { handleEdit(group) }}
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
                )}
                <button
                    onClick={handleAdd}
                    className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                </button>
            </div>

            <ModalForm
                isOpen={showForm}
                onClose={() => handleCancel()}
                onSave={handleSave}
                title={grupoEditing != null ? "Editar Horario de tiempo de comida" : "Nuevo horario de tiempo de comida"}
                saveText={grupoEditing != null ? "Actualizar" : "Guardar"}
            >
                <div className="space-y-6">
                    {grupoEditing !== null ? (
                        <input
                            type="text"
                            value={grupoEditing.tiempoComida}
                            readOnly
                            className="w-full px-3 py-2 border-2 border-blue-200 rounded-md focus:outline-none focus:border-blue-400 transition-colors placeholder-gray-400  text-gray-700"
                        />
                    ) : (
                        <Dropdown
                            options={tiemposComida.map(tiempo => ({
                                value: String(tiempo.id),
                                label: tiempo.valor
                            }))}
                            value={idTiempoComida}
                            onChange={setIdTiempoComida}
                            placeholder={'Tiempos de comida'}
                        />
                    )}
                    <p className="text-sm text-gray-500 italic mb-2">
                        Las horas deben ingresarse en formato de 24 horas (ej. 13:00 para 1:00 PM).
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Hora limite de modificación:</label>
                            <TimePicker
                                onChange={(value) => setHoraModificacion(value ?? '')}
                                value={horaModificacion && horaModificacion.length === 5 ? horaModificacion : null}
                                disableClock
                                format="HH:mm"
                                clearIcon={null}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Hora de cierre:</label>
                            <TimePicker
                                onChange={(value) => setHoraCierre(value ?? '')}
                                value={horaCierre && horaCierre.length === 5 ? horaCierre : null}
                                disableClock
                                format="HH:mm"
                                clearIcon={null}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </ModalForm>
            <ConfirmDialog
                isOpen={mostrarConfirmacion}
                title="Confirmar desactivación"
                message="¿Estás seguro de que quieres desactivar este horario de tiempo de comida?"
                onConfirm={handleDelete}
                onCancel={() => { setIdPendiente(null); setMostrarConfirmacion(false); }}
            />
        </MainLayout>
    );
}

export default HorarioComidaPage;