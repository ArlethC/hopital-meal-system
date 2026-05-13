/*
    Archivo: CardSolicitud.tsx
    Descripcion: Componente para mostrar un resumen del encabezado de las solicitudes de dietas.
    Autor: Marilyn Castro
    Fecha creacion: 15/07/2025
    Version: 1.0.0
*/
import { Calendar, Clock, CheckCircle, User, Home, Send, Edit, ArrowRightCircle, Lock, FileText, AlertCircle } from 'react-feather';
import { fechaATexto } from "../utils/formatear";
import Pagination from '../components/Pagination';


export interface SolicitudCard {
  id: number;
  estado: string;
  sala: string;
  fechaEntrega: string;
  usuario: string;
  fechaCreacion: string;
  tiempoComida: string;
}

interface CardsProps {
  cards?: SolicitudCard[];
  onSeleccionar?: (id: number) => void;
  paginaActual?: number;
  limitePagina?: number;
  totalPaginas?: number;
  totalItems?: number;
  onCambiarPagina?: (nuevaPagina: number) => void;
}

const HospitalizationCards: React.FC<CardsProps> = ({
  cards,
  onSeleccionar,
  paginaActual,
  totalPaginas,
  onCambiarPagina,
  totalItems,
  limitePagina,
}) => {

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Enviada a Cocina':
        return <Send className="w-4 h-4 text-blue-600" />;
      case 'Modificada y Enviada a Cocina':
        return <Edit className="w-4 h-4 text-blue-600" />;
      case 'Enviada a Sala':
        return <ArrowRightCircle className="w-4 h-4 text-green-600" />;
      case 'Recibida en Sala':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Recibida en Sala con Reclamo':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;  
      case 'Cerrada con Reclamo':
        return <Lock className="w-4 h-4 text-red-500" />;
      default:
        return <Lock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50">

        {cards?.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-3">
              <Home className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{card.sala}</span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">{card.tiempoComida}</span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              {getStatusIcon(card.estado)}
              <span className="text-sm text-gray-700">{card.estado}</span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">{fechaATexto(card.fechaEntrega)}</span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">{card.usuario}</span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">{fechaATexto(card.fechaCreacion)}</span>
            </div>
            <button
              onClick={() => onSeleccionar?.(card.id)}
              className="w-full bg-emerald-300 hover:bg-emerald-400 text-black text-sm font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              Ver detalles
              <span className="text-black">»</span>
            </button>

          </div>
        ))}
      </div>
      {totalPaginas && totalPaginas > 1 && paginaActual && onCambiarPagina && (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={paginaActual}
            totalPages={totalPaginas}
            onPageChange={onCambiarPagina}
            itemsPerPage={limitePagina}
            totalItems={totalItems}
          />
        </div>
      )}
    </div>

  );
};

export default HospitalizationCards;