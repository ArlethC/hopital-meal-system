/*
    Archivo: Notificacion.tsx
    Descripcion: componente para mostrar notificaciones.
    Autor: Marilyn Castro
    Fecha creacion: 16/07/2025
    Version: 1.0.0
*/
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'react-feather';

interface Message {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  content: string;
  duration?: number;
  dismissible?: boolean;
}

interface MessageNotificationProps {
  message: Message;
  onDismiss: (id: string) => void;
}

const MessageNotification: React.FC<MessageNotificationProps> = ({ message, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (message.duration && message.duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss(message.id), 300);
      }, message.duration);

      return () => clearTimeout(timer);
    }
  }, [message.duration, message.id, onDismiss]);

  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStyles = () => {
    switch (message.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(message.id), 300);
  };

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`border rounded-lg p-4 shadow-md ${getStyles()}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3">
            {getIcon()}
          </div>
          <div className="flex-1">
            {message.title && (
              <h3 className="font-semibold text-sm mb-1">{message.title}</h3>
            )}
            <p className="text-sm">{message.content}</p>
          </div>
          {message.dismissible !== false && (
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageNotification;