import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((actuales) => actuales.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((mensaje, tipo = 'error') => {
    const id = Date.now() + Math.random();
    setToasts((actuales) => [...actuales, { id, mensaje, tipo }]);
    window.setTimeout(() => {
      setToasts((actuales) => actuales.filter((toast) => toast.id !== id));
    }, 4200);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.tipo}`} role="status">
            <span>{toast.mensaje}</span>
            <button
              type="button"
              className="toast-close"
              aria-label="Cerrar aviso"
              onClick={() => dismissToast(toast.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const contexto = useContext(ToastContext);
  if (!contexto) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return contexto;
}
