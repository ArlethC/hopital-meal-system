export type Dieta = {
  codigo: number;
  nombre: string;
}


export interface DetalleOrden {
  idDetalle: number;
  cama: string;
  nombre: string;
  expediente: string;
  edad: number;
  dieta: Dieta,
  obsEnfermeria: string | null;
  obsNutricion: string | null;
  obsCocina: string | null;
  alergia: boolean;
  documento: boolean;
  cancelado: boolean;
  recibido: boolean;
  reclamo: boolean;
  modificado: boolean;
  edificio: string;
  edadTexto: string;
  dietasValidas?: Dieta[];
}

export interface OrdenBase {
  id: number;
  sala: string;
  fechaEntrega: string;
  usuario: string;
  fechaCreacion: string;
  tiempoComida: string;
  estado: string;
  tabla: string;
  code: string;
}

export interface ValorCatalogo {
  id: number;
  valor: string;
};

export interface Historial {
  campoModificado: string;
  valorAnterior: string;
  valorNuevo: string;
  fechaCambio: string;
  usuarioCambio: string;
}