/*
    Archivo: ValorCatalogoAtencionMedica.ts
    Descripcion: Vista que representa a la tabla ValorCatalogosAtencionMedica.
    Autor: Marilyn Castro
    Fecha creacion: 7/07/2025
    Version: 1.0.0
*/
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'Valores_catalogo_medico' })
export class ValorCatalogoMedico {
  @PrimaryGeneratedColumn({ name: 'id_valor_catalogo' })
  id!: number;

  @Column({ name: 'valor_catalogo', type: "nvarchar", length: 255 })
  valor?: string;

  @Column({ name: 'id_catalogo', type: "int"})
  objCatalogoID!: number;

  @Column({ type: "bit", default: true })
  activo!: boolean;
}
