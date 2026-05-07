/*
    Archivo: DietasEdadTiempoComida.ts
    Descripcion: Entidad de la tabla AlDieta_tiempo_comida_edad.
    Autor: Marilyn Castro
    Fecha creacion: 3/07/2025
    Version: 1.0.0
*/

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, } from 'typeorm';
import { RangoEdadDietaMes } from './RangosEdadDietaMes';

@Entity({ name: 'Dieta_comida_edad' })
export class DietaTiempoComidaEdad {
  @PrimaryGeneratedColumn({ name: 'id_dieta_comida_edad' })
  id!: number;

  @Column({ name: 'rango_edad_id' })
  idRangoEdad!: number;

  @Column({ name: 'id_comida', type: 'int' })
  idTiempoComida!: number;

  @Column({ name: 'id_dieta', type: 'int', nullable: true })
  idDieta!: number | null;

  @Column({ name: 'activo', type: 'bit', default: true })
  activo!: boolean;

  @Column({ name: 'creacion_usuario', type: 'varchar', length: 25 })
  usuarioCreacion!: string;

  @CreateDateColumn({ name: 'creacion_fecha', type: 'datetime', default: () => 'GETDATE()' })
  fechaCreacion!: Date;

  @Column({ name: 'cambio_usuario', type: 'varchar', length: 25, nullable: true })
  usuarioCambio?: string | null;

  @UpdateDateColumn({ name: 'cambio_fecha', type: 'datetime', nullable: true })
  fechaCambio?: Date | null;

  @Column({ name: 'ip_equipo_creacion', type: 'varchar', length: 50, nullable: true })
  ipUsuarioCreacion?: string | null;

  @Column({ name: 'abrev_nombre_dieta', type: 'varchar', length: 50, nullable: true })
  abrevDieta?: string | null;
  // Relaciones

  @ManyToOne(() => RangoEdadDietaMes)
  @JoinColumn({ name: 'rango_edad_id' })
  rangoEdadDietaMes!: RangoEdadDietaMes;
}
