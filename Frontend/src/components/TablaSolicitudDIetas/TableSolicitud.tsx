/*
    Archivo: TableSolicitud.tsx
    Descripcion: Componente para mostrar los detalles de las solicitudes.
    Autor: Marilyn Castro
    Fecha creacion: 11/07/2025
    Version: 4.0.1
*/
import React, { useState } from 'react';
import { FileText, AlertTriangle, X, Printer } from 'react-feather';
import { type ModificacionCocinaShemaDTO, type ModificacionNutricionShemaDTO, type modificacionEnfermeriaShemaDTO, type DetalleOrden } from '../../types/solicitud';
import { modificarCocina, modificarNutricion, modificarEnfermeria, cancelarDetalle, reactivarDetalle } from '../../services/detallesSolicitud';
import type { PacienteUi, PacienteModificar, PacienteFinalizado, Dieta } from '../../types/ui';
import { obtenerValorCampo, puedeEditar, puedeVerColumna, esPacienteNoCrear, getPacienteKey } from './utils/tablaUtils';
import AccionesCell from './AccionesCelda';
import HistorialRow from './HistorialFila';
import { obtenerHistorialDetalle } from '../../services/detallesSolicitud';
import ConfirmDialog from "../ConfimModal";
import { useNotifications } from '../../hooks/notificacionHook';
import { mapDetalleOrdenToPacienteModificar } from "../../utils/formatear"
import PatientInfoScreen from '../ListAlergiaIntolerancia';
import AlergiaAgregarButton from '../AgregarAlergiaButton';
import PatientDocuments from '../ListDocumentos';
import { FormularioReclamoContainer } from "../ContenedorReclamo";

import DietaCell from './CeldaDieta';
import CeldaObservacion from './celdaObservacion';
import TablaEncabezado from './TablaEncabezado';

interface PropsTabla {
    estado: string;
    pacientes: PacienteUi[];
    permisoUsuario: Record<string, boolean>;
    filaSeleccionada?: Set<string>;
    setFilaSeleccionada?: React.Dispatch<React.SetStateAction<Set<string>>>;
    setPacientes: React.Dispatch<React.SetStateAction<PacienteUi[]>>;
    idTiempoComida?: number;
    cambiosTemporales?: Map<string | number, Partial<PacienteUi>>;
    setCambiosTemporales?: React.Dispatch<React.SetStateAction<Map<string | number, Partial<PacienteUi>>>>;
    onImprimirEtiqueta?: (paciente: string) => any;
}

