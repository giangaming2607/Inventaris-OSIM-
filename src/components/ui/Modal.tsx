import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, className, footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} aria-hidden="true"></div>
      <div className={cn("relative w-full max-w-lg mx-auto my-6 z-50 bg-neutral-900 rounded-xl shadow-2xl flex flex-col max-h-[90vh]", className)}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 ml-auto bg-transparent border-0 text-neutral-600 hover:text-neutral-400 outline-none focus:outline-none transition-colors rounded-lg hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Body */}
        <div className="relative p-6 flex-auto overflow-y-auto">
          {children}
        </div>
        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end px-6 py-4 border-t border-neutral-800 bg-[#111111] rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
