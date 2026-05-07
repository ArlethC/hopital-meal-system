/*
    Archivo: AgregarAlergiaButton.tsx
    Descripcion: componente para mostrar el formulario para agregar una nueva alergia e intolerancia.
    Autor: Marilyn Castro
    Fecha creacion: 17/07/2025
    Version: 1.0.0
*/

import { Plus } from 'react-feather';
import React, { useState } from 'react';
import AlergiaModal from './FormAlergias';

interface Props {
    expediente: string;
    nombre: string;
    onSuccess?: () => void;
    compact?: boolean;
}

const AlergiaAgregarButton: React.FC<Props> = ({ expediente, onSuccess, nombre, compact = false }) => {
    const [showModal, setShowModal] = useState(false);

    const handleAgregar = () => {
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
    };

    return (
        <>
            <div className="flex justify-center mt-3">
                <button
                    onClick={handleAgregar}
                    className={`flex items-center transition-colors
            ${compact
                            ? "bg-transparent text-blue-500 p-0 hover:text-blue-600"
                            : "bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"}
        `}
                    title="Agregar alergia o intolerancia"
                >
                    {compact ? (
                        <>
                            <Plus size={16} />
                            <span className="text-sm">Agregar</span>
                        </>
                    ) : (
                        <>
                            <Plus className="w-5 h-5" />
                            <span className="ml-2">Agregar alergia o intolerancia</span>
                        </>
                    )}
                </button>
            </div>

            {showModal && (
                <AlergiaModal
                    expediente={expediente}
                    paciente={nombre}
                    showForm={showModal}
                    onClose={handleClose}
                    onSaved={(isNew) => {
                        if (isNew && onSuccess) {
                            onSuccess();
                        }
                    }}
                />
            )}
        </>
    );
};

export default AlergiaAgregarButton;
