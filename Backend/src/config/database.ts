/*
    Archivo: database.ts
    Descripcion: contiene la configuracion de la libreria mssql para conectarse a la base de datos
    Fecha creacion: 30/06/2025
    Version: 1.0.3
*/

import { ConnectionPool, connect, config as sqlConfigType, IResult, Table, VarChar, Transaction, Int } from 'mssql';
import { config as loadEnv } from 'dotenv';


loadEnv();

interface ParametroSQL {
  nombre: string;
  valor: any;
}

class ConexionBD {
  private sqlConfig: sqlConfigType;
  private poolconexiones: ConnectionPool | null;

  constructor() {
    this.sqlConfig = {
      user: process.env.DB_USUARIO!,
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_DATABASE!,
      server: process.env.DB_HOST!,
      options: {
        encrypt: false,
        trustServerCertificate: true
      }
    };

    this.poolconexiones = null;
  }

  async initialize(): Promise<void> {
    await this.obtenerPoolConexiones();
  }

  async obtenerPoolConexiones(): Promise<void> {
    try {
      const pool = await new ConnectionPool(this.sqlConfig).connect();
      this.poolconexiones = pool;
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error al obtener pool:', err);
      }
      throw err;
    }
  }

  async consultaBD(consultaSQL: string, parametrosSQL?: ParametroSQL[]): Promise<IResult<any>> {
    try {
      if (!this.poolconexiones) {
        await this.obtenerPoolConexiones();
      }

      if (!this.poolconexiones) {
        throw new Error('No se pudo establecer la conexión a la base de datos');
      }

      const solicitud = this.poolconexiones.request();

      parametrosSQL?.forEach(({ nombre, valor }) => {
        solicitud.input(nombre, valor);
      });

      const resultado = await solicitud.query(consultaSQL);
      return resultado;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error en consultaBD:', error);
      }
      throw error;
    }
  }

  async ejecutarProcedimiento<T = any>(nombreProcedimiento: string, parametrosSQL?: ParametroSQL[]): Promise<import('mssql').IProcedureResult<T>> {
    try {
      if (!this.poolconexiones) {
        await this.obtenerPoolConexiones();
      }

      if (!this.poolconexiones) {
        throw new Error('No se pudo establecer la conexión a la base de datos');
      }

      const solicitud = this.poolconexiones.request();

      parametrosSQL?.forEach(({ nombre, valor }) => {
        solicitud.input(nombre, valor);
      });

      const resultado = await solicitud.execute(nombreProcedimiento);
      return resultado;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error al ejecutar procedimiento almacenado:', error);
      }
      throw error;
    }
  }

  async realizarTransaccion(callback: (tx: Transaction) => Promise<void>): Promise<void> {
    if (!this.poolconexiones) {
      await this.obtenerPoolConexiones();
    }

    const transaction = new Transaction(this.poolconexiones!);

    try {
      await transaction.begin();


      const result = await callback(transaction);
      await transaction.commit();

      return result;
    } catch (error) {
      await transaction.rollback();
      if (process.env.NODE_ENV === 'development') {
        console.error('Error en la transacción:', error);
      }
      throw error;
    }
  }

}

export interface PacienteDieta {
  expediente: string;
  idDieta: number;
  obsEnfermeria?: string;
  cama?: string;
  idRelacion?: number;
  tipoRelacion?: string;
}


export function crearTablaPacientesDieta(pacientes: PacienteDieta[]): Table {
  const tabla = new Table();
  tabla.columns.add('idPaciente', VarChar(20));
  tabla.columns.add('idDieta', Int);
  tabla.columns.add('obsEnfermeria', VarChar(500));
  tabla.columns.add('cama', VarChar(50));
  tabla.columns.add('idRelacion', Int);
  tabla.columns.add('tipoRelacion', VarChar(50));


  for (const paciente of pacientes) {
    tabla.rows.add(paciente.expediente, paciente.idDieta, paciente.obsEnfermeria, paciente.cama, paciente.idRelacion, paciente.tipoRelacion);
  }

  return tabla;
}


export const bd = new ConexionBD();
