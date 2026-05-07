/*
    Archivo: ConfirmModal.tsx
    Descripcion: componente de modal para confirmar acciones criticas.
    Autor: Marilyn Castro
    Fecha creacion: 16/07/2025
    Version: 1.0.1
*/
import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmColor?: 'red' | 'green' | 'blue';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = 'Confirmar',
  message,
  onConfirm,
  onCancel,
  confirmColor = 'red',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
}) => {
  if (!isOpen) return null;

  const colorMap: Record<string, string> = {
    red: 'bg-red-500 hover:bg-red-600',
    green: 'bg-green-500 hover:bg-green-600',
    blue: 'bg-blue-500 hover:bg-blue-600',
  };

  return (
    <div className="fixed inset-0 bg-black/40  flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm mx-4">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-500 rounded-lg text-white">
            {cancelText}
          </button>
          <button onClick={onConfirm}  className={`px-4 py-2 text-white rounded-lg ${colorMap[confirmColor]}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
