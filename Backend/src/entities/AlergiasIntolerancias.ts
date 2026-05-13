/*
    Archivo: AlergiaIntolerancias.ts
    Descripcion: Entidad de la tabla AlAlergias_intolerancias_paciente.
    Autor: Marilyn Castro
    Fecha creacion: 16/07/2025
    Version: 1.0.0
*/
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,UpdateDateColumn,} from 'typeorm';

@Entity({ name: 'Alergias_intolerancias' })
export class AlergiasIntoleranciasPaciente {
  @PrimaryGeneratedColumn({ name: 'alergia_intolerancia_id' })
  id!: number;

  @Column({ name: 'id_paciente', type: 'varchar', length: 20 })
  expediente!: string;

  @Column({ name: 'intolerancia_alergia', type: 'nvarchar', length: 255 })
  alergiasIntolerancias!: string;

  @Column({ name: 'activo', type: 'bit', default: () => '1' })
  activo!: boolean;

  @Column({ name: 'creacion_usuario', type: 'varchar', length: 25 })
  usuarioCreacion!: string;

  @CreateDateColumn({ name: 'creacion_fecha', type: 'datetime', default: () => 'GETDATE()' })
  fechaCreacion!: Date;

  @Column({ name: 'cambio_usuario', type: 'varchar', length: 25, nullable: true })
  usuarioCambio?: string;

  @UpdateDateColumn({ name: 'cambio_fecha', type: 'datetime', nullable: true })
  fechaCambio?: Date;

  @Column({ name: 'ip_equipo_creacion', type: 'varchar', length: 50, nullable: true })
  ipUsuarioCreacion?: string;
}
