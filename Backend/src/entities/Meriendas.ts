/*
    Archivo: Meriendas.ts
    Descripcion: Entidad de la tabla AlDetalles_merienda.
    Autor: Marilyn Castro
    Fecha creacion: 31/07/2025
    Version: 1.0.0
*/
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn,} from 'typeorm';
import {ValorCatalogoMedico} from './ValorCatalogoAtencionMedica';

@Entity({ name: 'Detalle_merienda' })
export class DetallesMerienda {
    @PrimaryGeneratedColumn({ name: 'merienda_detalle_id'  })
    idDetalleMerienda!: number;

    @Column({ name: 'id_paciente', type: 'varchar', length: 20, nullable: false })
    expediente!: string;

    @Column({ name: 'id_dieta', type: 'int' })
    idDieta!: number;

    @Column({ name: 'id_comida', type: 'int', nullable: true })
    idTiempoComida?: number | null;

    @Column({ name: 'obs_merienda', type: 'nvarchar', length: "MAX", nullable: true })
    observacion?: string | null;

    @Column({ name: 'fecha_inicio', type: 'date' })
    fechaInicioMerienda!: Date;

    @Column({ name: 'fecha_final', type: 'date', nullable: true })
    fechaFinMerienda?: Date | null;

    @Column({ name: 'vigencia', type: 'bit', default: true })
    estadoVigencia!: boolean;

    @Column({ name: 'creacion_usuario', type: 'varchar', length: 25 })
    usuarioCreacion!: string;

    @CreateDateColumn({ name: 'creacion_fecha', type: 'datetime', default: () => 'GETDATE()' })
    fechaCreacion!: Date;

    @Column({ name: 'ip_equipo_creacion', type: 'varchar', length: 50, nullable: true })
    ipUsuarioCreacion!: string | null;

    @ManyToOne(() => ValorCatalogoMedico)
    @JoinColumn({ name: 'id_comida' })
    ValorCatalogoMedico!: ValorCatalogoMedico;
}