const TablaOrdenesDieta: React.FC<PropsTabla> = ({
    estado,
    pacientes,
    permisoUsuario,
    filaSeleccionada,
    setFilaSeleccionada,
    setPacientes,
    idTiempoComida,
    cambiosTemporales,
    setCambiosTemporales,
    onImprimirEtiqueta,
}) => {
    const { notify } = useNotifications();

    const [editandoFila, setEditandoFila] = useState<string | number | null>(null);;
    const [modalAbierto, setModalAbierto] = useState<string | null>(null);
    const [pacienteSeleccionado, setPacienteSeleccionado] = useState<PacienteUi | null>(null);
    const [historialVisible, setHistorialVisible] = useState<Set<string | number>>(new Set());
    const [historialDatos, setHistorialDatos] = useState<Map<string | number, any[]>>(new Map());
    const [datosOriginales, setDatosOriginales] = useState<Map<string | number, PacienteUi>>(new Map());
    const [todasLasDietasDisponibles, setTodasLasDietasDisponibles] = useState<Dieta[] | null>(null);
    const [accionPendiente, setAccionPendiente] = useState<'cancelar' | 'reactivar' | null>(null);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [idPendiente, setIdPendiente] = useState<number | null>(null);

    const confirmarAccion = async () => {
        if (!idPendiente || !accionPendiente) return;

        try {
            if (accionPendiente === 'cancelar') {
                await cancelarDetalle(idPendiente.toString());
                setPacientes(prev =>
                    prev.map(p =>
                        getPacienteKey(p) === idPendiente ? { ...p, cancelado: true, modificado: true } : p
                    )
                );
            } else if (accionPendiente === 'reactivar') {
                await reactivarDetalle(idPendiente.toString());
                setPacientes(prev =>
                    prev.map(p =>
                        getPacienteKey(p) === idPendiente ? { ...p, cancelado: false } : p
                    )
                );
            }
        } catch (error: any) {
            notify({
                type: 'error',
                content: error.response.data?.error ?? 'Ocurrió un error inesperado',
                duration: 3000,
            });
        } finally {
            setMostrarConfirmacion(false);
            setIdPendiente(null);
            setAccionPendiente(null);
        }
    };

    const handleEditarFila = (paciente: PacienteUi) => {
        const id = getPacienteKey(paciente)
        setDatosOriginales(prev => new Map(prev).set(id, { ...paciente }));
        setEditandoFila(id);
    };

    const handleGuardarFila = async (paciente: PacienteUi) => {
        const id = getPacienteKey(paciente);
        try {
            if (!cambiosTemporales) {
                setEditandoFila(null);
                return;
            }

            const cambios = cambiosTemporales.get(id);
            const original = datosOriginales.get(id);

            if (!cambios || !original) {
                notify({ type: 'warning', content: 'No hay cambios', duration: 3000 });
                setEditandoFila(null);
                return;
            }

            const normalizar = (valor: any) => {
                if (valor === null || valor === undefined) return '';
                return String(valor).trim();
            };

            const hayCambioReal = Object.entries(cambios).some(([campo, nuevoValor]) => {
                const originalValor = (original as any)[campo];

                const originalNormalizado = typeof originalValor === 'object' && originalValor !== null
                    ? originalValor.codigo
                    : normalizar(originalValor);

                const nuevoNormalizado = typeof nuevoValor === 'object' && nuevoValor !== null
                    ? (Array.isArray(nuevoValor)
                        ? nuevoValor.map((item: any) => item.codigo).join(',')
                        : (nuevoValor as any).codigo)
                    : normalizar(nuevoValor);

                return originalNormalizado !== nuevoNormalizado;
            });

            if (!hayCambioReal) {
                notify({ type: 'warning', content: 'No hay cambios', duration: 3000 });
                setEditandoFila(null);
                return;
            }
            const cambiosMod = cambios as Partial<PacienteModificar>;
            const camposModificados = Object.keys(cambios);


            let pacienteActualizado: DetalleOrden | null = null;
            if (camposModificados.includes("obsEnfermeria") || camposModificados.includes("dietaSeleccionada")) {
                const body: modificacionEnfermeriaShemaDTO = { id: Number(id) };

                if ("obsEnfermeria" in cambiosMod) {
                    body.obsEnfermeria = cambiosMod.obsEnfermeria || "";
                }

                if ("dietaSeleccionada" in cambiosMod && cambiosMod.dietaSeleccionada?.codigo) {
                    body.idDieta = cambiosMod.dietaSeleccionada.codigo;
                }
                if (body.obsEnfermeria !== undefined || body.idDieta !== undefined) {
                    pacienteActualizado = await modificarEnfermeria(body);
                } else {
                    notify({ type: 'warning', content: 'No hay cambios', duration: 3000, });
                    setEditandoFila(null);
                    return;
                }
            } else if (camposModificados.includes("obsNutricion") && cambiosMod.obsNutricion !== undefined) {
                const body: ModificacionNutricionShemaDTO = {
                    id: Number(id),
                    obsNutricion: cambiosMod.obsNutricion,
                };
                pacienteActualizado = await modificarNutricion(body);

            } else if (camposModificados.includes("obsCocina") && cambiosMod.obsCocina !== undefined) {
                const body: ModificacionCocinaShemaDTO = {
                    id: Number(id),
                    obsCocina: cambiosMod.obsCocina,
                };
                pacienteActualizado = await modificarCocina(body);
            } else {
                notify({ type: 'warning', content: 'No hay cambios', duration: 3000, });
                setEditandoFila(null);
                return;
            }

            if (pacienteActualizado && Object.keys(pacienteActualizado).length > 0 && setPacientes) {
                setPacientes(prev =>
                    prev.map(p =>
                        getPacienteKey(p) === id
                            ? {
                                ...p,
                                ...mapDetalleOrdenToPacienteModificar(pacienteActualizado!),
                            }
                            : p
                    )
                );
            }

        } catch (error: any) {
            notify({ type: 'error', content: error.response?.data?.error || 'Ocurrió un error al realizar la modificación.', duration: 3000, });
            const original = datosOriginales.get(id);
            if (original && setPacientes) {
                setPacientes(prev =>
                    prev.map(p =>
                        getPacienteKey(p) === id ? { ...original } : p
                    )
                );
            }
        } finally {
            if (setCambiosTemporales) {
                setCambiosTemporales(prev => {
                    const nuevos = new Map(prev);
                    nuevos.delete(id);
                    return nuevos;
                });
            }
            setEditandoFila(null);
        }
    };

    const handleCambiarValor = (
        id: string | number,
        campo: keyof PacienteUi | keyof PacienteModificar | keyof PacienteFinalizado,
        valor: any
    ) => {
        setPacientes(prev =>
            prev.map(p =>
                getPacienteKey(p) === id ? { ...p, [campo]: valor } : p
            )
        );

        if (editandoFila === id) {
            if (setCambiosTemporales) {
                setCambiosTemporales(prev => {
                    const nuevos = new Map(prev);
                    const cambiosActuales = nuevos.get(id) || {};
                    nuevos.set(id, { ...cambiosActuales, [campo]: valor });
                    return nuevos;
                });
            }
        }
    };

    const limpiarCamposPaciente = (p: PacienteUi & Record<string, any>): PacienteUi => {
        const copia = { ...p };
        ['dietaSeleccionada', 'obsEnfermeria'].forEach((campo) => {
            if (campo in copia) {
                copia[campo] = typeof copia[campo] === 'object' ? undefined : '';
            }
        });
        return copia;
    };

    const handleSeleccionarFila = (id: string) => {
        if (!filaSeleccionada || !setFilaSeleccionada) return;

        const nuevaSeleccion = new Set(filaSeleccionada);

        if (nuevaSeleccion.has(id)) {
            nuevaSeleccion.delete(id);
            setFilaSeleccionada(nuevaSeleccion);

            if (setPacientes) {
                setPacientes(prev =>
                    prev.map(p =>
                        p.expediente === id ? limpiarCamposPaciente(p) : p
                    )
                );
            }
        } else {
            nuevaSeleccion.add(id);
            setFilaSeleccionada(nuevaSeleccion);
        }
    };

    const abrirModal = (tipo: string, paciente: PacienteUi) => {
        setModalAbierto(tipo);
        setPacienteSeleccionado(paciente);
    };

    const cerrarModal = () => {
        setModalAbierto(null);
        setPacienteSeleccionado(null);
    };

    const esPacienteFinalizado = (paciente: PacienteUi): paciente is PacienteFinalizado => {
        return ['entrega', 'reclamo', 'cerrar'].includes(paciente.estado);
    };

    const renderCeldaRecibido = (paciente: PacienteUi) => {
        if (!esPacienteFinalizado(paciente)) {
            return null;
        }
        const esEditable = puedeEditar('recibido', getPacienteKey(paciente), filaSeleccionada, editandoFila, permisoUsuario, estado);
        const recibido = obtenerValorCampo(paciente, 'recibido' as keyof PacienteUi, cambiosTemporales, editandoFila,);

        if (esEditable) {
            return (
                <input
                    type="checkbox"
                    checked={recibido}
                    onChange={(e) => handleCambiarValor(getPacienteKey(paciente), 'recibido', e.target.checked)}
                    className="w-4 h-4"
                />
            );
        }

        return (
            <span className={`text-sm ${recibido ? 'text-green-600' : 'text-red-600'}`}>
                {recibido ? 'Sí' : 'No'}
            </span>
        );
    };

    const renderCeldaObservaciones = (paciente: PacienteUi) => {
        if (estado != 'crear' && permisoUsuario && permisoUsuario['cocina']) {
            const obsNutricion = obtenerValorCampo(paciente, 'obsNutricion' as keyof PacienteUi, cambiosTemporales, getPacienteKey(paciente));
            const obsEnfermeria = obtenerValorCampo(paciente, 'obsEnfermeria' as keyof PacienteUi, cambiosTemporales, getPacienteKey(paciente));

            if (paciente.estado != 'crear' && obsNutricion && obsNutricion.trim() !== '') {
                return <span className="text-sm">{obsNutricion}</span>;
            }
            return <span className="text-sm">{paciente.estado != 'crear' && obsEnfermeria || 'Sin observaciones'}</span>;
        }

        return null;
    };

    const renderCeldaImprimir = (paciente: PacienteUi) => {

        const idPaciente = String(getPacienteKey(paciente));

        if (estado != 'crear' && permisoUsuario['cocina'] && onImprimirEtiqueta) {
            return (
                <button
                    onClick={() => onImprimirEtiqueta(idPaciente)}
                    className="flex items-center gap-2 p-2 bg-white rounded">
                    <Printer size={18} />
                </button>
            );
        }

        return null;
    };

    const toggleHistorial = async (pacienteId: string | number) => {
        const nuevosVisibles = new Set(historialVisible);

        if (nuevosVisibles.has(pacienteId)) {
            nuevosVisibles.delete(pacienteId);
        } else {
            nuevosVisibles.add(pacienteId);
            if (estado === 'modificar' || !historialDatos.has(pacienteId)) {
                try {
                    const historial = await obtenerHistorialDetalle(pacienteId.toString());
                    setHistorialDatos(prev => new Map(prev).set(pacienteId, historial));
                } catch (error) {
                    if (import.meta.env.DEV) {
                        console.error('Error al cargar historial:', error);
                    }
                }
            }
        }

        setHistorialVisible(nuevosVisibles);
    };

    return (
        <div className="p-6 w-full overflow-x-auto">
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200" aria-label="Listado de detalles de una solicitude de dieta">
                    <TablaEncabezado
                        estado={estado}
                        permisoUsuario={permisoUsuario}
                        puedeVerColumna={puedeVerColumna}
                    />
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pacientes.map((paciente) => (
                            <React.Fragment key={getPacienteKey(paciente)}>
                                <tr
                                    key={getPacienteKey(paciente)}
                                    className={`hover:bg-gray-50 ${esPacienteNoCrear(paciente) && paciente.reclamo
                                        ? "bg-purple-200"
                                        : esPacienteNoCrear(paciente) && paciente.cancelado
                                            ? "bg-red-100"
                                            : esPacienteNoCrear(paciente) && paciente.modificado
                                                ? "bg-yellow-200"
                                                : ""
                                        }`}
                                >
                                    <td className="px-2 py-4  border-b">
                                        <AccionesCell
                                            key={getPacienteKey(paciente)}
                                            estado={paciente.estado}
                                            tiempoComida={idTiempoComida}
                                            paciente={paciente}
                                            filaSeleccionada={filaSeleccionada}
                                            handleGuardarFila={handleGuardarFila}
                                            setCambiosTemporales={setCambiosTemporales}
                                            setPacientes={setPacientes}
                                            editandoFila={editandoFila}
                                            setEditandoFila={setEditandoFila}
                                            permisoUsuario={permisoUsuario}
                                            getPacienteKey={getPacienteKey}
                                            selectFila={handleSeleccionarFila}
                                            handleEditarFila={handleEditarFila}
                                            datosOriginales={datosOriginales}
                                            toggleHistorial={toggleHistorial}
                                            setIdPendiente={setIdPendiente}
                                            setMostrarConfirmacion={setMostrarConfirmacion}
                                            setAccionPendiente={setAccionPendiente}
                                        />
                                    </td>
                                    <td className="px-2 py-4 text-sm font-medium text-gray-900 border-b">
                                        {paciente.ambiente}
                                    </td>
                                    <td className="px-2 py-4 text-sm text-gray-900 border-b">
                                        {paciente.paciente}
                                    </td>
                                    <td className="px-2 py-4 text-sm text-gray-900 border-b">
                                        {paciente.edadTexto}
                                    </td>
                                    <td className="px-2 py-4 border-b">
                                        <DietaCell
                                            paciente={paciente}
                                            esEditable={puedeEditar('dietaSeleccionada', getPacienteKey(paciente), filaSeleccionada, editandoFila, permisoUsuario, estado)}
                                            idTiempoComida={idTiempoComida}
                                            onHandleCambiarValor={handleCambiarValor}
                                            onObtenerValorCampo={(paciente, campo) =>
                                                obtenerValorCampo(
                                                    paciente,
                                                    campo,
                                                    cambiosTemporales,
                                                    editandoFila
                                                )
                                            }
                                            getPacienteKey={getPacienteKey}
                                            todasLasDietas={todasLasDietasDisponibles}
                                            setTodasLasDietas={setTodasLasDietasDisponibles}
                                        />
                                    </td>
                                    {puedeVerColumna('observaciones', permisoUsuario, estado) && (
                                        <td className="px-2 py-4 border-b">
                                            {renderCeldaObservaciones(paciente)}
                                        </td>
                                    )}
                                    {puedeVerColumna('obsEnfermeria', permisoUsuario, estado) && (
                                        <td className="px-2 py-4 border-b">
                                            <CeldaObservacion
                                                paciente={paciente}
                                                campo={'obsEnfermeria'}
                                                esEditable={puedeEditar('obsEnfermeria', getPacienteKey(paciente), filaSeleccionada, editandoFila, permisoUsuario, estado)}
                                                onChange={(valor) => handleCambiarValor(getPacienteKey(paciente), 'obsEnfermeria', valor)}
                                                onObtenerValorCampo={(paciente, campo) =>
                                                    obtenerValorCampo(
                                                        paciente,
                                                        campo,
                                                        cambiosTemporales,
                                                        editandoFila
                                                    )
                                                } />
                                        </td>
                                    )}
                                    {puedeVerColumna('obsNutricion', permisoUsuario, estado) && (
                                        <td className="px-2 py-4 border-b">
                                            <CeldaObservacion
                                                paciente={paciente}
                                                campo={'obsNutricion'}
                                                esEditable={puedeEditar('obsNutricion', getPacienteKey(paciente), filaSeleccionada, editandoFila, permisoUsuario, estado)}
                                                onChange={(valor) => handleCambiarValor(getPacienteKey(paciente), 'obsNutricion', valor)}
                                                onObtenerValorCampo={(paciente, campo) =>
                                                    obtenerValorCampo(
                                                        paciente,
                                                        campo,
                                                        cambiosTemporales,
                                                        editandoFila
                                                    )
                                                } />
                                        </td>
                                    )}
                                    <td className="px-2 py-4 border-b">
                                        <div className="flex flex-col items-start space-y-2">
                                            {paciente.alergia && (

                                                <button
                                                    onClick={() => abrirModal('alergias', paciente)}
                                                    className="flex items-center space-x-1 text-orange-600 hover:text-orange-800 cursor-pointer"
                                                >
                                                    <AlertTriangle size={16} />
                                                    <span className="text-sm">Ver</span>
                                                </button>

                                            )}
                                            {(['crear', 'modificar'].includes(paciente.estado) && permisoUsuario["crear alergias"]) && (
                                                <AlergiaAgregarButton
                                                    expediente={paciente.expediente}
                                                    nombre={paciente.paciente}
                                                    compact={true}
                                                    onSuccess={() => handleCambiarValor(getPacienteKey(paciente), 'alergia', true)}
                                                />
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-2 py-4 border-b">
                                        {paciente.documento && (
                                            <button
                                                onClick={() => abrirModal('documentos', paciente)}
                                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 cursor-pointer"
                                            >
                                                <FileText size={16} />
                                                <span className="text-sm">Ver</span>
                                            </button>
                                        )}
                                    </td>

                                    {puedeVerColumna('obsCocina', permisoUsuario, estado) && (
                                        <td className="px-2 py-4 border-b">
                                            <CeldaObservacion
                                                paciente={paciente}
                                                campo={'obsCocina'}
                                                esEditable={puedeEditar('obsCocina', getPacienteKey(paciente), filaSeleccionada, editandoFila, permisoUsuario, estado)}
                                                onChange={(valor) => handleCambiarValor(getPacienteKey(paciente), 'obsCocina', valor)}
                                                onObtenerValorCampo={(paciente, campo) =>
                                                    obtenerValorCampo(
                                                        paciente,
                                                        campo,
                                                        cambiosTemporales,
                                                        editandoFila
                                                    )
                                                } />
                                        </td>
                                    )}
                                    {puedeVerColumna('recibido', permisoUsuario, estado) && (
                                        <td className="px-2 py-4 border-b">
                                            {!paciente.cancelado && renderCeldaRecibido(paciente)}
                                        </td>
                                    )}
                                    {puedeVerColumna('reclamo', permisoUsuario, estado) && (
                                        <td className="px-2 py-4 border-b">
                                            {!paciente.cancelado ? (
                                                paciente.reclamo ? (
                                                    <button
                                                        onClick={() => abrirModal('reclamo', paciente)}
                                                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 cursor-pointer"
                                                    >
                                                        <span className="text-sm">Ver</span>
                                                    </button>
                                                ) : (
                                                    (estado !== 'cerrar' && permisoUsuario['crear solicitud']) && (
                                                        <button
                                                            onClick={() => abrirModal('reclamo', paciente)}
                                                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 cursor-pointer"
                                                            title="Crear reclamo"
                                                        >
                                                            <span className="text-sm">Crear</span>

                                                        </button>
                                                    )
                                                )
                                            ) : null}
                                        </td>
                                    )}
                                    {puedeVerColumna('imprimir', permisoUsuario, estado) && (
                                        <td className="px-2 py-4 border-b">
                                            {!paciente.cancelado && renderCeldaImprimir(paciente)}
                                        </td>
                                    )}
                                </tr>
                                {historialVisible.has(getPacienteKey(paciente)) && (
                                    <HistorialRow
                                        paciente={paciente}
                                        historial={historialDatos.get(getPacienteKey(paciente)) || []}
                                        onCerrar={() => toggleHistorial(getPacienteKey(paciente))}
                                        getPacienteKey={getPacienteKey}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
                <ConfirmDialog
                    isOpen={mostrarConfirmacion}
                    title={accionPendiente === 'cancelar' ? 'Cancelar orden' : 'Reactivar orden'}
                    message={`¿Estás seguro de que deseas ${accionPendiente} esta orden?`}
                    onConfirm={confirmarAccion}
                    onCancel={() => {
                        setMostrarConfirmacion(false);
                        setIdPendiente(null);
                        setAccionPendiente(null);
                    }}
                />
            </div>

            {/* Modal para Alergias */}

            {modalAbierto === 'alergias' && pacienteSeleccionado && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full mx-4 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl">
                        <div className="flex justify-end">
                            <button
                                onClick={cerrarModal}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <PatientInfoScreen
                            expediente={pacienteSeleccionado.expediente}
                        />
                    </div>
                </div>
            )}

            {/* Modal para Documentos */}
            {modalAbierto === 'documentos' && pacienteSeleccionado && (
                <PatientDocuments
                    expediente={pacienteSeleccionado.expediente}
                    isModal={true}
                    onClose={cerrarModal}
                    nombrePaciente={pacienteSeleccionado.paciente}
                />
            )}

            {/* Modal para reclamos */}
            {modalAbierto === 'reclamo' && pacienteSeleccionado && (
                <FormularioReclamoContainer
                    isOpen={modalAbierto === 'reclamo'}
                    onClose={cerrarModal}
                    id={Number(getPacienteKey(pacienteSeleccionado))}
                    reclamo={pacienteSeleccionado.reclamo ?? false}
                    paciente={pacienteSeleccionado}
                    onReclamoCreado={() => handleCambiarValor(getPacienteKey(pacienteSeleccionado), 'reclamo', true)}
                    forzarSoloVer={(estado === 'cerrar' || permisoUsuario['crear solicitud'] !== true)}
                />

            )}
        </div>
    );
};

export default TablaOrdenesDieta;