/*
    Archivo: user.ts
    Descripcion: contiene el tipo de typeScript que se usa para los usuarios en el hook que esta en Auth.tsx.
    Autor: Marilyn Castro
    Fecha creacion: 2/07/2025
    Version: 1.0.1
*/

export interface User {
  name: string;
  permissions: Record<string, true>;
}
