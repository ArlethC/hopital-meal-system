/*
    Archivo: Dropdown.tsx
    Descripcion: conponente de lista desplegable.
    Autor: Marilyn Castro
    Fecha creacion: 4/07/2025
    Version: 1.0.0
*/
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'react-feather';
import { type DropdownOption } from '../types/ui';


interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  incluirPlaceholder?: boolean; 
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder,
  className = '',
  incluirPlaceholder = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = options.find(opt => opt.value === value);

  const renderedOptions = incluirPlaceholder && placeholder
  ? [{ value: '', label: placeholder }, ...options]
  : options;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md flex justify-between items-center hover:bg-gray-50 focus:outline-none"
      >
        <span className="truncate text-sm text-gray-700">
          {selected?.label || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto flex flex-col">
          {renderedOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-100 ${
                opt.value === value ? 'bg-blue-50 text-blue-700' : 'text-gray-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
