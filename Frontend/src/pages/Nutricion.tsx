/*
    Archivo: Nutricion.tsx
    Descripcion: Pantalla para gestiona los documentos de nutrición y meriendas.
    Autor: Marilyn Castro
    Fecha creacion: 21/07/2025
    Version: 2.0.0
*/
import { useState, useEffect } from 'react';
import { Plus } from 'react-feather';
import { fetchPacientes } from "../utils/fecthDatos";
import { type SearchItem } from '../components/SearchBar';
import { useNotifications } from '../hooks/notificacionHook';
import { useAuth } from '../hooks/Auth';

import ConfirmDialog from "../components/ConfimModal";
import MainLayout from "../layouts/LayoutPrincipal";
import SearchBar from "../components/SearchBar";
import PatientDocuments from '../components/ListDocumentos';
import { ModalForm } from '../components/ModalForm';
import Dropdown from '../components/Dropdown';
import { PatienteMeriendas } from '../components/PacienteMeriendas';

import { desactivarDocumentoNutri, obtenerTiposDocumento, type ResponseBackend, type CrearDocumento, crearDocumentoNutri } from "../services/documentosNutricion";
import { useUnsavedChangesWarning } from "../hooks/advertenciaCambiosNoGuardados";
import { validarCamposGenerico } from "../utils/validaciones";
import { ValidarFecha } from "../utils/validaciones";


