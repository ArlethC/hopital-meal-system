export interface Documento  {
    idDocumento: number;
    tipoDocumento: string;
    rutaDocumento: string;
    fechaInicial: string | null;
    fechaFinalVigencia: string | null;
    obsDocumento: string | null;
};