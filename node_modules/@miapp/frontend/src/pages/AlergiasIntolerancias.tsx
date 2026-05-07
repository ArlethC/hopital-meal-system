/*
    Archivo: AlergiasIntolerancias.tsx
    Descripcion: Pantalla para gestionar las alergias e intolerancias.
    Autor: Marilyn Castro
    Fecha creacion: 7/07/2025
    Version: 1.0.0
*/

import MainLayout from "../layouts/LayoutPrincipal";
import SearchBar from "../components/SearchBar";
import { fetchPacientes } from "../utils/fecthDatos";
import { useState } from 'react';
import { type SearchItem } from '../components/SearchBar';
import PatientInfoScreen from '../components/ListAlergiaIntolerancia';
import { useNotifications } from '../hooks/notificacionHook';
import AlergiaAgregarButton from '../components/AgregarAlergiaButton';
import AlergiaModal from '../components/FormAlergias';
import ConfirmDialog from "../components/ConfimModal";
import type { AlergiaIntolerancia, AlergiasIntoleranciasPaciente } from '@miapp/shared';
import { obtenerAlergiasIntolerancias, desactivarAlergiaIntolerancia } from "../services/alergiaIntolerancia";

const AlergiasPage = () => {
  const { notify } = useNotifications();

  const [paciente, setPaciente] = useState<SearchItem | null>(null);
  const [infoPaciente, setInfoPaciente] = useState<AlergiasIntoleranciasPaciente | null>(null);
  const [alergiaSeleccionada, setAlergiaSeleccionada] = useState<AlergiaIntolerancia | null>(null);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [idPendiente, setIdPendiente] = useState<number | null>(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);


  const obtenerInfoPaciente = async (expediente: string) => {
    try {
      const info = await obtenerAlergiasIntolerancias(expediente);
      setInfoPaciente(info);
    } catch (error: any) {
      notify({
        type: 'error',
        content: error.response?.data?.error || 'Ocurrió un error al obtener las alergias del paciente ',
        duration: 3000,
      });
    }
  }

  const resetPaciente = () => {
    setPaciente(null);
    setInfoPaciente(null);
    setAlergiaSeleccionada(null);
    setShowModalEditar(false);
    setIdPendiente(null);
    setMostrarConfirmacion(false);
  };

  const editarAlergiaIntolerancia = async (alergia: AlergiaIntolerancia) => {
    setAlergiaSeleccionada(alergia);
    setShowModalEditar(true);
  }

  const solicitarEliminacion = (alergia: AlergiaIntolerancia) => {
    setIdPendiente(alergia.id);
    setMostrarConfirmacion(true);
  };

  const handleDelete = async () => {
    if (idPendiente === null) return;
    try {
      await desactivarAlergiaIntolerancia(idPendiente.toString())

      if (paciente) {
        await obtenerInfoPaciente(paciente?.id);
      }
    } catch (error: any) {
      notify({
        type: 'error',
        content: error.response?.data?.error || 'Ocurrió un error al desactivar la alergia/intolerancia',
        duration: 3000,
      });
    } finally {
      setIdPendiente(null);
      setMostrarConfirmacion(false);
    }
  };

  const obtenerInfo = async () => {
    if (paciente) {
      const response = await obtenerAlergiasIntolerancias(paciente.id)
      setInfoPaciente(response);
    }
  }

  return (
    <MainLayout>
      <h2 className="text-2xl font-semibold text-gray-800 text-center p-4">
        Alergias e Intolerancias
      </h2>
      <SearchBar
        liveSearch={{
          fetchResults: fetchPacientes,
          onSelect: (item) => {
            setPaciente(item)
            obtenerInfoPaciente(item.id)
          },
        }}
        onLiveSearchQueryChange={(q) => {
          if (q === '') resetPaciente();
        }}
        searchPlaceholder="Buscar expediente o nombre del paciente..."
        searchButtonText="Buscar"
        showButtonSearch={false}
      />
      {paciente && infoPaciente && (
        <div className="mt-4">
          <PatientInfoScreen
            patientData={infoPaciente}
            onEdit={editarAlergiaIntolerancia}
            onDelete={solicitarEliminacion}
          />
          <AlergiaAgregarButton
            expediente={infoPaciente.expediente}
            nombre={infoPaciente.nombre}
            onSuccess={obtenerInfo}
          />
        </div>
      )}
      {showModalEditar && infoPaciente && alergiaSeleccionada && (
        <AlergiaModal
          expediente={infoPaciente.expediente}
          paciente={infoPaciente.nombre}
          id={alergiaSeleccionada.id}
          alergia={alergiaSeleccionada.alergiasIntolerancias}
          onClose={(debeActualizar) => {
            setShowModalEditar(false);
            if (debeActualizar) {
              obtenerInfo();
            }
          }}
          showForm={showModalEditar}
        />
      )}

      <ConfirmDialog
        isOpen={mostrarConfirmacion}
        title="Confirmar desactivación"
        message="¿Estás seguro de que quieres desactivar esta alergia/intolerancia?"
        onConfirm={handleDelete}
        onCancel={() => { setIdPendiente(null); setMostrarConfirmacion(false); }}
      />
    </MainLayout>
  );
};

export default AlergiasPage;
