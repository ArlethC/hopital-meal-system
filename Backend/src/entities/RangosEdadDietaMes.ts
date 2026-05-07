/*
    Archivo: RangosEdadDietaMes.ts
    Descripcion: contiene la entidad para la tabla AlRangos_edad_dietas_en_meses
    Fecha creacion: 30/06/2025
    Version: 1.0.0
*/
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "Rangos_edad_dietas_meses" })
export class RangoEdadDietaMes {
  @PrimaryGeneratedColumn({ name: "id_rango_edad" })
  id!: number;

  @Column({ name: "descripcion_rango", type: "nvarchar", length: 100 })
  descripcion!: string;

  @Column({ name: "edad_minima", type: "int" })
  edadMinima!: number;

  @Column({ name: "edad_maxima", type: "int" })
  edadMaxima!: number;

  @Column({ type: "bit", default: true })
  activo!: boolean;

  @Column({ name: "creacion_usuario", type: "varchar", length: 25 })
  usuarioCreacion!: string;

  @Column({ name: "creacion_fecha", type: "datetime", default: () => "GETDATE()" })
  fechaCreacion?: Date;

  @Column({ name: "cambio_usuario", type: "varchar", length: 25, nullable: true })
  usuarioCambio?: string;

  @Column({ name: "cambio_fecha", type: "datetime", nullable: true })
  fechaCambio?: Date;

  @Column({ name: "ip_equipo_creacion", type: "varchar", length: 50, nullable: true })
  ipUsuarioCreacion?: string;
}

