/*
    Archivo: HttpError.ts
    Descripcion: clase para transformar los errores a codigos HTTP.
    Autor: Marilyn Castro
    Fecha creacion: 7/07/2025
    Version: 1.0.0
*/

export class HttpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
  }
}
