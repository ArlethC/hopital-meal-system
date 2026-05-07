/*
    Archivo: PaginaPrincipal.tsx
    Descripcion: La pantalla principal del módulo utiliza la barra superior y el Dashboard.
    Autor: Marilyn Castro
    Fecha creacion: 2/07/2025
    Version: 1.0.1
*/

import MainLayout from "../layouts/LayoutPrincipal";
import Dashboard from "../components/Dashboard";

const HomePage = () => {
  return (
    <MainLayout>
      <Dashboard />
    </MainLayout>
  );
};

export default HomePage;
