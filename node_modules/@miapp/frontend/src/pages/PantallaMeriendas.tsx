/*
    Archivo: PantallaMeriendas.tsx
    Descripcion: Pantalla que muestra el resumen de la pantalla de meriendas.
    Autor: Marilyn Castro
    Fecha creacion: 12/08/2025
    Version: 1.0.1
*/
import { Bell } from 'react-feather';
import { useState, useEffect, useMemo } from 'react';
import { obtenerResumenMerienda, type ResumenResponse } from '../services/cocina';
import { formatearNombre } from '../utils/formatear';

function getTextSizeClass(totalItems: number) {
    if (totalItems > 30) return "text-xs";
    if (totalItems > 20) return "text-sm";
    if (totalItems > 10) return "text-base";
    return "text-lg";
}

const MeriendaTV = () => {
    const [alerta, setAlerta] = useState<string | null>(null);
    const [data, setData] = useState<ResumenResponse | null>(null);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const totalDietas = data?.totalDietas?.length || 0;
    const totalAlergias = data?.alergias?.length || 0;

    const dietasTextSize = useMemo(() => getTextSizeClass(totalDietas), [totalDietas]);
    const alergiasTextSize = useMemo(() => getTextSizeClass(totalAlergias), [totalAlergias]);

    const actualizarDatos = async () => {
        try {
            const resumen = await obtenerResumenMerienda();
            setData(resumen);
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Error al obtener resumen:', error);
            }
            console.error('Error al obtener resumen');
            setAlerta('Error al actualizar datos de cocina');

            const alertaTimeout = setTimeout(() => {
                setAlerta(null);
            }, 10000);
            return () => clearInterval(alertaTimeout);
        }
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        actualizarDatos();

        const interval = setInterval(actualizarDatos, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!data?.alertasFormateadas || data.alertasFormateadas.length === 0) return;

        let indiceActual = 0;

        setAlerta(data.alertasFormateadas[indiceActual]);
        indiceActual++;

        const alertaInterval = setInterval(() => {
            if (indiceActual < data.alertasFormateadas.length) {
                setAlerta(data.alertasFormateadas[indiceActual]);
                indiceActual++;
            } else {
                clearInterval(alertaInterval);
            }
        }, 7000);

        const ultimoTimeout = setTimeout(() => setAlerta(null), data.alertasFormateadas.length * 7000);

        return () => {
            clearInterval(alertaInterval);
            clearTimeout(ultimoTimeout);
        };
    }, [data?.alertasFormateadas]);

    const formatDateTime = (date: Date) => {
        const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const meses = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];

        const diaSemana = diasSemana[date.getDay()];
        const numeroDia = date.getDate();
        const mes = meses[date.getMonth()];
        const año = date.getFullYear();
        const horas = date.getHours().toString().padStart(2, '0');
        const minutos = date.getMinutes().toString().padStart(2, '0');

        return `${diaSemana}, ${numeroDia} de ${mes} de ${año} ${horas}:${minutos}`;
    };

    useEffect(() => {
        if (!alerta) return;

        const sonido = new Audio("/sounds/alert.mp3");
        sonido.play();
    }, [alerta]);

    return (
        <div className="min-h-screen bg-gray-700 text-white px-8 py-4 overflow-hidden">
            <div className="flex items-center mb-2">
                <div className="w-1/3">
                    <h1 className="text-xl text-white mb-4">
                        {formatDateTime(currentDateTime)}
                    </h1>
                </div>
                {data?.tiempComida && (
                    <div className="w-1/3 text-center text-5xl font-bold">
                        {data.tiempComida}
                    </div>
                )}
                <div className="w-1/3">
                    <div className="flex mb-4 items-center justify-center  text-lg">
                        <Bell className="w-6 h-6 mr-3 text-orange-400" />
                        <span>Reclamos</span>
                    </div>
                    <div className="grid grid-cols-3 gap-x-6 gap-y-3 text-base">
                        {[
                            { label: "Desayuno", valor: "Desayuno" },
                            { label: "Cena", valor: "Cena" },
                            { label: "Almuerzo", valor: "Almuerzo" },
                            { label: "Merienda AM", valor: "Merienda am" },
                            { label: "Merienda PM", valor: "Merienda pm" },
                        ].map((item) => (
                            <div key={item.valor} className="flex justify-between gap-x-2">
                                <span>{item.label}</span>
                                <span className="font-bold">
                                    {data?.reclamos
                                        ? data.reclamos
                                            .filter((r) => r.valor === item.valor)
                                            .reduce((acc, r) => acc + (r.totalReclamo || 0), 0)
                                        : 0}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-x-8 h-[calc(100%-6rem)] overflow-hidden">
                {/* Columna izquierda - Dietas */}
                <div className="col-span-4 flex flex-col">
                    <h2 className={`mb-2 font-semibold text-center ${dietasTextSize}`}>
                        Dietas
                    </h2>
                    <div className={`flex-1 space-y-2 ${dietasTextSize}`}>
                        {data?.totalDietas?.map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <span className="font-semibold break-words whitespace-normal">{item.dieta}</span>
                                <span className="font-bold">{item.totalDietas}</span>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Columna Alergias/Intolerancias */}
                <div className="col-span-7 flex flex-col">
                    <h2 className={`mb-2 font-semibold text-center ${alergiasTextSize}`}>
                        Observaciones
                    </h2>
                    <div className={`flex-1 space-y-2 ${alergiasTextSize}`}>
                        {data?.alergias?.map((alergia, index) => (
                            <div key={index} className="flex justify-between">
                                <span className="font-semibold">{formatearNombre(alergia.paciente)}</span>
                                <span className="text-gray-300 break-words whitespace-normal">{alergia.observacion}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {alerta && (
                <div className="absolute top-4 right-4 bg-red-700 bg-opacity-80 text-white text-3xl font-semibold
      px-8 py-4 rounded shadow-lg z-50 flex items-center space-x-4">
                    <Bell className="w-8 h-8 text-amber-100" />
                    <span>{alerta}</span>
                </div>
            )}
        </div>
    );
};

export default MeriendaTV;