/*
    Archivo: TablaEncabezado.tsx
    Descripcion: contiene el encabezado de la tabla de detalles de solicitud de dietas.
    Autor: Marilyn Castro
    Fecha creacion: 11/05/2026
    Version: 1.0.0
*/
import React from 'react';

interface PropsEncabezado {
    estado: string;
    permisoUsuario: string[];
    puedeVerColumna: (columna: string, permisoUsuario: string[], estado: string) => boolean | undefined
}

const TablaEncabezado: React.FC<PropsEncabezado> = ({ estado, permisoUsuario, puedeVerColumna }) => {
    return (
        <thead className="bg-gray-50">
            <tr>
                {estado === 'crear' && (
                    <th className="w-[40px] px-2 py-3 text-left text-xs font-medium text-gray-500 tracking-wider border-b">
                        Seleccionar
                    </th>
                )}
                {estado === 'modificar' && (
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 tracking-wider border-b">
                        Acciones
                    </th>
                )}
                {(estado !== 'modificar' && estado !== 'crear') && (
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 tracking-wider border-b">
                        &nbsp;
                    </th>
                )}
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 tracking-wider border-b">Cama</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 tracking-wider border-b">Paciente</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 tracking-wider border-b">Edad</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 tracking-wider border-b">Tipo Dieta</th>

                {puedeVerColumna('observaciones', permisoUsuario, estado) && (
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 tracking-wider border-b">
                        Observaciones Nutricionales
                    </th>
                )}
                {puedeVerColumna('obsEnfermeria', permisoUsuario, estado) && (
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 tracking-wider border-b">
                        Observación enfermería
                    </th>
                )}
                {puedeVerColumna('obsNutricion', permisoUsuario, estado) && (
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 tracking-wider border-b">
                        Observación nutrición
                    </th>
                )}
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 tracking-wider border-b">
                    Alergia e Intolerancias
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 tracking-wider border-b">
                    Documentos nutrición
                </th>
                {puedeVerColumna('obsCocina', permisoUsuario, estado) && (
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 tracking-wider border-b">
                        Comentario Cocina
                    </th>
                )}
                {puedeVerColumna('recibido', permisoUsuario, estado) && (
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 tracking-wider border-b">
                        Recibido
                    </th>
                )}
                {puedeVerColumna('reclamo', permisoUsuario, estado) && (
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 tracking-wider border-b">
                        Reclamo
                    </th>
                )}
                {puedeVerColumna('imprimir', permisoUsuario, estado) && (
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 tracking-wider border-b">
                        Etiqueta
                    </th>
                )}
            </tr>
        </thead>
    );
};

export default TablaEncabezado;