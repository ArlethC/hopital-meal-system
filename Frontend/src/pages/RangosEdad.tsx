/*
    Archivo: RangosEdad.tsx
    Descripcion: Pantalla de gestion de los rangos de edad.
    Autor: Marilyn Castro
    Fecha creacion: 2/07/2025
    Version: 1.0.1
*/

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'react-feather';
import MainLayout from "../layouts/LayoutPrincipal";
import Dropdown from '../components/Dropdown';
import { ModalForm } from '../components/ModalForm';
import { useNotifications } from '../hooks/notificacionHook';
import ConfirmDialog from "../components/ConfimModal";
import type { CrearRangoEdadSchemaDTO } from '@miapp/shared';
import { actualizarRangoEdad, crearRangoEdad, eliminarRangoEdad } from "../services/rangosEdadService";
import { useUnsavedChangesWarning } from "../hooks/advertenciaCambiosNoGuardados";
import { obtenerEdadYUnidad } from "../utils/formatear";
import { fetchRangosEdad } from "../utils/fecthDatos";
import { type AgeRange } from '../types/ui';
import { validarCamposGenerico } from "../utils/validaciones";


const AgeRangesManager = () => {
    const { notify } = useNotifications();

    // Estados para los datos
    const [ageRanges, setAgeRanges] = useState<AgeRange[]>([]);

    // Estados para el formulario
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [description, setDescription] = useState('');
    const [minAge, setMinAge] = useState('');
    const [maxAge, setMaxAge] = useState('');
    const [unit, setUnit] = useState('meses');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [originalRange, setOriginalRange] = useState<{
        descripcion: string;
        edadMinima: number;
        edadMaxima: number;
        unidad: string;
    } | null>(null);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [idPendiente, setIdPendiente] = useState<number | null>(null);


    const unitOptions = [
        { value: 'meses', label: 'Meses' },
        { value: 'años', label: 'Años' }
    ];

    useEffect(() => {
        fetchRangos();
    }, []);

    const fetchRangos = async () => {
        const rangosEdadData = await fetchRangosEdad();
        setAgeRanges(rangosEdadData)
    };

    useEffect(() => {
        if (!editingId) {
            setHasUnsavedChanges(description !== '' || minAge !== '' || maxAge !== '');
        } else if (originalRange) {
            const edadMin = parseInt(minAge);
            const edadMax = parseInt(maxAge);
            const cambios =
                description !== originalRange.descripcion ||
                edadMin !== originalRange.edadMinima ||
                edadMax !== originalRange.edadMaxima ||
                unit !== originalRange.unidad;

            setHasUnsavedChanges(cambios);
        }
    }, [description, minAge, maxAge, editingId, originalRange, unit]);


    useUnsavedChangesWarning(hasUnsavedChanges);

    const handleAdd = () => {
        setEditingId(null);
        setDescription('');
        setMinAge('');
        setMaxAge('');
        setUnit('meses');
        setShowForm(true);
    };

    const handleEdit = (ageRange: AgeRange) => {
        const edadMin = obtenerEdadYUnidad(ageRange.edadMinima);
        const edadMax = obtenerEdadYUnidad(ageRange.edadMaxima);
        setEditingId(ageRange.id);
        setDescription(ageRange.descripcion);
        setMinAge(edadMin.valor.toString());
        setMaxAge(edadMax.valor.toString());
        setUnit(edadMin.unidad);
        setOriginalRange({
            descripcion: ageRange.descripcion,
            edadMinima: edadMin.valor,
            edadMaxima: edadMax.valor,
            unidad: edadMin.unidad
        });
        setShowForm(true);

    };

    const solicitarEliminacion = (id: number) => {
        setIdPendiente(id);
        setMostrarConfirmacion(true);
    };

    const handleDelete = async () => {
        if (idPendiente === null) return;
        try {
            await eliminarRangoEdad(idPendiente.toString())

            setAgeRanges(ageRanges.filter(range => range.id !== idPendiente));
            notify({
                type: 'success',
                title: 'Éxito',
                content: 'El rango de edad se elimino correctamente.',
                duration: 3000,
            });
        } catch (error: any) {
            notify({
                type: 'error',
                content: error.response?.data?.error || 'Ocurrió un error al eliminar el rango de edad.',
                duration: 3000,
            });
        }finally{
            setIdPendiente(null);
            setMostrarConfirmacion(false)
        }
    };

    const handleSave = async () => {
        const resultado = validarCamposGenerico({
            descripcion: { valor: description, tipo: 'string', requerido: true, nombreCampo: "Descripción" },
            edadMinima: { valor: minAge, tipo: 'number', requerido: true, min: 1, nombreCampo: "Edad mínima" },
            edadMaxima: { valor: maxAge, tipo: 'number', requerido: true, min: 1, nombreCampo: "Edad máxima" },
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

        const datos = resultado.datos as CrearRangoEdadSchemaDTO;

        if (parseInt(minAge) >= parseInt(maxAge)) {
            notify({ type: 'warning', title: 'Datos  inválidos', content: 'La edad mínima debe ser menor que la edad máxima.', duration: 3000,});
            return;
        }
        try {

            datos['unidad'] = unit as 'meses' | 'años';

            if (editingId && originalRange) {
                const cambios: Partial<typeof datos> = {}
                if (datos.descripcion !== originalRange.descripcion) cambios.descripcion = datos.descripcion;
                if (datos.edadMinima !== originalRange.edadMinima) {
                    cambios.edadMinima = datos.edadMinima;
                    cambios.unidad = datos.unidad;
                };
                if (datos.edadMaxima !== originalRange.edadMaxima) {
                    cambios.edadMaxima = datos.edadMaxima;
                    cambios.unidad = datos.unidad;
                };
                if (datos.unidad !== originalRange.unidad) {
                    cambios.unidad = datos.unidad;
                    cambios.edadMinima = datos.edadMinima;
                    cambios.edadMaxima = datos.edadMaxima;
                }

                if (Object.keys(cambios).length === 0) {
                    return;
                }

                await actualizarRangoEdad(editingId.toString(), cambios);

                await fetchRangos();
            } else {
                const response = await crearRangoEdad(datos)
                setAgeRanges([...ageRanges, response]);
            }
            handleCancel(true);

        } catch (error: any) {
            notify({ type: 'error', content: error.response?.data?.error || 'Ocurrió un error al crear o modificar el rango de edad.',duration: 3000, });
            setHasUnsavedChanges(false);
        }
    };

    const handleCancel = (force = false) => {
        if (force || !hasUnsavedChanges || window.confirm("¿Descartar los cambios?")) {
            setHasUnsavedChanges(false);
            setShowForm(false);
            setEditingId(null);
            setDescription('');
            setMinAge('');
            setMaxAge('');
            setUnit('meses');
        }
    };

    return (
        <MainLayout>
            <h2 className="text-2xl font-semibold text-gray-800 text-center p-4">
                Rangos de edad
            </h2>
            <div className="w-full flex flex-col items-center justify-center bg-white rounded-lg shadow-lg p-8 overflow-x-hidden">
                {/* Lista de rangos existentes */}
                <div className="mb-6">
                    {ageRanges.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No hay rangos de edad configurados
                        </div>
                    ) : (
                        <div className={`grid gap-4 w-full justify-center ${ageRanges.length === 1
                                ? 'grid-cols-1'
                                : 'grid-cols-1 md:grid-cols-2'
                                }`}>
                            {ageRanges.map((range) => (
                                <div
                                    key={range.id}
                                    className="flex flex-col sm:flex-row justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 w-full max-w-[700px] mx-auto"
                                >
                                    <div className="flex items-start">

                                        <div>
                                            <div className="font-medium text-gray-800">{range.descripcion}</div>
                                            <div className="mt-1 text-sm text-gray-600">
                                                Edad mínima: {range.edadMinimaTexto}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Edad máxima: {range.edadMaximaTexto}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(range)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => solicitarEliminacion(range.id)}
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
                </div>

                <button
                    onClick={handleAdd}
                    className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                </button>

                <ModalForm
                    isOpen={showForm}
                    onClose={() => handleCancel()}
                    onSave={handleSave}
                    title={editingId ? "Editar rango de edad" : "Nuevo rango de edad"}
                    saveText={editingId ? "Actualizar" : "Guardar"}
                >
                    <div className="space-y-6">
                        {/* Descripción */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción:</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 border-2 border-blue-200 rounded-md focus:outline-none focus:border-blue-400 transition-colors placeholder-gray-400 text-gray-700"
                                placeholder="Ej: Rango de 6 a 9 meses"
                            />
                        </div>

                        {/* Edades */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Edad mínima */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Edad mínima:</label>
                                <div className="flex flex-col md:flex-row gap-2">
                                    <input
                                        type="number"
                                        value={minAge}
                                        onChange={(e) => setMinAge(e.target.value)}
                                        min="0"
                                        className="flex-1 px-3 py-2 border-2 border-blue-200 rounded-md focus:outline-none focus:border-blue-400 transition-colors placeholder-gray-400 text-black"
                                        placeholder="0"
                                    />
                                    <Dropdown
                                        options={unitOptions}
                                        value={unit}
                                        onChange={setUnit}
                                        incluirPlaceholder={false}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Edad máxima:</label>
                                <div className="flex flex-col md:flex-row gap-2">
                                    <input
                                        type="number"
                                        value={maxAge}
                                        onChange={(e) => setMaxAge(e.target.value)}
                                        min="0"
                                        className="flex-1 px-3 py-2 border-2 border-blue-200 rounded-md focus:outline-none focus:border-blue-400 transition-colors placeholder-gray-400 text-black"
                                        placeholder="0"
                                    />
                                    <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md flex items-center min-w-[80px] justify-center">
                                        <span className="text-sm text-gray-600">
                                            {unitOptions.find(opt => opt.value === unit)?.label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalForm>
                <ConfirmDialog
                    isOpen={mostrarConfirmacion}
                    title="Confirmar desactivación"
                    message="¿Estás seguro de que quieres desactivar este rango de edad?"
                    onConfirm={handleDelete}
                    onCancel={() => { setIdPendiente(null); setMostrarConfirmacion(false) }}
                />
            </div>
        </MainLayout>
    );
}

export default AgeRangesManager;

