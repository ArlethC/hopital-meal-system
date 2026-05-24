/*
    Archivo: Auth.tsx
    Descripcion: Hook para manejar las sesiones de los usuarios.
    Autor: Marilyn Castro
    Fecha creacion: 8/07/2025
    Version: 1.0.0
*/
import React, { createContext, useContext, useState, useEffect } from 'react';
import { inicioSesion, verificarSesionUsuario, cerrarSesionUsuario, inicioSesionEmbedido } from '../services/autenticacion';

interface AuthContextType {
    esEmbebido: boolean;
    usuario: string | null;
    permisos: string[];
    login: (usuario: string, contrasena: string) => Promise<{ ok: true } | { ok: false; error: string }>;
    logout: () => Promise<void>;
    cargando: boolean;
    tienePermiso: (permiso: string) => boolean;
    isLoggingOut: boolean;
    setIsLoggingOut: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isEmbedded, setIsEmbedded] = useState(false);
    const [usuario, setUsuario] = useState<string | null>(null);
    const [permisos, setPermisos] = useState<string[]>([]);
    const [cargando, setCargando] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);


    useEffect(() => {
        const detectEmbedded = () => {
            return window.self !== window.top;
        };

        const verificacionSesion = async () => {
            try {
                const data = await verificarSesionUsuario();
                if (data) {
                    setUsuario(data.usuario);
                    setPermisos(data.permisos);
                }
            } catch (error) {
                if (import.meta.env.DEV) {
                    console.error('Error verificando sesión:', error);
                }
                console.error('Error verificando sesión');
            } finally {
                setCargando(false);
            }
        };

        const initAuth = async () => {
            const embedded = detectEmbedded();
            setIsEmbedded(embedded);

            if (embedded) {
                interface AuthDataEvent {
                    type: "AUTH_DATA";
                    usuario: string;
                    firma: string;
                }

                interface MessageEventWithAuthData extends MessageEvent {
                    data: AuthDataEvent;
                }

                const handler = async (event: MessageEventWithAuthData) => {
                    if (!event.data) {
                        return;
                    }

                    if (event.data.type !== "AUTH_DATA") {
                        return;
                    }

                    if (event.data.type !== "AUTH_DATA") {
                        return;
                    }

                    const { usuario, firma } = event.data;

                    try {
                        const data = await inicioSesionEmbedido(usuario, firma);
                        setUsuario(data.usuario);
                        setPermisos(data.permisos || {});
                    } catch (error) {
                        if (import.meta.env.DEV) {
                            console.error('Error en el inicio de sesion como componente:', error);
                        }
                        console.error('Error en el inicio de sesion como componente');
                    } finally {
                        setCargando(false);
                    }
                };

                window.addEventListener("message", handler);

                if (window.parent) {
                    window.parent.postMessage({ type: "IFRAME_READY" }, "*");
                }

                const timeout = setTimeout(() => {
                    setCargando(false);
                }, 10000);

                return () => {
                    window.removeEventListener("message", handler);
                    clearTimeout(timeout);
                };
            } else {
                await verificacionSesion();
            }

            setCargando(false);
        };

        initAuth();
    }, []);


    const login = async (usuario: string, contrasena: string): Promise<{ ok: true } | { ok: false; error: string }> => {
        try {
            const datos = { usuario, contrasena };
            const data = await inicioSesion(datos);

            if (data.accessToken) {
                sessionStorage.setItem('accessToken', data.accessToken);
            }

            setUsuario(data.usuario);
            setPermisos(data.permisos || {});

            return { ok: true };
        } catch (error: any) {
            const mensajeError = error?.response?.data?.error || 'Ocurrió un error inesperado';
            return { ok: false, error: mensajeError };
        }
    };

    const logout = async () => {
        try {
            await cerrarSesionUsuario();
        } catch {
            console.error('Error cerrando sesión');
        } finally {
            sessionStorage.removeItem('accessToken');
            setUsuario(null);
            setPermisos([]);
        }
    };

    const tienePermiso = (permiso: string) => permisos.includes(permiso);

    return (
        <AuthContext.Provider value={{ esEmbebido: isEmbedded, usuario, permisos, cargando, login, logout, tienePermiso, isLoggingOut, setIsLoggingOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};
