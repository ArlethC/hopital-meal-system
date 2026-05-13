/*
    Archivo: PdfSolicitud.service.ts
    Descripcion: Lógica de negocio para crear el pdf del reporte de la solicitud.
    Autor: Marilyn Castro
    Fecha creacion: 29/07/2025
    Version: 1.0.3
*/
import { jsPDF } from "jspdf";
import { autoTable } from 'jspdf-autotable';
import { bd } from '../config/database';
import { fechaATexto, formatearEdadPDF, formatearNombre, fechaConHora } from '../utils/funcionesFormatear';
import { HttpError } from "../utils/HttpError";
import { ESTADOS_SOLICITUD } from '../config/Constantes';
import { registrarHistorial, TipoOperacion } from "./historial.service";
import { tiempoComidaSolicitud } from "./solicitudDietas.service";
import { validarHorario } from "./horariosTiempoComida.service";
import fs from "fs";
import path from "path";
import type { DetalleOrden, OrdenBase } from "@miapp/shared";

export interface Detalle extends DetalleOrden {
  nuevaSala?: string;
  cambioSala: boolean;
}

export interface OrdenDietaPDF extends OrdenBase {
  detalles: Detalle[];
}

async function encontrarCambio(idOrden: number) {
    const cambios = await bd.consultaBD(`SELECT TOP(1) cambio_usuario, FORMAT(cambio_fecha, 'dd-MM-yyyy HH:mm:ss') AS fechaFormateada
FROM Historial_app_cocina
WHERE tabla_afectada = 'Detalles_solicitud_dietas' 
AND columna_modificada IN ( 'obs_enfermeria', 'id_dieta_vigente', 'detalle_estado')
AND id_registro IN (SELECT detalle_id
FROM Detalles_solicitud_dietas
WHERE solicitud_id = @idOrden)
ORDER BY cambio_fecha DESC `, [
        { nombre: 'idOrden', valor: idOrden }
    ]);

    return cambios.recordset.length > 0 ? cambios.recordset[0] : null;
}

export async function generarPDF(datos: OrdenDietaPDF) {
    try {

        const turno = await bd.consultaBD(`SELECT dbo.TurnoSolicitud(@fecha) AS turno`, [
            { nombre: 'fecha', valor: datos.fechaCreacion }
        ]);

        const doc = new jsPDF({
            unit: "mm",
            format: "letter",
        });

        doc.setFont("Helvetica");

        const imagePath = path.join(__dirname, '../images/logo.png');
        const logo = fs.readFileSync(imagePath, { encoding: 'base64' });

        doc.addImage(logo, "PNG", 25, 4, 30, 20);

        const pageWidth = doc.internal.pageSize.getWidth();

        // Título del documento
        doc.setFontSize(9);
        doc.text(`HOSPITAL RIOS
DIRECCIÓN DE GESTIÓN DE PACIENTES
SOLICITUD DE ALIMENTOS
REG-HOST-000`,
            pageWidth / 2, 8, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(255, 0, 0);
        doc.text(`N° ${datos.id}`, 160, 24, { align: 'left', });

        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);

        doc.text(`Sala: ${datos.sala}`, 18, 28, { align: 'left' });
        doc.text(`Turno: ${turno.recordset[0].turno}`, 18, 33, { align: 'left' });

        doc.text(`Fecha entrega alimentación: ${fechaATexto(datos.fechaEntrega)}`, 110, 29, { align: 'left' });

        doc.text(`Edificio: ${datos.detalles[0].edificio}`, 110, 34, { align: 'left' });

        doc.text(`Tiempo de comida: ${datos.tiempoComida}`, 18, 38, { align: 'left' });

        const bodyConMensajes: any[] = [];

        datos.detalles.forEach(item => {
            bodyConMensajes.push([
                item.cama || '',
                formatearNombre(item.nombre) || '',
                formatearEdadPDF(item.edad) || '',
                item.dieta.nombre || '',
                item.obsNutricion || item.obsEnfermeria || ''
            ]);

            if (item.cambioSala) {
                bodyConMensajes.push([
                    { content: `${item.nombre} cambió de sala a: ${item.nuevaSala}`, colSpan: 5, styles: { textColor: [200, 0, 0], fontStyle: 'italic', halign: 'left' } }
                ]);
            }
        });

        autoTable(doc, {
            head: [['Cama', 'Nombre del paciente', 'Edad', 'Tipo de dieta', 'Observaciones']],
            body: bodyConMensajes,
            startY: 42,
            theme: 'grid',
            margin: { left: 10, right: 10, bottom: 20 },
            styles: {
                fontSize: 8,
                cellPadding: { top: 1, bottom: 1, left: 1, right: 1 },
                minCellHeight: 7,
                valign: 'middle',
                halign: 'center',
                lineColor: [0, 0, 0],
                lineWidth: 0.1,
                textColor: [0, 0, 0]
            },
            headStyles: {
                fillColor: [250, 250, 250], // Relleno blanco
                textColor: [0, 0, 0], // Texto negro
                lineColor: [0, 0, 0], // Bordes negros
                lineWidth: 0.10, // Grosor del borde
                cellPadding: { top: 0.5, bottom: 0.5 },
                minCellHeight: 8
            }
        });

        doc.text(`Nombre y firma de quien solicita`, 30, 260, { align: 'left' });

        doc.line(8, 256, 100, 256);

        doc.text(`Nombre y firma de quien recibe`, 140, 260, { align: 'left' });

        doc.line(118, 256, 210, 256);

        doc.setFontSize(8);
        doc.text(`Elaborado por: ${datos.usuario}   Fecha y hora creación: ${fechaConHora(datos.fechaCreacion)}`, 8, 266, { align: 'left' });

        const cambios = await encontrarCambio(datos.id);

        if(cambios){
            doc.text(`Modificado por: ${cambios.usuario_cambio}   Fecha y hora modificación: ${cambios.fechaFormateada}`, 115, 266, { align: 'left' });
        }

        return Buffer.from(doc.output('arraybuffer'));

    } catch (error: any) {
        throw new HttpError("Error al generar el documento PDF.", 500);
    }
}

