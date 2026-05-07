/*
    Archivo: DietaEdadTiempoForm.tsx
    Descripcion: modal para editar un grupo de dieta, rango de edad y tiempo de comida.
    Autor: Marilyn Castro
    Fecha creacion: 3/07/2025
    Version: 2.0.1
*/

import { useState, useEffect } from 'react';
import Dropdown from './Dropdown';
import { type DropdownOption } from '../types/ui';
import { ModalForm } from './ModalForm';
import { useNotifications } from '../hooks/notificacionHook';
import { useUnsavedChangesWarning } from "../hooks/advertenciaCambiosNoGuardados";
import { actualizarDietaEdadTiempo, type NewGrupo } from '../services/dietasEdadTiempo';
import { validarCamposGenerico } from "../utils/validaciones";
import type { GrupoDieComEd } from '@miapp/shared';

interface FormProps {
    dataTiemposComida: DropdownOption[];
    dataRangos: DropdownOption[];
    setShowForm: (show: boolean) => void;
    showForm: boolean;
    grupoEdit: GrupoDieComEd;
    setGrupoEdit: (grupoEdit: GrupoDieComEd | null) => void;
    onEdit: (grupo: GrupoDieComEd) => void;
}

const DietaEdadTiempoForm: React.FC<FormProps> = ({
    dataTiemposComida,
    dataRangos,
    setShowForm,
    showForm,
    grupoEdit,
    onEdit,
    setGrupoEdit
}) => {
    const { notify } = useNotifications();

    const [dieta, setDieta] = useState(grupoEdit.dieta);
    const [abrevDieta, setAbrevDieta] = useState(grupoEdit.abrevDieta ?? '');
    const [rangoEdad, setRangoEdad] = useState(String(grupoEdit.idRangoEdad));
    const [tiempoComida, setTiempoComida] = useState(String(grupoEdit.idTiempoComida));
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const handleSave = async () => {
        const resultado = validarCamposGenerico({
            idDieta: { valor: dieta, tipo: 'number', requerido: true, nombreCampo: "Dieta" },
            idTiempoComida: { valor: tiempoComida, tipo: 'number', requerido: true, min: 1, nombreCampo: "Tiempo de comida" },
            idRangoEdad: { valor: rangoEdad, tipo: 'number', requerido: true, nombreCampo: "Rango de edad" },
            abrevDieta: { valor: abrevDieta, tipo: 'string', requerido: false, nombreCampo: "Abreviatura de la dieta" }
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

        const datos = resultado.datos as NewGrupo;

        try {
            const cambios: Partial<NewGrupo> = {}

            if (datos.idTiempoComida !== grupoEdit.idTiempoComida) cambios.idTiempoComida = datos.idTiempoComida;
            if (datos.idRangoEdad !== grupoEdit.idRangoEdad) cambios.idRangoEdad = datos.idRangoEdad;
            if (datos.abrevDieta !== grupoEdit.abrevDieta) cambios.abrevDieta = datos.abrevDieta;

            if (Object.keys(cambios).length === 0) {
                notify({
                    type: 'info',
                    content: 'No hay cambios',
                    duration: 3000,
                });
                return;
            }

            const response = await actualizarDietaEdadTiempo(String(grupoEdit.id), cambios);
            notify({
                type: 'success',
                title: 'Éxito',
                content: 'La agrupación se modifico correctamente.',
                duration: 3000,
            });

            onEdit(response.data[0]);
            handleCancel(true);
        } catch (error: any) {
            notify({
                type: 'error',
                content: error.response?.data?.error || 'Ocurrió un error al crear o modificar el grupo de edad, tiempo de comida y dieta.',
                duration: 3000,
            });
            setHasUnsavedChanges(false);
        }
    }

    const handleCancel = (force = false) => {
        if (force || !hasUnsavedChanges || window.confirm("¿Descartar los cambios?")) {
            setHasUnsavedChanges(false);
            setShowForm(false);
            setDieta('');
            setRangoEdad('');
            setTiempoComida('');
            setGrupoEdit(null);
        }
    };

    useEffect(() => {
        const cambios =
            tiempoComida !== String(grupoEdit.idTiempoComida) ||
            rangoEdad !== String(grupoEdit.idRangoEdad);

        setHasUnsavedChanges(cambios);
    }, [tiempoComida, rangoEdad, dieta, grupoEdit]);

    useUnsavedChangesWarning(hasUnsavedChanges);


    return (
        <ModalForm
            isOpen={showForm}
            onClose={() => handleCancel()}
            onSave={handleSave}
            title={"Editar relación dieta - tiempo comida - edad"}
            saveText={"Actualizar"}
        >
            <div className="space-y-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dieta:
                </label>
                <input
                    type="text"
                    value={dieta}
                    readOnly
                    className="w-full px-3 py-2 border-2 border-blue-200 rounded-md focus:outline-none focus:border-blue-400 transition-colors placeholder-gray-400  text-gray-700"
                />

                <div className="flex flex-col lg:flex-row lg:items-center lg:gap-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Abreviatura del nombre de la dieta:
                    </label>
                    <input
                        type="text"
                        value={abrevDieta}
                        onChange={(e) => { setAbrevDieta(e.target.value) }}
                        max={30}
                        className="w-full px-3 py-2 border-2 border-blue-200 rounded-md focus:outline-none focus:border-blue-400 transition-colors placeholder-gray-400  text-gray-700"
                    />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tiempo de comida:
                        </label>
                        <Dropdown
                            options={dataTiemposComida}
                            value={tiempoComida}
                            onChange={setTiempoComida}
                            placeholder={'Tiempos de comida'}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rango de edad:
                        </label>
                        <Dropdown
                            options={dataRangos}
                            value={rangoEdad}
                            onChange={setRangoEdad}
                            placeholder={'Rangos de edad'}
                        />
                    </div>
                </div>
            </div>
        </ModalForm>
    );
}

export default DietaEdadTiempoForm;



