/*
    Archivo: celdaObservacion.tsx
    Descripcion: componente para renderizar las celdas de observación de la tabla de detalles de solicitud.
    Autor: Marilyn Castro
    Fecha creacion: 10/08/2025
    Version: 1.0.0
*/
import React from "react";
import type { PacienteUi, PacienteObservaciones } from "../../types/ui";

interface Props {
    paciente: PacienteUi;
    campo: keyof PacienteObservaciones;
    esEditable: boolean;
    onChange: (valor: any) => void;
    onObtenerValorCampo: (paciente: PacienteUi, campo: keyof PacienteUi) => any;
}

const CeldaObservacion: React.FC<Props> = ({
    paciente,
    campo,
    esEditable, 
    onChange, 
    onObtenerValorCampo 
}) => {
    const valor = onObtenerValorCampo(paciente, campo) || '';
    
    if (esEditable) {
        return (
            <textarea
                value={valor || ''}
                onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = 'auto';
                    el.style.height = `${el.scrollHeight}px`;
                }}
                onChange={(e) => onChange(e.target.value)}
                onFocus={(e) => {
                    const el = e.currentTarget;
                    el.style.height = 'auto';
                    el.style.height = `${el.scrollHeight}px`;
                }}
                className="w-full px-2 py-1 border rounded text-sm"
                placeholder="Observaciones..."
                maxLength={500}
                rows={1}
            />
        );
    }

    return <span className="text-sm">{valor}</span>;
};

export default CeldaObservacion;