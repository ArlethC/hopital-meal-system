/*
    Archivo: notificacionHook.tsx
    Descripcion: hook para mostrar notificaciones.
    Autor: Marilyn Castro
    Fecha creacion: 16/07/2025
    Version: 1.0.2
*/
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import MessageNotification from '../components/Notificacion'; 
import { setNotify } from '../services/notificacionService';

type MessageType = 'success' | 'error' | 'warning' | 'info';

export interface Message {
  id: string;
  type: MessageType;
  title?: string;
  content: string;
  duration?: number;
  dismissible?: boolean;
}

interface NotificationContextType {
  notify: (message: Omit<Message, 'id'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const notify = (message: Omit<Message, 'id'>) => {
    const newMessage: Message = { id: uuidv4(), ...message };
    setMessages(prev => [...prev, newMessage]);
  };

  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  useEffect(() => {
    setNotify(notify);
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 w-80">
        {messages.map(message => (
          <MessageNotification
            key={message.id}
            message={message}
            onDismiss={removeMessage}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
