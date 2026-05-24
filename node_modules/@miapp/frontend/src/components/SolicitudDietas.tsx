/*
    Archivo: SolicitudDietas.tsx
    Descripcion: Componente para mostrar una solicitud de dietas.
    Autor: Marilyn Castro
    Fecha creacion: 15/07/2025
    Version: 1.0.0
*/

import { useState, useEffect, useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import type { OrdenDieta, } from '../types/solicitud';
import { obtenerDetalleSolicitud, obtenerDetSolicitud } from '../services/detallesSolicitud';
import { obtenerSolicitud } from '../services/solicitudDietas';
import { fechaATexto } from "../utils/formatear";
import type { PacienteUi } from "../types/ui";
import { useNotifications } from '../hooks/notificacionHook';
import type { TablaOrden } from '@miapp/shared';

import TablaOrdenesDieta from "../components/TablaSolicitudDIetas/TableSolicitud";

interface PropsOrdenDieta {
    ordenDieta: OrdenDieta;
    permisos: string[];
    idTiempoComida: number;
    estadoTabla: TablaOrden;
    onVolver?: () => void;
    habilitarAdvertenciaCambios?: boolean;
    onPacientesActualizados?: (pacientes: PacienteUi[]) => void;
    pacientes?: PacienteUi[],
    mapPaciente: (data: any) => PacienteUi;
    onEtiquetaPaciente?: (paciente: string) => void;
    cambiosTemporales?: Map<string | number, Partial<PacienteUi>>;
    setCambiosTemporales?: React.Dispatch<React.SetStateAction<Map<string | number, Partial<PacienteUi>>>>;
}


export interface DetalleOrdenDietaRef {
    actualizarOrden: () => Promise<void>;
}

const areArraysEqual = (a: PacienteUi[], b: PacienteUi[]) => {
    if (a.length !== b.length) return false;
    return a.every((item, index) => JSON.stringify(item) === JSON.stringify(b[index]));
};

const DetalleOrdenDieta = forwardRef<DetalleOrdenDietaRef, PropsOrdenDieta>(({
    ordenDieta,
    permisos,
    idTiempoComida,
    estadoTabla,
    onVolver,
    onPacientesActualizados,
    mapPaciente,
    pacientes,
    onEtiquetaPaciente,
    cambiosTemporales,
    setCambiosTemporales,
}, ref) => {
    const { notify } = useNotifications();
    const [ordenDietaLocal, setOrdenDietaLocal] = useState<OrdenDieta>(ordenDieta);
    const [detallesNuevos, setDetallesNuevos] = useState<PacienteUi[]>(() =>
        ordenDieta.detalles ? ordenDieta.detalles.map(mapPaciente) : []
    );
    const [edificio, setEdificio] = useState('');


    useEffect(() => {
        const cargarDetalles = async () => {
            try {
                let detallesData = ordenDieta.detalles;
                
                if (!detallesData || detallesData.length === 0) {
                    if (estadoTabla === 'modificar' && !(ordenDieta.tiempoComida.toLowerCase().includes("merienda"))) {
                        detallesData = await obtenerDetalleSolicitud(ordenDieta.id.toString());
                    } else {
                        detallesData = await obtenerDetSolicitud(ordenDieta.id.toString());
                    }
                }

                const detallesTransformados = detallesData.map(mapPaciente);
                setDetallesNuevos(detallesTransformados);

                if (detallesData.length > 0) {
                    setEdificio(detallesData[0].edificio);
                }
            } catch (error: any) {
                notify({
                    type: 'error',
                    content: error.response?.data?.error || 'Ocurrió un error al obtener los detalles de la solicitud.',
                    duration: 3000,
                });
            }
        };

        cargarDetalles();
    }, []);

    const detallesMemo = useMemo(() => detallesNuevos, [detallesNuevos]);

    const prevPacientesRef = useRef<string>("");

    useEffect(() => {
        if (!onPacientesActualizados) return;

        const current = JSON.stringify(detallesMemo);

        if (prevPacientesRef.current === current) return;

        prevPacientesRef.current = current;
        onPacientesActualizados(detallesMemo);
    }, [detallesMemo, onPacientesActualizados]);


    useEffect(() => {
        if (!pacientes || pacientes.length === 0) return;

        if (!areArraysEqual(pacientes, detallesMemo)) {
            setDetallesNuevos(pacientes);
        }
    }, [pacientes]);

    const yaActualizadoRef = useRef(false);

    useEffect(() => {
        if (estadoTabla !== 'modificar') return;

        const hayModificacion = detallesNuevos.some(p => p.modificado);

        if (hayModificacion && ordenDieta.estado !== 'Modificada y Enviada a Cocina' && !yaActualizadoRef.current) {
            yaActualizadoRef.current = true;
            actualizarOrden();
        }
    }, [detallesNuevos, estadoTabla, ordenDieta.estado]);

    const actualizarOrden = async () => {
        try {
            const ordenActualizada = await obtenerSolicitud(ordenDieta.id.toString());

            setOrdenDietaLocal(prev => ({
                ...ordenActualizada,
                detalles: ordenActualizada.detalles ?? prev.detalles
            }));

        } catch (error: any) {
            notify({
                type: 'error',
                content: error.response?.data?.error || 'No se pudo actualizar la información de la solicitud.',
                duration: 3000,
            });
        }
    };

    useImperativeHandle(ref, () => ({
        actualizarOrden
    }));

    return (
        <div className="bg-inherit rounded-lg shadow-sm border border-gray-200 p-3 mx-3 my-3">
            <div className="bg-white border rounded p-2">
                <div className="flex flex-col items-center relative pt-3">
                    {onVolver && (
                        <button
                            onClick={onVolver}
                            className="absolute left-0 top-0 text-sm text-blue-600 hover:underline"
                        >
                            ← Volver a la lista
                        </button>
                    )}
                    <h1 className="text-2xl font-bold text-gray-800 mt-0 mb-2">
                        {ordenDietaLocal.tiempoComida}
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm text-gray-600">
                    <div className="space-y-1">
                        <div className="flex items-center">
                            <span className="font-semibold text-gray-700 w-36">Sala:</span>
                            <span>{ordenDietaLocal.sala}</span>
                        </div>

                        <div className="flex items-center">
                            <span className="font-semibold text-gray-700 w-36">Fecha y hora de envío:</span>
                            <span>{fechaATexto(ordenDietaLocal.fechaCreacion)}</span>
                        </div>

                        <div className="flex items-center">
                            <span className="font-semibold text-gray-700 w-36">Solicitud generada por:</span>
                            <span>{ordenDietaLocal.usuario}</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center">
                            <span className="font-semibold text-gray-700 w-36">Estado:</span>
                            <span>{ordenDietaLocal.estado}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold text-gray-700 w-36">Fecha de entrega:</span>
                            <span>{fechaATexto(ordenDietaLocal.fechaEntrega)}</span>
                        </div>

                        <div className="flex items-center">
                            <span className="font-semibold text-gray-700 w-36">Edificio:</span>
                            <span>{edificio}</span>
                        </div>
                    </div>
                </div>
            </div>

            <TablaOrdenesDieta
                estado={estadoTabla}
                pacientes={detallesNuevos}
                permisoUsuario={permisos}
                setPacientes={setDetallesNuevos}
                idTiempoComida={idTiempoComida}
                setCambiosTemporales={setCambiosTemporales}
                cambiosTemporales={cambiosTemporales}
                onImprimirEtiqueta={onEtiquetaPaciente}
            />
        </div>
    );
});

export default DetalleOrdenDieta;


