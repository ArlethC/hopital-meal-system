/*
    Archivo: databaseORM.ts
    Descripcion: contiene la configuracion del ORM typeORM para conectarse a la base de datos
    Fecha creacion: 30/06/2025
    Version: 1.0.0
*/

import "reflect-metadata";
import { DataSource } from "typeorm";
import { config as loadEnv } from 'dotenv';

loadEnv();

export const OrigenDatos = new DataSource({
    type: "mssql", 
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USUARIO,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: false, 
    logging: false,
    entities: [__dirname + "/../entities/**/*.{ts,js}"],
    migrations: [],
    subscribers: [],
    options: {
        encrypt: false,                
        trustServerCertificate: true, 
    }
});
