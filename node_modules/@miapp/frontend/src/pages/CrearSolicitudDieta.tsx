/*
    Archivo: CrearSolicitud.tsx
    Descripcion: Pantalla para crear las solicitudes de dietas.
    Autor: Marilyn Castro
    Fecha creacion: 11/07/2025
    Version: 2.0.2
*/
import { useState, useEffect } from 'react';
import { CheckCircle, X } from 'react-feather';
import MainLayout from "../layouts/LayoutPrincipal";
import SearchBar from "../components/SearchBar";
import TablaOrdenesDieta from "../components/TablaSolicitudDIetas/TableSolicitud";
import PreviewModal from "../components/ModalPrevisualizacion";
import NuevoPacForm from "../components/NuevoPacienteForm";

import { useAuth } from "../hooks/Auth";
import { useUnsavedChangesWarning } from "../hooks/advertenciaCambiosNoGuardados";
import { useNotifications } from '../hooks/notificacionHook';

import type { ValorCatalogo, Salas, PacienteUi } from '../types/ui';
import { fetchTiemposComida, fecthSalas } from "../utils/fecthDatos";
import { obtenerPacientesSala } from "../services/pacientes";
import { ValidarFecha } from "../utils/validaciones";
import { transformarPaciente } from "../utils/formatear";
import type { PacienteOmitido, DatosSala } from "../types/solicitud";
import { validarCamposGenerico } from "../utils/validaciones";


