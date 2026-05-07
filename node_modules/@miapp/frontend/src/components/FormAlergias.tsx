/*
    Archivo: FormAlergias.tsx
    Descripcion: Componente de un formulario para agregar una nueva alergia e intolerancia.
    Autor: Marilyn Castro
    Fecha creacion: 17/07/2025
    Version: 1.0.0
*/
import { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/notificacionHook';
import { crearAlergiaIntolerancia, modificarAlergiaIntolerancia } from "../services/alergiaIntolerancia";
import { formatearNombre } from "../utils/formatear";
import { useUnsavedChangesWarning } from "../hooks/advertenciaCambiosNoGuardados";
import { ModalForm } from './ModalForm';
import ConfirmDialog from './ConfimModal'

interface PropsAlergiaModal {
    expediente: string;
    paciente: string;
    id?: number;
    alergia?: string;
    onClose: (show: boolean) => void;
    onSaved?: (isNew: boolean) => void;
    showForm: boolean;
}

const AlergiaModal: React.FC<PropsAlergiaModal> = ({
    expediente,
    paciente,
    id,
    alergia,
    showForm,
    onClose,
    onSaved,
}) => {
    const { notify } = useNotifications();

    const [alergiaIntolerancia, setAlergiaIntolerancia] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

    useUnsavedChangesWarning(hasUnsavedChanges);

    useEffect(() => {
        if (alergia) {
            setAlergiaIntolerancia(alergia);
            setHasUnsavedChanges(false);
        } else {
            setAlergiaIntolerancia('');
            setHasUnsavedChanges(false);
        }
    }, [alergia]);

    useEffect(() => {
        if (alergia) {
            const cambios =
                alergiaIntolerancia !== alergia;

            setHasUnsavedChanges(cambios);
        } else {
            setHasUnsavedChanges(alergiaIntolerancia !== '');
        }
    }, [alergiaIntolerancia]);

    const handleSave = async () => {
        if (alergiaIntolerancia.trim() === '') {
            notify({
                type: 'warning',
                title: 'Datos inválidos',
                content: 'Por favor, ingresa el nombre de la alergia o intolerancia.',
                duration: 3000,
            });
            return;
        }

        try {
            if (id) {
                await modificarAlergiaIntolerancia({
                    id: id,
                    alergiasIntolerancias: alergiaIntolerancia,
                });

                notify({
                    type: 'success',
                    title: 'Éxito',
                    content: 'La alergia-intolerancia se modificó correctamente.',
                    duration: 3000,
                });

                onSaved?.(false);
                onClose(true);
            } else {
                await crearAlergiaIntolerancia({
                    expediente: expediente,
                    alergiasIntolerancias: alergiaIntolerancia,
                });

                notify({
                    type: 'success',
                    title: 'Éxito',
                    content: 'La alergia-intolerancia se creó correctamente.',
                    duration: 3000,
                });

                onSaved?.(true);

                setHasUnsavedChanges(false);
                setMostrarConfirmacion(true); 
            }
        } catch (error: any) {
            notify({
                type: 'error',
                content:
                    error.response?.data?.error || 'Ocurrió un error al crear o modificar la alergia o intolerancia.',
                duration: 3000,
            });
            setHasUnsavedChanges(false);
        }
    };


    const handleCancel = (force = false) => {
        if (force || !hasUnsavedChanges || window.confirm("¿Descartar los cambios?")) {
            setHasUnsavedChanges(false);
            setAlergiaIntolerancia('');
            onClose(true);
        }
    };

    return (
        <ModalForm
            isOpen={showForm}
            onClose={() => handleCancel()}
            onSave={handleSave}
            title={alergia ? "Editar alergia-intolerancia" : "Nueva alergia-intolerancia"}
            saveText={alergia ? "Actualizar" : "Guardar"}
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 text-sm text-gray-600">
                <p><span className="font-medium">Expediente:</span> {expediente}</p>
                <p><span className="font-medium">Nombre:</span> {formatearNombre(paciente)}</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la alergia-intolerancia:
                </label>
                <textarea
                    value={alergiaIntolerancia}
                    onChange={(e) => { setAlergiaIntolerancia(e.target.value) }}
                    className="w-full px-2 py-1 border rounded text-sm"
                    placeholder="Ingrese una alergia o intolerancia"
                />
            </div>
            <ConfirmDialog
                isOpen={mostrarConfirmacion}
                title="Nueva alergia"
                message="¿Deseas agregar otra alergia o intolerancia?"
                confirmText="Si"
                cancelText="No"
                confirmColor='blue'
                onConfirm={() => {
                    setMostrarConfirmacion(false);
                    setAlergiaIntolerancia('');
                }}
                onCancel={() => {
                    setMostrarConfirmacion(false);
                    onClose(true); 
                }}
            />
        </ModalForm>
    );
}

export default AlergiaModal;