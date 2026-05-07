/*
    Archivo: etiquetasPrint.ts
    Descripcion: funciones para crear los pdf de las etiquetas de los pacientes.
    Autor: Marilyn Castro
    Fecha creacion: 29/07/2025
    Version: 1.0.2
*/
import { jsPDF } from "jspdf";
import { formatearNombre, formatearEdadPDF } from './funcionesFormatear';
import { HttpError } from "../utils/HttpError";


type Paciente = {
    paciente: string;
    edad: number;
    sala: string;
    descripcion: string;
    abrev: string;
}

function dibujarEtiqueta(doc: jsPDF, paciente: Paciente, config: any) {
    doc.setFont("Helvetica");
    const textWidth = config.width - 0.15;
    const fontSize = calculateFontSize(doc, `${paciente.paciente}`, textWidth);
    doc.setFontSize(fontSize);

    const salaHeight = drawDynamicText(doc, ``, paciente.sala, 0.10, 0.30, textWidth, fontSize, false, true);

    const pacienteteY = 0.22 + salaHeight + 0.06;
    const pacienteHeight = drawDynamicText(doc, ``, formatearNombre(paciente.paciente), 0.10, pacienteteY, textWidth, fontSize);

    const edadY = pacienteteY + pacienteHeight + 0.06;
    const EdadHeight = drawDynamicText(doc, ``, formatearEdadPDF(paciente.edad), 0.10, edadY, textWidth, fontSize);

    const dieta = edadY + EdadHeight + 0.06;
    const dietaValida = paciente.abrev != null ? paciente.abrev : paciente.descripcion
    drawDynamicText(doc, ``, dietaValida, 0.10, dieta, textWidth, fontSize);

}

export async function generarEtiquetaPaciente(InfoPaciente: Paciente | Paciente[]) {
    try {
        const config = { width: 2.5, height: 2.5, margin: 0.5 };

        const doc = new jsPDF({
            unit: "cm",
            format: [config.width, config.height],
            orientation: "landscape",
        });

        const pacientes = Array.isArray(InfoPaciente) ? InfoPaciente : [InfoPaciente];

        pacientes.forEach((paciente, index) => {
            if (index > 0) {
                doc.addPage([config.width, config.height], "landscape");
            }
            dibujarEtiqueta(doc, paciente, config);
        });

        return Buffer.from(doc.output('arraybuffer'));
    } catch (error: any) {
        throw new HttpError("Error al generar el documento PDF.", 500);
    }
}

function calculateFontSize(doc: jsPDF, text: string, maxWidth: number, maxFontSize = 11, minFontSize = 8) {
    let low = minFontSize, high = maxFontSize;
    let bestSize = minFontSize;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        doc.setFontSize(mid);
        const width = doc.getTextWidth(text);

        if (width <= maxWidth) {
            bestSize = mid; // Mantener el tamaño si cabe
            low = mid + 1;  // Intentar con un tamaño mayor
        } else {
            high = mid - 1; // Intentar con un tamaño menor
        }
    }

    return bestSize;
}

/*
    Crea una linea de texto en el documento PDF con un tamaño de fuente ajustado para que quepa en el ancho especificado.
    @param  doc - la instancia de jsPDF
    @param {String} label - el texto fijo que se desea mostrar
    @param {String} value - el texto dinámico que se desea mostrar
    @param {Number} labelX - la posición en X del texto fijo
    @param {Number} labelY - la posición en Y del texto fijo
    @param {Number} maxTotalWidth - el ancho máximo que puede tener eñ texto 
    @param {Number} labelFontSize - el tamaño de fuente del texto fijo
*/
function drawDynamicText(doc: jsPDF, label: string, value: string, labelX: number, labelY: number, maxTotalWidth: number, labelFontSize: number, darkText = false, underline = false) {
    doc.setFontSize(labelFontSize);
    const labelWidth = doc.getTextWidth(label);

    const maxFirstLineWidth = maxTotalWidth - labelWidth;
    const maxOtherLinesWidth = maxTotalWidth;

    const adjustedFontSize = calculateFontSize(doc, value, maxTotalWidth, labelFontSize, 8);
    const lineHeight = adjustedFontSize * 0.039;

    doc.setFontSize(labelFontSize);
    doc.text(label, labelX, labelY);

    doc.setFontSize(adjustedFontSize);
    if (darkText) {
        doc.setFont("helvetica", "bold");
    }
    // Dividir el texto en líneas si excede el ancho máximo
    const words = value.split(' ');
    let lines = [];
    let currentLine = words[0];
    let isFirstLine = true;

    for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const currentMaxWidth = isFirstLine ? maxFirstLineWidth : maxOtherLinesWidth;
        const testWidth = doc.getTextWidth(testLine);


        if (testWidth > currentMaxWidth) {
            lines.push(currentLine);
            currentLine = words[i];
            isFirstLine = false;
        } else {
            currentLine = testLine;
        }

    }
    lines.push(currentLine);

    if (lines.length > 0) {
        for (let i = 0; i < lines.length; i++) {
            const isFirstLine = i === 0;
            const x = isFirstLine ? labelX + labelWidth : labelX;
            const y = labelY + i * lineHeight;

            doc.text(lines[i], x, y);

            if (underline) {
                const textWidth = doc.getTextWidth(lines[i]);
                doc.setLineWidth(0.005);
                doc.line(x, y + 0.01, x + textWidth, y + 0.01);
            }
        }
    }

    return lines.length * lineHeight;
}