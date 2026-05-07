/*
    Archivo: Paginatio.tsx
    Descripcion: Componente para aplicar paginación.
    Autor: Marilyn Castro
    Fecha creacion: 21/07/2025
    Version: 1.0.0
*/
import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'react-feather';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems?: number;
    itemsPerPage?: number;
    showInfo?: boolean;
    showFirstLast?: boolean;
    maxVisiblePages?: number;
    className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage,
    showInfo = true,
    showFirstLast = true,
    maxVisiblePages = 5,
    className = ''
}) => {
    const getVisiblePages = () => {
        const pages: number[] = [];

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            const halfVisible = Math.floor(maxVisiblePages / 2);
            let start = Math.max(1, currentPage - halfVisible);
            let end = Math.min(totalPages, currentPage + halfVisible);

            if (end - start + 1 < maxVisiblePages) {
                if (start === 1) {
                    end = Math.min(totalPages, start + maxVisiblePages - 1);
                } else {
                    start = Math.max(1, end - maxVisiblePages + 1);
                }
            }

            if (start > 1) {
                pages.push(1);
                if (start > 2) {
                    pages.push(-1);
                }
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < totalPages) {
                if (end < totalPages - 1) {
                    pages.push(-1);
                }
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const visiblePages = getVisiblePages();

    const getItemsInfo = () => {
        if (!totalItems || !itemsPerPage) return null;

        const start = (currentPage - 1) * itemsPerPage + 1;
        const end = Math.min(currentPage * itemsPerPage, totalItems);

        return { start, end, total: totalItems };
    };

    const itemsInfo = getItemsInfo();

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            onPageChange(page);
        }
    };

    if (totalPages <= 1) return null;

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
            {showInfo && itemsInfo && (
                <div className="text-sm text-gray-600">
                    Mostrando {itemsInfo.start} a {itemsInfo.end} de {itemsInfo.total} elementos
                </div>
            )}


            <div className="hidden sm:flex items-center gap-1">
                {showFirstLast && (
                    <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Primera página"
                    >
                        <ChevronsLeft className="w-4 h-4" />
                    </button>
                )}

                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Página anterior"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {visiblePages.map((page, index) => (
                    <React.Fragment key={index}>
                        {page === -1 ? (
                            <span className="px-3 py-2 text-gray-500">...</span>
                        ) : (
                            <button
                                onClick={() => handlePageChange(page)}
                                className={`
                  px-3 py-2 rounded-lg border transition-colors
                  ${currentPage === page
                                        ? 'bg-blue-500 text-white border-blue-500'
                                        : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                                    }
                `}
                            >
                                {page}
                            </button>
                        )}
                    </React.Fragment>
                ))}

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Página siguiente"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>

                {showFirstLast && (
                    <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Última página"
                    >
                        <ChevronsRight className="w-4 h-4" />
                    </button>
                )}
            </div>

            {totalPages > 1 && (
                <div className="sm:hidden">
                    <select
                        value={currentPage}
                        onChange={(e) => handlePageChange(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <option key={page} value={page}>
                                Página {page}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};

export default Pagination;