interface Cambios {
    id_paciente: string;
    nombre_sala: string;
}

export async function obtenerCambioSala(idSolicitud: number, sala: string): Promise<Cambios[]> {
    const pacientes = await bd.consultaBD(`SELECT adm.id_paciente,  a.nombre_sala 
	FROM Admisiones_paciente_hospitalizado adm
		INNER JOIN Camas c ON c.id_cama = adm.id_cama
		INNER JOIN Habitaciones s ON c.id_habitacion = s.id_habitacion
		INNER JOIN Salas a ON s.id_sala = a.id_sala
	WHERE  a.nombre_sala <> @sala AND adm.alta_medica = 0
		AND adm.id_paciente IN (
			SELECT det.id_paciente
			FROM Solicitud_dietas sol 
			INNER JOIN Detalles_solicitud_dietas det ON sol.solicitud_id = det.solicitud_id
			WHERE sol.solicitud_id = @idSolicitud 
		)`, [
        { nombre: 'sala', valor: sala },
        { nombre: 'idSolicitud', valor: idSolicitud },
    ]);

    return pacientes.recordset;
}

export async function cambiarEstadoSolicitud(idSolicitud: number, usuario: string, ipUsuario: string) {

    const tiempoComida = await tiempoComidaSolicitud(idSolicitud);

    const horarioValido = await validarHorario(tiempoComida, 'rango');

    if (!horarioValido) {
        return;
    }

    const estadoSolicitud = await bd.consultaBD(`SELECT 1
FROM Solicitud_dietas 
WHERE solicitud_id = @idSolicitud AND estado_solicitud IN ( @d1, @d2)`, [
        { nombre: 'd1', valor: ESTADOS_SOLICITUD.ENVIADA_COCINA.id },
        { nombre: 'd2', valor: ESTADOS_SOLICITUD.MODIFICADA.id },
        { nombre: 'idSolicitud', valor: idSolicitud },
    ]);

    if (estadoSolicitud.recordset.length > 0) {

        await bd.consultaBD(`UPDATE Solicitud_dietas
SET estado_solicitud = @estado
WHERE solicitud_id = @idSolicitud 
AND fecha_entrega = CAST(GETDATE() AS DATE)`, [
            { nombre: 'idSolicitud', valor: idSolicitud },
            { nombre: 'estado', valor: ESTADOS_SOLICITUD.ENVIADA_SALA.id },
        ]);

        await registrarHistorial({
            tabla: 'Solicitud_dietas',
            idRegistro: idSolicitud,
            cambios: [{ campo: 'estado_solicitud', valorAnterior: '', nuevoValor: `${ESTADOS_SOLICITUD.ENVIADA_SALA.id}` }],
            operacion: TipoOperacion.CAMBIO_ESTADO,
            usuario: usuario,
            ipUsuario: ipUsuario,
        })
    }
}

export function mapToDetalle(detalle: DetalleOrden, cambios: Cambios[]): Detalle {
  const cambio = cambios.find(c => c.id_paciente === detalle.expediente);

  return {
    ...detalle,
    cambioSala: !!cambio,
    nuevaSala: cambio?.nombre_sala
  };
}

