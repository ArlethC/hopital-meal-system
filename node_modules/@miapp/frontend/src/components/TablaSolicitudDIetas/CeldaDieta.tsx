/*
    Archivo: CeldaDieta.tsx
    Descripcion: Componente para renderizar las celda donde se escoge el tipo de dieta.
    Autor: Marilyn Castro
    Fecha creacion: 14/07/2025
    Version: 1.0.1
*/
import type { PacienteUi, PacienteModificar, PacienteFinalizado, Dieta, } from '../../types/ui';
import { obtenerDietasEdadTiempo } from '../../services/dietasEdadTiempo';
import { RefreshCw, } from 'react-feather';


interface PropsDietaCel {
    paciente: PacienteUi;
    esEditable: boolean;
    idTiempoComida?: number;
    onHandleCambiarValor: (id: string | number,
        campo: keyof PacienteUi | keyof PacienteModificar | keyof PacienteFinalizado,
        valor: any) => void;
    onObtenerValorCampo: (paciente: PacienteUi, campo: keyof PacienteUi) => any;
    getPacienteKey: (paciente: PacienteUi) => string | number;
    todasLasDietas: Dieta[] | null;
    setTodasLasDietas: React.Dispatch<React.SetStateAction<Dieta[] | null>>;
}

const DietaCell: React.FC<PropsDietaCel> = ({
    paciente,
    esEditable,
    idTiempoComida,
    onHandleCambiarValor,
    onObtenerValorCampo,
    getPacienteKey,
    todasLasDietas,
    setTodasLasDietas,
}) => {

    const handleTraerTodasLasDietas = async (pacienteId: string | number) => {
        if (!todasLasDietas) {
            const dietas = await obtenerDietasEdadTiempo(`?t=${idTiempoComida}&pag=1&limit=10000`);

            const grupos = Array.isArray(dietas?.data) ? dietas.data : [];

            const datos: Dieta[] = grupos.map(grupo => ({
                codigo: grupo.idDieta,
                nombre: grupo.dieta
            }));
            setTodasLasDietas(datos); 
            onHandleCambiarValor(pacienteId, 'dietasValidas', datos);
        } else {
            onHandleCambiarValor(pacienteId, 'dietasValidas', todasLasDietas);
        }
    };

    const esPacienteFinalizado = (
        paciente: PacienteUi
    ): paciente is PacienteFinalizado => {
        return paciente.estado === 'entrega' || paciente.estado === 'reclamo' || paciente.estado === 'cerrar';
    };

    if (esPacienteFinalizado(paciente)) {
        return <span className="text-sm">{paciente.dietaSeleccionada.nombre || 'Sin dieta'}</span>;
    }

    const dietaSeleccionada = onObtenerValorCampo(paciente, 'dietaSeleccionada' as keyof PacienteUi);
    const dietasValidas = onObtenerValorCampo(paciente, 'dietasValidas' as keyof PacienteUi) || paciente.dietasValidas || [];


    if (esEditable) {
        return (
            <div className="flex flex-wrap items-center gap-2 w-full max-w-full ">
                <select
                    aria-label="Seleccione una dieta"
                    value={dietaSeleccionada?.codigo || ''}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const nuevaDieta = dietasValidas.find((d: Dieta) => String(d.codigo) === e.target.value);
                        if (nuevaDieta) {
                            onHandleCambiarValor(getPacienteKey(paciente), 'dietaSeleccionada', nuevaDieta);
                        }
                    }}
                    className="flex-1 min-w-[100px] px-2 py-1 border rounded text-sm"
                >
                    <option value="">Seleccione una dieta</option>
                    {dietasValidas.map((dieta: Dieta) => (
                        <option key={dieta.codigo} value={dieta.codigo}>
                            {dieta.nombre}
                        </option>
                    ))}
                </select>
                <button
                    onClick={() => handleTraerTodasLasDietas(getPacienteKey(paciente))}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    title="Cargar todas las dietas"
                >
                    <RefreshCw size={16} />
                </button>
            </div>
        );
    }

    return (
        <span className="text-sm">
            {dietaSeleccionada?.nombre || ''}
        </span>
    );
};


export default DietaCell;