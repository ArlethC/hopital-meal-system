/*
    Archivo: Redirigir.tsx
    Descripcion: Pantalla para redirigir al login o al dashboard.
    Autor: Marilyn Castro
    Fecha creacion: 8/07/2025
    Version: 1.0.0
*/
import { Navigate } from 'react-router-dom';
import { useAuth } from "../hooks/Auth";

const RedirectToInicio = () => {
  const { esEmbebido, usuario, cargando, permisos } = useAuth();

  if (usuario && permisos) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!esEmbebido) {
    return <Navigate to="/login" replace />;
  }

  if (cargando) {
    return <div>Cargando...</div>;
  }

  if (esEmbebido && !usuario && !cargando) {
    alert("No autenticado en modo embebido. Acceso denegado.")
    return <Navigate to="/login" replace />;
  }

  return null;
};

export default RedirectToInicio;
