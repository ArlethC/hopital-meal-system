export interface Merienda {
    id: number;
    dieta: number;
    observacion: string | null;
    tiempoComida: string;
    fechaInicial: string;
    fechaFinal: string | null;
    estado: boolean;
}