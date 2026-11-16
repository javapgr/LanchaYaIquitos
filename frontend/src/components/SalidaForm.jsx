import React, { useEffect, useState } from 'react';
import { combinarDuracion, partirDuracion } from '../utils/duracion';

const inicial = {
  empresaId: '', embarcacion: '', tipo: 'lancha', destino: '', puerto: '',
  fechaHora: '', duracionHoras: '', duracionMinutos: '0', precio: '', capacidad: '', cupos: '',
};

function SalidaForm({ salida, empresas, onGuardar, onCancelar }) {
  const [formulario, setFormulario] = useState(inicial);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!salida) {
      setFormulario(inicial);
    } else {
      const { horas, minutos } = partirDuracion(salida.duracionHoras);
      setFormulario({
        ...salida,
        duracionHoras: horas,
        duracionMinutos: minutos || '0',
      });
    }
    setError('');
  }, [salida]);

  function cambiar(event) {
    setFormulario({ ...formulario, [event.target.name]: event.target.value });
  }

  function enviar(event) {
    event.preventDefault();
    const duracionHoras = combinarDuracion(formulario.duracionHoras, formulario.duracionMinutos);
    const datos = {
      ...formulario,
      empresaId: Number(formulario.empresaId),
      duracionHoras,
      precio: Number(formulario.precio),
      capacidad: Number(formulario.capacidad),
      cupos: Number(formulario.cupos),
    };
    delete datos.duracionMinutos;

    if (!Number.isInteger(datos.empresaId) || datos.empresaId <= 0) {
      return setError('Selecciona una empresa');
    }
    for (const campo of ['embarcacion', 'destino', 'puerto', 'fechaHora']) {
      if (!String(datos[campo]).trim()) return setError(`El campo ${campo} es obligatorio`);
    }
    if (!['lancha', 'rapido', 'deslizador'].includes(datos.tipo)) return setError('Selecciona un tipo válido');
    if (!Number.isFinite(datos.precio) || datos.precio <= 0) return setError('El precio debe ser mayor que 0');
    if (duracionHoras == null) return setError('Indica horas y minutos válidos (minutos 0–59)');
    if (!Number.isInteger(datos.capacidad) || datos.capacidad <= 0) return setError('La capacidad debe ser mayor que 0');
    if (!Number.isInteger(datos.cupos) || datos.cupos < 0) return setError('Los cupos deben ser un entero válido');
    if (datos.cupos > datos.capacidad) return setError('Los cupos no pueden superar la capacidad');
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
          ['embarcacion', 'Embarcación'], ['destino', 'Destino'], ['puerto', 'Puerto'],
        ].map(([name, label]) => <label key={name}>{label}<input name={name} value={formulario[name]} onChange={cambiar} /></label>)}
        <label>Empresa
          <select name="empresaId" value={formulario.empresaId} onChange={cambiar}>
            <option value="">Selecciona una empresa</option>
            {empresas.map((empresa) => (
              <option key={empresa.id} value={empresa.id}>{empresa.razonSocial}</option>
            ))}
          </select>
        </label>
        <label>Tipo<select name="tipo" value={formulario.tipo} onChange={cambiar}><option value="lancha">Lancha</option><option value="rapido">Rápido</option><option value="deslizador">Deslizador</option></select></label>
        <label>Fecha y hora<input type="datetime-local" name="fechaHora" value={formulario.fechaHora} onChange={cambiar} /></label>
        <label>Duración (horas)
          <input type="number" min="0" step="1" name="duracionHoras" value={formulario.duracionHoras} onChange={cambiar} />
        </label>
        <label>Duración (minutos)
          <input type="number" min="0" max="59" step="1" name="duracionMinutos" value={formulario.duracionMinutos} onChange={cambiar} />
        </label>
        <label>Precio (S/)<input type="number" min="0.01" step="0.01" name="precio" value={formulario.precio} onChange={cambiar} /></label>
        <label>Capacidad<input type="number" min="1" step="1" name="capacidad" value={formulario.capacidad} onChange={cambiar} /></label>
        <label>Cupos<input type="number" min="0" step="1" name="cupos" value={formulario.cupos} onChange={cambiar} /></label>
      </div>
      <div className="form-actions"><button className="button primary">{salida ? 'Guardar cambios' : 'Registrar salida'}</button>{salida && <button type="button" className="button secondary" onClick={onCancelar}>Cancelar</button>}</div>
    </form>
  );
}

export default SalidaForm;
