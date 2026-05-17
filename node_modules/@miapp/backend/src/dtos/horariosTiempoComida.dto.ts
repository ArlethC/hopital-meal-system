/*
    Archivo: horariosTiempoComida.dto.ts
    Descripcion: esquemas de ZOD para validar datos de los horarios.
    Autor: Marilyn Castro
    Fecha creacion: 7/07/2025
    Version: 1.0.0
*/
import type { HorarioTiempoComida } from '@miapp/shared';
import { convertirHoraAHHmm } from '../utils/funcionesFormatear';

export function toHorarioDto(horario: any): HorarioTiempoComida {
  return {
    id: horario.id_horario_comida,
    tiempoComida: horario.v_valor_catalogo,
    horaCierre: convertirHoraAHHmm(horario.horaCierre),
    horaModificacion: convertirHoraAHHmm(horario.horaModificacion),
  };
}
