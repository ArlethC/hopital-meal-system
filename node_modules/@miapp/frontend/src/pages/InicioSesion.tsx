/*
    Archivo: InicioSesion.tsx
    Descripcion: Pantalla de inicio de sesión.
    Autor: Marilyn Castro
    Fecha creacion: 8/07/2025
    Version: 1.0.2
*/
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "react-feather";
import { useNotifications } from '../hooks/notificacionHook';

import { useAuth } from "../hooks/Auth";

declare global {
    interface Window {
        chrome?: {
            webstore?: unknown;
            runtime?: unknown;
        };
    }
}

const InicioSesion: React.FC = () => {
    const { notify } = useNotifications();

    const { login } = useAuth();
    const [usuario, setUsuario] = useState<string>('');
    const [showCustomToggle, setShowCustomToggle] = useState(true);
    const [contrasena, setContrasena] = useState<string>('');
    const [mostrarContrasena, setMostrarContrasena] = useState<boolean>(false);
    const navigate = useNavigate();

    const isPruebas = import.meta.env.VITE_APP_ENV === 'testing';

    useEffect(() => {
        const isChromium = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

        if (isChromium && !isMac) {
            setShowCustomToggle(false);
        } else {
            setShowCustomToggle(true);
        }
    }, []);

    const toggleMostrarContrasena = (): void => {
        setMostrarContrasena(!mostrarContrasena);
    };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        const exito = await login(usuario, contrasena);

        if (!exito.ok) {
            notify({
                type: 'error',
                content: exito.error,
                duration: 3000,
            });
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <div className="h-screen overflow-auto w-full bg-gradient-to-b from-blue-100 to-blue-50">
            {isPruebas && (
                <div className="bg-yellow-500 text-black text-center py-2 font-bold shadow-md w-full">
                    Entorno de Pruebas
                </div>
            )}
            <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 h-[calc(100%-40px)]">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="text-center">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            Bienvenido al Módulo de Alimentación
                        </h1>
                    </div>
                    <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
                        <h2 className="text-center text-2xl font-semibold text-gray-900 mb-6">
                            Inicio de Sesión
                        </h2>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label htmlFor="usuario" className="block text-sm font-medium text-gray-700">
                                    Nombre de usuario
                                </label>
                                <input
                                    id="usuario"
                                    type="text"
                                    required
                                    value={usuario}
                                    autoComplete="username"
                                    onChange={(e) => setUsuario(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700">
                                    Contraseña
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        id="contrasena"
                                        type={mostrarContrasena ? "text" : "password"}
                                        required
                                        value={contrasena}
                                        autoComplete="current-password"
                                        onChange={(e) => setContrasena(e.target.value)}
                                        className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {showCustomToggle && (
                                        <button
                                            type="button"
                                            onClick={toggleMostrarContrasena}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {mostrarContrasena ? (
                                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                >
                                    Ingresar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InicioSesion;