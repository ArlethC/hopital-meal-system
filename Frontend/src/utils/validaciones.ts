/*
    Archivo: validaciones.tsx
    Descripcion: funciones para validar fechas y validar campos que ingresa el usuario.
    Autor: Marilyn Castro
    Fecha creacion: 11/07/2025
    Version: 1.0.2
*/
export function ValidarFecha(fecha: string): boolean {
  if (!fecha || typeof fecha !== 'string') return true; 

  const partes = fecha.split('-');
  if (partes.length !== 3) return true; 

  const [yearStr, monthStr, dayStr] = partes;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (
    isNaN(year) || isNaN(month) || isNaN(day) ||
    year < 1900 || month < 1 || month > 12 || day < 1 || day > 31
  ) return true;

  const fechaVal = new Date(year, month - 1, day);
  if (isNaN(fechaVal.getTime())) return true; 
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  fechaVal.setHours(0, 0, 0, 0);

  return fechaVal < hoy;
}



type CampoTipo = 'string' | 'number' | 'boolean';

interface ReglaCampo {
  valor: any;
  tipo: CampoTipo;
  requerido: boolean;
  min?: number;
  nombreCampo?: string;
}

interface ResultadoValidacion {
  ok: boolean;
  mensaje?: string;
  datos?: Record<string, any>;
}

export function validarCamposGenerico(
  reglas: Record<string, ReglaCampo>
): ResultadoValidacion {
  const datos: Record<string, any> = {};

  for (const campo in reglas) {
    const { valor, tipo, requerido, min, nombreCampo } = reglas[campo];

    if (requerido && (valor === null || valor === undefined || valor === '')) {
      return { ok: false, mensaje: `El campo "${nombreCampo != undefined ? nombreCampo : campo}" es obligatorio.` };
    }

    if (!requerido && (valor === null || valor === undefined || valor === '')) {
      continue;
    }

    switch (tipo) {
      case 'string':
        if (typeof valor !== 'string') {
          return { ok: false, mensaje: `El campo "${nombreCampo != undefined ? nombreCampo : campo}" debe ser un texto.` };
        }
        if (requerido && valor.trim() === '') {
          return { ok: false, mensaje: `El campo "${nombreCampo != undefined ? nombreCampo : campo}" no puede estar vacío.` };
        }
        datos[campo] = valor.trim();
        break;

      case 'number':
        const num = Number(valor);
        if (isNaN(num)) {
          return { ok: false, mensaje: `El campo "${nombreCampo != undefined ? nombreCampo : campo}" debe ser un número válido.` };
        }
        if (min !== undefined && num < min) {
          return {
            ok: false,
            mensaje: `El campo "${nombreCampo != undefined ? nombreCampo : campo}" debe ser mayor o igual a ${min}.`,
          };
        }
        datos[campo] = num;
        break;

      case 'boolean':
        if (typeof valor !== 'boolean') {
          return { ok: false, mensaje: `El campo "${nombreCampo != undefined ? nombreCampo : campo}" debe ser verdadero o falso.` };
        }
        datos[campo] = valor;
        break;

      default:
        return { ok: false, mensaje: `Tipo de campo no soportado: ${tipo}` };
    }
  }

  return { ok: true, datos };
}

