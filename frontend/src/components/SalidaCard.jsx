import React from 'react';

function SalidaCard({ salida, onEditar, onEliminar }) {
  const fecha = new Date(salida.fechaHora);
  const cuposClase = salida.cupos > 20 ? 'disponible' : salida.cupos > 5 ? 'limitado' : 'agotandose';

  return (
    <article className="card">
      <div className="card-header">
        <span className={`tag tag-${salida.tipo}`}>{salida.tipo}</span>
        <span className={`cupos ${cuposClase}`}>{salida.cupos} cupos</span>
      </div>
      <h3>{salida.destino}</h3>
      <p className="empresa">{salida.empresa} · {salida.embarcacion}</p>
      <dl className="details">
        <div><dt>Salida</dt><dd>{fecha.toLocaleDateString('es-PE')} · {fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</dd></div>
        <div><dt>Puerto</dt><dd>{salida.puerto}</dd></div>
        <div><dt>Duración</dt><dd>{salida.duracionHoras} horas</dd></div>
      </dl>
      <strong className="price">S/ {salida.precio.toFixed(2)}</strong>
      {onEditar && onEliminar && (
        <div className="card-actions">
          <button type="button" className="button secondary" onClick={() => onEditar(salida)}>Editar</button>
          <button type="button" className="button danger" onClick={() => onEliminar(salida.id)}>Eliminar</button>
        </div>
      )}
    </article>
  );
}

export default SalidaCard;