const DietasCreatePage = () => {
    const { notify } = useNotifications();

    const [nuevosPacientesIds, setNuevosPacientesIds] = useState<Set<string>>(new Set());
    const [tiemposComida, setTiemposComida] = useState<ValorCatalogo[]>([]);
    const [salas, setSalas] = useState<Salas[]>([]);
    const [pacientes, setPacientes] = useState<PacienteUi[]>([]);
    const [filaSeleccionada, setFilaSeleccionada] = useState<Set<string>>(new Set());
    const [pacienteOmitidos, setPacienteOmitidos] = useState<PacienteOmitido[]>([]);
    const [datosPrevios, setDatosPrevios] = useState<any>(null);
    const [mostrarSoloNuevos, setMostrarSoloNuevos] = useState(false);

    const [modal, setModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showNuevoPaciente, setShowNuevoPaciente] = useState(false);
    const [busqueda, setBusqueda] = useState(false);


    const [sala, setSala] = useState('');
    const [edificio, setEdificio] = useState('');
    const [tiempoComida, setTiempoComida] = useState('');
    const [deliveryDate, setDeliveryDate] = useState(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });

    const shouldBlock = (
        filaSeleccionada.size > 0 ||
        pacientes.some(p => (
            'obsEnfermeria' in p && p.obsEnfermeria?.trim() ||
            'dietaSeleccionada' in p && p.dietaSeleccionada
        ))
    );

    useUnsavedChangesWarning(shouldBlock);

    const { permisos, usuario } = useAuth();

    useEffect(() => {
        const fetchTiempos = async () => {
            const tiemposComidaData = await fetchTiemposComida();
            setTiemposComida(tiemposComidaData);
        };
        const obtenerSalas = async () => {
            const salasData = await fecthSalas();
            setSalas(salasData);
        };

        fetchTiempos();
        obtenerSalas();
    }, []);

    useEffect(() => {
        if (showSuccessModal) {
            const timeout = setTimeout(() => {
                setShowSuccessModal(false);
                setSala("");
                setTiempoComida("")
                setFilaSeleccionada(new Set());
                setPacientes([]);
            }, 1900);


            return () => clearTimeout(timeout);
        }
    }, [showSuccessModal]);


    useEffect(() => {
        if (sala !== '' && tiempoComida !== '' && deliveryDate !== '') {
            const cargarPacientes = async () => {
                await pacienteSala(sala, tiempoComida, deliveryDate);
            };

            setMostrarSoloNuevos(false);
            cargarPacientes();

        }
    }, [sala, tiempoComida, deliveryDate]);

    const handleNuevoPaciente = () => {
        if (tiempoComida.trim() == '' || deliveryDate.trim() == '' || sala.trim() == '') {
            notify({
                type: 'warning',
                content: 'Por favor seleccione una sala, fecha y hora de comida.',
                duration: 4000,
            });
            return
        }

        setShowNuevoPaciente(true);
    }

    const agregarPaciente = (nuevo: PacienteUi) => {
        setPacientes((prev) => [...prev, nuevo]);
        setNuevosPacientesIds((prev) => new Set(prev).add(nuevo.expediente));
        setMostrarSoloNuevos(true);
    };


    const pacienteSala = async (sala: string, tiempoComida: string, fecha: string) => {
        const resultado = validarCamposGenerico({
            sala: { valor: sala, tipo: 'string', requerido: true, },
            fecha: { valor: fecha, tipo: 'string', requerido: true, },
            idTiempoComida: { valor: tiempoComida, tipo: 'number', requerido: true, nombreCampo: "Tiempo de comida" },
        });

        if (!resultado.ok) {
            notify({
                type: 'warning',
                title: 'Datos inválidos',
                content: resultado.mensaje || "Los datos no son correctos",
                duration: 3000,
            });
            return;
        }

        const datos = resultado.datos as DatosSala;

        if (ValidarFecha(fecha)) {
            notify({
                type: 'warning',
                title: 'Datos inválidos',
                content: "Selecciona una fecha igual o mayor a la fecha actual.",
                duration: 3000,
            });
            return;
        }

        try {
            setBusqueda(true);

            const response = await obtenerPacientesSala(datos);
            const pacientesCrear: PacienteUi[] = response.map(transformarPaciente)
            setPacientes(prevPacientes => {
                const mapaPrevio = new Map(prevPacientes.map(p => [p.expediente, p]));

                const combinados = pacientesCrear.map(pacienteNuevo => {
                    const pacientePrevio = mapaPrevio.get(pacienteNuevo.expediente);
                    if (pacientePrevio) {
                        return {
                            ...pacienteNuevo,
                            dietaSeleccionada: (pacientePrevio as any).dietaSeleccionada ?? (pacienteNuevo as any).dietaSeleccionada,
                            obsEnfermeria: (pacientePrevio as any).obsEnfermeria ?? (pacienteNuevo as any).obsEnfermeria,
                        };
                    }
                    return pacienteNuevo;
                });

                return combinados;
            });
            if (response.length > 0) {
                const edificio = response[0].edificio;
                setEdificio(edificio);
            }
        } catch (error: any) {
            notify({
                type: 'error',
                content: error.response?.data?.error || 'Ocurrió un error al obtener los pacientes.',
                duration: 3000,
            });
            setPacientes([]);
        }
    };

    const previsualizar = () => {
        const sinDieta = pacientes.filter(
            p => filaSeleccionada.has(p.expediente) && (!('dietaSeleccionada' in p))
        );

        if (sinDieta.length > 0) {
            const nombres = sinDieta.map(p => p.paciente).join(', ');
            notify({
                type: 'warning',
                content: `Los siguientes pacientes no tienen dieta asignada: ${nombres}`,
                duration: 3000,
            });
            return;
        }
        const datos = {
            edificio: edificio,
            sala: sala,
            usuario: usuario,
            fecha: deliveryDate,
            idTiempoComida: tiempoComida,
            tiempoComida: tiemposComida.find(item => item.id === Number(tiempoComida))?.valor,
        }

        const pacientesFiltrados = pacientes
            .filter(p => filaSeleccionada.has(p.expediente))
            .map(p => ({
                expediente: p.expediente,
                cama: p.ambiente,
                paciente: p.paciente,
                edadTexto: p.edadTexto,
                dietaSeleccionada: 'dietaSeleccionada' in p && p.dietaSeleccionada ? p.dietaSeleccionada : undefined,
                obsEnfermeria: 'obsEnfermeria' in p && p.obsEnfermeria ? p.obsEnfermeria : '',
                idRelacion: p.idRelacion,
                tipoRelacion: p.tipoRelacion,
            }));
        if (pacientesFiltrados.length === 0) {
            notify({
                type: 'warning',
                content: 'No hay pacientes seleccionados',
                duration: 3000,
            });
            return;
        }
        setDatosPrevios({ ...datos, pacientes: pacientesFiltrados });
        setModal(true)
    }

    const handleSeleccionarTodos = (pacientes: PacienteUi[]) => {
        const todos = new Set(pacientes.map(p => p.expediente));
        setFilaSeleccionada(todos);
    };

