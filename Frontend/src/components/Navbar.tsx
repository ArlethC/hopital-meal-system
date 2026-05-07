/*
    Archivo: Navbar.tsx
    Descripcion: componente de la barra superior de las pantallas.
    Autor: Marilyn Castro
    Fecha creacion: 2/07/2025
    Version: 1.0.1
*/

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Menu, X, LogOut } from 'react-feather';
import type { User } from '../types/user';

interface SubSection {
    name: string;
    path: string;
    permission?: Permission;
}

type Permission = string | string[];

interface NavItem {
    name: string;
    path?: string;
    permission?: Permission;
    subSections?: SubSection[];
}

interface NavbarProps {
    user: User;
    onLogout: () => void;
    onNavigate: (path: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onNavigate }) => {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Configuración de elementos del menú
    const navItems: NavItem[] = [
        {
            name: 'Inicio',
            path: '/dashboard',
        },
        {
            name: 'Solicitud de dietas',
            permission: ['crear solicitud', 'nutricion', 'admin', 'solicitud extraordinaria'],
            subSections: [
                { name: 'Crear solicitud', path: '/solicitud/crear', permission: ['crear solicitud', "admin", "solicitud extraordinaria"] },
                { name: 'Modificar solicitud', path: '/solicitud/modificar', permission: ['nutricion', 'crear solicitud', "admin"] },
                { name: 'Recibir la solicitud', path: '/solicitud/recibir', permission: 'crear solicitud' },
                { name: 'Reclamos', path: '/solicitud/reclamar', permission: ['crear solicitud', 'admin'] },
            ]
        },
        {
            name: 'Alergias/intolerancias',
            permission: 'crear alergias',
            path: '/alergias-intolerancias',
        },
        {
            name: 'Nutrición',
            permission: ['nutricion', 'meriendas'],
            path: '/nutricion',
        },
        {
            name: 'Configuración de dietas',
            permission: 'admin',
            subSections: [
                { name: 'Crear rangos de edad', path: '/confDietas/rangosEdad', permission: 'admin' },
                { name: 'Configuración de dieta por edad y tiempo de comida', path: '/confDietas/grupDietas', permission: 'admin' },
                { name: 'Configurar horarios', path: '/confDietas/horariosComida', permission: 'admin' }
            ]
        },
        {
            name: 'Cocina',
            permission: 'cocina',
            subSections: [
                { name: 'Solicitudes de dieta', path: '/cocinaSol', permission: 'cocina' },
                { name: 'Pantalla TV', path: '/pantallaTv', permission: 'cocina' },
                { name: 'Pantalla meriendas', path: '/meriendaTv', permission: 'cocina' }
            ]    
        },
        {
            name: 'Historial Solicitudes',
            permission: 'ver solicitudes',
            path: '/solicitud/visualizar', 
        },
    ];

    const hasPermission = (permission?: Permission): boolean => {
        if (!permission) return true;
        if (Array.isArray(permission)) {
            return permission.some(p => !!user.permissions[p]);
        }

        return !!user.permissions[permission];
    };

    const filteredNavItems = navItems.filter(item => hasPermission(item.permission));

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNavigation = (path: string) => {
        onNavigate(path);
        setActiveDropdown(null);
        setIsMobileMenuOpen(false);
    };

    const handleDropdownToggle = (itemName: string) => {
        setActiveDropdown(activeDropdown === itemName ? null : itemName);
    };

    const handleMobileSubItemClick = (e: React.MouseEvent | React.TouchEvent, path: string) => {
        e.preventDefault();
        e.stopPropagation();

        setTimeout(() => {
            handleNavigation(path);
        }, 50);
    };

    const isPruebas = import.meta.env.VITE_APP_ENV === 'testing';

    return (
        <nav className={`bg-white shadow-lg max-w-full ${isPruebas ? 'border-yellow-500 border-b-4' : 'border-gray-200  border-b '}`}>
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <img
                        src="/logo.jpg"
                        alt="logo"
                        className="h-10 max-w-[150px] object-contain"
                        width="400" height="300"
                    />
                    {isPruebas && (
                        <span className="ml-4 text-xs font-bold text-yellow-700">
                            PRUEBAS
                        </span>
                    )}

                    {/* Menú Desktop */}
                    <div className="hidden lg:flex items-center space-x-4 ml-4" ref={dropdownRef}>
                        <div className="flex justify-between items-center h-16">
                            {filteredNavItems.map((item) => (
                                <div key={item.name} className="relative">
                                    {item.subSections ? (
                                        <div>
                                            <button
                                                onClick={() => handleDropdownToggle(item.name)}
                                                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                                            >
                                                {item.name}
                                                <ChevronDown className="ml-1 h-4 w-4" />
                                            </button>
                                            {activeDropdown === item.name && (
                                                <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                                                    <div className="py-1">
                                                        {item.subSections
                                                            .filter(subItem => hasPermission(subItem.permission))
                                                            .map((subItem) => (
                                                                <button
                                                                    key={subItem.name}
                                                                    onClick={() => handleNavigation(subItem.path)}
                                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200"
                                                                >
                                                                    {subItem.name}
                                                                </button>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleNavigation(item.path!)}
                                            className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                                        >
                                            {item.name}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Usuario y Logout */}
                    <div className="hidden lg:flex items-center space-x-4 w-full justify-end">
                        <span className=" lg:inline text-sm text-gray-700">Hola, {user.name}</span>
                        <button
                            onClick={onLogout}
                            className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200"
                        >
                            <LogOut className="h-4 w-4 mr-1" />
                            Cerrar Sesión
                        </button>
                    </div>

                    {/* Menú Mobile */}
                    <div className="lg:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                            aria-label="Abrir menú"
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Menú Mobile Expandido */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50 rounded-md mt-2">
                            {filteredNavItems.map((item) => (
                                <div key={item.name} className="w-full">
                                    {item.subSections ? (
                                        <div className="w-full">
                                            <button
                                                onClick={() => handleDropdownToggle(item.name)}
                                                className="flex items-center justify-between w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors duration-200"
                                            >
                                                <span>{item.name}</span>
                                                <ChevronDown
                                                    className={`h-4 w-4 transition-transform duration-200 ${activeDropdown === item.name ? 'rotate-180' : ''
                                                        }`}
                                                />
                                            </button>

                                            {activeDropdown === item.name && (
                                                <div className="mt-1 ml-2 space-y-1 border-l-2 border-blue-200 pl-3">
                                                    {item.subSections
                                                        .filter(subItem => hasPermission(subItem.permission))
                                                        .map((subItem) => (
                                                            <div
                                                                key={subItem.name}
                                                                onClick={(e) => handleMobileSubItemClick(e, subItem.path)}
                                                                onTouchEnd={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleMobileSubItemClick(e, subItem.path);
                                                                }}
                                                                className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer select-none active:bg-blue-100 transition-colors duration-200 border border-transparent hover:border-blue-200"
                                                                style={{
                                                                    touchAction: 'manipulation',
                                                                    WebkitTapHighlightColor: 'rgba(59, 130, 246, 0.1)',
                                                                    userSelect: 'none',
                                                                    WebkitUserSelect: 'none',
                                                                    minHeight: '44px',
                                                                    display: 'flex',
                                                                    alignItems: 'center'
                                                                }}
                                                                role="button"
                                                                tabIndex={0}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                                        e.preventDefault();
                                                                        handleMobileSubItemClick(
                                                                            {
                                                                                preventDefault: () => e.preventDefault(),
                                                                                stopPropagation: () => e.stopPropagation()
                                                                            } as unknown as React.MouseEvent<Element, MouseEvent>,
                                                                            subItem.path
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                {subItem.name}
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleNavigation(item.path!)}
                                            className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors duration-200"
                                        >
                                            {item.name}
                                        </button>
                                    )}
                                </div>
                            ))}

                            {/* Usuario y Logout en Mobile */}
                            <div className="border-t border-gray-200 pt-2 mt-4">
                                <div className="px-3 py-2">
                                    <span className="text-sm text-gray-600">Hola, {user.name}</span>
                                </div>
                                <button
                                    onClick={onLogout}
                                    className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
