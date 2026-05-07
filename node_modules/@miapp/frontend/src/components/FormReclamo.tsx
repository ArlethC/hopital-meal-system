/*
    Archivo: FormReclamo.tsx
    Descripcion: componente para crear, marcar como resuelto y modificar reclamos.
    Autor: Marilyn Castro
    Fecha creacion: 24/07/2025
    Version: 2.0.0
*/
import { X } from "react-feather";

interface FormReclamoProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  saveText?: string;
  cancelText?: string;
  widthClass?: string;
  modo: 'crear' | 'verConAcciones' | 'editar' | 'soloVer';
  onEditar?: () => void;
  onMarcarSolucionado?: () => void;
  isSaving?: boolean;
}

export const FormReclamo = ({
  title,
  children,
  isOpen,
  onClose,
  onSave,
  saveText = "Guardar",
  cancelText = "Cancelar",
  widthClass = "max-w-3xl",
  modo,
  onEditar,
  onMarcarSolucionado,
  isSaving,
}: FormReclamoProps) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 overflow-y-auto">
      <div
        className={`bg-white w-full ${widthClass} rounded-lg shadow-lg p-6 sm:p-8 relative`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
            aria-label="Cerrar modal"
            title="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">{children}</div>

        <div className="flex justify-end space-x-3 mt-6">
          {modo === 'crear' || modo === 'editar' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                className={`px-6 py-2 text-white rounded-md transition-colors ${isSaving ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
              >
                {isSaving ? 'Guardando...' : saveText}
              </button>
            </>
          ) : null}

          {modo === 'verConAcciones' ? (
            <>
              <button
                type="button"
                onClick={onEditar}
                className="px-6 py-2 bg-emerald-300 hover:bg-emerald-400 text-black rounded-md transition-colors"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={onMarcarSolucionado}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
              >
                Marcar como solucionado
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
