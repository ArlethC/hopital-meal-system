/*
    Archivo: ContenedorReclamo.tsx
    Descripcion: componente que contiene el formulario para gestionar reclamos.
    Autor: Marilyn Castro
    Fecha creacion: 24/07/2025
    Version: 2.0.0
*/
import { useState, useEffect } from "react";
import { FormReclamo } from "./FormReclamo";
import Dropdown from './Dropdown';
import { useNotifications } from '../hooks/notificacionHook';
import { validarCamposGenerico } from "../utils/validaciones";
import { useUnsavedChangesWarning } from "../hooks/advertenciaCambiosNoGuardados";
import type { PacienteUi } from '../types/ui';
import { formatearNombre } from "../utils/formatear";
import { estadoReclamo, modificarReclamo, crearReclamo, obtenerReclamo, obtenerTiposReclamo } from "../services/reclamos";
import type { Reclamo, TipoReclamo, ModificarReclamoSchemaDTO } from "@miapp/shared";

type Modo = 'crear' | 'verConAcciones' | 'editar' | 'soloVer';

interface FormularioReclamoContainerProps {
  isOpen: boolean;
  onClose: () => void;
  id: number;
  reclamo: boolean;
  forzarSoloVer?: boolean;
  paciente: PacienteUi;
  onReclamoCreado?: () => void;
}

