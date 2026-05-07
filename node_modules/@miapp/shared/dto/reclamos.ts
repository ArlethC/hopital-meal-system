export interface TipoReclamo  {
    id: number;
    nombre: string;
}

export interface Reclamo  {
    tipoReclamo: TipoReclamo;
    estadoReclamo: string;
    observacion?: string;
    archivo?: string;
}