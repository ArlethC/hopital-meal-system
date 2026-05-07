import type { Dieta } from "./detallesSolicitud";

export interface Paciente {
  expediente: string;
  nombre: string;
  edad: string;
};

export type PacientesList = {
    expediente: string;
    ambiente: string;
    nombre: string;
    edad: number;
    edadTexto: string;
    edificio: string;
    sala: string;
    hora: string;
    dietasValidas: Dieta[];
    alergia: boolean;
    documento: boolean;
    asignado:boolean;
    idRelacionSis: number;
    tipoRelacion: string;
};

export interface Salas {
  idSala: number;
  descripcion: string;
}

export interface PacienteOmitido {
    expediente: string;
    nombre: string;
}
