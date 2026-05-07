/*
    Archivo: subirArchivo.ts
    Descripcion: middleware para subir archivos.
    Autor: Marilyn Castro
    Fecha creacion: 21/07/2025
    Version: 1.0.2
*/
import multer from 'multer';
import path from 'path';

import { RUTA_UPLOADS } from '../config/Constantes';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = path.join(RUTA_UPLOADS);
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext)
            .replace(/\s+/g, '_')        
            .replace(/[^a-zA-Z0-9_-]/g, ''); 
        cb(null, `${baseName}-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); 
    } else {
        cb(new Error('Solo se permiten archivos PDF o imágenes (JPG, PNG)')); 
    }
};

export const upload = multer({ storage, fileFilter });


