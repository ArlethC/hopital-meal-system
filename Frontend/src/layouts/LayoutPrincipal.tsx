/*
    Archivo: LayoutPrincipal.tsx
    Descripcion: contiene la barra superior con la lógica para cerrar sesión.
    Autor: Marilyn Castro
    Fecha creacion: 2/07/2025
    Version: 1.0.1
*/

import { type ReactNode } from "react";
import type { User } from '../types/user';
import Navbar from "../components/Navbar";
import { useNavigate, } from "react-router-dom";
import { useAuth } from "../hooks/Auth";

const MainLayout = ({ children }: { children: ReactNode }) => {
    const { usuario, permisos, logout, setIsLoggingOut } = useAuth();
    const navigate = useNavigate();

    const user: User = {
        name: usuario ?? "",
        permissions: permisos
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await logout();

        navigate('/login', { replace: true });
        setTimeout(() => setIsLoggingOut(false), 300);
    };


    const handleNavigate = (path: string) => {
        navigate(path);
    };

    return (
        <div style={{ backgroundColor: '#E3F2FD' }} className="min-h-screen max-w-full overflow-x-hidden overflow-y-auto flex flex-col">
            <Navbar
                user={user}
                onLogout={handleLogout}
                onNavigate={handleNavigate}
            />
            <main className="flex-1 p-4 px-4 sm:px-6 lg:px-12 overflow-x-hidden overflow-y-auto">{children}</main>
        </div>
    );
};

export default MainLayout;
