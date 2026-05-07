/*
    Archivo: DocumentosNutricion.ts
    Descripcion: Entidad para la tabla AlDocumentos_nutricion.
    Autor: Marilyn Castro
    Fecha creacion: 21/07/2025
    Version: 1.0.0
*/

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, } from 'typeorm';
import {ValorCatalogoMedico} from './ValorCatalogoAtencionMedica';

@Entity({ name: 'Documentos_nutricion' })
export class DocumentoNutricion {
    @PrimaryGeneratedColumn({ name: 'documento_id' })
    idDocumento!: number;

    @Column({ name: 'id_paciente', type: 'varchar', length: 20, nullable: false })
    expediente!: string;

    @Column({ name: 'tipo_documento_id', type: 'int', nullable: false })
    idTipoDocumento!: number;

    @Column({ name: 'ruta_documento', type: 'nvarchar', length: 500, nullable: false })
    rutaDocumento!: string;

    @Column({ name: 'obs_documento', type: 'nvarchar', length: "MAX", nullable: false })
    obsDocumento!: string;

    @Column({ name: 'activo', type: 'bit', default: true })
    activo!: boolean;

    @Column({ name: 'creacion_usuario', type: 'varchar', length: 25 })
    usuarioCreacion!: string;

    @Column({ name: 'fecha_inicial', type: 'date', nullable: true })
    fechaInicial?: Date;

    @Column({ name: 'fecha_final', type: 'date', nullable: true })
    fechaFinalVigencia?: Date;

    @CreateDateColumn({ name: 'creacion_fecha', type: 'datetime', default: () => 'GETDATE()' })
    fechaCreacion!: Date;

    @Column({ name: 'cambio_usuario', type: 'varchar', length: 25, nullable: true })
    usuarioActualizacion?: string;

    @UpdateDateColumn({ name: 'cambio_fecha', type: 'datetime', nullable: true })
    fechaUltimaModificacion?: Date;

    @Column({ name: 'ip_equipo_creacion', type: 'varchar', length: 45, nullable: true })
    ipUsuarioCreacion?: string;

    @ManyToOne(() => ValorCatalogoMedico)
    @JoinColumn({ name: 'tipo_documento_id', referencedColumnName: 'valor' })
    valor?: ValorCatalogoMedico;
}

export { ValorCatalogoMedico };