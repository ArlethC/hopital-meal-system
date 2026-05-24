/*
    Archivo: ui.tsx
    Descripcion: typos para componentes como tablas, barras de búsqueda y listas deplegables.
    Autor: Marilyn Castro
    Fecha creacion: 4/07/2025
    Version: 1.0.0
*/
import type { Dieta, Salas, ValorCatalogo } from "@miapp/shared";

interface DropdownOption {
  value: string;
  label: string;
}

type AgeRange = {
  id: number;
  descripcion: string;
  edadMinima: number;
  edadMaxima: number;
  edadMinimaTexto: string;
  edadMaximaTexto: string;
};

interface PacienteBase {
  expediente: string;
  ambiente: string;
  paciente: string;
  alergia: boolean;
  documento: boolean;
  edadTexto: string;
};

interface PacienteObservaciones {
  obsEnfermeria?: string;
  obsNutricion?: string;
  obsCocina?: string;
  idRelacion?: number;
  tipoRelacion?: string;
  modificado: boolean;
  cancelado: boolean;
  recibido: boolean;
  reclamo: boolean;
}

export interface PacienteCrear extends PacienteBase, Partial<PacienteObservaciones> {
  estado: 'crear';
  dietasValidas: Dieta[];
  asignado: boolean;
}

interface PacienteModificar extends PacienteBase, PacienteObservaciones {
  estado: 'modificar';
  dietasValidas: Dieta[];
  dietaSeleccionada: Dieta;
  id: number;
}

interface PacienteFinalizado extends PacienteBase, PacienteObservaciones {
  estado: 'entrega' | 'reclamo' | 'cerrar' ;
  id: number;
  dietaSeleccionada: Dieta;
}

type PacienteUi = PacienteCrear | PacienteModificar | PacienteFinalizado;

export {
  type DropdownOption,
  type Dieta,
  type ValorCatalogo,
  type AgeRange,
  type PacienteObservaciones,
  type PacienteModificar,
  type PacienteFinalizado,
  type PacienteUi,
  type Salas
};






