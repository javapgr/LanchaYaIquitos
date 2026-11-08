import React, { useEffect, useState } from 'react';

const inicial = {
  empresa: '', embarcacion: '', tipo: 'lancha', destino: '', puerto: '',
  fechaHora: '', duracionHoras: '', precio: '', cupos: '',
};

function SalidaForm({ salida, onGuardar, onCancelar }) {
  const [formulario, setFormulario] = useState(inicial);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormulario(salida ? { ...salida } : inicial);
    setError('');
  }, [salida]);

  function cambiar(event) {
    setFormulario({ ...formulario, [event.target.name]: event.target.value });
  }

  function enviar(event) {
    event.preventDefault();
    const datos = {
      ...formulario,
      duracionHoras: Number(formulario.duracionHoras),
      precio: Number(formulario.precio),
      cupos: Number(formulario.cupos),
    };
    for (const campo of ['empresa', 'destino', 'puerto', 'fechaHora']) {
      if (!String(datos[campo]).trim()) return setError(`El campo ${campo} es obligatorio`);
    }
    if (!['lancha', 'rapido', 'deslizador'].includes(datos.tipo)) return setError('Selecciona un tipo válido');
    if (!Number.isFinite(datos.precio) || datos.precio <= 0) return setError('El precio debe ser mayor que 0');
    if (!Number.isFinite(datos.duracionHoras) || datos.duracionHoras <= 0) return setError('La duración debe ser mayor que 0');
    if (!Number.isInteger(datos.cupos) || datos.cupos < 0) return setError('Los cupos deben ser un entero válido');
    if (!salida && new Date(datos.fechaHora) < new Date()) return setError('La fecha no puede estar en el pasado');
    setError('');
    onGuardar(datos);
  }

  return (
    <form className="form-panel" onSubmit={enviar}>
      <h2>{salida ? 'Editar salida' : 'Registrar salida'}</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="form-grid">
        {[
          ['empresa', 'Empresa'], ['embarcacion', 'Embarcación'], ['destino', 'Destino'], ['puerto', 'Puerto'],
        ].map(([name, label]) => <label key={name}>{label}<input name={name} value={formulario[name]} onChange={cambiar} /></label>)}
        <label>Tipo<select name="tipo" value={formulario.tipo} onChange={cambiar}><option value="lancha">Lancha</option><option value="rapido">Rápido</option><option value="deslizador">Deslizador</option></select></label>
        <label>Fecha y hora<input type="datetime-local" name="fechaHora" value={formulario.fechaHora} onChange={cambiar} /></label>
        <label>Duración (horas)<input type="number" min="0.5" step="0.5" name="duracionHoras" value={formulario.duracionHoras} onChange={cambiar} /></label>
        <label>Precio (S/)<input type="number" min="0.01" step="0.01" name="precio" value={formulario.precio} onChange={cambiar} /></label>
        <label>Cupos<input type="number" min="0" step="1" name="cupos" value={formulario.cupos} onChange={cambiar} /></label>
      </div>
      <div className="form-actions"><button className="button primary">{salida ? 'Guardar cambios' : 'Registrar salida'}</button>{salida && <button type="button" className="button secondary" onClick={onCancelar}>Cancelar</button>}</div>
    </form>
  );
}

export default SalidaForm;
