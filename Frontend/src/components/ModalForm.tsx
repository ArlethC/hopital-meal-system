/*
    Archivo: ModalForm.tsx
    Descripcion: componente de un modal con un formulario.
    Autor: Marilyn Castro
    Fecha creacion: 4/07/2025
    Version: 1.0.0
*/
import { X } from "react-feather";

interface ModalFormProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  saveText?: string;
  cancelText?: string;
  widthClass?: string;
}

export const ModalForm = ({
  title,
  children,
  isOpen,
  onClose,
  onSave,
  saveText = "Guardar",
  cancelText = "Cancelar",
  widthClass = "max-w-3xl"
}: ModalFormProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        className={`bg-white w-full ${widthClass} max-h-screen rounded-lg shadow-lg p-6 sm:p-8 relative`}
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
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            {saveText}
          </button>
        </div>
      </div>
    </div>
  );
};
