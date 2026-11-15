import React, { useEffect, useRef } from 'react';

function ConfirmModal({
  titulo = 'Confirmar acción',
  mensaje,
  confirmarTexto = 'Confirmar',
  cancelarTexto = 'Cancelar',
  onConfirmar,
  onCancelar,
}) {
  const botonSeguro = useRef(null);
  const cancelarRef = useRef(onCancelar);
  cancelarRef.current = onCancelar;

  useEffect(() => {
    const elementoAnterior = document.activeElement;
    function alPresionar(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        cancelarRef.current();
      }
    }
    document.addEventListener('keydown', alPresionar);
    botonSeguro.current?.focus();
    return () => {
      document.removeEventListener('keydown', alPresionar);
      if (elementoAnterior instanceof HTMLElement) elementoAnterior.focus();
    };
  }, []);

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) cancelarRef.current();
      }}
    >
      <div
        className="modal confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        data-testid="confirm-modal"
      >
        <h2 id="confirm-modal-title">{titulo}</h2>
        <p>{mensaje}</p>
        <div className="form-actions">
          <button
            type="button"
            className="button secondary"
            ref={botonSeguro}
            onClick={onCancelar}
          >
            {cancelarTexto}
          </button>
          <button type="button" className="button danger" onClick={onConfirmar}>
            {confirmarTexto}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
