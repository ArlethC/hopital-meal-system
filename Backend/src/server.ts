/*
    Archivo: server.ts
    Descripcion: contiene la configuracion del servidor 
    Autor: Marilyn Castro
    Fecha creacion: 30/06/2025
    Version: 1.0.0
*/

import 'reflect-metadata';
import { bd } from './config/database';
import { OrigenDatos } from './config/databaseORM';
import { initSocket } from './socket'
import app from './app';
import http from 'http';
import { programarCierres } from './services/horariosTiempoComida.service';

const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
  try {
    await OrigenDatos.initialize();
    console.log('Conexión con TypeORM establecida');

    await bd.initialize(); 
    console.log('Conexión con SQL Server (mssql) ');

    programarCierres();

    initSocket(server);

    server.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

iniciarServidor();
