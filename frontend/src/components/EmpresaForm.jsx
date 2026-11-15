import React, { useEffect, useState } from 'react';

const inicial = {
  razonSocial: '',
  ruc: '',
  telefono: '',
  puertoBase: '',
};

function EmpresaForm({ empresa, onGuardar, onCancelar }) {
  const [formulario, setFormulario] = useState(inicial);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormulario(empresa ? { ...empresa } : inicial);
    setError('');
  }, [empresa]);

  function cambiar(event) {
    setFormulario({ ...formulario, [event.target.name]: event.target.value });
  }

  function enviar(event) {
    event.preventDefault();
    for (const campo of Object.keys(inicial)) {
      if (!formulario[campo].trim()) return setError(`El campo ${campo} es obligatorio`);
    }
    if (!/^\d{11}$/.test(formulario.ruc)) {
      return setError('El RUC debe tener exactamente 11 dígitos');
    }
    setError('');
    onGuardar({
      razonSocial: formulario.razonSocial.trim(),
      ruc: formulario.ruc.trim(),
      telefono: formulario.telefono.trim(),
      puertoBase: formulario.puertoBase.trim(),
    });
  }

  return (
    <form className="form-panel" onSubmit={enviar}>
      <h2>{empresa ? 'Editar empresa' : 'Registrar empresa'}</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="form-grid">
        <label>Razón social<input name="razonSocial" value={formulario.razonSocial} onChange={cambiar} /></label>
        <label>RUC<input name="ruc" inputMode="numeric" maxLength="11" value={formulario.ruc} onChange={cambiar} /></label>
        <label>Teléfono<input name="telefono" value={formulario.telefono} onChange={cambiar} /></label>
        <label>Puerto base<input name="puertoBase" value={formulario.puertoBase} onChange={cambiar} /></label>
      </div>
      <div className="form-actions">
        <button className="button primary">{empresa ? 'Guardar cambios' : 'Registrar empresa'}</button>
        <button type="button" className="button secondary" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  );
}

export default EmpresaForm;
