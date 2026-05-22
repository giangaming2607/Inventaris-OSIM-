import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, AlertCircle } from 'lucide-react';

export type PopupType = 'success' | 'error';

interface PopupEventDetail {
  type: PopupType;
  title: string;
  description?: string;
  duration?: number;
}

// Global utility helper to trigger the popup easily from any component
export const triggerResultPopup = (
  type: PopupType,
  title: string,
  description?: string,
  duration?: number
) => {
  const event = new CustomEvent('show-popup', {
    detail: { type, title, description, duration }
  });
  window.dispatchEvent(event);
};

export function ResultPopup() {
  const [popup, setPopup] = useState<PopupEventDetail | null>(null);

  useEffect(() => {
    const handleShowPopup = (e: Event) => {
      const customEvent = e as CustomEvent<PopupEventDetail>;
      const { type, title, description, duration = 1000 } = customEvent.detail;
      
      setPopup({ type, title, description, duration });
    };

    window.addEventListener('show-popup', handleShowPopup);
    return () => {
      window.removeEventListener('show-popup', handleShowPopup);
    };
  }, []);

  useEffect(() => {
    if (popup) {
      const timer = setTimeout(() => {
        setPopup(null);
      }, popup.duration || 1000);
      return () => clearTimeout(timer);
    }
  }, [popup]);

  return (
    <AnimatePresence>
      {popup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
          {/* Card container */}
          <motion.div
            initial={{ scale: 0.9, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 10, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-sm overflow-hidden bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 text-center z-10"
          >
            {/* Success or Error glow backdrop inside the card */}
            <div 
              className={`absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none ${
                popup.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />

            {/* Glowing Icon Container and Animation */}
            <div className="flex justify-center mb-4 relative z-10">
              {popup.type === 'success' ? (
                <motion.div
                  initial={{ rotate: -90, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.05, type: "spring", stiffness: 200, damping: 12 }}
                  className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10"
                >
                  <Check className="w-7 h-7 stroke-[2.5]" />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ x: -10, scale: 0.8 }}
                  animate={{ x: [0, -6, 6, -4, 4, 0], scale: 1 }}
                  transition={{ delay: 0.05, duration: 0.4 }}
                  className="flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 shadow-lg shadow-red-500/10"
                >
                  <AlertCircle className="w-7 h-7 stroke-[2.5]" />
                </motion.div>
              )}
            </div>

            {/* Main Content */}
            <div className="relative z-10 space-y-2">
              <motion.h3 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg font-bold text-white tracking-tight"
              >
                {popup.title}
              </motion.h3>
              
              {popup.description && (
                <motion.p 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-sm text-neutral-400"
                >
                  {popup.description}
                </motion.p>
              )}
            </div>

            {/* Accent border strip animated */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-neutral-800">
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: (popup.duration || 1000) / 1000, ease: "linear" }}
                className={`h-full ${popup.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
