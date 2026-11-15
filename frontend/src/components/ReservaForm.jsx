import React, { useState } from 'react';
import { formatearFechaHora } from '../utils/fechas';

function ReservaForm({ salida, onReservar, onCancelar, errorServidor = '' }) {
  const [formulario, setFormulario] = useState({
    nombre: '',
    dni: '',
    telefono: '',
    cantidad: 1,
  });
  const [error, setError] = useState('');

  function cambiar(event) {
    setFormulario({ ...formulario, [event.target.name]: event.target.value });
  }

  function enviar(event) {
    event.preventDefault();
    if (!formulario.nombre.trim()) return setError('El nombre es obligatorio');
    if (!/^\d{8}$/.test(formulario.dni)) return setError('El DNI debe tener 8 dígitos');
    if (!formulario.telefono.trim()) return setError('El teléfono es obligatorio');
    const cantidad = Number(formulario.cantidad);
    if (!Number.isInteger(cantidad) || cantidad <= 0) return setError('La cantidad debe ser válida');
    if (cantidad > salida.cupos) return setError('La cantidad supera los cupos disponibles');
    setError('');
    onReservar({ ...formulario, cantidad });
  }

  return (
    <form className="form-panel" onSubmit={enviar}>
      <h2>Reservar salida a {salida.destino}</h2>
      <p className="form-help">{salida.cupos} cupos disponibles · {formatearFechaHora(salida.fechaHora)} (Lima)</p>
      {errorServidor && <p className="error-message" role="alert">{errorServidor}</p>}
      {error && <p className="error-message" role="alert">{error}</p>}
      <div className="form-grid">
        <label>Nombre completo<input name="nombre" value={formulario.nombre} onChange={cambiar} /></label>
        <label>DNI<input name="dni" inputMode="numeric" maxLength="8" value={formulario.dni} onChange={cambiar} /></label>
        <label>Teléfono<input name="telefono" value={formulario.telefono} onChange={cambiar} /></label>
        <label>Cantidad<input type="number" min="1" max={salida.cupos} name="cantidad" value={formulario.cantidad} onChange={cambiar} /></label>
      </div>
      <div className="form-actions">
        <button className="button primary">Confirmar reserva</button>
        <button type="button" className="button secondary" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  );
}

export default ReservaForm;
