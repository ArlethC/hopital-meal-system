/*
    Archivo: TablaDietas.tsx
    Descripcion: Componente para crear grupos de dietas, tiempo de comida y rango de edad.
    Autor: Marilyn Castro
    Fecha creacion: 15/08/2025
    Version: 1.0.2
*/
import { useEffect, useState } from "react";
import { crearDietaEdadTiempo, obtenerDietas } from "../services/dietasEdadTiempo";
import { type Dieta } from '../types/ui';
import { useNotifications } from '../hooks/notificacionHook';
import { X } from "react-feather";
import { type DropdownOption } from '../types/ui';
import Dropdown from './Dropdown';
import { useUnsavedChangesWarning } from "../hooks/advertenciaCambiosNoGuardados";
import Pagination from './Pagination';

interface Props {
  setShowForm: (show: boolean) => void;
  showForm: boolean;
  dataTiemposComida: DropdownOption[];
  dataRangos: DropdownOption[];
  onCreate: (tiempoComida: string, rangoEdad: string) => void;
}

const TablaDietas: React.FC<Props> = ({
  setShowForm,
  showForm,
  dataTiemposComida,
  dataRangos,
  onCreate,
}) => {
  const { notify } = useNotifications();

  const [dietas, setDietas] = useState<Dieta[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<{ [codigo: string]: boolean }>({});
  const [abreviaturas, setAbreviaturas] = useState<{ [codigo: string]: string }>({});
  const [pagina, setPagina] = useState(1);
  const [limite, setLimite] = useState(3);
  const [total, setTotal] = useState(0);
  const [totalPag, setTotalPag] = useState(0);
  const [filtro, setFiltro] = useState("");
  const [rangoEdad, setRangoEdad] = useState('');
  const [tiempoComida, setTiempoComida] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const fetchDietas = async (pag: number = 1) => {
    try {
      const response = await obtenerDietas(`?q=${filtro}&pag=${pag}&limit=${limite}`);
      setDietas(response.data);
      setPagina(pag);
      setTotal(response.total);
      setLimite(response.pageSize);
      setTotalPag(response.totalPages)
    } catch (error: any) {
      notify({
        type: 'error',
        content: error.response?.data?.error || 'Ocurrió un error al realizar la búsqueda',
        duration: 3000,
      });
    }

  };

  useEffect(() => {
    setHasUnsavedChanges(tiempoComida !== '' || rangoEdad !== '' || Object.keys(seleccionadas).length > 0 || Object.keys(abreviaturas).length > 0);
  }, [tiempoComida, rangoEdad, seleccionadas, abreviaturas]);

  useUnsavedChangesWarning(hasUnsavedChanges);

  useEffect(() => {
    fetchDietas(pagina);
  }, [pagina, filtro, limite]);

  useEffect(() => {
    setPagina(1);
  }, [filtro, limite]);


  const toggleSeleccion = (codigo: number) => {
    setSeleccionadas(prev => ({ ...prev, [codigo]: !prev[codigo] }));
  };

  const handleAbreviatura = (codigo: number, valor: string) => {
    setAbreviaturas(prev => ({ ...prev, [codigo]: valor }));
  };

  const handleGuardar = async () => {
    const dietasParaEnviar = Object.keys(seleccionadas)
      .filter(codigo => seleccionadas[codigo])
      .map(codigo => {
        const dieta: { codigo: number; abrevDieta?: string } = { codigo: Number(codigo) };

        if (abreviaturas[codigo]) {
          dieta.abrevDieta = abreviaturas[codigo];
        }

        return dieta;
      });

    if (dietasParaEnviar.length === 0) {
      notify({ type: 'warning', title: 'Datos  inválidos', content: 'Seleccione al menos una dieta.', duration: 3000 });
      return;
    }

    if (tiempoComida.trim() === '' || Number.isNaN(tiempoComida)) {
      notify({ type: 'warning', title: 'Datos  inválidos', content: 'Seleccione un tiempo de comida.', duration: 3000 });
      return;
    }

    if (rangoEdad.trim() === '' || Number.isNaN(rangoEdad)) {
      notify({ type: 'warning', title: 'Datos  inválidos', content: 'Seleccione un rango de edad.', duration: 3000 });
      return;
    }

    try {
      await crearDietaEdadTiempo({ idDietas: dietasParaEnviar, idTiempoComida: Number(tiempoComida), idRangoEdad: Number(rangoEdad) },);
      notify({
        type: 'success',
        title: 'Éxito',
        content: 'La agrupación se creo correctamente.',
        duration: 3000,
      });
      onCreate(tiempoComida, rangoEdad);
      handleCancel(true);
    } catch (error: any) {
      notify({
        type: 'error',
        content: error.response?.data?.error || 'Ocurrió un error al crear o modificar el grupo de edad, tiempo de comida y dieta.',
        duration: 3000,
      });
    }
  };

  const handleCancel = (forceClose = false) => {
    if (forceClose || !hasUnsavedChanges || window.confirm("¿Descartar los cambios?")) {
      setHasUnsavedChanges(false);
      setShowForm(false);
      setSeleccionadas({});
      setAbreviaturas({})
      setRangoEdad('');
      setTiempoComida('');
      setPagina(1);
      setTotal(0);
      setFiltro('');
    }
  };

  if (!showForm) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 overflow-y-auto">
      <div
        className={`bg-white w-full max-w-5xl rounded-lg shadow-lg p-2 sm:p-4 md:p-6 relative`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base sm:text-lg font-medium text-gray-800 text-center sm:text-left">Nueva relación dieta - tiempo comida - edad</h3>
          <button
            onClick={() => handleCancel()}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
            aria-label="Cerrar modal"
            title="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[70vh] space-y-4">
          <div className="flex-1 overflow-y-auto p-2 sm:p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-2">
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
            <div>
              <input
                type="text"
                placeholder="Buscar dieta..."
                value={filtro}
                onChange={e => {
                  setFiltro(e.target.value);
                  setPagina(1);
                }}
                className="mb-2 px-3 py-2 border rounded-md w-full text-sm sm:text-base"
              />

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm sm:text-base border-gray-200" aria-label="Listado de dietas">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">Seleccionar</th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">Nombre de dieta</th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">Abreviatura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dietas.map((d, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-3 py-2">
                          <input
                            type="checkbox"
                            checked={!!seleccionadas[d.codigo]}
                            onChange={() => toggleSeleccion(d.codigo)}
                          />
                        </td>
                        <td className="border border-gray-200 px-3 py-2">{d.nombre}</td>
                        <td className="border border-gray-200 px-3 py-2">
                          <input
                            type="text"
                            value={abreviaturas[d.codigo] || ""}
                            onChange={e => handleAbreviatura(d.codigo, e.target.value)}
                            disabled={!seleccionadas[d.codigo]}
                            className={`border rounded px-2 py-1 w-full text-sm sm:text-base ${!seleccionadas[d.codigo] ? "bg-gray-100" : ""
                              }`}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={pagina}
                totalPages={totalPag}
                onPageChange={fetchDietas}
                itemsPerPage={limite}
                totalItems={total}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => handleCancel()}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGuardar}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>

  );
};

export default TablaDietas;
