import React from 'react';
import { claseCupos, etiquetaCupos } from '../utils/cupos';

function SalidaCard({ salida }) {
  const fecha = new Date(salida.fechaHora);

  return (
    <article className="card">
      <div className="card-header">
        <span className={`tag tag-${salida.tipo}`}>{salida.tipo}</span>
        <span className={`cupos ${claseCupos(salida.cupos)}`} title={etiquetaCupos(salida.cupos)}>
          {salida.cupos} cupos · {etiquetaCupos(salida.cupos)}
        </span>
      </div>
      <h3>{salida.destino}</h3>
      <p className="empresa">{salida.empresa} · {salida.embarcacion}</p>
      <dl className="details">
        <div>
          <dt>Salida</dt>
          <dd>
            {fecha.toLocaleDateString('es-PE')} ·{' '}
            {fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
          </dd>
        </div>
        <div><dt>Puerto</dt><dd>{salida.puerto}</dd></div>
        <div><dt>Duración</dt><dd>{salida.duracionHoras} horas</dd></div>
      </dl>
      <strong className="price">S/ {salida.precio.toFixed(2)}</strong>
    </article>
  );
}

export default SalidaCard;
