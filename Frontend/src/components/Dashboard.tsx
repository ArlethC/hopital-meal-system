/*
    Archivo: Dashboard.tsx
    Descripcion: contiene el componente de la pantalla incial del módulo.
    Autor: Marilyn Castro
    Fecha creacion: 2/07/2025
    Version: 1.0.1
*/

import { useAuth } from "../hooks/Auth";
import { useNavigate } from "react-router-dom";


const Dashboard = () => {

  const navigate = useNavigate();
  const { usuario, tienePermiso } = useAuth();


  if (!usuario) return null;

  return (
    <div className="flex flex-col gap-4 items-center">

      {(tienePermiso("crear solicitud") || tienePermiso("nutricion") || tienePermiso("admin") || tienePermiso("solicitud extraordinaria")) && (
        <section className="bg-white p-4 rounded shadow flex flex-col gap-4  w-full max-w-md
                    sm:max-w-lg
                    md:max-w-xl
                    lg:max-w-2xl
                    xl:max-w-3xl">
          <h2 className="text-2xl font-bold text-blue-600 border-b border-blue-200 pb-2 text-center">
            Solicitud de dietas
          </h2>
          <div className="flex flex-col gap-4 items-center">
            {(tienePermiso("crear solicitud") || tienePermiso("admin") || tienePermiso("solicitud extraordinaria") ) && (
              <button
                onClick={() => navigate("/solicitud/crear")}
                className="px-6 py-2 max-w-xs w-full text-sm font-medium text-white hover:bg-blue-600 rounded-lg transition-colors duration-200 bg-blue-500"
              >
                {"Crear solicitud"}
              </button>
            )}
            {(tienePermiso("nutricion") || tienePermiso("crear solicitud") || tienePermiso("admin")) && (
              <button
                onClick={() => navigate("/solicitud/modificar")}
                className="px-6 py-2 max-w-xs w-full text-sm font-medium text-white hover:bg-slate-700 rounded-lg transition-colors duration-200 bg-slate-600"
              >
                {"Modificar solicitud"}
              </button>
            )}
            {tienePermiso("crear solicitud") && (
              <button
                onClick={() => navigate("/solicitud/recibir")}
                className="px-6 py-2 max-w-xs w-full text-sm font-medium text-white hover:bg-blue-600 rounded-lg transition-colors duration-200 bg-blue-500"
              >
                {"Recibir la solicitud"}
              </button>
            )}
            {(tienePermiso("crear solicitud") || tienePermiso("admin"))  && (
              <button
                onClick={() => navigate("/solicitud/reclamar")}
                className="px-6 py-2 max-w-xs w-full text-sm font-medium text-white hover:bg-slate-700 rounded-lg transition-colors duration-200 bg-slate-600"
              >
                {"Reclamos de la solicitud"}
              </button>
            )}
          </div>
        </section>
      )}


      {tienePermiso("nutricion") && tienePermiso('meriendas') && (
        <section className="bg-white p-4 rounded shadow flex flex-col gap-4  w-full max-w-md
                    sm:max-w-lg
                    md:max-w-xl
                    lg:max-w-2xl
                    xl:max-w-3xl">
          <h2 className="text-2xl font-bold text-blue-600 border-b border-blue-200 pb-2 text-center">
            Nutrición
          </h2>
          <div className="flex flex-col gap-4 items-center">
            <button
              onClick={() => navigate("/nutricion")}
              className="px-6 py-2 max-w-xs w-full text-sm font-medium text-white hover:bg-blue-600 rounded-lg transition-colors duration-200 bg-blue-500"
            >
              {"Área de Nutrición"}
            </button>
          </div>
        </section>
      )}

      {tienePermiso("cocina") && (
        <section className="bg-white p-4 rounded shadow flex flex-col gap-4  w-full max-w-md
                    sm:max-w-lg
                    md:max-w-xl
                    lg:max-w-2xl
                    xl:max-w-3xl">
          <h2 className="text-2xl font-bold text-blue-600 border-b border-blue-200 pb-2 text-center">
            Cocina
          </h2>
          <div className="flex flex-col gap-4 items-center">
            <button
              onClick={() => navigate("/cocinaSol")}
              className="px-6 py-2 max-w-xs w-full text-sm font-medium text-white hover:bg-blue-600 rounded-lg transition-colors duration-200 bg-blue-500"
            >
              {"Solicitud de dietas"}
            </button>
            <button
              onClick={() => navigate("/pantallaTv")}
              className="px-6 py-2 max-w-xs w-full text-sm font-medium text-white hover:bg-slate-700 rounded-lg transition-colors duration-200 bg-slate-600"
            >
              {"Pantalla TV"}
            </button>
            <button
              onClick={() => navigate("/meriendaTv")}
              className="px-6 py-2 max-w-xs w-full text-sm font-medium text-white hover:bg-blue-600 rounded-lg transition-colors duration-200 bg-blue-500"
            >
              {"Pantalla meriendas"}
            </button>
          </div>
        </section>
      )}

      {tienePermiso("ver solicitudes") && (
        <section className="bg-white p-4 rounded shadow flex flex-col gap-4  w-full max-w-md
                    sm:max-w-lg
                    md:max-w-xl
                    lg:max-w-2xl
                    xl:max-w-3xl">
          <h2 className="text-2xl font-bold text-blue-600 border-b border-blue-200 pb-2 text-center">
            Historial de Solicitudes de Dietas
          </h2>
          <div className="flex flex-col gap-4 items-center">
            <button
              onClick={() => navigate("/solicitud/visualizar")}
              className="px-6 py-2 max-w-xs w-full text-sm font-medium text-white hover:bg-blue-600 rounded-lg transition-colors duration-200 bg-blue-500"
            >
              {"Visualizar Solicitudes de dietas"}
            </button>
          </div>
        </section>
      )}

      {tienePermiso("crear alergias") && (
        <section className="bg-white p-4 rounded shadow flex flex-col gap-4  w-full max-w-md
                    sm:max-w-lg
                    md:max-w-xl
                    lg:max-w-2xl
                    xl:max-w-3xl">
          <h2 className="text-2xl font-bold text-blue-600 border-b border-blue-200 pb-2 text-center">
            Alergias/intolerancias
          </h2>
          <div className="flex flex-col gap-4 items-center">
            <button
              onClick={() => navigate("/alergias-intolerancias")}
              className="px-6 py-2 max-w-xs w-full text-sm font-medium text-white hover:bg-blue-600 rounded-lg transition-colors duration-200 bg-blue-500"
            >
              {"Crear alergias e intolerancias"}
            </button>
          </div>
        </section>
      )}

      {tienePermiso("admin") && (
        <section className="bg-white p-4 rounded shadow flex flex-col gap-4  w-full max-w-md
                    sm:max-w-lg
                    md:max-w-xl
                    lg:max-w-2xl
                    xl:max-w-3xl">
          <h2 className="text-2xl font-bold text-blue-600 border-b border-blue-200 pb-2 text-center">
            Configuración de dietas
          </h2>
          <div className="flex flex-col gap-4 items-center">
            <button
              onClick={() => navigate("/confDietas/rangosEdad")}
              className="px-6 py-2 max-w-xs w-full text-sm font-medium text-white hover:bg-blue-600 rounded-lg transition-colors duration-200 bg-blue-500"
            >
              {"Rangos de edad"}
            </button>
            <button
              onClick={() => navigate("/confDietas/grupDietas")}
              className="px-6 py-2 max-w-xs w-full text-sm font-medium text-white hover:bg-slate-700 rounded-lg transition-colors duration-200 bg-slate-600"
            >
              {"Configuración de dieta por edad y tiempo de comida"}
            </button>
            <button
              onClick={() => navigate("/confDietas/horariosComida")}
              className="px-6 py-2 max-w-xs w-full text-sm font-medium text-white hover:bg-blue-600 rounded-lg transition-colors duration-200 bg-blue-500"
            >
              {"Configurar horarios"}
            </button>
          </div>
        </section>
      )}

    </div>
  );
};

export default Dashboard;

