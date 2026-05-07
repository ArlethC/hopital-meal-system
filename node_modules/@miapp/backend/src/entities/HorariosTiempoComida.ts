/*
    Archivo: HorariosTiempoComida.ts
    Descripcion: Entidad que representa la tabla Al_Horarios_tiempo_comida.
    Autor: Marilyn Castro
    Fecha creacion: 7/07/2025
    Version: 1.0.0
*/
import {ValorCatalogoMedico} from './ValorCatalogoAtencionMedica';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'Horario_comida' })
export class HorariosTiempoComida {
  @PrimaryGeneratedColumn({ name: 'id_horario_comida' })
  id!: number;

  @Column({ name: 'id_comida', type: 'int' })
  idTiempoComida!: number;

  @Column({ name: 'hora_final_cierre', type: 'time' })
  horaCierre!: string; 

  @Column({ name: 'hora_final_modificacion', type: 'time' })
  horaModificacion!: string; 

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

  @ManyToOne(() => ValorCatalogoMedico)
  @JoinColumn({ name: 'id_comida', referencedColumnName: 'valor' })
  valor?: ValorCatalogoMedico;

}
