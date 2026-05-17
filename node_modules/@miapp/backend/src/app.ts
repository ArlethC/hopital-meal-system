/*
    Archivo: app.ts
    Descripcion: contiene todas las rutas de la API
    Autor: Marilyn Castro
    Fecha creacion: 30/06/2025
    Version: 1.0.3
*/
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { config as loadEnv } from 'dotenv';
import mime from 'mime-types';

loadEnv();

import rangoEdadRutas from './routes/rangosEdad.routes';
import dietasEdadTiempoComida from './routes/dietasEdadTiempoComida.routes';
import dietas from './routes/dietas.routes';
import pacientes from './routes/pacientes.routes';
import horarioTiempoComida from './routes/horarioTiempoComida.routes';
import autenticacion from './routes/autenticacion.routes';
import solicituDietas from './routes/solicitudDietas.routes';
import alergias from './routes/alergiaIntolerancia.routes';
import documentosNutricion from './routes/documentosNutricion.routes';
import reclamos from './routes/reclamo.routes';
import meriendas from './routes/meriendas.routes';
import detalles from './routes/detallesSolicitudDietas.routes';
import cocina from './routes/cocina.routes';

import { errorHandler } from './middlewares/errores';

import fs from 'fs';
import path from 'path';
import { RUTA_UPLOADS } from './config/Constantes';


const app = express();

const uploadsPath = path.join(RUTA_UPLOADS);
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use('/uploads', express.static(uploadsPath, {
  fallthrough: false,
  setHeaders: (res, path, stat) => {
    const mimeType = mime.lookup(path);
    
    if (mimeType) {
      if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
        const fileName = path.split('/').pop() || 'file';
        res.setHeader('Content-Disposition', 'inline; filename="${fileName}"');
        res.setHeader('Content-Type', mimeType);
      }
    }
    
    res.setHeader('Cache-Control', 'public, max-age=31536000'); 
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.set('trust proxy', true);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});
app.use(session({
  secret: process.env.SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 3600000, // 1 hora de duración
    sameSite: 'none',
    secure: false
  }
}));
app.use(cookieParser());

// Rutas
app.use('/api', autenticacion);

app.use('/api/rangoEdad', rangoEdadRutas);
app.use('/api/dietasEdadTiempo', dietasEdadTiempoComida);

app.use('/api/dietas', dietas);
app.use('/api/pacientes', pacientes);

app.use('/api/horarioTiempoComida', horarioTiempoComida);
app.use('/api/solicitudDietas', solicituDietas);

app.use('/api/solicitud/detalles', detalles);
app.use('/api/alergias', alergias);

app.use('/api/documentosNutri', documentosNutricion);
app.use('/api/reclamos', reclamos);

app.use('/api/merienda', meriendas);
app.use('/api/cocina', cocina);

app.use(errorHandler);


export default app;
