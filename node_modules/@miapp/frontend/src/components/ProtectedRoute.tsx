/*
    Archivo: ProtectedRoute.tsx
    Descripcion: componente para validar los permisos del usuario para acceder a las pantallas.
    Autor: Marilyn Castro
    Fecha creacion: 8/07/2025
    Version: 1.0.0
*/

import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from '../hooks/notificacionHook';

import { useAuth } from "../hooks/Auth";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredPermission: string | string[];
}

const ProtectedRoute = ({
    children,
    requiredPermission,
}: ProtectedRouteProps) => {
    const { notify } = useNotifications();

    const { tienePermiso, cargando, isLoggingOut } = useAuth();
    const navigate = useNavigate();

    const userHasAccess = Array.isArray(requiredPermission)
        ? requiredPermission.some(p => tienePermiso(p))
        : tienePermiso(requiredPermission);


    useEffect(() => {
        if (!cargando && !isLoggingOut && !userHasAccess) {
            notify({
                type: 'warning',
                content: "No tiene permisos para acceder a esta pantalla.",
                duration: 3000,
            });
            navigate("/dashboard");
        }
    }, [cargando, userHasAccess, isLoggingOut, navigate]);


    if (cargando) {
        return <div>Cargando...</div>;
    }

    return <>{children}</>;;
};

export default ProtectedRoute;
