
// de salida Backend
export interface AlergiaIntolerancia {
  id: number;
  alergiasIntolerancias: string;
};

export interface AlergiasIntoleranciasPaciente {
    expediente: string;
    nombre: string;
    edad: string;
    alergias: AlergiaIntolerancia[]
}