const NutritionPage = () => {
    const { notify } = useNotifications();
    const { tienePermiso } = useAuth();

    const [paciente, setPaciente] = useState<SearchItem | null>(null);
    const [tiposDocumentos, setTiposDocumentos] = useState<ResponseBackend | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [idPendiente, setIdPendiente] = useState<number | null>(null);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const hoy = (() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    })();
    const formularioInicial: CrearDocumento = {
        idTipoDocumento: Array.isArray(tiposDocumentos) && tiposDocumentos.length > 0 && 'id' in tiposDocumentos[0]
            ? (tiposDocumentos[1] as { id: number }).id
            : 0,
        fechaInicial: hoy,
        fechaFinalVigencia: undefined,
        obsDocumento: undefined,
        expediente: '',
        archivo: new File([], '')
    };
    const [formulario, setFormulario] = useState<CrearDocumento>({
        idTipoDocumento: 0,
        fechaInicial: hoy,
        fechaFinalVigencia: undefined,
        obsDocumento: undefined,
        expediente: '',
        archivo: new File([], '')
    });

    useEffect(() => {
        const esDiferente = JSON.stringify(formulario) !== JSON.stringify(formularioInicial);
        setHasUnsavedChanges(esDiferente);
    }, [formulario]);

    useUnsavedChangesWarning(hasUnsavedChanges);

    useEffect(() => {
        if (tiposDocumentos && tiposDocumentos.length > 0 && formulario.idTipoDocumento === 0) {
            setFormulario((prev) => ({
                ...prev,
                idTipoDocumento: Array.isArray(tiposDocumentos) && tiposDocumentos.length > 0 && 'id' in tiposDocumentos[0]
                    ? (tiposDocumentos[1] as { id: number }).id
                    : 0
            }));
        }
    }, [tiposDocumentos]);


    const getTiposDocumentos = async () => {
        try {
            const datos = await obtenerTiposDocumento();
            setTiposDocumentos(datos);
        } catch (error: any) {
            notify({
                type: 'error',
                content: error.response?.data?.error || 'Error al obtener los documentos del paciente.',
                duration: 3000,
            });
        }
    };

    const resetPaciente = () => {
        setPaciente(null);
        setShowModal(false);
        setIdPendiente(null);
        setMostrarConfirmacion(false);
    };

    const solicitarEliminacion = (id: number) => {
        setIdPendiente(id);
        setMostrarConfirmacion(true);
    };

    const abrirCrear = () => {
        setShowModal(true);
        getTiposDocumentos();
    };


    const handleDelete = async () => {
        if (idPendiente === null) return;
        try {
            await desactivarDocumentoNutri(idPendiente.toString())

            if (paciente) {
                setRefreshKey(prev => prev + 1);
            }
        } catch (error: any) {
            notify({
                type: 'error',
                content: error.response?.data?.error || 'Ocurrió un error al desactivar el documento de nutrición.',
                duration: 3000,
            });
        } finally {
            setIdPendiente(null);
            setMostrarConfirmacion(false);
        }
    };

    const handleCancel = (force = false) => {
        if (force || !hasUnsavedChanges || window.confirm("¿Descartar los cambios?")) {
            setHasUnsavedChanges(false);
            setShowModal(false);
            setFormulario({
                idTipoDocumento: Array.isArray(tiposDocumentos) && tiposDocumentos.length > 0 && 'id' in tiposDocumentos[0]
                    ? (tiposDocumentos[1] as { id: number }).id
                    : 0,
                fechaInicial: hoy,
                fechaFinalVigencia: undefined,
                expediente: "",
                archivo: new File([], '')
            })
        }
    };

    const actualizarCampo = <K extends keyof CrearDocumento>(
        campo: K,
        valor: CrearDocumento[K]
    ) => {
        setFormulario(prev => ({ ...prev, [campo]: valor }));
    };

    const handleSave = async () => {
        const resultado = validarCamposGenerico({
            expediente: { valor: paciente?.id, tipo: 'string', requerido: true, nombreCampo: "Expediente" },
            idTipoDocumento: { valor: formulario.idTipoDocumento, tipo: 'number', requerido: true, min: 1, nombreCampo: "Tipo de documento" },
            fechaInicial: { valor: formulario.fechaInicial, tipo: 'string', requerido: true, nombreCampo: "Fecha inicial de vigencia" },
            fechaFinalVigencia: { valor: formulario.fechaFinalVigencia, tipo: 'string', requerido: false, nombreCampo: "Fecha final de vigencia" },
            obsDocumento: { valor: formulario.obsDocumento, tipo: 'string', requerido: false, nombreCampo: "Detalle para Cocina" },
        });

        if (!resultado.ok) {
            notify({ type: 'warning', title: 'Datos  inválidos', content: resultado.mensaje || 'Los datos no son correctos.', duration: 3000, });
            return;
        }

        if (formulario.archivo.size === 0) {
            notify({ type: 'warning', title: 'Archivo requerido', content: 'Debe seleccionar un archivo para continuar.', duration: 3000, });
            return;
        }

        if ((formulario.fechaInicial && ValidarFecha(formulario.fechaInicial)) || (formulario.fechaFinalVigencia && ValidarFecha(formulario.fechaFinalVigencia))) {
            notify({ type: 'warning', title: 'Datos inválidos', content: "Selecciona una fecha igual o mayor a la fecha actual.", duration: 3000, });
            return;
        }

        if (formulario.fechaFinalVigencia) {
            if (!formulario.fechaInicial) {
                notify({ type: 'warning', title: 'Datos inválidos', content: "Si hay fecha final de vigencia, también debe haber una fecha inicial.", duration: 3000, });
                return;
            }

            const [y1, m1, d1] = formulario.fechaInicial.split('-').map(Number);
            const [y2, m2, d2] = formulario.fechaFinalVigencia.split('-').map(Number);

            const fechaInicial = new Date(y1, m1 - 1, d1);
            const fechaFinal = new Date(y2, m2 - 1, d2);


            if (fechaFinal < fechaInicial) {
                notify({ type: 'warning', title: 'Datos inválidos', content: "La fecha final de vigencia debe ser mayor que la fecha inicial.", duration: 3000, });
                return;
            }
        }

        const formData = new FormData();

        formData.append("expediente", paciente?.id || '');
        formData.append("idTipoDocumento", formulario.idTipoDocumento.toString());

        formData.append("fechaInicial", formulario.fechaInicial);

        if (formulario.fechaFinalVigencia) formData.append("fechaFinalVigencia", formulario.fechaFinalVigencia);
        if (formulario.obsDocumento && formulario.obsDocumento.trim() !== '') formData.append("obsDocumento", formulario.obsDocumento);

        formData.append('archivo', formulario.archivo);

        try {
            await crearDocumentoNutri(formData);

            notify({ type: 'success', title: 'Éxito', content: 'El documento se creo correctamente.', duration: 3000, });

            setRefreshKey(prev => prev + 1);
            handleCancel(true);
        } catch (error: any) {
            notify({ type: 'error', content: error.response?.data?.error || 'Ocurrió un error al crear el documento de nutrición', duration: 3000, });
            setHasUnsavedChanges(false);
        }
    }

    return (
        <MainLayout>
            <h2 className="text-2xl font-semibold text-gray-800 text-center p-4">
                Gestión de Nutrición
            </h2>
            <SearchBar
                liveSearch={{
                    fetchResults: fetchPacientes,
                    onSelect: (item) => {
                        setPaciente(item)
                    },
                }}
                onLiveSearchQueryChange={(q) => {
                    if (q === '') resetPaciente();
                }}
                searchPlaceholder="Buscar expediente o nombre del paciente..."
                searchButtonText="Buscar"
                showButtonSearch={false}
            />
            {paciente && (
                <div className="mt-4">
                    {tienePermiso('nutricion') && (
                        <>
                            <PatientDocuments
                                expediente={paciente.id}
                                nombrePaciente={paciente.name}
                                onDelete={solicitarEliminacion}
                                refreshTable={refreshKey}
                            />

                            <div className="flex justify-center mt-4">
                                <button
                                    onClick={() => abrirCrear()}
                                    className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Agregar Documento
                                </button>
                            </div>
                        </>
                    )}

                    {tienePermiso('meriendas') && (
                        <PatienteMeriendas
                            expediente={paciente.id}
                            nombrePaciente={paciente.name}
                            edad={paciente.category!}
                            setHasUnsavedChanges={setHasUnsavedChanges}
                            hasUnsavedChanges={hasUnsavedChanges}
                        />)}
                </div>
            )}
            <ModalForm
                isOpen={showModal}
                onClose={() => handleCancel()}
                onSave={handleSave}
                title={"Nuevo documento nutricional"}
                saveText={"Guardar"}
            >
                <div >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de documento:
                        </label>
                        <Dropdown
                            options={tiposDocumentos?.map((item) => ({
                                value: item.id.toString(),
                                label: item.Valor
                            })) || []}
                            value={formulario.idTipoDocumento.toString()}
                            onChange={(val) => actualizarCampo('idTipoDocumento', Number(val))}
                            placeholder={'Tipos de documentos'}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Seleccione un documento</label>
                        <input id="archivo" type="file"
                            accept="image/*,application/pdf"
                            multiple={false}
                            className="block w-full mb-5 text-sm text-black file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold  file:bg-blue-600 file:text-white  hover:file:bg-blue-700 border border-gray-300 rounded-lg cursor-pointer  bg-white focus:outline-none"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
                                    if (!allowedTypes.includes(file.type)) {
                                        notify({ type: 'warning', title: 'Datos inválidos', content: "Solo se permiten imágenes y PDF.", duration: 3000, });
                                        e.target.value = "";

                                    } else {
                                        actualizarCampo('archivo', file);
                                    }
                                }
                            }}></input>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha de inicio vigencia:
                            </label>
                            <input
                                type="date"
                                value={formulario.fechaInicial || ''}
                                onChange={(e) => actualizarCampo('fechaInicial', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha de final de vigencia:
                            </label>
                            <input
                                type="date"
                                value={formulario.fechaFinalVigencia || ''}
                                onChange={(e) => actualizarCampo('fechaFinalVigencia', e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Detalle para Cocina:
                        </label>
                        <textarea
                            value={formulario.obsDocumento || ''}
                            onChange={(e) => actualizarCampo('obsDocumento', e.target.value)}
                            placeholder="Detalle para que cocina lo visualice"
                            className="w-full border px-3 py-2 rounded"
                            aria-label="Observación del reclamo"
                        />
                    </div>
                </div>
            </ModalForm>

            <ConfirmDialog
                isOpen={mostrarConfirmacion}
                title="Confirmar desactivación"
                message="¿Estás seguro de que quieres desactivar este documento nutricional?"
                onConfirm={handleDelete}
                onCancel={() => { setIdPendiente(null); setMostrarConfirmacion(false); }}
            />
        </MainLayout>
    );
};

export default NutritionPage;
