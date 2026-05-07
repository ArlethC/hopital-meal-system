/*
    Archivo: App.tsx
    Descripcion: Contiene las rutas de las pantallas del frontend.
    Autor: Marilyn Castro
    Fecha creacion: 30/06/2025
    Version: 1.0.1
*/
import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ProtectedRoute from "./components/ProtectedRoute";
import { NotificationProvider } from "./hooks/notificacionHook";

const HomePage = lazy(() => import("./pages/PaginaPrincipal"));
const AgeRangeForm = lazy(() => import("./pages/RangosEdad"));
const DietasManager = lazy(() => import("./pages/AgrupacionDietas"));
const AlergiasPage = lazy(() => import("./pages/AlergiasIntolerancias"));
const HorarioComidaPage = lazy(() => import("./pages/HorariosTiempoComida"));
const InicioSesion = lazy(() => import("./pages/InicioSesion"));
const RedirectToInicio = lazy(() => import("./pages/Redirigir"));
const DietasCreatePage = lazy(() => import("./pages/CrearSolicitudDieta"));
const DietasModifyPage = lazy(() => import("./pages/ModificarSolicitudDieta"));
const NutritionPage = lazy(() => import("./pages/Nutricion"));
const RecibidoPage = lazy(() => import("./pages/RecibirSolicitudDieta"));
const ReclamosPage = lazy(() => import("./pages/ReclamosSolicitud"));
const CocinaPage = lazy(() => import("./pages/CocinaSolicitudes"));
const ScreenTV = lazy(() => import("./pages/PantallaTv"));
const MeriendaTV = lazy(() => import("./pages/PantallaMeriendas"));
const VisualizarPage = lazy(() => import("./pages/VisualizarSolicitudes"));

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<div>Cargando...</div>}>
        <RedirectToInicio />
      </Suspense>
    ),
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<div>Cargando...</div>}>
        <InicioSesion />
      </Suspense>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <Suspense fallback={<div>Cargando...</div>}>
        <HomePage />
      </Suspense>
    ),
  },
  {
    path: "/confDietas/rangosEdad",
    element: (
      <Suspense fallback={<div>Cargando...</div>}>
        <ProtectedRoute requiredPermission="admin">
          <AgeRangeForm />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/confDietas/grupDietas",
    element: (
      <Suspense fallback={<div>Cargando...</div>}>
        <ProtectedRoute requiredPermission="admin">
          <DietasManager />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/confDietas/horariosComida",
    element: (
      <Suspense fallback={<div>Cargando...</div>}>
        <ProtectedRoute requiredPermission="admin">
          <HorarioComidaPage />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/alergias-intolerancias",
    element: (
      <Suspense fallback={<div>Cargando...</div>}>
        <ProtectedRoute requiredPermission="crear alergias">
          <AlergiasPage />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/solicitud/crear",
    element: (
      <Suspense fallback={<div>Cargando...</div>}>
        <ProtectedRoute requiredPermission={["crear solicitud", "admin", "solicitud extraordinaria"]}>
          <DietasCreatePage />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/solicitud/modificar",
    element: (
      <Suspense fallback={<div>Cargando...</div>}>
        <ProtectedRoute requiredPermission={["crear solicitud", "nutricion", "admin"]}>
          <DietasModifyPage />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/solicitud/recibir",
    element: (
      <Suspense fallback={<div>Cargando...</div>}>
        <ProtectedRoute requiredPermission={["crear solicitud"]}>
          <RecibidoPage />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/solicitud/reclamar",
    element: (
      <Suspense fallback={<div>Cargando...</div>}>
        <ProtectedRoute requiredPermission={["crear solicitud", "admin"]}>
          <ReclamosPage />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/nutricion",
    element: (
      <Suspense fallback={<div>Cargando...</div>}>
        <ProtectedRoute requiredPermission={["nutricion", "meriendas"]}>
          <NutritionPage />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/cocinaSol",
    element: (
      <Suspense fallback={<div>Cargando...</div>}>
        <ProtectedRoute requiredPermission={"cocina"}>
          <CocinaPage />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/pantallaTv",
    element: (
      <Suspense fallback={<div>Cargando...</div>}>
        <ProtectedRoute requiredPermission={"cocina"}>
          <ScreenTV />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/meriendaTv",
    element: (
      <Suspense fallback={<div>Cargando...</div>}>
        <ProtectedRoute requiredPermission={"cocina"}>
          <MeriendaTV />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/solicitud/visualizar",
    element:
      (
        <Suspense fallback={<div>Cargando...</div>}>
          <ProtectedRoute requiredPermission={"ver solicitudes"}>
            <VisualizarPage />
          </ProtectedRoute>
        </Suspense>
      ),
  },
]);

function App() {
  return (
    <NotificationProvider>
      <RouterProvider router={router} />
    </NotificationProvider>
  );
}


export default App
