import type { Paciente, PacientesList, Salas } from "@miapp/shared";
import { formatearEdad } from '../utils/funcionesFormatear';

export function toPacienteDto(paciente: any): Paciente {
    return {
        expediente: paciente.id_paciente,
        nombre: paciente.nombre_paciente,
        edad: formatearEdad(paciente.edad),
    };
}

export function toPacienteListDto(paciente: any): PacientesList {
    return {
        expediente: paciente.id_paciente,
        ambiente: paciente.nombre_cama,
        nombre: `${paciente.id_paciente} - ${paciente.nombre_paciente}`,
        edad: paciente.edad,
        edadTexto: formatearEdad(paciente.edad),
        edificio: paciente.edificio,
        sala: paciente.nombre_sala,
        hora: paciente.hora,
        dietasValidas: paciente.dietasValidas,
        alergia: paciente.alergia,
        documento: paciente.documento,
        asignado: paciente.asignado,
        idRelacionSis: paciente.id_relacion_sistema,
        tipoRelacion: paciente.tipoRelacion,
    };
}

export function toSalaDto(sala: any): Salas {
    return {
        idSala: sala.id_sala,
        descripcion: sala.nombre_sala,
    };
}

