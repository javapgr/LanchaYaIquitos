import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';

const ToastContext = createContext(null);
let secuencia = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const temporizadores = useRef(new Map());

  const quitar = useCallback((id) => {
    setToasts((actuales) => actuales.filter((toast) => toast.id !== id));
    const temporizador = temporizadores.current.get(id);
    if (temporizador) {
      clearTimeout(temporizador);
      temporizadores.current.delete(id);
    }
  }, []);

  const agregar = useCallback((mensaje, tipo) => {
    const id = ++secuencia;
    setToasts((actuales) => [...actuales, { id, mensaje, tipo }]);
    const temporizador = setTimeout(() => quitar(id), 4500);
    temporizadores.current.set(id, temporizador);
  }, [quitar]);

  useEffect(() => () => {
    temporizadores.current.forEach((temporizador) => clearTimeout(temporizador));
    temporizadores.current.clear();
  }, []);

  const api = useMemo(() => ({
    success: (mensaje) => agregar(mensaje, 'exito'),
    error: (mensaje) => agregar(mensaje, 'error'),
  }), [agregar]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-viewport" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.tipo}`}
            role="status"
            data-testid="toast"
          >
            <span>{toast.mensaje}</span>
            <button
              type="button"
              className="toast-close"
              aria-label="Cerrar notificación"
              onClick={() => quitar(toast.id)}
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
  if (!contexto) throw new Error('useToast debe usarse dentro de ToastProvider');
  return contexto;
}
