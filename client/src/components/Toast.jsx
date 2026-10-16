import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
  };

  const bgStyles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    error: 'bg-rose-50 border-rose-200 text-rose-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-4 fade-in duration-200">
      <div className={`flex items-center justify-between p-4 rounded-xl border shadow-lg backdrop-blur-sm ${bgStyles[type] || bgStyles.info}`}>
        <div className="flex items-center space-x-3">
          {icons[type] || icons.info}
          <p className="text-sm font-semibold">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 p-1 rounded-lg hover:bg-black/5 transition-colors"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4 opacity-70 hover:opacity-100" />
        </button>
      </div>
    </div>
  );
}