export function FormularioReclamoContainer({
  isOpen,
  onClose,
  id,
  reclamo,
  forzarSoloVer,
  paciente,
  onReclamoCreado,
}: FormularioReclamoContainerProps) {
  const { notify } = useNotifications();

  const [modo, setModo] = useState<Modo>(reclamo ? 'verConAcciones' : 'crear');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [reclamoOriginal, setReclamoOriginal] = useState<Reclamo | null>(null);
  const [observacion, setObservacion] = useState('');
  const [tipoReclamo, setTipoReclamo] = useState<TipoReclamo | null>(null);
  const [tiposReclamo, setTiposReclamo] = useState<TipoReclamo[] | []>([]);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);

  useUnsavedChangesWarning(hasUnsavedChanges);

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmar = window.confirm('Tienes cambios sin guardar. ¿Deseas salir de todos modos?');
      if (!confirmar) return;
    }

    onClose();
  };


  useEffect(() => {
    if (modo === 'crear') {
      const huboCambios = tipoReclamo !== null || observacion.trim() !== '' || archivo !== null;
      setHasUnsavedChanges(huboCambios);
    } else if (reclamoOriginal && modo === 'editar') {
      const cambios =
        tipoReclamo?.id.toString() !== reclamoOriginal.tipoReclamo.id.toString() ||
        (observacion || '') !== (reclamoOriginal.observacion || '') || archivo !== null;;
      setHasUnsavedChanges(cambios);
    }
  }, [observacion, tipoReclamo, modo, reclamoOriginal, hasUnsavedChanges, archivo]);

  useEffect(() => {
    if (reclamo) {
      getReclamo();
    }
  }, [reclamo]);

  const getReclamo = async () => {
    try {
      const datos = await obtenerReclamo(id.toString());
      setTipoReclamo(datos.tipoReclamo);
      setObservacion(datos.observacion ?? '');

      if (datos.estadoReclamo === 'Solucionado') {
        setModo('soloVer');
      }
      setReclamoOriginal(datos);
    } catch (error: any) {
      notify({ type: 'error', content: error.response?.data?.error || 'Error al obtener el reclamo', duration: 3000, });
    }
  };

  useEffect(() => {
    if (forzarSoloVer) {
      setModo('soloVer');
    }
  }, [forzarSoloVer]);

  useEffect(() => {
    if (modo === 'crear' || modo === 'editar') {
      const getTiposReclamo = async () => {
        try {
          const datos = await obtenerTiposReclamo();
          setTiposReclamo(datos);
        } catch (error: any) {
          notify({ type: 'error', content: error.response?.data?.error || 'Error al obtener los tipos de reclamos', duration: 3000, });
        }
      };

      getTiposReclamo();
    }
  }, [modo]);

  const handleGuardar = async () => {
    const oblig = modo === 'crear' ? true : false;
    const resultado = validarCamposGenerico({
      idReclamo: { valor: tipoReclamo?.id, tipo: 'number', requerido: oblig, min: 1, nombreCampo: "Tipo de reclamo" },
      observacion: { valor: observacion, tipo: 'string', requerido: false, },
    });

    if (!resultado.ok) {
      notify({
        type: 'warning',
        title: 'Datos  inválidos',
        content: resultado.mensaje || 'Los datos no son correctos.',
        duration: 3000,
      });
      return;
    }

    const datos = resultado.datos as ModificarReclamoSchemaDTO;
    try {
      if (datos) {
        if (modo === 'crear') {
          const formData = new FormData();

          if (datos.idReclamo) formData.append("idReclamo", datos.idReclamo.toString());
          if (datos.observacion && datos.observacion.trim() !== '') formData.append("observacion", datos.observacion);

          if (archivo) formData.append('archivo', archivo);

          setGuardando(true);
          const response = await crearReclamo(id.toString(), formData);
          notify({
            type: response.correoEnviado ? 'success' : 'warning',
            title: 'Creación del reclamo',
            content: response.correoEnviado ? response.mensaje : 'Error al enviar correo',
            duration: 3000,
          });

          if (onReclamoCreado) {
            onReclamoCreado();
          }
        } else if (modo === 'editar') {
          await modificarReclamo(id.toString(), datos);
          notify({
            type: 'success',
            title: 'Éxito',
            content: 'El reclamo se modifico correctamente.',
            duration: 3000,
          });
        }
        onClose();
      }
    } catch (error: any) {
      notify({
        type: 'error',
        content: error.response?.data?.error || 'Error al crear o modificar el reclamo.',
        duration: 3000,
      });
    } finally {
      setHasUnsavedChanges(false);
      setGuardando(false);

    }

  };

  const handleMarcarSolucionado = async () => {
    try {
      await estadoReclamo(id.toString());
      notify({
        type: 'success',
        title: 'Éxito',
        content: 'El reclamo se marco como resuelto.',
        duration: 3000,
      });
    } catch (error: any) {
      notify({
        type: 'error',
        content: error.response?.data?.error || 'Error al marcar el reclamo como resuelto.',
        duration: 3000,
      });
    }
    onClose();
  };

  const handleEditar = () => {
    setModo('editar');
  };

  if ((modo === 'verConAcciones' || modo === 'soloVer') && !reclamoOriginal) {
    return <div>Cargando reclamo...</div>;
  }

  return (
    <FormReclamo
      title={
        modo === 'crear'
          ? 'Nuevo Reclamo'
          : modo === 'editar'
            ? 'Editar Reclamo'
            : 'Detalle del Reclamo'
      }
      isOpen={isOpen}
      onClose={handleClose}
      onSave={handleGuardar}
      modo={modo}
      onEditar={handleEditar}
      onMarcarSolucionado={handleMarcarSolucionado}
      isSaving={guardando}
    >
    <div className="overflow-y-auto max-h-[70vh] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 text-sm text-gray-600">
        <p><span className="font-medium">Expediente:</span> {paciente.expediente}</p>
        <p><span className="font-medium">Nombre:</span> {formatearNombre(paciente.paciente)}</p>
        <p><span className="font-medium">Edad:</span> {paciente.edadTexto}</p>
        {('dieta' in paciente) && (
          <p><span className="font-medium">Dieta:</span> {(paciente as any).dieta.nombre}</p>
        )}

        {(modo === "soloVer") && reclamoOriginal && (
          <p>
            <span className="font-medium">Estado del reclamo:</span> {reclamoOriginal.estadoReclamo}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de reclamo:
        </label>
        {modo === 'soloVer' || modo === 'verConAcciones' && reclamoOriginal ? (
          <input
            value={tipoReclamo?.nombre}
            disabled={true}
            className="w-full border px-3 py-2 rounded"
          />
        ) : (
          <>
            <Dropdown
              options={tiposReclamo.map(item => ({
                value: String(item.id),
                label: item.nombre
              }))}
              value={tipoReclamo?.id.toString() ?? ''}
              onChange={(value: string) => {
                const selected = tiposReclamo.find(item => String(item.id) === value) || null;
                setTipoReclamo(selected);
              }}
              placeholder={'Tipos de reclamo'}
            />
          </>
        )}
      </div>
      <textarea
        value={observacion}
        onChange={(e) => { setObservacion(e.target.value) }}
        placeholder="Observación del reclamo"
        disabled={modo === 'soloVer' || modo === 'verConAcciones'}
        className="w-full border px-3  rounded"
        aria-label="Observación del reclamo"
      />
      {(modo === 'verConAcciones' || modo === 'soloVer' || modo === 'editar') && reclamoOriginal?.archivo && (
        <div className="mt-4">
          <p className="font-medium text-gray-700 mb-2">Archivo adjunto:</p>
          {reclamoOriginal.archivo.match(/\.(jpg|jpeg|png|gif)$/i) ? (
            <img
              src={reclamoOriginal.archivo}
              alt="Archivo adjunto"
              className="max-w-full h-auto rounded-lg border border-gray-300"
              width="400" height="300"
            />
          ) : (
            <a
              href={reclamoOriginal.archivo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Ver documento
            </a>
          )}
        </div>
      )}

      {(modo === 'crear') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adjuntar archivo o tomar foto:
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            capture="environment"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                const file = e.target.files[0];
                setArchivo(file);
                setVistaPrevia(URL.createObjectURL(file)); 
              }
            }}
            className="block w-full mb-5 text-sm text-black file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none"
          />

          {vistaPrevia && (
            <div className="mt-4">
              <p className="font-medium text-gray-700 mb-2">Vista previa:</p>
              {archivo && archivo.type.startsWith("image/") ? (
                <img
                  src={vistaPrevia}
                  alt="Vista previa"
                  className="max-w-full h-auto rounded-lg border border-gray-300"
                  width="400" height="300"
                />
              ) : archivo && archivo.type === "application/pdf" ? (
                <iframe
                  src={vistaPrevia}
                  className="w-full h-64 border border-gray-300 rounded-lg"
                  title="Vista previa PDF"
                ></iframe>
              ) : (
                <p className="text-gray-600">{archivo ? archivo.name : 'No existe archivo'}</p>
              )}
            </div>
          )}
        </div>
      )}

    </div>
    </FormReclamo>
  );
}
