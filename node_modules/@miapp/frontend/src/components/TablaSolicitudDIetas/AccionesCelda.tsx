/*
    Archivo: AccionesCelda.tsx
    Descripcion: Componente para renderizar la columna que muestra los iconos de edición, cancelación e historial.
    Autor: Marilyn Castro
    Fecha creacion: 14/07/2025
    Version: 1.0.5
*/
import { Edit, Save, X, Activity, RotateCcw, Slash } from 'react-feather';
import type { PacienteUi } from '../../types/ui';

interface PropsAccionesCel {
    tiempoComida?: number;
    estado: string;
    paciente: PacienteUi;
    datosOriginales: Map<string | number, PacienteUi>;
    filaSeleccionada?: Set<string>;
    setCambiosTemporales?: React.Dispatch<React.SetStateAction<Map<string | number, Partial<PacienteUi>>>>;
    setPacientes?: React.Dispatch<React.SetStateAction<PacienteUi[]>>;
    editandoFila: string | number | null,
    setEditandoFila: React.Dispatch<React.SetStateAction<string | number | null>>;
    permisoUsuario: Record<string, boolean>;
    getPacienteKey: (paciente: PacienteUi) => string | number;
    selectFila: (id: string) => void;
    toggleHistorial: (id: string | number) => void;
    handleGuardarFila: (paciente: PacienteUi) => void;
    handleEditarFila: (paciente: PacienteUi) => void;
    setAccionPendiente: React.Dispatch<React.SetStateAction<'cancelar' | 'reactivar' | null>>;
    setMostrarConfirmacion: React.Dispatch<React.SetStateAction<boolean>>;
    setIdPendiente: React.Dispatch<React.SetStateAction<number | null>>;
}

const BotonHistorial: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="p-1 text-purple-600 hover:text-purple-800"
        title="Ver historial de cambios"
    >
        <Activity size={16} />
    </button>
);


const AccionesCell: React.FC<PropsAccionesCel> = ({
    estado,
    tiempoComida,
    paciente,
    filaSeleccionada,
    setCambiosTemporales,
    setEditandoFila,
    permisoUsuario,
    setPacientes,
    editandoFila,
    getPacienteKey,
    selectFila,
    toggleHistorial,
    datosOriginales,
    handleGuardarFila,
    handleEditarFila,
    setAccionPendiente,
    setIdPendiente,
    setMostrarConfirmacion,
}) => {

    const handleCancelarEdicion = (id: number | string) => {
        const original = datosOriginales.get(id);
        if (original && setPacientes) {
            setPacientes(prev =>
                prev.map(p =>
                    getPacienteKey(p) === id ? { ...original } : p
                )
            );
        }

        if (setCambiosTemporales) {
            setCambiosTemporales(prev => {
                const nuevos = new Map(prev);
                nuevos.delete(id);
                return nuevos;
            });
        }

        setEditandoFila(null);
    };

    const handleCancelarOrden = async (id: string | number) => {
        if (id) {
            setAccionPendiente('cancelar');
            setMostrarConfirmacion(true);
            setIdPendiente(Number(id));
        }
    };

    const handleReactivarOrden = async (id: string | number) => {
        if (id) {
            setAccionPendiente('reactivar');
            setMostrarConfirmacion(true);
            setIdPendiente(Number(id));
        }
    };

    const pacienteKey = getPacienteKey(paciente);
    const tieneHistorial = paciente.modificado === true;

    const historialBtn = tieneHistorial ? (
        <BotonHistorial onClick={() => toggleHistorial(pacienteKey)} />
    ) : null;


    if (estado === 'crear') {
        return (
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={filaSeleccionada?.has(paciente.expediente)}
                    onChange={() => selectFila(paciente.expediente)}
                    className="w-4 h-4"
                    aria-label='Seleccionar paciente con expediente'
                />
                {paciente.estado === 'crear' && paciente.asignado && <span className="text-sm text-red-500">Asignado</span>}
            </div>
        );
    }

    if (estado === 'modificar') {
        const pacienteKey = getPacienteKey(paciente);

        if (editandoFila === pacienteKey) {
            return (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleGuardarFila(paciente)}
                        className="p-1 text-green-600 hover:text-green-800"
                        title="Guardar cambios"
                    >
                        <Save size={16} />
                    </button>
                    <button
                        onClick={() => handleCancelarEdicion(pacienteKey)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Cancelar edición"
                    >
                        <X size={16} />
                    </button>
                    {historialBtn}
                </div>
            );
        }

        return (
            <>
                <div className="flex space-x-2">
                    {paciente.estado !== 'crear' && !paciente.cancelado && (permisoUsuario['cocina'] || permisoUsuario['nutricion'] || (tiempoComida !== 5957 && tiempoComida !== 5956)) && (
                        <button
                            onClick={() => handleEditarFila(paciente)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Editar"
                        >
                            <Edit size={16} />
                        </button>
                    )}
                    {permisoUsuario['crear solicitud'] && paciente.estado !== 'crear' && !paciente.cancelado && (
                        <button
                            onClick={() => handleCancelarOrden(pacienteKey)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Cancelar orden"
                        >
                            <Slash size={16} />
                        </button>
                    )}
                    {permisoUsuario['crear solicitud'] && paciente.estado !== 'crear' && paciente.cancelado && (
                        <button
                            onClick={() => handleReactivarOrden(pacienteKey)}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Reactivar orden"
                        >
                            <RotateCcw size={16} />
                        </button>
                    )}
                    {historialBtn}
                </div>

            </>
        );
    }

    if (paciente.modificado) {
        const pacienteKey = getPacienteKey(paciente);
        return (
            <div className="flex space-x-2">
                <BotonHistorial onClick={() => toggleHistorial(pacienteKey)} />
            </div>
        );
    }

    return null;

}

export default AccionesCell;