const listaMostrada = mostrarSoloNuevos
  ? pacientes.filter((p) => nuevosPacientesIds.has(p.expediente))
  : pacientes;

    return (
        <MainLayout>
            <h2 className="text-2xl font-semibold text-gray-800 text-center p-4">
                Crear solicitud de dieta
            </h2>

            <SearchBar
                leftDropdown={{
                    options:
                        salas.map(sala => ({
                            label: sala.descripcion,
                            value: sala.descripcion,
                        })),
                    value: sala,
                    onChange: setSala,
                    placeholder: "Salas"
                }}
                rightDropdown={{
                    options:
                        tiemposComida.map(tiempo => ({
                            label: tiempo.valor,
                            value: String(tiempo.id),
                        })),
                    value: tiempoComida,
                    onChange: setTiempoComida,
                    placeholder: "Tiempo de comida"
                }}
                dateSelector={{
                    onDateChange: setDeliveryDate,
                    value: deliveryDate,
                    label: "Fecha de entrega",
                }}
                showButtonSearch={false}
                showSearchBar={false}
            />

            {(permisos["solicitud extraordinaria"] || permisos['admin'])&& (
                <div className="flex justify-end my-4">
                    <button
                        onClick={() => handleNuevoPaciente()}
                        className="px-6 py-2 max-w-xs w-full text-sm font-medium text-black bg-emerald-300 hover:bg-emerald-400 rounded-lg transition-colors duration-200 "
                        title="Agregar un nuevo paciente a la solicitud"
                    >
                        Agregar Paciente
                    </button>
                </div>
            )}

            {!busqueda && !showSuccessModal && (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg mt-4">
                    Selecione una sala y un tiempo de comida
                </div>
            )}

            {busqueda ? (
                listaMostrada.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-white rounded-lg mt-4">
                        No hay resultados
                    </div>
                ) : (
                    <>
                        <TablaOrdenesDieta
                            estado={'crear'}
                            pacientes={listaMostrada}
                            permisoUsuario={permisos}
                            filaSeleccionada={filaSeleccionada}
                            setFilaSeleccionada={setFilaSeleccionada}
                            setPacientes={setPacientes}
                            idTiempoComida={Number(tiempoComida)}
                        />

                        <div className="flex flex-col md:flex-row gap-4 md:gap-30 justify-center md:justify-end items-center">
                            <button
                                onClick={() => handleSeleccionarTodos(pacientes)}
                                className="px-6 py-2 max-w-xs text-sm font-medium text-white hover:bg-blue-700 rounded-lg transition-colors duration-200 bg-blue-500"
                                title="Seleccionar todos los pacientes"
                            >
                                Seleccionar todos
                            </button>

                            <button
                                onClick={() => previsualizar()}
                                className="px-6 py-2 max-w-xs text-sm font-medium text-white hover:bg-blue-700 rounded-lg transition-colors duration-200 bg-blue-500"
                                title="Previsualizar solicitud"
                            >
                                Previsualizar solicitud
                            </button>
                        </div>
                    </>
                )
            ) : null}


            {showNuevoPaciente && (
                <NuevoPacForm
                    isOpen={showNuevoPaciente}
                    idTiempoComida={tiempoComida}
                    sala={sala}
                    fecha={deliveryDate}
                    onAgregarPaciente={agregarPaciente}
                    onClose={() => setShowNuevoPaciente(false)}
                />
            )}


            {modal && (
                <PreviewModal
                    setShowModal={setModal}
                    setShowSuccessModal={setShowSuccessModal}
                    setBusqueda={setBusqueda}
                    datos={datosPrevios}
                    setPacienteOmitidos={setPacienteOmitidos}
                />
            )}

            {showSuccessModal && (
                <div className="flex justify-center items-center mt-1">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 justify-center relative">
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
                            aria-label="Cerrar modal"
                            title="Cerrar modal"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <div className="text-center">
                            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Solicitud de dietas creada!</h2>
                            {pacienteOmitidos.length > 0 && (
                                <>
                                    <p className="text-gray-600 mb-6">
                                        Pacientes que ya tienen una dieta.
                                    </p>
                                    <div className="overflow-auto max-h-[50vh]">
                                        <table className="w-full">
                                            <thead className="bg-gray-100 sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expediente</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {pacienteOmitidos.map((paciente, index) => (
                                                    <tr key={paciente.expediente} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {paciente.expediente}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {paciente.nombre}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>

                    </div>
                </div>
            )}

        </MainLayout>
    );

}

export default DietasCreatePage;



