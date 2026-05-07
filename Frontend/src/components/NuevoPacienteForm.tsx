/*
    Archivo: NuevoPacienteForm.tsx
    Descripcion: Componente para agregar un nuevo paciente que no se encuentra en sala a la solicitude de dietas.
    Autor: Marilyn Castro
    Fecha creacion: 15/07/2025
    Version: 1.0.1
*/

import { useState } from 'react';
import type { PacienteUi } from '../types/ui';
import { ModalForm } from '../components/ModalForm';
import SearchBar from "../components/SearchBar";
import { fetchPacientes } from "../utils/fecthDatos";
import { transformarPaciente } from "../utils/formatear";
import { useNotifications } from '../hooks/notificacionHook';

import { obtenerPaciente } from "../services/pacientes";

interface FormProps {
    onAgregarPaciente: (nuevo: PacienteUi) => void;
    isOpen: boolean;
    idTiempoComida: string;
    fecha: string;
    sala: string;
    onClose: () => void;
}

const NuevoPacForm: React.FC<FormProps> = ({
    isOpen,
    idTiempoComida,
    fecha,
    sala,
    onAgregarPaciente,
    onClose,
}) => {
    const { notify } = useNotifications();

    const [paciente, setPaciente] = useState('');

    const agregarPaciente = async () => {
        if (!paciente && paciente.trim() == '') {
            notify({
                type: 'warning',
                title: 'Datos  inválidos',
                content: "Debe seleccionar un paciente.",
                duration: 3000,
            });
            return;
        }

        const datos = {
            expediente: paciente,
            fecha: fecha,
            idTiempoComida: Number(idTiempoComida),
            sala: sala,
        }

        try {
            const dataPaciente = await obtenerPaciente(datos);

            const datosTransformados = dataPaciente.map(item => transformarPaciente(item));

            onAgregarPaciente(datosTransformados[0]);

            onClose();

        } catch (error: any) {
            notify({
                type: 'error',
                content: error.response?.data?.error || 'Ocurrió un error al obtener el paciente',
                duration: 3000,
            });
        }
    }

    return (
        <ModalForm
            isOpen={isOpen}
            onClose={() => onClose()}
            onSave={agregarPaciente}
            title={"Seleccione un paciente"}
            saveText={"Agregar"}
            cancelText={"Cancelar"}
        >
            <SearchBar
                liveSearch={{
                    fetchResults: fetchPacientes,
                    onSelect: (item) => setPaciente(item.id),
                }}
                onLiveSearchQueryChange={(q) => {
                    if (q === '') setPaciente('');
                }}
                searchPlaceholder="Buscar expediente o nombre del paciente..."
                showButtonSearch={false}
            />

        </ModalForm>
    );
};

export default NuevoPacForm;
